/** Premissas da metodologia Cambel (laudo 00003028). */

export const HORAS_DISPONIVEIS_MES = 176;
export const TAXA_HORAS_VENDIDAS = 0.7;
export const HORAS_VENDIDAS_POR_MECANICO =
  HORAS_DISPONIVEIS_MES * TAXA_HORAS_VENDIDAS;

export const SHARE_SERVICO = 0.4;
export const SHARE_PECAS = 0.6;

export const CUSTO_FIXO_IDEAL_MIN = 0.25;
export const CUSTO_FIXO_IDEAL_MAX = 0.32;

export const MARKUP_BOM = 100;
export const MARKUP_MEDIANO_MIN = 60;
export const MARKUP_EXCECAO_PECA_BARATA = 400;
export const MARKUP_EXCECAO_PECA_ALTA = 30;
export const PECA_ALTA_VALOR = 5000;

export const ELEVADORES_POR_MECANICO = 1.5;
export const MARKUP_HORA = 1; // 100% sobre o custo da hora produtiva

export const ANOS_TRANSICAO_ANTECIPACAO = 5;

export const CONSULTORIA_URL =
  "https://materiais.cambelcontabilidade.com.br/contabilidade-gerencial";
