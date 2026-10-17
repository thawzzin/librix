import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.gutenberg.org' },
      { protocol: 'https', hostname: 'gutendex.com' },
    ],
  },
};

export default nextConfig;
