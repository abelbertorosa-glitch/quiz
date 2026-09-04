import type { NextConfig } from "next";

function hostOf(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).host;
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  basePath: "/diagnostico",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "cambel.srv.br",
        "www.cambel.srv.br",
        "cambelcontabilidade.com.br",
        "www.cambelcontabilidade.com.br",
        hostOf(process.env.NEXT_PUBLIC_SITE_ORIGIN),
        process.env.VERCEL_URL,
        "localhost:3000",
      ].filter((host): host is string => Boolean(host)),
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
