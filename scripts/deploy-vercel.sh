#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  if ! vercel whoami >/dev/null 2>&1; then
    echo "Faça vercel login ou exporte VERCEL_TOKEN." >&2
    exit 1
  fi
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

rsync -a \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude dist \
  --exclude output \
  --exclude test-results \
  --exclude .playwright-cli \
  --exclude vendor/chromium-bin \
  --exclude HANDOFF.md \
  --exclude HANDOFF.local.md \
  "$ROOT/" "$TMP/"

cd "$TMP"
ARGS=(deploy --prod --yes)
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  ARGS+=(--token "$VERCEL_TOKEN")
fi
vercel "${ARGS[@]}"
