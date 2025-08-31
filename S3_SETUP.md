# 🚀 S3 Integration Setup Guide

## 📋 **What You Need from Your Team**

Ask your team to provide these AWS credentials:

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=your-moviesite-bucket-name
AWS_REGION=us-east-1
```

## 🔧 **Step 1: Create Environment File**

Create `apps/api/.env` file with:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/moviesite_db"
REDIS_URL="redis://localhost:6379"

# AWS S3 Configuration (Ask your team for these)
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_S3_BUCKET=your-moviesite-bucket-name
AWS_REGION=us-east-1

# Optional: CloudFront CDN
AWS_CLOUDFRONT_DOMAIN=cdn.yourdomain.com

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=4000
NODE_ENV=development

# Public Base URL (for CDN links)
PUBLIC_BASE_URL=http://localhost:4000
```

## 🎯 **Step 2: S3 Bucket Structure**

Your S3 bucket should have this structure:

```
your-moviesite-bucket/
├── movies/
│   ├── m17/
│   │   ├── poster.jpg
│   │   ├── backdrop.jpg
│   │   └── trailer.mp4
│   └── m18/
│       ├── poster.jpg
│       └── backdrop.jpg
├── brand/
│   ├── logo-light.svg
│   ├── logo-dark.svg
│   └── favicon.ico
└── sponsors/
    ├── hero-1.png
    └── sidebar-1.png
```

## 🔒 **Step 3: S3 Bucket Permissions**

Your team needs to set these permissions:

- **Public read access** for images (so users can view them)
- **Private write access** for admin uploads
- **CORS enabled** for web access

## 🚀 **Step 4: Test Integration**

Once you have the credentials:

1. **Restart your API server**
2. **Test file upload** via admin panel
3. **Verify images load** in frontend

## 📱 **Your Code is Already Ready!**

The S3 integration is already configured in:

- `apps/api/src/modules/storage/storage.service.ts`
- Environment variables will be automatically loaded

## 🎬 **What Happens Next**

1. **Team provides AWS credentials**
2. **You add them to `.env` file**
3. **Restart API server**
4. **Start uploading movie images to S3!**

## 💡 **Pro Tips**

- **Never commit `.env` files to Git**
- **Use different buckets for dev/staging/prod**
- **Enable CloudFront for global CDN later**
- **Set up S3 lifecycle policies for cost optimization**
