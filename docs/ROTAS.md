# Rotas

`basePath` = `/diagnostico`. URLs abaixo já incluem o prefixo.

## Quiz (Vercel)

| URL | Arquivo | Uso |
|-----|---------|-----|
| `/diagnostico` | `src/app/page.tsx` | Porta do quiz (não é a LP de tráfego) |
| `/diagnostico/lead` | `src/app/lead/page.tsx` | Captura obrigatória |
| `/diagnostico/quiz` | `src/app/quiz/page.tsx` | 19 perguntas |
| `/diagnostico/resultado/{id}` | `src/app/resultado/[id]/page.tsx` | Laudo |
| `/diagnostico/resultado/{id}?print=1` | idem | HTML do PDF |
| `/diagnostico/api/pdf/{id}` | `src/app/api/pdf/[id]/route.ts` | PDF A4 |
| `/diagnostico/privacidade` | `src/app/privacidade/page.tsx` | LGPD |

Apex Vercel `/` redireciona para `/diagnostico`.

## LP (Hostinger)

| URL | Arquivo |
|-----|---------|
| `/` | `lp/index.html` |
| `/site.config.json` | CTA e UTMs |

## Não usar

| Path | Motivo |
|------|--------|
| `/obrigado-diagnostico/{id}` | Fora do prefixo do proxy; o resultado é `/diagnostico/resultado/{id}` |
| `/api/pdf/{id}` sem `/diagnostico` | Hostinger não encaminha `/api/*` |
