#!/bin/bash

# API Server Startup Script
echo "🚀 Starting Movie Site API Server on Port 4000..."

# Navigate to API directory
cd apps/api

# Set environment variables
export PORT=4000
export NODE_ENV=production
export HOSTNAME=51.79.254.237

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

# Check if .env file exists, if not create from template
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    if [ -f "env.template" ]; then
        cp env.template .env
        echo "✅ Created .env from template. Please configure your environment variables."
        echo "📝 Edit .env file with your database and AWS credentials."
    else
        echo "❌ Error: env.template not found. Please create .env file manually."
        exit 1
    fi
fi

# Start the API server
echo "🌐 Starting API server on http://51.79.254.237:4000"
echo "📁 Serving from: $(pwd)/dist"
echo "🔒 Production mode enabled"
echo "📚 API Documentation: http://51.79.254.237:4000/docs"
echo ""

# Run the production server
npm run start:prod
