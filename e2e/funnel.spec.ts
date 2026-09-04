import { expect, test } from "@playwright/test";
import { LP_URL, completeLead, completeQuestions } from "./helpers";

test.describe("LP to diagnóstico funnel", () => {
  test("visitor goes from LP CTA through the quiz to the laudo", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.goto(`${LP_URL}/`);
    await page.locator(".hero a.cta").click();
    await expect(page).toHaveURL(/localhost:3000\/diagnostico\/?(\?|$)/);
    await page.getByRole("link", { name: "Começar" }).click();
    await expect(page).toHaveURL(/\/diagnostico\/quiz/);
    await completeLead(page);
    await completeQuestions(page);
    await expect(page).toHaveURL(/\/diagnostico\/resultado\//, { timeout: 60_000 });
    await expect(
      page.getByRole("heading", { name: "Diagnóstico da oficina" }),
    ).toBeVisible();
  });
});
