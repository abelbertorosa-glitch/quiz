import { describe, expect, it } from "vitest";
import {
  formatBRL,
  maskCidadeUf,
  maskIdade,
  maskPercent,
  maskYear,
  parseBRL,
  parsePercent,
} from "./mask";

describe("BRL", () => {
  it("formata reais com centavos", () => {
    expect(formatBRL(5000).replace(/\s/g, " ")).toBe("R$ 5.000,00");
    expect(parseBRL("500000")).toBe(5000);
    expect(parseBRL("R$ 5.000,00")).toBe(5000);
    expect(parseBRL("")).toBeUndefined();
  });
});

describe("percent", () => {
  it("só dígitos até 4 casas", () => {
    expect(maskPercent("100")).toBe("100");
    expect(maskPercent("10000")).toBe("1000");
    expect(parsePercent("%")).toBeUndefined();
    expect(parsePercent("80")).toBe(80);
  });
});

describe("year and age", () => {
  it("limita ano a 4 dígitos e idade a 2", () => {
    expect(maskYear("20185")).toBe("2018");
    expect(maskIdade("388")).toBe("38");
  });
});

describe("cidade/UF", () => {
  it("maiúsculas na UF depois da barra", () => {
    expect(maskCidadeUf("Belo Horizonte/mg")).toBe("Belo Horizonte/MG");
    expect(maskCidadeUf("bh/m")).toBe("bh/M");
  });
});
