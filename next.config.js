/** @type {import('next').NextConfig} */

const __PROD__ = process.env.NODE_ENV === 'production';

const destinationHost = __PROD__ ? 'https://ichallengeu.app' : 'http://localhost:3000';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
      },
      {
        source: "/favicon.ico",
        destination: `${destinationHost}/favicon.ico`,
      },
      {
        source: "/chevron-down.svg",
        destination: `${destinationHost}/chevron-down.svg`,
      },
      {
        source: "/chevron-left.svg",
        destination: `${destinationHost}/chevron-left.svg`,
      },
      {
        source: "/frozen-fire.svg",
        destination: `${destinationHost}/frozen-fire.svg`,
      },
    ];
  }
}

module.exports = nextConfig
