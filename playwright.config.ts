import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "off",
    video: process.env.PLAYWRIGHT_BASE_URL ? "off" : "on",
    screenshot: "off",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: "pnpm exec next dev --port 3000",
          url: "http://localhost:3000/diagnostico",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: "npx --yes serve lp -p 4179",
          url: "http://localhost:4179",
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
        },
      ],
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
