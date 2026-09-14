import { CARGOS } from "@/lib/questions";
import { digitsOnly } from "@/lib/mask";
import type { Cargo, ResponseRecord } from "@/lib/types";

export const RD_CONVERSIONS_URL =
  "https://api.rd.services/platform/conversions";

const DEFAULT_IDENTIFIER = "diagnostico-oficina-quiz";
const FETCH_MS = 8_000;

export type RdConversionBody = {
  event_type: "CONVERSION";
  event_family: "CDP";
  payload: Record<string, unknown>;
};

export type RdSyncResult =
  | { ok: true; eventUuid?: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped?: false; status?: number; error: string };

export function rdStationApiKey(): string {
  return (
    process.env.RD_STATION_API_KEY?.trim() ||
    process.env.RD_STATION_PUBLIC_TOKEN?.trim() ||
    ""
  );
}

export function rdConversionIdentifier(): string {
  return (
    process.env.RD_STATION_CONVERSION_IDENTIFIER?.trim() || DEFAULT_IDENTIFIER
  );
}

export function parseCidadeUf(value: string): {
  city?: string;
  state?: string;
} {
  const trimmed = value.trim();
  if (!trimmed) return {};
  const slash = trimmed.lastIndexOf("/");
  if (slash === -1) return { city: trimmed };
  const city = trimmed.slice(0, slash).trim();
  const state = trimmed
    .slice(slash + 1)
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 2)
    .toUpperCase();
  return {
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
  };
}

export function toE164(raw: string): string | undefined {
  const d = digitsOnly(raw);
  if (!d) return undefined;
  if (d.startsWith("55") && d.length >= 12) return `+${d}`;
  if (d.length === 10 || d.length === 11) return `+55${d}`;
  return `+55${d}`;
}

export function cargoLabel(cargo: Cargo): string {
  return CARGOS.find((item) => item.value === cargo)?.label ?? cargo;
}

export function laudoPublicUrl(id: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (!base) return undefined;
  return `${base}/resultado/${id}`;
}

function omitEmpty(
  entries: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

export function withoutCustomFields(body: RdConversionBody): RdConversionBody {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body.payload)) {
    if (key.startsWith("cf_")) continue;
    payload[key] = value;
  }
  return { ...body, payload };
}

export function buildConversionPayload(record: ResponseRecord): RdConversionBody {
  const { lead, utm, id } = record;
  const { city, state } = parseCidadeUf(lead.cidadeUf);
  const phone = toE164(lead.telefone);
  const laudo = laudoPublicUrl(id);

  return {
    event_type: "CONVERSION",
    event_family: "CDP",
    payload: omitEmpty({
      conversion_identifier: rdConversionIdentifier(),
      email: lead.email.trim().toLowerCase(),
      name: lead.nome.trim(),
      job_title: cargoLabel(lead.cargo),
      company_name: lead.empresa.trim(),
      city,
      state,
      country: "Brasil",
      mobile_phone: phone,
      personal_phone: phone,
      website: laudo,
      traffic_source: utm.source,
      traffic_medium: utm.medium,
      traffic_campaign: utm.campaign,
      traffic_value: utm.term,
      tags: ["quiz-cambel", "diagnostico-oficina"],
      available_for_mailing: true,
      legal_bases: [
        {
          category: "communications",
          type: "consent",
          status: "granted",
        },
      ],
      cf_cnpj: digitsOnly(lead.cnpj) || undefined,
      cf_ano_fundacao: String(lead.anoFundacao),
      cf_idade: String(lead.idade),
      cf_genero: lead.genero,
      cf_laudo_id: id,
      cf_laudo_url: laudo,
    }),
  };
}

function shouldSkipInTests(): boolean {
  return Boolean(process.env.VITEST) && process.env.RD_STATION_TEST !== "1";
}

async function postConversion(
  apiKey: string,
  body: RdConversionBody,
): Promise<{ status: number; json: { event_uuid?: string; errors?: unknown } }> {
  const url = `${RD_CONVERSIONS_URL}?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(FETCH_MS),
  });
  const json = (await res.json().catch(() => ({}))) as {
    event_uuid?: string;
    errors?: unknown;
  };
  return { status: res.status, json };
}

export async function syncToRdStation(
  record: ResponseRecord,
): Promise<RdSyncResult> {
  if (shouldSkipInTests()) {
    return { ok: false, skipped: true, reason: "vitest" };
  }

  const apiKey = rdStationApiKey();
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "missing_api_key" };
  }

  const email = record.lead.email.trim();
  if (!email) {
    return { ok: false, skipped: true, reason: "missing_email" };
  }

  const body = buildConversionPayload(record);

  try {
    let result = await postConversion(apiKey, body);
    if (result.status === 400) {
      result = await postConversion(apiKey, withoutCustomFields(body));
    }
    if (result.status >= 200 && result.status < 300) {
      return { ok: true, eventUuid: result.json.event_uuid };
    }
    console.error("rdstation_sync_failed", result.status, result.json.errors);
    return {
      ok: false,
      status: result.status,
      error: `http_${result.status}`,
    };
  } catch (err) {
    console.error("rdstation_sync_failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network_error",
    };
  }
}
