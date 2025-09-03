# Environment Configuration Guide

This guide explains how to configure the admin panel for different environments.

## 🏠 Local Development

### Prerequisites
- Backend API running on `localhost:4000`
- Node.js and npm installed

### Quick Start
```bash
# Navigate to admin directory
cd apps/admin

# Option 1: Use the development script
./start-dev.sh

# Option 2: Manual start
export NODE_ENV=development
export NEXT_PUBLIC_API_BASE=http://localhost:4000
export NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

### What Happens
- Frontend runs on `http://localhost:3000`
- Connects to backend at `http://localhost:4000`
- Uses development environment variables
- Hot reload enabled

## 🚀 Production (Ubuntu Server)

### Prerequisites
- Backend API running on `51.79.254.237:4000`
- Server accessible on `51.79.254.237:3001`

### Quick Start
```bash
# Navigate to project root
cd /home/ubuntu/irn-task-manager/MOVIESITE

# Option 1: Use the production script
./start-admin-simple.sh

# USE THIS - Option 2: Use PM2 (recommended for production)
pm2 start admin-pm2.config.cjs
```

### What Happens
- Frontend runs on `http://51.79.254.237:3001`
- Connects to backend at `http://51.79.254.237:4000`
- Uses production environment variables
- Optimized for production

## 🔧 Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Production (.env.production)
```bash
NEXT_PUBLIC_API_BASE=http://51.79.254.237:4000
NEXT_PUBLIC_API_URL=http://51.79.254.237:4000
```

## 📁 File Structure
```
apps/admin/
├── .env.local          # Local development (gitignored)
├── .env.production     # Production environment
├── start-dev.sh        # Development startup script
├── next.config.mjs     # Next.js configuration
└── src/                # Source code
```

## 🔄 Switching Environments

### From Development to Production
1. Stop development server (`Ctrl+C`)
2. Build the project: `npm run build`
3. Start production: `./start-admin-simple.sh`

### From Production to Development
1. Stop production server (`pm2 stop admin-panel` or `Ctrl+C`)
2. Navigate to admin directory: `cd apps/admin`
3. Start development: `./start-dev.sh`

## 🌐 Next.js Configuration

The `next.config.mjs` automatically detects the environment:
- **Development**: Uses `localhost:4000`
- **Production**: Uses `51.79.254.237:4000`

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for your environment
   - Check API base URL matches your environment

2. **Port Already in Use**
   - Development: Change port in `package.json` scripts
   - Production: Check PM2 processes with `pm2 status`

3. **Environment Variables Not Loading**
   - Restart the server after changing environment files
   - Check file permissions and syntax

### Debug Commands
```bash
# Check current environment
echo $NODE_ENV
echo $NEXT_PUBLIC_API_BASE

# Check running processes
pm2 status
netstat -tlnp | grep :3001

# View logs
pm2 logs admin-panel
```

## 📝 Notes

- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- The `NODE_ENV` variable controls which environment configuration is used
- Always restart the server after changing environment variables
- Production builds are optimized and don't include development features

