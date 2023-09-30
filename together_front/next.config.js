/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ["kr.object.ncloudstorage.com"],
  },
};

module.exports = nextConfig;
