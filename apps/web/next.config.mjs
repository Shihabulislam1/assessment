/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
  async rewrites() {
    const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

    if (!nextPublicApiUrl) {
      throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
    }

    return [{ source: '/api/:path*', destination: `${nextPublicApiUrl}/api/:path*` }];
  },
};

export default nextConfig;
