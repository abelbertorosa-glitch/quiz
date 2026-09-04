import type { Utm } from "./types";

const UTM_KEYS = ["source", "medium", "campaign", "content", "term"] as const;

export function parseUtm(search: string | URLSearchParams): Utm {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`)?.trim();
    if (value) utm[key] = value;
  }
  return utm;
}
