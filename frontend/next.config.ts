import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['192.168.29.117'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;