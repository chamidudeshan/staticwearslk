/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // Safety net: Clerk's default paths → our custom paths
      { source: '/sign-in', destination: '/login', permanent: false },
      { source: '/sign-in/:path*', destination: '/login/:path*', permanent: false },
      { source: '/sign-up', destination: '/register', permanent: false },
      { source: '/sign-up/:path*', destination: '/register/:path*', permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'api.staticwears.com',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
  transpilePackages: [
    '@static-wears/shared',
    '@static-wears/user-service',
    '@static-wears/product-service',
    '@static-wears/order-service',
    '@static-wears/payment-service',
    '@static-wears/email-service',
  ],
};

export default nextConfig;
