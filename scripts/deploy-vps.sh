#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${CAMBEL_VPS_HOST:-gikadatavps}"
REMOTE="${CAMBEL_VPS_PATH:-/home/deploy/quiz-cambel}"

rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude dist \
  --exclude output \
  --exclude test-results \
  --exclude playwright-report \
  --exclude .playwright-cli \
  --exclude vendor/chromium-bin \
  --exclude HANDOFF.local.md \
  --exclude .env \
  --exclude .vercel \
  --exclude data/responses \
  "$ROOT/" "$HOST:$REMOTE/"

ssh "$HOST" "cd $REMOTE && docker compose up -d --build"
