import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonical: redirect www → non-www agar OAuth callback URL konsisten
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nukaedu.web.id" }],
        destination: "https://nukaedu.web.id/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
