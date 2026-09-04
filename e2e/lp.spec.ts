import { expect, test } from "@playwright/test";
import { LP_URL } from "./helpers";

test.describe("LP", () => {
  test("collage, sections and header nav fill the viewport", async ({ page }) => {
    await page.goto(`${LP_URL}/`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "capacidade",
      { timeout: 10_000 },
    );
    await expect(page.getByRole("heading", { name: /Quatro frentes/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /3 passos/ })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Pronto para ver o número/ }),
    ).toBeVisible();
    await expect(page.locator(".eyebrow")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "O que medimos" })).toHaveCount(0);
    await expect(page.locator("a.cta").first()).toHaveAttribute(
      "href",
      /localhost:3000\/diagnostico/,
    );
    await expect(page.locator(".hero h1")).toBeInViewport();
    await expect(page.locator(".hero .cta")).toBeInViewport();
    await expect(page.locator(".hero .fine-print")).toBeInViewport();

    const nav = page.getByRole("navigation", { name: "Seções" });
    await expect(nav).toBeVisible();
    const sections = [
      { name: "O que medimos", id: "medimos", heading: /Quatro frentes/ },
      { name: "Como funciona", id: "como", heading: /3 passos/ },
      { name: "Começar", id: "comecar", heading: /Pronto para ver o número/ },
      { name: "Início", id: "inicio", heading: /capacidade/ },
    ];
    for (const item of sections) {
      await nav.getByRole("link", { name: item.name, exact: true }).click();
      await expect.poll(async () =>
        page.evaluate((id) => {
          const el = document.getElementById(id);
          const header = document.querySelector(".site-header");
          if (!el || !header) return 99;
          const r = el.getBoundingClientRect();
          const head = header.getBoundingClientRect();
          return Math.max(
            Math.abs(r.top - head.bottom),
            Math.abs(window.innerHeight - r.bottom),
          );
        }, item.id),
      ).toBeLessThanOrEqual(6);
      await expect(page.getByRole("heading", { name: item.heading })).toBeInViewport();
    }
  });

  test("hero CTA keeps UTMs into the quiz", async ({ page }) => {
    await page.goto(`${LP_URL}/?utm_source=google&utm_campaign=oficinas`);
    const cta = page.locator(".hero a.cta");
    await expect(cta).toHaveAttribute("href", /utm_source=google/);
    await expect(cta).toHaveAttribute("href", /utm_campaign=oficinas/);
    await cta.click();
    await expect(page).toHaveURL(/localhost:3000\/diagnostico/);
    await expect(page).toHaveURL(/utm_source=google/);
    await expect(page).toHaveURL(/utm_campaign=oficinas/);
    await expect(
      page.getByRole("heading", { name: "Diagnóstico da sua oficina" }),
    ).toBeVisible();
  });

  test("favicon is the Cambel mark", async ({ page }) => {
    await page.goto(`${LP_URL}/`);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      /logo-cambel/,
    );
  });
});
