# Arquitetura — Diagnóstico Cambel

```
Tráfego pago / orgânico
        │
        v
Hostinger (domínio da LP de anúncio · public_html)
  lp/                         HTML estático + pixels
  /diagnostico*  ──proxy──►  Vercel Next.js
                              src/
                              /api/pdf/[id]  Chromium
```

O site institucional `www.cambel.srv.br` (GreatPages) **não** é esse
`public_html`. Tráfego pago usa Hostinger próprio; o quiz nunca é servido
pelo PHP, só encaminhado.

## Por que dois hosts

- **Hostinger:** LP, pixels, domínio de anúncio, tráfego.
- **Vercel:** App Router, Server Actions, PDF com Chromium (`@sparticuz/chromium`).
  Lambda não roda bem atrás de PHP. O Chromium do PDF **não** pode abrir o
  domínio do proxy — isso resulta em `fetch failed`.

## Quiz

- Next.js 16 App Router · `basePath: /diagnostico`
- Motor em `src/lib/scoring/`
- Persistência inicial: `data/responses.json` (trocar por Supabase depois)
- PDF: `src/lib/pdf.ts` + `src/app/api/pdf/[id]/route.ts`
- Chromium brotli copiado em `postinstall`/`prebuild` para `vendor/chromium-bin`

## LP

Pasta `lp/`. HTML estático. CTA = `/diagnostico` com UTMs.

## Variáveis

Ver `.env.example`. Em produção o Chromium usa só `PDF_INTERNAL_BASE_URL`
(URL Vercel com `/diagnostico`). Nunca o domínio Hostinger.
