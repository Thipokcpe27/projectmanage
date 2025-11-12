/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'drive.google.com'],
  },
  // Vercel serverless config
  serverRuntimeConfig: {
    maxDuration: 10, // seconds for hobby plan
  },
}

module.exports = nextConfig
