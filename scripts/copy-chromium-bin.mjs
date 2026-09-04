import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "node_modules", "@sparticuz", "chromium", "bin");
const dest = join(root, "vendor", "chromium-bin");

if (!existsSync(src)) {
  console.warn(
    "[copy-chromium-bin] skip: node_modules/@sparticuz/chromium/bin not found",
  );
  process.exit(0);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(join(root, "vendor"), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("[copy-chromium-bin] copied to vendor/chromium-bin");
