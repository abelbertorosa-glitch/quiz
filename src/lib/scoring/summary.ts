import type { Categoria, Finding, Tier } from "@/lib/types";

export const CAT_ORDER: Categoria[] = [
  "financeiro",
  "operacao",
  "gestao",
  "comercial",
];

export const CAT_LABEL: Record<Categoria, string> = {
  financeiro: "Financeiro",
  operacao: "Operação",
  gestao: "Gestão",
  comercial: "Comercial",
};

export const TIER_LABEL: Record<Tier, string> = {
  bom: "Bom",
  mediano: "Mediano",
  atencao: "Atenção",
};

export const TIER_POINTS: Record<Tier, number> = {
  bom: 100,
  mediano: 55,
  atencao: 20,
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

export function scoreOf(findings: Finding[]): number {
  return Math.round(avg(findings.map((f) => TIER_POINTS[f.tier])));
}

export function scoreByCategory(
  findings: Finding[],
): Record<Categoria, number> {
  const out = {} as Record<Categoria, number>;
  for (const cat of CAT_ORDER) {
    out[cat] = scoreOf(findings.filter((f) => f.categoria === cat));
  }
  return out;
}

export function countByTier(findings: Finding[]): Record<Tier, number> {
  return {
    bom: findings.filter((f) => f.tier === "bom").length,
    mediano: findings.filter((f) => f.tier === "mediano").length,
    atencao: findings.filter((f) => f.tier === "atencao").length,
  };
}

export function verdict(score: number): { label: string; tier: Tier } {
  if (score >= 80) return { label: "No patamar de resultado", tier: "bom" };
  if (score >= 55) return { label: "Em ajuste", tier: "mediano" };
  return { label: "Em atenção", tier: "atencao" };
}
