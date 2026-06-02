import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: mengemas server + deps minimum saja (~50MB vs ~500MB node_modules)
  // Hasil build ada di .next/standalone/ — siap dijalankan dengan `node server.js`
  output: "standalone",
};

export default nextConfig;
