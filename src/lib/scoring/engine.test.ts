import { describe, expect, it } from "vitest";
import type { Answers, Lead } from "@/lib/types";
import {
  calcularMetricas,
  custoFixoSobreFaturamento,
  diagnosticar,
  faturamentoEsperado,
  idadeEmpresaAnos,
  isCaixaSaudavel,
  markupTier,
} from "./engine";

const lead: Lead = {
  empresa: "Oficina Teste",
  cnpj: "00000000000000",
  anoFundacao: 2018,
  cidadeUf: "Belo Horizonte/MG",
  nome: "Abel",
  cargo: "proprietario",
  idade: 45,
  genero: "masculino",
  telefone: "31999999999",
  email: "abel@teste.com",
};

const baseAnswers: Answers = {
  p1_custoFixo: 30_000,
  p2_faturamento: 100_000,
  p3_markup: 100,
  p4_reserva: "2_meses_ou_mais",
  p5_antecipa: false,
  p6_mecanicos: 2,
  p7_comercializacao: "pecas_servicos",
  p8_horaMinima: 180,
  p9_elevadores: 3,
  p10_checklist: true,
  p11_produtividade: true,
  p12_processos: "seguidos",
  p13_donoGestorPatio: false,
  p14_sistema: "ultracar",
  p15_softwarePrecificacao: true,
  p16_canal: "google",
  p17_conversaoPosVenda: true,
  p18_recorrencia: true,
  p19_faturamentoDiario: true,
};

describe("idadeEmpresaAnos", () => {
  it("calcula a partir do ano de fundação", () => {
    expect(idadeEmpresaAnos(2021, 2026)).toBe(5);
  });
});

describe("markupTier", () => {
  it("classifica as três faixas do laudo", () => {
    expect(markupTier(100)).toBe("bom");
    expect(markupTier(80)).toBe("mediano");
    expect(markupTier(40)).toBe("atencao");
  });
});

describe("custo fixo × faturamento", () => {
  it("30k em 100k = 30%", () => {
    expect(custoFixoSobreFaturamento(30_000, 100_000)).toBeCloseTo(0.3);
  });
});

describe("caixa saudável", () => {
  it("só com 2 meses e sem antecipação", () => {
    expect(isCaixaSaudavel("2_meses_ou_mais", false)).toBe(true);
    expect(isCaixaSaudavel("2_meses_ou_mais", true)).toBe(false);
    expect(isCaixaSaudavel("1_mes", false)).toBe(false);
  });
});

describe("faturamento esperado", () => {
  it("2 mecânicos × hora 180 segue a fórmula do laudo", () => {
    const r = faturamentoEsperado(2, 180);
    expect(r.horasPorMecanico).toBeCloseTo(123.2);
    expect(r.horasOficina).toBeCloseTo(246.4);
    expect(r.servicos).toBeCloseTo(44_352);
    expect(r.total).toBeCloseTo(110_880);
  });
});

describe("calcularMetricas", () => {
  it("não calcula custo fixo quando vende só serviço", () => {
    const m = calcularMetricas(lead, {
      ...baseAnswers,
      p7_comercializacao: "somente_servico",
    });
    expect(m.custoFixoSobreFaturamento).toBeNull();
  });

  it("marca estrutura de elevadores ok em 3 para 2", () => {
    const m = calcularMetricas(lead, baseAnswers);
    expect(m.elevadoresIdeais).toBeCloseTo(3);
    expect(m.estruturaElevadoresOk).toBe(true);
  });

  it("hora mínima recomendada = custo da hora × 2", () => {
    const m = calcularMetricas(lead, baseAnswers);
    // 30000 / (176 * 2) = 85.227... × 2 ≈ 170.45
    expect(m.custoHoraProdutiva).toBeCloseTo(30_000 / (176 * 2));
    expect(m.horaMinimaRecomendada).toBeCloseTo((30_000 / (176 * 2)) * 2);
  });
});

describe("diagnosticar", () => {
  it("inverte a P13: dono gestor de pátio é atenção", () => {
    const d = diagnosticar(lead, {
      ...baseAnswers,
      p13_donoGestorPatio: true,
    });
    const f = d.findings.find((x) => x.id === "gestor-patio");
    expect(f?.tier).toBe("atencao");
  });

  it("cita consultoria quando o faturamento fica abaixo do esperado", () => {
    const d = diagnosticar(lead, {
      ...baseAnswers,
      p2_faturamento: 40_000,
      p8_horaMinima: 180,
    });
    const f = d.findings.find((x) => x.id === "faturamento-esperado");
    expect(f?.tier).toBe("atencao");
    expect(f?.texto).toMatch(/Consultoria e Assessoria Gerencial/);
  });

  it("cita Tempário quando não tem software de precificação", () => {
    const d = diagnosticar(lead, {
      ...baseAnswers,
      p15_softwarePrecificacao: false,
    });
    const f = d.findings.find((x) => x.id === "precificacao");
    expect(f?.texto).toMatch(/Tempário/);
  });

  it("antecipação em empresa nova é mediano, não só atenção", () => {
    const d = diagnosticar(
      { ...lead, anoFundacao: 2024 },
      { ...baseAnswers, p5_antecipa: true },
    );
    const f = d.findings.find((x) => x.id === "antecipacao");
    expect(f?.tier).toBe("mediano");
  });
});
