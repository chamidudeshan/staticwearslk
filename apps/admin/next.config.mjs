/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverActions: { bodySizeLimit: '10mb' },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: [
    '@static-wears/shared',
    '@static-wears/user-service',
    '@static-wears/product-service',
    '@static-wears/order-service',
  ],
};

export default nextConfig;
