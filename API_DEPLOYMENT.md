# API Server Deployment Guide

## Overview
This guide will help you deploy the NestJS Movie Site API on IP address `51.79.254.237` on port `4000`.

## Current Status ✅
- **Server**: Running successfully
- **IP Address**: 51.79.254.237
- **Port**: 4000
- **URL**: http://51.79.254.237:4000
- **Framework**: NestJS
- **Process ID**: 2751823
- **Memory Usage**: 1.9%
- **Uptime**: 8 days, 16 hours, 42 minutes

## Quick Start

### 1. Build the API Application
```bash
cd apps/api
npm run build
```

### 2. Start the API Server

#### Option A: Simple Startup Script
```bash
./start-api.sh
```

#### Option B: PM2 Production Deployment
```bash
# Install PM2 globally if not installed
npm install -g pm2

# Start with PM2
pm2 start api-ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Configuration

### Port Configuration
- **Current Port**: 4000
- **Change Port**: Modify `PORT` environment variable in startup scripts
- **Default NestJS Port**: 4000

### IP Binding
The server is configured to bind to `51.79.254.237` by default.
To change this, modify the `HOSTNAME` environment variable.

### Environment Variables
```bash
export PORT=4000                    # Server port
export NODE_ENV=production          # Environment mode
export HOSTNAME=51.79.254.237      # Server hostname
```

## File Structure
```
├── apps/api/                       # API application source
│   ├── dist/                       # Built NestJS application
│   ├── src/                        # Source code
│   ├── prisma/                     # Database schema and migrations
│   ├── public/                     # Static files and CDN
│   ├── package.json                # Dependencies
│   └── env.template                # Environment template
├── start-api.sh                    # Simple startup script
├── api-ecosystem.config.js         # PM2 configuration
├── check-api-status.sh             # Status monitoring script
└── logs/                           # Application logs
```

## Access URLs

### Main Application
- **API Base**: http://51.79.254.237:4000/v1
- **API Documentation**: http://51.79.254.237:4000/docs
- **OpenAPI JSON**: http://51.79.254.237:4000/openapi.json
- **CDN Files**: http://51.79.254.237:4000/cdn/*

### API Endpoints
- **Authentication**: http://51.79.254.237:4000/v1/auth/*
- **Movies**: http://51.79.254.237:4000/v1/movies/*
- **Users**: http://51.79.254.237:4000/v1/users/*
- **Admin**: http://51.79.254.237:4000/v1/admin/*

## Monitoring & Management

### Status Check
```bash
./check-api-status.sh
```

### PM2 Commands
```bash
pm2 status              # Check process status
pm2 logs movie-api      # View logs
pm2 restart movie-api   # Restart application
pm2 stop movie-api      # Stop application
pm2 delete movie-api    # Remove from PM2
```

### Process Management
```bash
# Check running processes
ps aux | grep 'npm.*start:prod'

# Check port usage
netstat -tulpn | grep :4000

# Kill process by PID
kill <PID>
```

## Security Features

### ✅ Enabled Security Measures
- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 300 requests per minute
- **Compression**: Gzip compression
- **Validation Pipes**: Input validation
- **JWT Authentication**: Secure token-based auth

### 🔒 Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security
- Cross-Origin policies

## Performance Optimization

### Current Optimizations
- ✅ NestJS production build
- ✅ Gzip compression
- ✅ Rate limiting
- ✅ Static file serving
- ✅ Database connection pooling
- ✅ Redis caching support

### Additional Optimizations
- **CDN**: AWS S3 + CloudFront integration
- **Caching**: Redis for session and data caching
- **Load Balancing**: nginx as reverse proxy
- **SSL**: HTTPS with Let's Encrypt
- **Monitoring**: Application performance monitoring

## Database & Dependencies

### Required Services
- **PostgreSQL**: Main database
- **Redis**: Caching and session storage
- **AWS S3**: File storage (optional)
- **Meilisearch**: Search engine (optional)

### Environment Configuration
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
REDIS_URL="redis://localhost:6379"

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :4000

# Kill the process
sudo kill -9 <PID>
```

#### Build Errors
```bash
# Clean and rebuild
cd apps/api
rm -rf dist/
npm run build
```

#### Permission Denied
```bash
# Make script executable
chmod +x start-api.sh
chmod +x check-api-status.sh
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check Redis status
sudo systemctl status redis

# Test database connection
cd apps/api
npm run db:studio
```

#### Environment Variables
```bash
# Create .env from template
cd apps/api
cp env.template .env

# Edit with your values
nano .env
```

### Firewall Configuration
If you're using UFW:
```bash
# Allow your port
sudo ufw allow 4000

# Check status
sudo ufw status
```

## Maintenance

### Regular Tasks
1. **Log Rotation**: Monitor log file sizes in `./logs/`
2. **Security Updates**: Keep dependencies updated
3. **Performance Monitoring**: Check PM2 metrics
4. **Database Maintenance**: Regular backups and optimization
5. **Backup**: Backup configuration and environment files

### Update Process
```bash
# Pull latest changes
git pull

# Install dependencies
cd apps/api
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart movie-api
```

## Development vs Production

### Development Mode
```bash
cd apps/api
npm run start:dev
# Runs on http://localhost:4000 with hot reload
```

### Production Mode
```bash
# Build first
npm run build

# Start production server
npm run start:prod
# Runs on http://51.79.254.237:4000
```

## Support & Monitoring

### Health Checks
- **Status Script**: `./check-api-status.sh`
- **Process Monitoring**: `ps aux | grep 'npm.*start:prod'`
- **Port Monitoring**: `netstat -tulpn | grep :4000`
- **API Testing**: `curl -I http://51.79.254.237:4000/v1`
- **Docs Testing**: `curl -I http://51.79.254.237:4000/docs`

### Log Files
- **Error logs**: `./logs/api-err.log`
- **Output logs**: `./logs/api-out.log`
- **Combined logs**: `./logs/api-combined.log`

### Performance Metrics
- **Memory Usage**: Check with status script
- **Uptime**: Monitor process uptime
- **Response Time**: Test with curl commands
- **Rate Limiting**: Check X-RateLimit headers

### API Documentation
- **Swagger UI**: http://51.79.254.237:4000/docs
- **OpenAPI JSON**: http://51.79.254.237:4000/openapi.json
- **API Base**: http://51.79.254.237:4000/v1

---
**Last Updated**: $(date)
**Version**: 1.0.0
**Status**: ✅ Running on Port 4000
**Framework**: NestJS
**Database**: PostgreSQL + Redis
