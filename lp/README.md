# LP de tráfego

Landing da Cambel. Roda na **Hostinger**, no domínio de tráfego pago
(não no site institucional GreatPages).

O quiz Next.js **não** mora aqui. O CTA desta pasta aponta para `/diagnostico`
(proxy Hostinger → Vercel).

## Contrato com o quiz

| Item | Valor |
|------|--------|
| CTA principal | `site.config.json` → `quizUrl` (prod: `/diagnostico`) |
| UTMs | preservar `utm_source`, `utm_medium`, `utm_campaign` na URL do quiz |
| Não coletar lead na LP | a captura oficial é `/diagnostico/lead` |
| Não gerar PDF aqui | PDF é `/diagnostico/api/pdf/{id}` na Vercel |
| Não apontar Chromium para este domínio | o proxy quebra o print |

## Local

Na raiz do repo:

```bash
pnpm dev:lp
# http://localhost:4173
```

Para testar o funil completo, o quiz precisa estar em `http://localhost:3000/diagnostico`.
Em `localhost` os CTAs apontam para essa origem automaticamente. Em produção
continuam em `/diagnostico` no domínio da LP.

## Deploy Hostinger

Publicar o conteúdo desta pasta no `public_html` (ou subpasta da LP).
O proxy do quiz fica em `hostinger/` — não misturar os arquivos da LP com o PHP
sem revisar o `.htaccess`.

## Visual

Layout em camadas (`.collage` em `index.html`/`styles.css`): dois blocos
decorativos inclinados (`.block--a` teal, `.block--b` laranja), um painel
navy com o selo do logo (`.photo`) e o card branco com a copy (`.card`)
sobrepondo tudo. Paleta e fontes seguem o manual de marca oficial
(`lp/assets/brand-cambel.pdf`): azul `#0055a3`, navy `#002c4d`, laranja
`#ef7d00`, teal `#00a685`, fonte Poppins (substituta gratuita da Gotham).
Empilha em coluna única abaixo de 760px (blocos decorativos somem, só
painel + card).

Header sticky com menu (Início, O que medimos, Como funciona, Começar) e
CTA. Cada seção ocupa no mínimo uma tela (`min-height: 100svh`) sem recortar
o conteúdo.

Depois do hero, três seções no mesmo vocabulário visual:

1. `#medimos` — quatro frentes do laudo (Financeiro, Operação, Gestão, Comercial)
2. `#como` — três passos até o PDF
3. `#comecar` — CTA final em faixa navy

Todos os `.cta` herdam UTMs de `site.config.json`.

## Trocar o painel navy por foto real

Quando tiver uma foto (oficina, mecânico, cliente) pra usar no lugar do
selo do logo:

1. Colocar o arquivo em `lp/assets/hero.jpg` (ou `.webp`).
2. Em `styles.css`, na regra `.photo`, trocar o `background:` (gradiente +
   textura pontilhada) por `background: url('./assets/hero.jpg')
   center/cover;`.
3. Decidir se mantém a tag `<img>` do logo sobreposta à foto (como selo, ex.
   canto inferior direito) ou remove — hoje ela fica ancorada no canto
   superior esquerdo do painel, longe da área que o card cobre.
