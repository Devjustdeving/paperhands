import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.dexscreener.com" },
      { protocol: "https", hostname: "**.arweave.net" },
      { protocol: "https", hostname: "**.ipfs.io" },
    ],
  },
};

export default nextConfig;
