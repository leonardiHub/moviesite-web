const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function restoreDatabase(exportFilePath) {
  try {
    console.log("🗄️  Starting database restoration...\n");

    // Check if export file exists
    if (!fs.existsSync(exportFilePath)) {
      throw new Error(`Export file not found: ${exportFilePath}`);
    }

    // Read the export file
    console.log(`📖 Reading export file: ${exportFilePath}`);
    const exportData = JSON.parse(fs.readFileSync(exportFilePath, "utf8"));

    console.log(`📅 Export created: ${exportData.metadata.exportedAt}`);
    console.log(
      `📊 Total records to restore: ${Object.values(exportData.data).reduce((sum, records) => sum + records.length, 0)}`
    );

    // Confirm before proceeding
    console.log(
      "\n⚠️  WARNING: This will completely replace your production database!"
    );
    console.log(
      "   Make sure you have a backup of your current production data."
    );

    // In production, you might want to add a confirmation prompt here
    // For now, we'll proceed with the restoration

    // Disable foreign key checks temporarily (if supported by your database)
    console.log("\n🔧 Preparing database for restoration...");

    // Clear existing data in reverse order (respecting foreign key constraints)
    const clearOrder = [
      "UserFavorite",
      "UserRating",
      "UserWatchHistory",
      "UserPreference",
      "User",
      "AnalyticsEvent",
      "CampaignItem",
      "Campaign",
      "Sponsor",
      "HomepageSectionItem",
      "HomepageSection",
      "AuditLog",
      "CollectionSeries",
      "CollectionMovie",
      "Collection",
      "Subtitle",
      "Source",
      "Artwork",
      "Credit",
      "SeriesLanguage",
      "SeriesCountry",
      "SeriesTag",
      "SeriesGenre",
      "MovieLanguage",
      "MovieCountry",
      "MovieTag",
      "MovieGenre",
      "Episode",
      "Season",
      "Series",
      "Movie",
      "Person",
      "Language",
      "Country",
      "Tag",
      "Genre",
      "AdminUserRole",
      "RolePermission",
      "Permission",
      "Role",
      "AdminUser",
    ];

    console.log("🧹 Clearing existing data...");
    for (const table of clearOrder) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        if (count > 0) {
          console.log(`   Clearing ${table} (${count} records)...`);
          await prisma[table.toLowerCase()].deleteMany({});
        }
      } catch (error) {
        console.log(`   ⚠️  Could not clear ${table}: ${error.message}`);
      }
    }

    // Restore data in the correct order
    const restoreOrder = [
      "AdminUser",
      "Role",
      "Permission",
      "RolePermission",
      "AdminUserRole",
      "Genre",
      "Tag",
      "Country",
      "Language",
      "Person",
      "Movie",
      "Series",
      "Season",
      "Episode",
      "MovieGenre",
      "MovieTag",
      "MovieCountry",
      "MovieLanguage",
      "SeriesGenre",
      "SeriesTag",
      "SeriesCountry",
      "SeriesLanguage",
      "Credit",
      "Artwork",
      "Source",
      "Subtitle",
      "Collection",
      "CollectionMovie",
      "CollectionSeries",
      "AuditLog",
      "HomepageSection",
      "HomepageSectionItem",
      "Sponsor",
      "Campaign",
      "CampaignItem",
      "AnalyticsEvent",
      "User",
      "UserPreference",
      "UserWatchHistory",
      "UserRating",
      "UserFavorite",
    ];

    console.log("\n📥 Restoring data...");
    let totalRestored = 0;

    for (const table of restoreOrder) {
      const records = exportData.data[table] || [];
      if (records.length === 0) {
        console.log(`   ⏭️  Skipping ${table} (no records)`);
        continue;
      }

      try {
        console.log(`   📋 Restoring ${table} (${records.length} records)...`);

        // Remove nested relations for direct table insertion
        const cleanRecords = records.map((record) => {
          const clean = { ...record };
          // Remove nested objects that are handled by separate tables
          delete clean.genres;
          delete clean.tags;
          delete clean.countries;
          delete clean.languages;
          delete clean.credits;
          delete clean.artworks;
          delete clean.sources;
          delete clean.subtitles;
          delete clean.seasons;
          delete clean.episodes;
          delete clean.roles;
          delete clean.permissions;
          delete clean.movies;
          delete clean.series;
          delete clean.items;
          delete clean.preferences;
          delete clean.watchHistory;
          delete clean.ratings;
          delete clean.favorites;
          return clean;
        });

        // Insert records
        if (cleanRecords.length > 0) {
          await prisma[table.toLowerCase()].createMany({
            data: cleanRecords,
            skipDuplicates: true,
          });
        }

        // Restore relations separately
        await restoreRelations(table, records);

        totalRestored += records.length;
        console.log(`   ✅ Restored ${records.length} records to ${table}`);
      } catch (error) {
        console.log(`   ❌ Failed to restore ${table}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Database restoration completed!`);
    console.log(`📊 Total records restored: ${totalRestored}`);

    // Verify the restoration
    console.log("\n🔍 Verifying restoration...");
    const verificationResults = {};
    for (const table of restoreOrder) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        const expectedCount = exportData.data[table]?.length || 0;
        verificationResults[table] = {
          actual: count,
          expected: expectedCount,
          match: count === expectedCount,
        };

        if (count === expectedCount) {
          console.log(`   ✅ ${table}: ${count} records`);
        } else {
          console.log(
            `   ⚠️  ${table}: ${count} records (expected ${expectedCount})`
          );
        }
      } catch (error) {
        console.log(`   ❌ ${table}: Error counting records`);
      }
    }

    return {
      totalRestored,
      verificationResults,
      exportMetadata: exportData.metadata,
    };
  } catch (error) {
    console.error("❌ Error during database restoration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreRelations(table, records) {
  // Restore relations for specific tables
  switch (table) {
    case "Movie":
      for (const movie of records) {
        if (movie.genres) {
          for (const genre of movie.genres) {
            await prisma.movieGenre
              .create({
                data: {
                  movieId: movie.id,
                  genreId: genre.genreId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
        if (movie.tags) {
          for (const tag of movie.tags) {
            await prisma.movieTag
              .create({
                data: {
                  movieId: movie.id,
                  tagId: tag.tagId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
        if (movie.countries) {
          for (const country of movie.countries) {
            await prisma.movieCountry
              .create({
                data: {
                  movieId: movie.id,
                  countryId: country.countryId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
        if (movie.credits) {
          for (const credit of movie.credits) {
            await prisma.credit
              .create({
                data: {
                  movieId: movie.id,
                  personId: credit.personId,
                  role: credit.role,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
      }
      break;

    case "Series":
      for (const series of records) {
        if (series.genres) {
          for (const genre of series.genres) {
            await prisma.seriesGenre
              .create({
                data: {
                  seriesId: series.id,
                  genreId: genre.genreId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
        if (series.tags) {
          for (const tag of series.tags) {
            await prisma.seriesTag
              .create({
                data: {
                  seriesId: series.id,
                  tagId: tag.tagId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
        if (series.countries) {
          for (const country of series.countries) {
            await prisma.seriesCountry
              .create({
                data: {
                  seriesId: series.id,
                  countryId: country.countryId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
        if (series.credits) {
          for (const credit of series.credits) {
            await prisma.credit
              .create({
                data: {
                  seriesId: series.id,
                  personId: credit.personId,
                  role: credit.role,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
      }
      break;

    case "AdminUser":
      for (const user of records) {
        if (user.roles) {
          for (const role of user.roles) {
            await prisma.adminUserRole
              .create({
                data: {
                  adminUserId: user.id,
                  roleId: role.roleId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
      }
      break;

    case "Role":
      for (const role of records) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            await prisma.rolePermission
              .create({
                data: {
                  roleId: role.id,
                  permissionId: permission.permissionId,
                },
              })
              .catch(() => {}); // Skip duplicates
          }
        }
      }
      break;
  }
}

// Command line usage
if (require.main === module) {
  const exportFilePath = process.argv[2];

  if (!exportFilePath) {
    console.error("❌ Usage: node restore-database.js <export-file-path>");
    console.error(
      "   Example: node restore-database.js ./database-exports/database-export-2024-01-15T10-30-00-000Z.json"
    );
    process.exit(1);
  }

  restoreDatabase(exportFilePath)
    .then((result) => {
      console.log("\n✅ Database restoration completed successfully!");
      console.log(`📊 Total records restored: ${result.totalRestored}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Database restoration failed:", error);
      process.exit(1);
    });
}

module.exports = { restoreDatabase };
