# Hostinger · tráfego + proxy do quiz

Mesmo desenho do funil de diagnóstico: LP e pixels na Hostinger; quiz, laudo e
PDF na Vercel. O visitante só vê o domínio da LP.

```
Visitante
  └─ domínio de tráfego (Hostinger · public_html)
        ├─ /                 → LP (pasta lp/)
        └─ /diagnostico*     → quiz-proxy.php → Vercel (Next + PDF)
```

O site institucional `www.cambel.srv.br` hoje é GreatPages. **Não** publicar
esta pasta na raiz dele. A LP de tráfego pago vai numa conta/subdomínio
Hostinger próprio.

## Regras

- Chromium do PDF **nunca** pode abrir o domínio Hostinger. Usa
  `PDF_INTERNAL_BASE_URL` no deploy Vercel (URL `*.vercel.app/diagnostico`).
- Não criar path tipo `/obrigado-diagnostico/{id}` no proxy. Resultado =
  `/diagnostico/resultado/{id}`.
- Server Actions precisam do host da LP em `serverActions.allowedOrigins`
  (`NEXT_PUBLIC_SITE_ORIGIN` no Vercel).
- PHP precisa timeout alto o bastante para o PDF (cold start 15–30s).

## Arquivos

| Arquivo | Função |
|---------|--------|
| `quiz-proxy.php` | Encaminha `/diagnostico*` para a Vercel |
| `quiz-origin.example.php` | Modelo da URL Vercel (copiar para `quiz-origin.php`) |
| `.htaccess` | HTTPS + rewrite só de `/diagnostico*` |

## Publicar

```bash
CAMBEL_VERCEL_ORIGIN=https://SEU-PROJETO.vercel.app pnpm pack:hostinger
```

Sobe o conteúdo de `dist/hostinger/` no `public_html` da Hostinger de tráfego.
Edite `quiz-origin.php` se o pack rodou sem a env.

Variáveis na Vercel:

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_SITE_ORIGIN` | `https://` + domínio da LP na Hostinger |
| `NEXT_PUBLIC_BASE_URL` | esse domínio + `/diagnostico` |
| `PDF_INTERNAL_BASE_URL` | `https://SEU-PROJETO.vercel.app/diagnostico` |
