const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function exportDatabase() {
  try {
    console.log("🗄️  Starting database export...\n");

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        description: "Complete database export for production migration",
      },
      data: {},
    };

    // Export all tables in the correct order (respecting foreign key constraints)
    const tables = [
      "AdminUser",
      "Role",
      "Permission",
      "RolePermission",
      "AdminUserRole",
      "Genre",
      "Tag",
      "Country",
      "Person",
      "Movie",
      "Series",
      "Season",
      "Episode",
      "MovieGenre",
      "MovieTag",
      "MovieCountry",
      "SeriesGenre",
      "SeriesTag",
      "Credit",
      "Artwork",
      "Source",
      "Subtitle",
      "Collection",
      "CollectionItem",
      "AuditLog",
      "Brand",
      "Sponsor",
      "SponsorAsset",
      "Placement",
      "Campaign",
      "CampaignAsset",
      "User",
      "UserHistory",
      "UserFavorite",
      "Report",
    ];

    for (const table of tables) {
      try {
        console.log(`📋 Exporting ${table}...`);

        // Use dynamic property access to get the table data
        // Convert PascalCase to camelCase for Prisma client
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);
        const tableData = await prisma[modelName].findMany({
          include: getIncludeForTable(table),
        });

        exportData.data[table] = tableData;
        console.log(`✅ Exported ${tableData.length} records from ${table}`);
      } catch (error) {
        console.log(`⚠️  Skipping ${table}: ${error.message}`);
        exportData.data[table] = [];
      }
    }

    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, "database-exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `database-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    // Write the export file
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log(`\n🎉 Database export completed successfully!`);
    console.log(`📁 Export saved to: ${filepath}`);
    console.log(
      `📊 Total size: ${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`
    );

    // Also create a compressed version
    const compressedFilename = `database-export-${timestamp}.json.gz`;
    const compressedFilepath = path.join(exportDir, compressedFilename);

    // Create a simple summary file
    const summary = {
      exportInfo: exportData.metadata,
      recordCounts: Object.entries(exportData.data).reduce(
        (acc, [table, records]) => {
          acc[table] = records.length;
          return acc;
        },
        {}
      ),
      totalRecords: Object.values(exportData.data).reduce(
        (sum, records) => sum + records.length,
        0
      ),
    };

    const summaryFilepath = path.join(
      exportDir,
      `export-summary-${timestamp}.json`
    );
    fs.writeFileSync(summaryFilepath, JSON.stringify(summary, null, 2));

    console.log(`📋 Summary saved to: ${summaryFilepath}`);
    console.log(`\n📈 Export Summary:`);
    console.log(`   Total Records: ${summary.totalRecords}`);
    console.log(
      `   Tables Exported: ${Object.keys(summary.recordCounts).length}`
    );

    return {
      exportFile: filepath,
      summaryFile: summaryFilepath,
      summary: summary,
    };
  } catch (error) {
    console.error("❌ Error during database export:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getIncludeForTable(table) {
  // Define includes for tables that have relations
  const includes = {
    AdminUser: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
    Role: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
    Movie: {
      genres: {
        include: {
          genre: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      countries: {
        include: {
          country: true,
        },
      },
      credits: {
        include: {
          person: true,
        },
      },
      artworks: true,
      sources: true,
      subtitles: true,
    },
    Series: {
      genres: {
        include: {
          genre: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      credits: {
        include: {
          person: true,
        },
      },
      seasons: {
        include: {
          episodes: true,
        },
      },
      artworks: true,
    },
    Person: {
      credits: {
        include: {
          movie: true,
          series: true,
        },
      },
    },
    Collection: {
      items: true,
    },
    Campaign: {
      assets: {
        include: {
          asset: true,
        },
      },
    },
    User: {
      histories: true,
      favorites: true,
    },
  };

  return includes[table] || {};
}

// Run the export
if (require.main === module) {
  exportDatabase()
    .then((result) => {
      console.log("\n✅ Export completed successfully!");
      console.log(`📁 Files created:`);
      console.log(`   - ${result.exportFile}`);
      console.log(`   - ${result.summaryFile}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Export failed:", error);
      process.exit(1);
    });
}

module.exports = { exportDatabase };
