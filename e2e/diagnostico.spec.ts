import { expect, test } from "@playwright/test";
import { completeLead, completeQuestions, continueQuiz, fillOficina } from "./helpers";

test.describe("Diagnóstico", () => {
  test("home has one-line title, start CTA and privacy footer", async ({
    page,
  }) => {
    await page.goto("/diagnostico");
    const h1 = page.getByRole("heading", { name: "Diagnóstico da sua oficina" });
    await expect(h1).toBeVisible();
    const lines = await h1.evaluate((el) => {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight === "normal" ? cs.fontSize : cs.lineHeight);
      return Math.round(el.getBoundingClientRect().height / lh);
    });
    expect(lines).toBe(1);
    await expect(page.getByRole("link", { name: "Começar" })).toBeVisible();
    await expect(page.getByText("Gratuito", { exact: true })).toHaveCount(0);
    const privacy = page.locator("footer").getByRole("link", { name: "Privacidade" });
    await expect(privacy).toBeVisible();
    await privacy.hover();
    await expect(privacy).toHaveCSS("text-decoration-line", "underline");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      /icon\.png|logo-cambel/,
    );
  });

  test("privacy page has Cambel LGPD copy", async ({ page }) => {
    await page.goto("/diagnostico/privacidade");
    await expect(page.getByRole("heading", { name: "Privacidade" })).toBeVisible();
    await expect(page.getByText("ainda será alinhado")).toHaveCount(0);
    await expect(page.getByText("Cambel Contadores Associados")).toBeVisible();
    await expect(page.getByText("contato@cambelcontabilidade.com.br")).toBeVisible();
    await expect(page.getByText("CNPJ")).toBeVisible();
    await page.getByRole("link", { name: "Voltar ao diagnóstico" }).click();
    await expect(page).toHaveURL(/\/diagnostico\/?$/);
  });

  test("/lead redirects into the unified quiz", async ({ page }) => {
    await page.goto("/diagnostico/lead");
    await expect(page).toHaveURL(/\/diagnostico\/quiz/);
    await expect(page.getByRole("heading", { name: "Dados da oficina" })).toHaveCount(
      1,
    );
  });

  test("office step is a fixed square with logo inside", async ({ page }) => {
    await page.goto("/diagnostico/quiz");
    const card = page.locator(".quiz-card");
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).toBeTruthy();
    expect(Math.abs((box?.width ?? 0) - (box?.height ?? 0))).toBeLessThan(4);
    const logo = page.locator(".quiz-card .brand-mark");
    await expect(logo).toBeVisible();
    const logoBox = await logo.boundingBox();
    expect(logoBox).toBeTruthy();
    expect(logoBox!.y).toBeGreaterThanOrEqual(box!.y);
    expect(logoBox!.y + logoBox!.height).toBeLessThanOrEqual(box!.y + box!.height);
  });

  test("office validation and CNPJ mask", async ({ page }) => {
    await page.goto("/diagnostico/quiz");
    await continueQuiz(page);
    await expect(page.getByText("Informe o nome da oficina.")).toBeVisible();
    await fillOficina(page);
    await expect(page.getByLabel("CNPJ")).toHaveValue("12.345.678/0001-90");
    await continueQuiz(page);
    await expect(page.getByRole("heading", { name: "Sobre você" })).toBeVisible();
  });

  test("full diagnostic yields result and PDF", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/diagnostico/quiz");
    await completeLead(page);
    await completeQuestions(page);
    await expect(page).toHaveURL(/\/diagnostico\/resultado\//, { timeout: 60_000 });
    await expect(
      page.getByRole("heading", { name: "Diagnóstico da oficina" }),
    ).toBeVisible();
    await expect(page.getByText("Oficina Central")).toBeVisible();
    await expect(page.getByText("Ana Silva")).toBeVisible();
    const pdf = page.getByRole("link", { name: "Baixar PDF" });
    await expect(pdf).toBeVisible();
    const href = await pdf.getAttribute("href");
    expect(href).toMatch(/\/diagnostico\/api\/pdf\//);
    const res = await page.request.get(new URL(href!, page.url()).href);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"] ?? "").toMatch(/pdf/i);
  });
});
