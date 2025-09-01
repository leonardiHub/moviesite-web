#!/bin/bash

# Admin Panel Startup Script
echo "🚀 Starting Admin Panel Server on Port 3001..."

# Navigate to admin directory
cd apps/admin

# Set environment variables
export PORT=3001
export NODE_ENV=production
export HOSTNAME=51.79.254.237

# Check if .next folder exists
if [ ! -d ".next" ]; then
    echo "❌ Error: .next folder not found. Please run 'npm run build' first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if admin-server.js exists in parent directory
if [ ! -f "../admin-server.js" ]; then
    echo "❌ Error: admin-server.js not found in parent directory."
    exit 1
fi

# Start the admin server
echo "🌐 Starting admin panel on http://51.79.254.237:3001"
echo "📁 Serving from: $(pwd)/.next"
echo "🔒 Security features enabled"
echo ""

# Run the admin server from parent directory
cd ..
node admin-server.js
