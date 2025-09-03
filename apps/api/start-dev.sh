#!/bin/bash

# Set environment variables
export PUBLIC_BASE_URL="http://localhost:4000"
export USE_DIRECT_S3_URLS="true"
export S3_BUCKET_NAME="th-movie-storage"
export S3_REGION="ap-southeast-1"

# Start the development server
npm run start:dev
