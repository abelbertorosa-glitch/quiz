import { describe, expect, it } from "vitest";
import type { Finding } from "@/lib/types";
import {
  countByTier,
  scoreByCategory,
  scoreOf,
  verdict,
} from "./summary";

const f = (
  categoria: Finding["categoria"],
  tier: Finding["tier"],
  id: string,
): Finding => ({
  id,
  categoria,
  pergunta: 1,
  tier,
  titulo: id,
  texto: id,
});

describe("scoreOf", () => {
  it("média arredondada dos pontos de cada finding", () => {
    expect(
      scoreOf([
        f("financeiro", "bom", "a"),
        f("operacao", "mediano", "b"),
        f("gestao", "atencao", "c"),
      ]),
    ).toBe(Math.round((100 + 55 + 20) / 3));
  });
});

describe("scoreByCategory", () => {
  it("isola cada eixo", () => {
    const by = scoreByCategory([
      f("financeiro", "bom", "a"),
      f("financeiro", "bom", "b"),
      f("comercial", "atencao", "c"),
    ]);
    expect(by.financeiro).toBe(100);
    expect(by.comercial).toBe(20);
    expect(by.operacao).toBe(0);
  });
});

describe("countByTier / verdict", () => {
  it("conta e classifica o laudo", () => {
    const findings = [
      f("financeiro", "bom", "a"),
      f("operacao", "atencao", "b"),
      f("gestao", "mediano", "c"),
    ];
    expect(countByTier(findings)).toEqual({ bom: 1, mediano: 1, atencao: 1 });
    expect(verdict(90).tier).toBe("bom");
    expect(verdict(60).tier).toBe("mediano");
    expect(verdict(40).tier).toBe("atencao");
  });
});
