/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don’t fail the production build because of ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
