export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseBRL(raw: string): number | undefined {
  const d = digitsOnly(raw);
  if (!d) return undefined;
  return Number(d) / 100;
}

export function maskBRL(raw: string): string {
  const n = parseBRL(raw);
  return n === undefined ? "" : formatBRL(n);
}

export function parsePercent(raw: string): number | undefined {
  const d = digitsOnly(raw).slice(0, 4);
  if (!d) return undefined;
  return Number(d);
}

export function maskPercent(raw: string): string {
  const n = parsePercent(raw);
  return n === undefined ? "" : String(n);
}

export function maskYear(raw: string): string {
  return digitsOnly(raw).slice(0, 4);
}

export function maskIdade(raw: string): string {
  return digitsOnly(raw).slice(0, 2);
}

export function maskCidadeUf(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-ZÀ-ÿ\s/'-]/g, "");
  const slash = cleaned.indexOf("/");
  if (slash === -1) return cleaned;
  const city = cleaned.slice(0, slash).replace(/\s+$/g, "");
  const uf = cleaned
    .slice(slash + 1)
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 2)
    .toUpperCase();
  return `${city}/${uf}`;
}
