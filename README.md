# Diagnóstico de oficina · Cambel

Quiz de diagnóstico empresarial para oficinas mecânicas, da
[Cambel Contabilidade](https://www.cambel.srv.br/).

| Peça | Onde | Pasta |
|------|------|-------|
| LP de tráfego | Hostinger | `lp/` |
| Quiz + PDF | Vercel · path `/diagnostico` | `src/` |
| Proxy Hostinger → Vercel | Hostinger | `hostinger/` |

## Local

```bash
pnpm install
pnpm test
pnpm dev       # quiz em http://localhost:3000/diagnostico
pnpm dev:lp    # LP em http://localhost:4173
```

PDF local precisa de Playwright (`npx playwright install chromium`). Sem isso
a página de resultado funciona; a rota `/api/pdf/{id}` falha.

## Fluxo

```
LP (Hostinger) → /diagnostico/lead → /diagnostico/quiz
       → /diagnostico/resultado/{id} → /diagnostico/api/pdf/{id}
```

## Documentação

| Tema | Arquivo |
|------|---------|
| Regras de negócio | [docs/BRIEFING.md](docs/BRIEFING.md) |
| Infra | [docs/ARQUITETURA.md](docs/ARQUITETURA.md) · [docs/ROTAS.md](docs/ROTAS.md) |
| LP | [lp/README.md](lp/README.md) |
| Proxy | [hostinger/README.md](hostinger/README.md) |
