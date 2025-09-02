#!/bin/bash

# Database Backup Script
# This script exports your local database for production migration

echo "🗄️  MovieSite Database Export Script"
echo "======================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the apps/api directory"
    exit 1
fi

# Check if Prisma is available
if [ ! -f "node_modules/.bin/prisma" ]; then
    echo "❌ Prisma is not installed. Please run 'npm install' first"
    exit 1
fi

echo "📋 Starting database export..."
echo ""

# Run the export script
node export-database.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database export completed successfully!"
    echo ""
    echo "📁 Your database export files are in the 'database-exports' directory"
    echo "📋 Use the restore-database.js script to restore in production"
    echo ""
    echo "🚀 To restore in production:"
    echo "   1. Copy the export file to your production server"
    echo "   2. Run: node restore-database.js <export-file-path>"
    echo ""
else
    echo ""
    echo "❌ Database export failed!"
    exit 1
fi
