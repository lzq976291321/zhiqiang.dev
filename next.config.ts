import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.opennana.com",
        pathname: "/prompts/assets/**",
      },
    ],
  },
};

export default nextConfig;
