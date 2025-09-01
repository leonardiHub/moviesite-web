import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const hostname = '51.79.254.237';
const port = 3001;
const adminBuildPath = './apps/admin/.next';

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Security middleware
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", `http://${hostname}:*`],
    },
  },
});

// CORS middleware
const corsMiddleware = cors({
  origin: [
    `http://${hostname}`,
    `http://${hostname}:*`,
    `https://${hostname}`,
    `https://${hostname}:*`
  ],
  credentials: true
});

// Compression middleware
const compressionMiddleware = compression();

// Serve static files
async function serveStaticFile(res, filePath, contentType) {
  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('File not found');
  }
}

// Get content type based on file extension
function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// Handle requests
async function handleRequest(req, res) {
  try {
    // Apply middleware
    helmetMiddleware(req, res, () => {});
    corsMiddleware(req, res, () => {});
    compressionMiddleware(req, res, () => {});
    
    const url = req.url;
    let filePath = '';
    
    // Handle different routes
    if (url === '/' || url === '/index.html') {
      filePath = join(adminBuildPath, 'static', 'html', 'index.html');
    } else if (url.startsWith('/_next/')) {
      // Next.js static assets
      filePath = join(adminBuildPath, 'static', url.substring(7));
    } else if (url.startsWith('/api/')) {
      // API routes - return placeholder for now
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'API endpoint - configure your backend here' }));
      return;
    } else {
      // Try to serve as static file
      filePath = join(adminBuildPath, 'static', url);
    }
    
    // Check if file exists
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const contentType = getContentType(filePath);
      await serveStaticFile(res, filePath, contentType);
    } else {
      // Fallback to index.html for client-side routing
      const indexPath = join(adminBuildPath, 'static', 'html', 'index.html');
      if (existsSync(indexPath)) {
        await serveStaticFile(res, indexPath, 'text/html');
      } else {
        res.writeHead(404);
        res.end('Page not found');
      }
    }
    
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
}

// Create server
const server = createServer(handleRequest);

server.listen(port, hostname, (err) => {
  if (err) throw err;
  console.log(`🚀 Admin Panel Server running on http://${hostname}:${port}`);
  console.log(`📁 Serving from: ${adminBuildPath}`);
  console.log(`🌐 CORS enabled for: ${hostname}:*`);
  console.log(`🔒 Security headers enabled with Helmet`);
  console.log(`🗜️  Compression enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
