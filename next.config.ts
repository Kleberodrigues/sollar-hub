import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "btaqtllwqfzxkrcmaskh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
