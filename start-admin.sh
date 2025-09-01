#!/bin/bash

# Admin Panel Startup Script
echo "🚀 Starting Admin Panel Server..."

# Set environment variables
export PORT=${PORT:-3000}
export NODE_ENV=production

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found. Please run 'npm run build' first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌐 Starting server on http://51.79.254.237:${PORT}"
echo "📁 Serving files from: $(pwd)/dist"
echo "🔒 Security features enabled"
echo ""

# Run the server
node server.js
