/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Abaikan error eslint saat build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Abaikan error typescript saat build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
