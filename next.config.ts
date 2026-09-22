import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.formula1.com",
      },
      {
        protocol: "https",
        hostname: "fastgirlsclub.co.uk",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "cms.fastgirlsclub.co.uk",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination:
          "https://cms.fastgirlsclub.co.uk/wp-content/uploads/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
