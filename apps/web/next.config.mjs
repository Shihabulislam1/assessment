const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!nextPublicApiUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${nextPublicApiUrl}/api/:path*` }];
  },
};

export default nextConfig;
