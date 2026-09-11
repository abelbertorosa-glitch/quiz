import { expect, type Page } from "@playwright/test";

export const LP_URL = "http://localhost:4179";

export async function fillOficina(page: Page) {
  const empresa = page.getByLabel("Nome da empresa / oficina");
  await expect(async () => {
    await empresa.fill("Oficina Central");
    await expect(empresa).toHaveValue("Oficina Central");
  }).toPass();
  await page.getByLabel("CNPJ").fill("12345678000190");
  await expect(page.getByLabel("CNPJ")).toHaveValue("12.345.678/0001-90");
  await page.getByLabel("Ano de fundação").fill("2018");
  await page.getByLabel("Cidade / UF").fill("Belo Horizonte/mg");
  await expect(page.getByLabel("Cidade / UF")).toHaveValue("Belo Horizonte/MG");
}

export async function fillPessoa(page: Page) {
  await page.getByLabel("Seu nome").fill("Ana Silva");
  await page.getByLabel("Cargo").selectOption("gestor");
  await page.getByLabel("Idade").fill("38");
  await page.getByLabel("Gênero").selectOption("feminino");
}

export async function fillContato(page: Page) {
  await page.getByLabel("Telefone / WhatsApp").fill("31988887777");
  await expect(page.getByLabel("Telefone / WhatsApp")).toHaveValue(
    "(31) 98888-7777",
  );
  await page.getByLabel("E-mail").fill("ana@oficina.com");
}

export async function continueQuiz(page: Page, name = "Continuar") {
  await page.getByRole("button", { name }).click();
}

export async function completeLead(page: Page) {
  await expect(page.getByRole("heading", { name: "Dados da oficina" })).toHaveCount(
    1,
  );
  await fillOficina(page);
  await continueQuiz(page);
  await expect(page.getByRole("heading", { name: "Sobre você" })).toBeVisible();
  await fillPessoa(page);
  await continueQuiz(page);
  await expect(page.getByRole("heading", { name: "Contato" })).toBeVisible();
  await fillContato(page);
  await continueQuiz(page, "Começar as perguntas");
}

async function pick(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
}

async function setStepper(page: Page, target: number) {
  const display = page.locator(".quiz-ask span.text-4xl");
  await expect(display).toBeVisible();
  await expect(async () => {
    const n = Number((await display.textContent()) ?? "0");
    if (n === target) return;
    if (n < target) await page.getByRole("button", { name: "+" }).click();
    else await page.getByRole("button", { name: "−" }).click();
    await expect(display).toHaveText(String(target));
  }).toPass();
}

async function fillMoney(page: Page, digits: string, shown: RegExp) {
  const input = page.locator(".quiz-ask input");
  await input.fill(digits);
  await expect(input).toHaveValue(shown);
}

export async function completeQuestionsUntilMechanics(page: Page) {
  await expect(page.getByRole("heading", { name: /custo fixo/i })).toBeVisible();
  await fillMoney(page, "3000000", /30\.000,00/);
  await continueQuiz(page);

  await expect(page.getByRole("heading", { name: /faturamento mensal/i })).toBeVisible();
  await fillMoney(page, "10000000", /100\.000,00/);
  await continueQuiz(page);

  await expect(page.getByRole("heading", { name: /markup/i })).toBeVisible();
  await page.locator(".quiz-ask input").fill("100");
  await expect(page.locator(".quiz-ask input")).toHaveValue("100");
  await continueQuiz(page);

  await pick(page, "2 meses ou mais");
  await continueQuiz(page);

  await pick(page, "Não");
  await continueQuiz(page);

  await expect(page.getByRole("heading", { name: /mecânicos/i })).toBeVisible();
}

export async function completeQuestions(page: Page) {
  await completeQuestionsUntilMechanics(page);
  await setStepper(page, 2);
  await continueQuiz(page);

  await pick(page, "Peças e serviços");
  await continueQuiz(page);

  await expect(page.getByRole("heading", { name: /hora mínima/i })).toBeVisible();
  await fillMoney(page, "18000", /180,00/);
  await continueQuiz(page);

  await expect(page.getByRole("heading", { name: /elevadores/i })).toBeVisible();
  await setStepper(page, 3);
  await continueQuiz(page);

  await pick(page, "Sim");
  await continueQuiz(page);
  await pick(page, "Sim");
  await continueQuiz(page);

  await pick(page, "Existem processos e são seguidos por todos");
  await continueQuiz(page);

  await pick(page, "Não");
  await continueQuiz(page);

  await pick(page, "Ultracar");
  await continueQuiz(page);

  await pick(page, "Sim");
  await continueQuiz(page);

  await pick(page, "Google / internet");
  await continueQuiz(page);

  await pick(page, "Sim");
  await continueQuiz(page);
  await pick(page, "Sim");
  await continueQuiz(page);
  await pick(page, "Sim");
  await page.getByRole("button", { name: "Ver resultado" }).click();
}
