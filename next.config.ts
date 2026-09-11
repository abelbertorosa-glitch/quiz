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
  output: "standalone",
  basePath: "/diagnostico",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "cambel.srv.br",
        "www.cambel.srv.br",
        "cambelcontabilidade.com.br",
        "www.cambelcontabilidade.com.br",
        "quiz.cambel.srv.br",
        "diagnostico.cambel.srv.br",
        "diagnostico.cambelcontabilidade.com.br",
        "179.197.65.2:3060",
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
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "playwright-core",
  ],
  outputFileTracingIncludes: {
    "/resultado/[id]": ["./data/**/*"],
    "/api/pdf/[id]": [
      "./data/**/*",
      "./vendor/chromium-bin/**/*",
      "./node_modules/puppeteer-core/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
      "./node_modules/playwright-core/**/*",
    ],
    "src/app/api/pdf/[id]/route": [
      "./vendor/chromium-bin/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
      "./node_modules/playwright-core/**/*",
    ],
  },
};

export default nextConfig;
