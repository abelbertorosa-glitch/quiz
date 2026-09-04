import type {
  Answers,
  Diagnosis,
  Finding,
  Lead,
  Metricas,
  ReservaCaixa,
  Tier,
} from "@/lib/types";
import {
  ANOS_TRANSICAO_ANTECIPACAO,
  CONSULTORIA_URL,
  CUSTO_FIXO_IDEAL_MAX,
  CUSTO_FIXO_IDEAL_MIN,
  ELEVADORES_POR_MECANICO,
  HORAS_DISPONIVEIS_MES,
  HORAS_VENDIDAS_POR_MECANICO,
  MARKUP_BOM,
  MARKUP_HORA,
  MARKUP_MEDIANO_MIN,
  SHARE_SERVICO,
} from "./constants";
import { textos } from "./copy";

export function idadeEmpresaAnos(
  anoFundacao: number,
  anoAtual = new Date().getFullYear(),
): number {
  if (!Number.isFinite(anoFundacao) || anoFundacao <= 0) return 0;
  return Math.max(0, anoAtual - anoFundacao);
}

export function markupTier(markup: number): Tier {
  if (markup >= MARKUP_BOM) return "bom";
  if (markup >= MARKUP_MEDIANO_MIN) return "mediano";
  return "atencao";
}

export function custoFixoSobreFaturamento(
  custoFixo: number,
  faturamento: number,
): number | null {
  if (faturamento <= 0) return null;
  return custoFixo / faturamento;
}

export function isCaixaSaudavel(
  reserva: ReservaCaixa,
  antecipa: boolean,
): boolean {
  return reserva === "2_meses_ou_mais" && !antecipa;
}

export function faturamentoEsperado(mecanicos: number, horaMinima: number) {
  const horasPorMecanico = HORAS_VENDIDAS_POR_MECANICO;
  const horasOficina = horasPorMecanico * mecanicos;
  const servicos = horasOficina * horaMinima;
  const total = SHARE_SERVICO > 0 ? servicos / SHARE_SERVICO : 0;
  return { horasPorMecanico, horasOficina, servicos, total };
}

export function custoHoraProdutiva(custoFixo: number, mecanicos: number) {
  const horas = HORAS_DISPONIVEIS_MES * mecanicos;
  const custo = horas > 0 ? custoFixo / horas : 0;
  const recomendada = custo * (1 + MARKUP_HORA);
  return { custo, recomendada };
}

export function elevadoresIdeais(mecanicos: number): number {
  return mecanicos * ELEVADORES_POR_MECANICO;
}

export function calcularMetricas(lead: Lead, answers: Answers): Metricas {
  const idade = idadeEmpresaAnos(lead.anoFundacao);
  const ratio =
    answers.p7_comercializacao === "pecas_servicos"
      ? custoFixoSobreFaturamento(answers.p1_custoFixo, answers.p2_faturamento)
      : null;
  const esperado = faturamentoEsperado(
    answers.p6_mecanicos,
    answers.p8_horaMinima,
  );
  const hora = custoHoraProdutiva(answers.p1_custoFixo, answers.p6_mecanicos);
  const elevadoresIdeal = elevadoresIdeais(answers.p6_mecanicos);
  const elevadoresPorMecanico =
    answers.p6_mecanicos > 0
      ? answers.p9_elevadores / answers.p6_mecanicos
      : 0;

  return {
    idadeEmpresaAnos: idade,
    custoFixoSobreFaturamento: ratio,
    horasVendidasPorMecanico: esperado.horasPorMecanico,
    horasVendidasOficina: esperado.horasOficina,
    faturamentoServicosEsperado: esperado.servicos,
    faturamentoTotalEsperado: esperado.total,
    gapFaturamento: answers.p2_faturamento - esperado.total,
    atingeFaturamentoEsperado: answers.p2_faturamento >= esperado.total,
    elevadoresPorMecanico,
    elevadoresIdeais: elevadoresIdeal,
    estruturaElevadoresOk: answers.p9_elevadores >= elevadoresIdeal,
    custoHoraProdutiva: hora.custo,
    horaMinimaRecomendada: hora.recomendada,
    caixaSaudavel: isCaixaSaudavel(answers.p4_reserva, answers.p5_antecipa),
  };
}

function finding(
  partial: Omit<Finding, "texto"> & { texto: string },
): Finding {
  return partial;
}

export function diagnosticar(lead: Lead, answers: Answers): Diagnosis {
  const metricas = calcularMetricas(lead, answers);
  const findings: Finding[] = [];

  if (answers.p7_comercializacao === "pecas_servicos") {
    const ratio = metricas.custoFixoSobreFaturamento ?? 0;
    const pct = Math.round(ratio * 100);
    const dentro =
      ratio >= CUSTO_FIXO_IDEAL_MIN && ratio <= CUSTO_FIXO_IDEAL_MAX;
    findings.push(
      finding({
        id: "custo-fixo",
        categoria: "financeiro",
        pergunta: "cruzado",
        tier: ratio <= CUSTO_FIXO_IDEAL_MAX ? "bom" : "atencao",
        titulo: "Custo fixo sobre o faturamento",
        texto: textos.custoFixo(pct, dentro),
      }),
    );
  } else {
    findings.push(
      finding({
        id: "so-servico",
        categoria: "financeiro",
        pergunta: 7,
        tier: "atencao",
        titulo: "Comercialização só de serviço",
        texto: textos.soServico(),
      }),
    );
  }

  const mTier = markupTier(answers.p3_markup);
  findings.push(
    finding({
      id: "markup",
      categoria: "financeiro",
      pergunta: 3,
      tier: mTier,
      titulo: "Markup das peças",
      texto: textos.markup(answers.p3_markup, mTier),
    }),
  );

  findings.push(
    finding({
      id: "caixa",
      categoria: "financeiro",
      pergunta: "cruzado",
      tier: metricas.caixaSaudavel ? "bom" : "atencao",
      titulo: "Caixa saudável",
      texto: textos.caixa(metricas.caixaSaudavel),
    }),
  );

  findings.push(
    finding({
      id: "antecipacao",
      categoria: "financeiro",
      pergunta: 5,
      tier: answers.p5_antecipa
        ? metricas.idadeEmpresaAnos <= ANOS_TRANSICAO_ANTECIPACAO
          ? "mediano"
          : "atencao"
        : "bom",
      titulo: "Antecipação de cartão",
      texto: textos.antecipacao(
        answers.p5_antecipa,
        metricas.idadeEmpresaAnos,
      ),
    }),
  );

  findings.push(
    finding({
      id: "faturamento-esperado",
      categoria: "operacao",
      pergunta: "cruzado",
      tier: metricas.atingeFaturamentoEsperado ? "bom" : "atencao",
      titulo: "Faturamento versus capacidade",
      texto: textos.faturamentoEsperado(metricas, answers.p2_faturamento),
    }),
  );

  findings.push(
    finding({
      id: "hora-minima",
      categoria: "operacao",
      pergunta: 8,
      tier:
        answers.p8_horaMinima >= metricas.horaMinimaRecomendada
          ? "bom"
          : "atencao",
      titulo: "Valor da hora mínima",
      texto: textos.horaMinima(answers.p8_horaMinima, metricas),
    }),
  );

  findings.push(
    finding({
      id: "elevadores",
      categoria: "operacao",
      pergunta: 9,
      tier: metricas.estruturaElevadoresOk ? "bom" : "atencao",
      titulo: "Elevadores por mecânico",
      texto: textos.elevadores(
        answers.p6_mecanicos,
        answers.p9_elevadores,
        metricas,
      ),
    }),
  );

  findings.push(
    finding({
      id: "checklist",
      categoria: "operacao",
      pergunta: 10,
      tier: answers.p10_checklist ? "bom" : "atencao",
      titulo: "Checklist de entrada e saída",
      texto: textos.checklist(answers.p10_checklist),
    }),
  );

  findings.push(
    finding({
      id: "produtividade",
      categoria: "operacao",
      pergunta: 11,
      tier: answers.p11_produtividade ? "bom" : "atencao",
      titulo: "Controle de produtividade por técnico",
      texto: textos.produtividade(answers.p11_produtividade),
    }),
  );

  findings.push(
    finding({
      id: "processos",
      categoria: "gestao",
      pergunta: 12,
      tier:
        answers.p12_processos === "seguidos"
          ? "bom"
          : answers.p12_processos === "basico"
            ? "mediano"
            : "atencao",
      titulo: "Processos da operação",
      texto: textos.processos(answers.p12_processos),
    }),
  );

  findings.push(
    finding({
      id: "gestor-patio",
      categoria: "gestao",
      pergunta: 13,
      tier: answers.p13_donoGestorPatio ? "atencao" : "bom",
      titulo: "Proprietário como gestor de pátio",
      texto: textos.gestorPatio(answers.p13_donoGestorPatio),
    }),
  );

  findings.push(
    finding({
      id: "sistema",
      categoria: "gestao",
      pergunta: 14,
      tier: answers.p14_sistema === "outros" ? "mediano" : "bom",
      titulo: "Sistema de gestão",
      texto: textos.sistema(answers.p14_sistema),
    }),
  );

  findings.push(
    finding({
      id: "precificacao",
      categoria: "gestao",
      pergunta: 15,
      tier: answers.p15_softwarePrecificacao ? "bom" : "atencao",
      titulo: "Software de precificação de mão de obra",
      texto: textos.precificacao(answers.p15_softwarePrecificacao),
    }),
  );

  findings.push(
    finding({
      id: "canal",
      categoria: "comercial",
      pergunta: 16,
      tier: answers.p16_canal === "indicacao" ? "mediano" : "bom",
      titulo: "Canal principal de clientes",
      texto: textos.canal(answers.p16_canal),
    }),
  );

  findings.push(
    finding({
      id: "conversao",
      categoria: "comercial",
      pergunta: 17,
      tier: answers.p17_conversaoPosVenda ? "bom" : "atencao",
      titulo: "Conversão de orçamentos e pós-venda",
      texto: textos.conversao(answers.p17_conversaoPosVenda),
    }),
  );

  findings.push(
    finding({
      id: "recorrencia",
      categoria: "comercial",
      pergunta: 18,
      tier: answers.p18_recorrencia ? "bom" : "atencao",
      titulo: "Recorrência de clientes",
      texto: textos.recorrencia(answers.p18_recorrencia),
    }),
  );

  findings.push(
    finding({
      id: "faturamento-diario",
      categoria: "comercial",
      pergunta: 19,
      tier: answers.p19_faturamentoDiario ? "bom" : "atencao",
      titulo: "Acompanhamento do faturamento diário",
      texto: textos.faturamentoDiario(answers.p19_faturamentoDiario),
    }),
  );

  return { metricas, findings };
}

export { CONSULTORIA_URL };
