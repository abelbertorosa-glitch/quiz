import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";

describe("QUESTIONS", () => {
  it("tem as 19 perguntas do laudo, na ordem", () => {
    expect(QUESTIONS).toHaveLength(19);
    expect(QUESTIONS.map((q) => q.n)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ]);
  });

  it("cobre as quatro categorias do laudo", () => {
    const cats = QUESTIONS.map((q) => q.categoria);
    expect(cats.filter((c) => c === "financeiro")).toHaveLength(5);
    expect(cats.filter((c) => c === "operacao")).toHaveLength(6);
    expect(cats.filter((c) => c === "gestao")).toHaveLength(4);
    expect(cats.filter((c) => c === "comercial")).toHaveLength(4);
  });
});
