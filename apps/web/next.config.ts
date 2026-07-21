import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Image runtime légère pour le déploiement Docker (voir docker/Dockerfile).
  output: "standalone",
  experimental: {
    serverActions: {
      // Couvre le fichier max (10 Mo, voir lib/storage/s3.ts) + la marge que
      // Next.js recommande pour l'encodage multipart/form-data.
      bodySizeLimit: "15mb",
    },
  },
};

export default withNextIntl(nextConfig);
