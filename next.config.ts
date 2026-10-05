import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Fully prefetched editorial pages must not retain the default five-minute
  // client cache after the editor changes or trashes a story.
  experimental: { staleTimes: { dynamic: 15, static: 30 } },

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
        source: "/2026/09/27/f1-fans-please-touch-grass-alpine-speaks-out-after-baku-drama",
        destination: "/blog/f1-fans-please-touch-grass-alpine-speaks-out-after-baku-drama",
        permanent: true,
      },
      {
        source: "/2026/09/27/george-russell-survives-baku-chaos-to-take-azerbaijan-grand-prix-win",
        destination: "/blog/george-russell-survives-baku-chaos-to-take-azerbaijan-grand-prix-win",
        permanent: true,
      },
      {
        source: "/2026/09/25/george-russell-takes-baku-pole-as-kimi-antonelli-crashes-out-in-q1",
        destination: "/blog/george-russell-takes-baku-pole-as-kimi-antonelli-crashes-out-in-q1",
        permanent: true,
      },
      {
        source: "/2026/09/04/a-beginners-guide-to-formula-1%f0%9f%8f%8e%ef%b8%8f%f0%9f%92%96",
        destination: "/blog/a-beginners-guide-to-formula-1%f0%9f%8f%8e%ef%b8%8f%f0%9f%92%96",
        permanent: true,
      },
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
