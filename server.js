const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '51.79.254.237';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://51.79.254.237:*"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://51.79.254.237',
    'http://51.79.254.237:*',
    'https://51.79.254.237',
    'https://51.79.254.237:*'
  ],
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy for development (if needed)
app.use('/api', (req, res) => {
  res.json({ message: 'API endpoint - configure your backend here' });
});

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Admin Panel Server running on http://${HOST}:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌐 CORS enabled for: ${HOST}:*`);
  console.log(`🔒 Security headers enabled with Helmet`);
  console.log(`📊 Logging enabled with Morgan`);
  console.log(`🗜️  Compression enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
