#!/bin/bash

# Development startup script for local development
echo "Starting admin panel in development mode..."

# Set environment variables for development
export NODE_ENV=development
export NEXT_PUBLIC_API_BASE=http://localhost:4000
export NEXT_PUBLIC_API_URL=http://localhost:4000

# Start the development server
echo "Environment: $NODE_ENV"
echo "API Base: $NEXT_PUBLIC_API_BASE"
echo "Starting npm run dev..."

npm run dev

