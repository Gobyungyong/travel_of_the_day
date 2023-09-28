/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["kr.object.ncloudstorage.com"],
  },
};

module.exports = nextConfig;
