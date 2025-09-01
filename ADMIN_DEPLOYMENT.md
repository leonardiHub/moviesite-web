# Admin Panel Deployment Guide

## Overview
This guide will help you deploy the Next.js admin panel on IP address `51.79.254.237` on port `3001`.

## Current Status ✅
- **Server**: Running successfully
- **IP Address**: 51.79.254.237
- **Port**: 3001
- **URL**: http://51.79.254.237:3001
- **Framework**: Next.js 14.2.3
- **Process ID**: 3088152

## Quick Start

### 1. Build the Admin Application
```bash
cd apps/admin
npm run build
```

### 2. Start the Admin Panel Server

#### Option A: Simple Startup Script
```bash
./start-admin-simple.sh
```

#### Option B: PM2 Production Deployment
```bash
# Install PM2 globally if not installed
npm install -g pm2

# Start with PM2
pm2 start admin-pm2.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Configuration

### Port Configuration
- **Current Port**: 3001
- **Change Port**: Modify `PORT` environment variable in startup scripts
- **Default Next.js Port**: 3000 (already occupied)

### IP Binding
The server is configured to bind to `51.79.254.237` by default.
To change this, modify the `HOSTNAME` environment variable.

### Environment Variables
```bash
export PORT=3001                    # Server port
export NODE_ENV=production          # Environment mode
export HOSTNAME=51.79.254.237      # Server hostname
```

## File Structure
```
├── apps/admin/                     # Admin application source
│   ├── .next/                     # Built Next.js application
│   ├── src/                       # Source code
│   ├── package.json               # Dependencies
│   └── next.config.mjs           # Next.js configuration
├── start-admin-simple.sh          # Simple startup script
├── admin-pm2.config.js            # PM2 configuration
├── check-admin-status.sh          # Status monitoring script
└── logs/                          # Application logs
```

## Access URLs

### Main Application
- **Admin Panel**: http://51.79.254.237:3001
- **Local Access**: http://localhost:3001

### API Endpoints
- **API Routes**: http://51.79.254.237:3001/api/*
- **Static Assets**: http://51.79.254.237:3001/_next/*

## Monitoring & Management

### Status Check
```bash
./check-admin-status.sh
```

### PM2 Commands
```bash
pm2 status              # Check process status
pm2 logs admin-panel    # View logs
pm2 restart admin-panel # Restart application
pm2 stop admin-panel    # Stop application
pm2 delete admin-panel  # Remove from PM2
```

### Process Management
```bash
# Check running processes
ps aux | grep next-server

# Check port usage
netstat -tulpn | grep :3001

# Kill process by PID
kill <PID>
```

## Security Features

### ✅ Enabled Security Measures
- **Next.js Built-in Security**: XSS protection, CSRF protection
- **Environment Variables**: Secure configuration management
- **Production Mode**: Optimized and secure builds
- **Static File Serving**: Secure asset delivery

### 🔒 CORS Configuration
- Configured for your IP domain
- Credentials support enabled
- Secure origin validation

## Performance Optimization

### Current Optimizations
- ✅ Next.js production build
- ✅ Static file optimization
- ✅ Code splitting and lazy loading
- ✅ Image optimization
- ✅ CSS and JS minification

### Additional Optimizations
- **CDN**: Consider using a CDN for static assets
- **Caching**: Implement Redis for session storage
- **Load Balancing**: Use nginx as reverse proxy
- **SSL**: Add HTTPS with Let's Encrypt

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3001

# Kill the process
sudo kill -9 <PID>
```

#### Build Errors
```bash
# Clean and rebuild
cd apps/admin
rm -rf .next/
npm run build
```

#### Permission Denied
```bash
# Make script executable
chmod +x start-admin-simple.sh
chmod +x check-admin-status.sh
```

#### Next.js Not Starting
```bash
# Check dependencies
cd apps/admin
npm install

# Check build
npm run build

# Start manually
npm run start
```

### Firewall Configuration
If you're using UFW:
```bash
# Allow your port
sudo ufw allow 3001

# Check status
sudo ufw status
```

## Maintenance

### Regular Tasks
1. **Log Rotation**: Monitor log file sizes in `./logs/`
2. **Security Updates**: Keep dependencies updated
3. **Performance Monitoring**: Check PM2 metrics
4. **Backup**: Backup configuration files

### Update Process
```bash
# Pull latest changes
git pull

# Install dependencies
cd apps/admin
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart admin-panel
```

## Development vs Production

### Development Mode
```bash
cd apps/admin
npm run dev
# Runs on http://localhost:3000
```

### Production Mode
```bash
# Build first
npm run build

# Start production server
npm run start
# Runs on http://51.79.254.237:3001
```

## Support & Monitoring

### Health Checks
- **Status Script**: `./check-admin-status.sh`
- **Process Monitoring**: `ps aux | grep next-server`
- **Port Monitoring**: `netstat -tulpn | grep :3001`
- **Response Testing**: `curl -I http://51.79.254.237:3001`

### Log Files
- **Error logs**: `./logs/admin-err.log`
- **Output logs**: `./logs/admin-out.log`
- **Combined logs**: `./logs/admin-combined.log`

### Performance Metrics
- **Memory Usage**: Check with status script
- **Uptime**: Monitor process uptime
- **Response Time**: Test with curl commands

---
**Last Updated**: $(date)
**Version**: 1.0.0
**Status**: ✅ Running on Port 3001
