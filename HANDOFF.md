# HANDOFF — Quiz Cambel + LP

**Atualizado em:** 2026-09-14  
**Para:** Gui (continuar daqui)  
**Leia isto + `docs/BRIEFING.md` + `docs/RD-STATION.md` antes de mexer.**

Segredos (tokens RD, Vercel antigo, chaves) ficam em `HANDOFF.local.md` (gitignored). **Não** commitar esse arquivo.

---

## Em uma frase

Diagnóstico empresarial para oficinas: LP + quiz + PDF na **VPS GikaData**, no ar em **https://quiz.cambel.srv.br**. Laudo em **passo a passo**. Todo diagnóstico concluído vai para o **RD Station**. Vercel foi apagada.

---

## Estado agora (14/09)

- Cliente (Abel / Andreza): laudo **aprovado** (“ficou bem legal”, testando, feedback ok)
- RD Station **no ar**: token público no `.env` da VPS; conversão `diagnostico-oficina-quiz`
- Andreza confirmou o lead de teste no painel do RD (nome, cargo, empresa, e-mail, celular, 1 conversão, entrou em automação)
- Código no remoto cliente: `client/main` @ `d4a4db3` (`feat: envia lead do quiz para o RD Station`)
- `origin` (GitHub interno `alefdssantos/quiz-cambel`) **não respondeu** no push de 14/09 (`repository not found`). Fonte da verdade: remoto `client`

Puxar:

```bash
git fetch client
git checkout client
git pull
```

---

## URLs de produção

| Peça | URL |
|------|-----|
| Domínio | https://quiz.cambel.srv.br |
| LP | https://quiz.cambel.srv.br/cambel |
| Quiz | https://quiz.cambel.srv.br/diagnostico |
| Raiz `/` | redireciona para `/cambel` |
| Laudo de exemplo | https://quiz.cambel.srv.br/diagnostico/resultado/ca00d8df-e515-437f-bdae-0d9f786190d5 |
| Fallback HTTP | http://179.197.65.2:3060/cambel e `/diagnostico` |

HTTPS público é Cloudflare (certificado Google Trust Services em `cambel.srv.br`).

---

## Repos

| Onde | Valor |
|------|--------|
| Local | `/Users/alefsantos/Projetos/quiz-cambel` |
| GitHub interno | https://github.com/alefdssantos/quiz-cambel (`origin`) — **inacessível em 14/09** |
| GitHub cliente | https://github.com/abelbertorosa-glitch/quiz (`client`) |
| Branch de trabalho | `client` (track `client/main`) |

SSH do repo cliente: host `github-samuelfajreldines01` (chave `~/.ssh/id_ed25519_github_samuelfajreldines01`).

---

## VPS (produção)

| Item | Valor |
|------|--------|
| SSH | `ssh gikadatavps` |
| Host | `179.197.65.2` · porta **2222** · user **`deploy`** |
| Chave | `~/.ssh/alef_vps` |
| Path | `/home/deploy/quiz-cambel` |
| Containers | `quiz-cambel-app` (Next) + `quiz-cambel-web` (nginx LP + proxy) |
| Porta do app | **3060** → nginx do container (LP `/cambel`, quiz `/diagnostico`) |
| Volume | Docker `quiz-cambel_quiz_data` → `/data` (um JSON por laudo) |
| Env no servidor | `/home/deploy/quiz-cambel/.env` (`chmod 600`) |

**Não mexer** nos outros da VPS: gikadata, skopus, giro, blue-prime, taylla, cliente-b/c, comandafacil, maian-expo.

### Nginx do host (80/443)

O default do GikaData dá **444** em Host desconhecido (Cloudflare via a 520). Por isso existe vhost próprio:

| Item | Path |
|------|------|
| Vhost | `/etc/nginx/sites-available/quiz.cambel.srv.br` |
| Enabled | `/etc/nginx/sites-enabled/quiz.cambel.srv.br` |
| Origem do arquivo | `deploy/host-nginx-quiz.cambel.srv.br.conf` |
| Cert origem (self-signed) | `/etc/ssl/quiz-cambel/fullchain.pem` + `privkey.pem` |
| Upstream | `127.0.0.1:3060` |

`deploy` **não tem sudo**. O user está no grupo `docker`. Para gravar vhost / recarregar o nginx **do host**:

```bash
# master do nginx systemd (NÃO o do blue-prime)
# PID típico: /usr/sbin/nginx  — conferir com:
ps aux | grep 'nginx: master process /usr/sbin/nginx'

# reload (docker group, privileged):
docker run --rm --privileged --pid=host alpine:3.20 kill -HUP <PID_DO_MASTER_SYSTEMD>
```

Há **vários** nginx na máquina. O do blue-prime também é `nginx -g daemon off`. Se der HUP no PID errado, o vhost novo não entra.

### Deploy

```bash
cd /Users/alefsantos/Projetos/quiz-cambel
pnpm test
pnpm deploy:vps
```

Isso faz rsync para `/home/deploy/quiz-cambel` e `docker compose up -d --build`.  
O `.env` da VPS **não** deve ser apagado (script exclui `.env`).

`.env` na VPS (valores secretos só em `HANDOFF.local.md`):

```
NEXT_PUBLIC_SITE_ORIGIN=https://quiz.cambel.srv.br
NEXT_PUBLIC_BASE_URL=https://quiz.cambel.srv.br/diagnostico
RD_STATION_PUBLIC_TOKEN=
RD_STATION_PRIVATE_TOKEN=
RD_STATION_API_KEY=
RD_STATION_CONVERSION_IDENTIFIER=diagnostico-oficina-quiz
```

PDF interno (Chromium no container): `PDF_INTERNAL_BASE_URL=http://127.0.0.1:3000/diagnostico`.

---

## RD Station

Doc completa: `docs/RD-STATION.md`.

- Andreza (12/09) mandou **token público** + **token privado** (Dados de integração, não API Key da App Store)
- Conversão usa o **público** em `POST https://api.rd.services/platform/conversions?api_key=`
- Privado dá **401** nesse endpoint (serve funil/venda; está no `.env` mas o código não usa)
- Dispara em `createResponse` (diagnóstico gravado). Abandono no meio do form **não** vai
- Falha no RD **não** trava o laudo (`rdstation_sync_failed` no log)
- Teste 14/09: HTTP 200, `event_uuid=5bd9cbc3-50bd-4171-8c7f-19b653a543e9`
- Lead de prova no RD: `teste.integracao.quiz@cambel.srv.br` — **podem apagar**
- Mailing do teste foi `false` (por isso o aviso amarelo no RD). Lead real do quiz vai com mailing ligado

---

## O que o produto faz

1. LP (`lp/`) em `/cambel`
2. Quiz Next (`basePath` `/diagnostico`) — lead + 19 perguntas
3. Motor de diagnóstico (`src/lib/scoring/`)
4. Resultado em **6 passos** (`ResultadoPassos`): visão geral → financeiro → operação → gestão → comercial → próximos passos
5. PDF via Chromium (`/diagnostico/api/pdf/{id}`)
6. Lead → RD Station (conversão `diagnostico-oficina-quiz`)

Store: `src/lib/data/store.ts` — um arquivo `/data/{uuid}.json` (atômico). Na Vercel isso quebrava (disco serverless); por isso saímos da Vercel.

---

## Histórico

### 14/09

- Integração RD Station (token público)
- Teste confirmado no painel do RD pela Andreza
- Deploy VPS + push `client/main`

### 11/09

- Cliente: perguntas ok, **laudo não voltava**; prazo de ~2 semanas até a feira
- Causa: persistência em arquivo na Vercel
- Tudo hospedado na VPS GikaData; projeto Vercel `quiz-cambel` **apagado**
- DNS: `quiz.cambel.srv.br` no Cloudflare (proxy laranja) → origem `179.197.65.2`
- Vhost host + laudo em painel, depois seções, depois **passo a passo para ler**
- Contador do quiz centralizado; mobile do laudo sem sobreposição

---

## Como rodar local

```bash
pnpm install
pnpm dev          # http://localhost:3000/diagnostico
pnpm test
pnpm test:e2e     # Playwright; PDF precisa de Chromium local
```

E2E de produção:

```bash
PLAYWRIGHT_BASE_URL=https://quiz.cambel.srv.br pnpm exec playwright test e2e/diagnostico.spec.ts --grep "full diagnostic"
```

Sem tokens RD no `.env` local, o envio é ignorado (não quebra o quiz).

---

## O que ainda não tem / próximo

- Pixels / WhatsApp / GTM na LP
- Foto real no painel navy da LP
- Destino extra do lead: planilha / e-mail (RD já está)
- Aula de faturamento diário (não gravada; sem link)
- Let's Encrypt na origem (hoje self-signed atrás do Cloudflare; SSL Flexible/Full)
- Certificado origin Cloudflare se quiserem Full Strict

Pendências do briefing: enunciado P1/P2 (valor aberto vs faixa); resultado agora é passo a passo, não score único por tela de categoria além do que já tem.

---

## Arquivos-chave

| Path | Função |
|------|--------|
| `src/app/quiz/` | Quiz (form + server action) |
| `src/components/diagnostico/ResultadoPassos.tsx` | Laudo passo a passo (cliente) |
| `src/components/diagnostico/ResultadoPainel.tsx` | PDF/print + gráficos |
| `src/lib/data/store.ts` | Persistência `/data/{id}.json` + envio RD |
| `src/lib/rdstation.ts` | Conversão RD Station (token público) |
| `docs/RD-STATION.md` | Integração RD: endpoint, campos, env |
| `src/lib/scoring/` | Motor + textos do laudo |
| `lp/` | Landing |
| `docker-compose.yml` + `Dockerfile` | App na VPS |
| `deploy/nginx.conf` | Nginx do container (3060) |
| `deploy/host-nginx-quiz.cambel.srv.br.conf` | Vhost 80/443 do host |
| `scripts/deploy-vps.sh` | Rsync + compose build |
