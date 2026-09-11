/**
 * PDF via Chromium.
 * Local: Playwright. Vercel: puppeteer-core + @sparticuz/chromium (vendor/).
 */

import { existsSync } from "node:fs";
import path from "node:path";

const isServerless =
  !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

const UNSAFE_PRINT_HOSTS = [
  /cambel\.srv\.br/i,
  /cambelcontabilidade\.com\.br/i,
];

function resolveChromiumBinDir(): string {
  const candidates = [
    path.join(process.cwd(), "vendor", "chromium-bin"),
    path.join(process.cwd(), "node_modules", "@sparticuz", "chromium", "bin"),
  ];
  for (const dir of candidates) {
    if (existsSync(path.join(dir, "chromium.br"))) return dir;
  }
  throw new Error(
    `chromium_bin_missing: expected chromium.br in ${candidates.join(" | ")}`,
  );
}

export async function gerarPdfDaUrl(url: string): Promise<Buffer> {
  if (isServerless) {
    return withRetry(() => gerarPdfServerless(url), 2, `serverless:${url}`);
  }
  const bin = process.env.CHROMIUM_PATH?.trim();
  if (bin) {
    return withRetry(() => gerarPdfWithBin(url, bin), 2, `bin:${url}`);
  }
  return gerarPdfLocal(url);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number,
  label: string,
): Promise<T> {
  let last: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      console.error(`PDF ${label} attempt ${i}/${attempts} failed`, err);
      if (i < attempts) await new Promise((r) => setTimeout(r, 500 * i));
    }
  }
  const msg = last instanceof Error ? last.message : String(last);
  throw new Error(`pdf_failed after ${attempts} attempts (${label}): ${msg}`);
}

async function gerarPdfServerless(url: string): Promise<Buffer> {
  const puppeteer = (await import("puppeteer-core")).default;
  const chromiumMod = await import("@sparticuz/chromium");
  const chromium = chromiumMod.default ?? chromiumMod;
  const executablePath = await chromium.executablePath(resolveChromiumBinDir());

  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      "--hide-scrollbars",
      "--disable-web-security",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    executablePath,
    headless: true,
    defaultViewport: { width: 1024, height: 1400, deviceScaleFactor: 2 },
  });
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const u = req.url();
      if (
        /googletagmanager|google-analytics|facebook\.net|fbevents|doubleclick|hotjar|vercel\.live|speed-insights/i.test(
          u,
        )
      ) {
        void req.abort();
        return;
      }
      void req.continue();
    });
    const resp = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    if (resp && (resp.status() >= 400 || resp.status() === 0)) {
      throw new Error(`print_page_http_${resp.status()}: ${url}`);
    }
    await new Promise((r) => setTimeout(r, 800));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function gerarPdfWithBin(url: string, executablePath: string): Promise<Buffer> {
  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.launch({
    args: [
      "--hide-scrollbars",
      "--disable-web-security",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    executablePath,
    headless: true,
    defaultViewport: { width: 1024, height: 1400, deviceScaleFactor: 2 },
  });
  try {
    const page = await browser.newPage();
    const resp = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    if (resp && (resp.status() >= 400 || resp.status() === 0)) {
      throw new Error(`print_page_http_${resp.status()}: ${url}`);
    }
    await new Promise((r) => setTimeout(r, 800));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function gerarPdfLocal(url: string): Promise<Buffer> {
  const { chromium } = await import(
    /* turbopackIgnore: true */ /* webpackIgnore: true */ "playwright-core"
  );
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 1400 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function isSafePrintBase(base: string): boolean {
  try {
    const host = new URL(base).hostname;
    return !UNSAFE_PRINT_HOSTS.some((re) => re.test(host));
  } catch {
    return false;
  }
}
