import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/diagnostico",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "cambel.srv.br",
        "www.cambel.srv.br",
        "localhost:3000",
      ],
    },
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/diagnostico",
        permanent: false,
        basePath: false,
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/resultado/[id]": ["./data/**/*"],
    "/api/pdf/[id]": [
      "./data/**/*",
      "./vendor/chromium-bin/**/*",
      "./node_modules/puppeteer-core/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
    ],
    "src/app/api/pdf/[id]/route": [
      "./vendor/chromium-bin/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
