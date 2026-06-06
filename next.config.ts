import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served under arttools.live/markdown-converter behind nginx
  basePath: "/markdown-converter",
};

export default nextConfig;
