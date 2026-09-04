import { describe, expect, it } from "vitest";
import {
  digitsOnly,
  isValidAnoFundacao,
  isValidEmail,
  maskCnpj,
  maskWhatsappBR,
  validateContato,
  validateOficina,
  validatePessoa,
} from "./lead";
import type { Lead } from "./types";

const base: Lead = {
  empresa: "Oficina Central",
  cnpj: "12.345.678/0001-90",
  anoFundacao: 2018,
  cidadeUf: "Belo Horizonte/MG",
  nome: "Abel Rosa",
  cargo: "proprietario",
  idade: 45,
  genero: "masculino",
  telefone: "(31) 99999-0000",
  email: "abel@oficina.com",
};

describe("masks", () => {
  it("máscara CNPJ no formato do laudo", () => {
    expect(maskCnpj("12345678000190")).toBe("12.345.678/0001-90");
    expect(digitsOnly("12.345.678/0001-90")).toBe("12345678000190");
  });

  it("máscara WhatsApp BR progressiva", () => {
    expect(maskWhatsappBR("31999866199")).toBe("(31) 99986-6199");
    expect(maskWhatsappBR("3132121234")).toBe("(31) 3212-1234");
  });
});

describe("validateOficina", () => {
  it("exige empresa, CNPJ de 14 dígitos, fundação e cidade", () => {
    expect(validateOficina(base)).toEqual({});
    expect(validateOficina({ ...base, empresa: "  " }).empresa).toBe(
      "Informe o nome da oficina.",
    );
    expect(validateOficina({ ...base, cnpj: "123" }).cnpj).toBe(
      "Informe um CNPJ com 14 dígitos.",
    );
    expect(validateOficina({ ...base, cidadeUf: "" }).cidadeUf).toBe(
      "Informe a cidade e a UF.",
    );
  });

  it("rejeita ano de fundação fora do intervalo", () => {
    expect(isValidAnoFundacao(1949, 2026)).toBe(false);
    expect(isValidAnoFundacao(2027, 2026)).toBe(false);
    expect(isValidAnoFundacao(2018, 2026)).toBe(true);
    expect(validateOficina({ ...base, anoFundacao: 1900 }).anoFundacao).toBe(
      "Informe um ano de fundação válido.",
    );
  });
});

describe("validatePessoa", () => {
  it("exige nome, cargo, idade e gênero do laudo", () => {
    expect(validatePessoa(base)).toEqual({});
    expect(validatePessoa({ ...base, nome: "" }).nome).toBe("Informe seu nome.");
    expect(validatePessoa({ ...base, idade: 12 }).idade).toBe(
      "Informe uma idade entre 16 e 99.",
    );
  });
});

describe("validateContato", () => {
  it("exige WhatsApp com DDD e e-mail válido", () => {
    expect(validateContato(base)).toEqual({});
    expect(validateContato({ ...base, telefone: "31" }).telefone).toBe(
      "Informe um WhatsApp com DDD.",
    );
    expect(validateContato({ ...base, email: "invalido" }).email).toBe(
      "E-mail inválido.",
    );
    expect(isValidEmail("seu@email.com")).toBe(true);
  });
});
