/** @type {import('next').NextConfig} */
export default {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    domains: ['51.79.254.237'],
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
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://51.79.254.237:4000'}/api/:path*`,
      },
    ];
  },
};
