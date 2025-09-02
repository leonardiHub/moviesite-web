/** @type {import('next').NextConfig} */
export default {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    domains: ['localhost', '51.79.254.237'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  server: {
    hostname: '0.0.0.0',
    port: 3001,
  },
  async rewrites() {
    // Auto-detect environment based on NODE_ENV
    const isDevelopment = process.env.NODE_ENV === 'development';
    const defaultApiUrl = isDevelopment 
      ? 'http://localhost:4000' 
      : 'http://51.79.254.237:4000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || defaultApiUrl}/api/:path*`,
      },
    ];
  },
};
