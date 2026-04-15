/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  ...(process.env.BASE_PATH
    ? { basePath: process.env.BASE_PATH, assetPrefix: process.env.BASE_PATH }
    : {}),
};

module.exports = nextConfig;
