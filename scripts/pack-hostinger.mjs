import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "dist", "hostinger");
const origin = (process.env.CAMBEL_VERCEL_ORIGIN || "").replace(/\/$/, "");

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(join(root, "lp"), dest, { recursive: true });
rmSync(join(dest, "README.md"), { force: true });
rmSync(join(dest, "assets", "brand-cambel.pdf"), { force: true });
cpSync(join(root, "hostinger", "quiz-proxy.php"), join(dest, "quiz-proxy.php"));
cpSync(join(root, "hostinger", ".htaccess"), join(dest, ".htaccess"));

const originSrc = origin
  ? `<?php\nreturn '${origin}';\n`
  : readFileSync(join(root, "hostinger", "quiz-origin.example.php"), "utf8");
writeFileSync(join(dest, "quiz-origin.php"), originSrc);

console.log(`hostinger pack → ${dest}`);
if (origin) console.log(`origin ${origin}`);
else console.log("CAMBEL_VERCEL_ORIGIN vazio: edite dist/hostinger/quiz-origin.php");
