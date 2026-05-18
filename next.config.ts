import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/prompts",
        destination: "/agent",
        permanent: false,
      },
      {
        source: "/prompts/:path*",
        destination: "/agent",
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
