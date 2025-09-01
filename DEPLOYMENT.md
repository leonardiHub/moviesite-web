# Admin Panel Deployment Guide

## Overview
This guide will help you deploy the admin panel on IP address `51.79.254.237` with proper production configuration.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- PM2 (for production process management)
- Firewall access to your desired port

## Quick Start

### 1. Build the Application
```bash
npm run build
```

### 2. Install Dependencies (if not already done)
```bash
npm install
```

### 3. Start the Server

#### Option A: Direct Start
```bash
./start-admin.sh
```

#### Option B: PM2 Production Deployment
```bash
# Install PM2 globally if not installed
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Configuration

### Port Configuration
- Default port: 3000
- Change by setting environment variable: `export PORT=8080`
- Or modify `ecosystem.config.js`

### IP Binding
The server is configured to bind to `51.79.254.237` by default.
To change this, edit `server.js` and modify the `HOST` constant.

### Environment Variables
```bash
export PORT=3000          # Server port
export NODE_ENV=production # Environment mode
```

## Security Features

### ✅ Enabled Security Measures
- **Helmet.js**: Security headers
- **CORS**: Configured for your IP domain
- **Compression**: Gzip compression for better performance
- **Morgan**: Request logging
- **Content Security Policy**: XSS protection

### 🔒 CORS Configuration
The server allows requests from:
- `http://51.79.254.237:*`
- `https://51.79.254.237:*`

## File Structure
```
├── dist/                 # Built application files
├── server.js            # Production server
├── start-admin.sh       # Startup script
├── ecosystem.config.js  # PM2 configuration
├── logs/                # Application logs
└── package.json         # Dependencies
```

## Access URLs

### Main Application
- **Local**: http://localhost:3000
- **Network**: http://51.79.254.237:3000

### API Endpoints
- **Health Check**: http://51.79.254.237:3000/api
- **Static Files**: http://51.79.254.237:3000/assets/

## Monitoring & Logs

### PM2 Commands
```bash
pm2 status              # Check process status
pm2 logs admin-panel    # View logs
pm2 restart admin-panel # Restart application
pm2 stop admin-panel    # Stop application
pm2 delete admin-panel  # Remove from PM2
```

### Log Files
- **Error logs**: `./logs/err.log`
- **Output logs**: `./logs/out.log`
- **Combined logs**: `./logs/combined.log`

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000

# Kill the process
sudo kill -9 <PID>
```

#### Permission Denied
```bash
# Make script executable
chmod +x start-admin.sh
```

#### CORS Issues
- Check if the requesting domain is in the CORS configuration
- Verify the IP address matches exactly

#### Build Errors
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Firewall Configuration
If you're using UFW:
```bash
# Allow your port
sudo ufw allow 3000

# Check status
sudo ufw status
```

## Performance Optimization

### Current Optimizations
- ✅ Gzip compression
- ✅ Static file serving
- ✅ Security headers
- ✅ Request logging

### Additional Optimizations
- **CDN**: Consider using a CDN for static assets
- **Caching**: Implement Redis for session storage
- **Load Balancing**: Use nginx as reverse proxy
- **SSL**: Add HTTPS with Let's Encrypt

## Maintenance

### Regular Tasks
1. **Log Rotation**: Monitor log file sizes
2. **Security Updates**: Keep dependencies updated
3. **Performance Monitoring**: Check PM2 metrics
4. **Backup**: Backup configuration files

### Update Process
```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart admin-panel
```

## Support
For issues or questions:
1. Check the logs in `./logs/` directory
2. Verify firewall and network configuration
3. Ensure all dependencies are installed
4. Check PM2 process status

---
**Last Updated**: $(date)
**Version**: 1.0.0
