#!/bin/bash

# Simple Admin Panel Startup Script using Next.js built-in server
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

# Start the Next.js server
echo "🌐 Starting admin panel on http://51.79.254.237:3001"
echo "📁 Serving from: $(pwd)/.next"
echo "🔒 Using Next.js built-in server"
echo ""

# Run the Next.js start command
npm run start
