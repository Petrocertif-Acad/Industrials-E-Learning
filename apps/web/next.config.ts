import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image runtime légère pour le déploiement Docker (voir docker/Dockerfile).
  output: "standalone",
};

export default nextConfig;
