# Hostinger · tráfego + proxy do quiz

```
Visitante
  └─ domínio da Cambel (Hostinger)
        ├─ / e /lp/*     → arquivos estáticos da pasta lp/
        └─ /diagnostico* → quiz-proxy.php → Vercel (Next + PDF)
```

## Regras

- Chromium do PDF **nunca** pode abrir o domínio Hostinger. Usa
  `PDF_INTERNAL_BASE_URL` no deploy Vercel.
- Não criar path tipo `/obrigado-diagnostico/{id}` no proxy. Resultado =
  `/diagnostico/resultado/{id}`.
- Server Actions do Next precisam do domínio Hostinger em
  `serverActions.allowedOrigins`.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `quiz-proxy.php` | Encaminha `/diagnostico*` para a URL Vercel |
| `.htaccess.example` | HTTPS + rewrite da LP e do quiz |

Substituir `VERCEL_ORIGIN` no PHP quando o projeto Vercel existir.
