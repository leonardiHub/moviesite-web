# Update Production Code

Your production services need to be updated with the latest codebase. Here's how to deploy the latest code:

## 🚀 Quick Update Steps

### Step 1: Upload Latest Code

Upload these files/directories to your production server:

**API Files to upload:**

- `src/` (entire directory)
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `prisma/` (entire directory)

**Admin Frontend Files to upload:**

- `../admin/src/` (entire directory)
- `../admin/package.json`
- `../admin/package-lock.json`
- `../admin/next.config.mjs`
- `../admin/tailwind.config.ts`
- `../admin/tsconfig.json`

### Step 2: SSH into Production Server

```bash
ssh root@51.79.254.237
```

### Step 3: Update API

```bash
# Navigate to API directory
cd /root/moviesite-web/apps/api

# Install dependencies
npm install

# Build the application
npm run build

# Generate Prisma client
npx prisma generate

# Push database schema changes
npx prisma db push

# Restart API service
pm2 restart api
# OR if not using PM2:
# npm run start:dev &
```

### Step 4: Update Admin Frontend

```bash
# Navigate to admin directory
cd /root/moviesite-web/apps/admin

# Install dependencies
npm install

# Build the application
npm run build

# Restart admin service
pm2 restart admin
# OR if not using PM2:
# npm run start:dev &
```

### Step 5: Verify Deployment

```bash
# Test API health
curl http://51.79.254.237:4000/health

# Test API login
curl -X POST http://51.79.254.237:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test frontend
curl -I http://51.79.254.237:3001/
```

## 🎯 What Gets Updated

After deployment, your production environment will have:

- ✅ **Latest Admin UI** - Updated interface and components
- ✅ **Movie Filtering** - Tags, genres, casts, countries filtering
- ✅ **Enhanced Movie Management** - Better CRUD operations
- ✅ **Bug Fixes** - All recent fixes and improvements
- ✅ **Updated Dependencies** - Latest package versions
- ✅ **Database Schema** - Any schema changes applied

## 🔧 Alternative: Git-Based Deployment

If you prefer using Git:

```bash
# On production server
cd /root/moviesite-web

# Pull latest changes
git pull origin main

# Update API
cd apps/api
npm install
npm run build
npx prisma generate
npx prisma db push
pm2 restart api

# Update Admin
cd ../admin
npm install
npm run build
pm2 restart admin
```

## 🆘 Troubleshooting

If you encounter issues:

1. **Check service status**:

   ```bash
   pm2 status
   ```

2. **Check logs**:

   ```bash
   pm2 logs api
   pm2 logs admin
   ```

3. **Check build errors**:

   ```bash
   cd /root/moviesite-web/apps/api
   npm run build

   cd /root/moviesite-web/apps/admin
   npm run build
   ```

4. **Restart all services**:
   ```bash
   pm2 restart all
   ```

## ✅ Success Indicators

You'll know the update was successful when:

- ✅ API responds at http://51.79.254.237:4000/
- ✅ Frontend loads at http://51.79.254.237:3001/
- ✅ Admin login works with admin/admin123
- ✅ Movie filtering functionality works
- ✅ All latest UI improvements are visible

## 📊 Expected Results

After successful deployment:

- **Frontend**: http://51.79.254.237:3001/ - Latest admin panel
- **API**: http://51.79.254.237:4000/ - Updated backend with latest features
- **Database**: All your 311 records preserved
- **Features**: Movie filtering, enhanced UI, bug fixes

Your production environment will be fully up to date with your latest codebase! 🚀

