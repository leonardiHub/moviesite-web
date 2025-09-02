# Database Migration Guide

This guide explains how to export your local database and restore it in production to completely replace your production database.

## 🗄️ Database Export (Local → Production)

### Quick Start

```bash
# From the apps/api directory
./backup-database.sh
```

### Manual Export

```bash
# From the apps/api directory
node export-database.js
```

### What Gets Exported

The export script creates a complete snapshot of your local database including:

- **Admin Users & Permissions**: 1 admin user, 1 role, 8 permissions
- **Content Data**: 13 movies, 35 cast members, 75 genres, 25 tags
- **Relations**: Movie-genre associations, movie-tag associations, cast credits
- **Media Assets**: 21 artworks, 13 video sources
- **Total**: 311 records across 35 tables

### Export Files Created

- `database-exports/database-export-YYYY-MM-DDTHH-MM-SS-sssZ.json` - Complete database dump
- `database-exports/export-summary-YYYY-MM-DDTHH-MM-SS-sssZ.json` - Export summary with record counts

## 🚀 Database Restore (Production)

### Prerequisites

1. **Backup your production database first!**
2. Ensure your production environment has the same Prisma schema
3. Copy the export file to your production server

### Restore Process

```bash
# On your production server, from the apps/api directory
node restore-database.js <path-to-export-file>
```

### Example

```bash
node restore-database.js ./database-exports/database-export-2025-09-02T16-32-50-159Z.json
```

### What Happens During Restore

1. **Verification**: Checks export file exists and is valid
2. **Clear Production**: Removes all existing data (respecting foreign key constraints)
3. **Restore Data**: Inserts all records in the correct order
4. **Restore Relations**: Recreates all relationships between tables
5. **Verification**: Confirms all records were restored correctly

## ⚠️ Important Warnings

### Before Running Restore

- **This will completely replace your production database**
- **Make sure you have a backup of your current production data**
- **Test the restore process on a staging environment first**

### Data Considerations

- All existing production data will be lost
- User accounts, preferences, and watch history will be replaced
- Admin users and permissions will be replaced
- All content (movies, series, etc.) will be replaced

## 📊 Export Summary

Your latest export contains:

- **AdminUser**: 1 record
- **Role**: 1 record
- **Permission**: 8 records
- **RolePermission**: 8 records
- **AdminUserRole**: 1 record
- **Genre**: 75 records
- **Tag**: 25 records
- **Country**: 1 record
- **Person**: 35 records
- **Movie**: 13 records
- **Series**: 0 records
- **Season**: 0 records
- **Episode**: 0 records
- **MovieGenre**: 34 records
- **MovieTag**: 26 records
- **MovieCountry**: 13 records
- **SeriesGenre**: 0 records
- **SeriesTag**: 0 records
- **Credit**: 36 records
- **Artwork**: 21 records
- **Source**: 13 records
- **Subtitle**: 0 records
- **Collection**: 0 records
- **CollectionItem**: 0 records
- **AuditLog**: 0 records
- **Brand**: 0 records
- **Sponsor**: 0 records
- **SponsorAsset**: 0 records
- **Placement**: 0 records
- **Campaign**: 0 records
- **CampaignAsset**: 0 records
- **User**: 0 records
- **UserHistory**: 0 records
- **UserFavorite**: 0 records
- **Report**: 0 records

**Total: 311 records**

## 🔧 Troubleshooting

### Export Issues

- Ensure your local database is running and accessible
- Check that Prisma client is properly configured
- Verify all required dependencies are installed

### Restore Issues

- Ensure production database is accessible
- Check that the export file is not corrupted
- Verify Prisma schema matches between local and production
- Check database permissions for the restore process

### Common Errors

- **"Cannot read properties of undefined"**: Table name mismatch - check Prisma model names
- **"Foreign key constraint fails"**: Data insertion order issue - check table dependencies
- **"Permission denied"**: Database user lacks necessary permissions

## 📁 File Structure

```
apps/api/
├── export-database.js          # Export script
├── restore-database.js         # Restore script
├── backup-database.sh          # Convenience script
├── DATABASE_MIGRATION_GUIDE.md # This guide
└── database-exports/           # Export files directory
    ├── database-export-*.json  # Database dumps
    └── export-summary-*.json   # Export summaries
```

## 🎯 Next Steps

1. **Test the export**: Run `node export-database.js` to create a fresh export
2. **Backup production**: Create a backup of your current production database
3. **Test restore**: Test the restore process on a staging environment
4. **Deploy to production**: Run the restore script on your production server
5. **Verify**: Check that all data was restored correctly

## 📞 Support

If you encounter issues during the migration process:

1. Check the console output for specific error messages
2. Verify your database connection and permissions
3. Ensure the Prisma schema is consistent between environments
4. Test with a smaller dataset first if possible
