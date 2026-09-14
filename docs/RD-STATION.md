# RD Station Marketing — envio de leads do quiz

Fonte: [Conversão via API Key](https://developers.rdstation.com/reference/conversao) e [Evento de conversão via API Key](https://developers.rdstation.com/reference/evento-de-conversao-via-api-key).

## Tokens da conta Cambel

Andreza passou os **Dados de integração** (perfil → Integrações), não a API Key da App Store.

| Token | Uso |
|-------|-----|
| **Público** | Envio de lead (conversão). Vai no `api_key` do POST. |
| **Privado** | Funil / marcar venda. **Não** autentica conversão (401). |

O endpoint `POST /platform/conversions?api_key=` aceita o token público. Confirmado em 14/09 (HTTP 200 + `event_uuid`).

## Quando dispara

No `submitQuiz` → `createResponse`. O lead só existe no servidor quando o diagnóstico é gravado. Abandono no meio do formulário **não** vai para o RD.

Falha no RD **não** impede o laudo. Log: `rdstation_sync_failed`.

## Endpoint

```
POST https://api.rd.services/platform/conversions?api_key={RD_STATION_API_KEY}
Content-Type: application/json
```

```json
{
  "event_type": "CONVERSION",
  "event_family": "CDP",
  "payload": {
    "conversion_identifier": "diagnostico-oficina-quiz",
    "email": "ana@oficina.com",
    "name": "Ana Silva",
    "job_title": "Gestor",
    "company_name": "Oficina Central",
    "city": "Belo Horizonte",
    "state": "MG",
    "country": "Brasil",
    "mobile_phone": "+5531988887777",
    "personal_phone": "+5531988887777",
    "website": "https://quiz.cambel.srv.br/diagnostico/resultado/{id}",
    "traffic_source": "utm_source",
    "traffic_medium": "utm_medium",
    "traffic_campaign": "utm_campaign",
    "tags": ["quiz-cambel", "diagnostico-oficina"],
    "available_for_mailing": true,
    "legal_bases": [
      { "category": "communications", "type": "consent", "status": "granted" }
    ]
  }
}
```

Resposta 200: `{ "event_uuid": "..." }`.

## Campos personalizados (opcional)

O payload também tenta:

| Campo no RD (`api_identifier`) | Origem |
|--------------------------------|--------|
| `cf_cnpj` | CNPJ só dígitos |
| `cf_ano_fundacao` | Ano de fundação |
| `cf_idade` | Idade |
| `cf_genero` | `feminino` / `masculino` |
| `cf_laudo_id` | UUID do diagnóstico |
| `cf_laudo_url` | URL pública do laudo |

Se o RD responder 400 (campo inexistente), o código reenvia **sem** `cf_*`. O lead entra mesmo assim.

Para o CNPJ aparecer no perfil, criar o campo na conta RD com `api_identifier` começando em `cf_`.

## Env

```
RD_STATION_PUBLIC_TOKEN=
RD_STATION_PRIVATE_TOKEN=
RD_STATION_API_KEY=
RD_STATION_CONVERSION_IDENTIFIER=diagnostico-oficina-quiz
```

`RD_STATION_API_KEY` é alias do token público. Sem os dois, o envio é ignorado (dev local). Na VPS os tokens **já estão** em `/home/deploy/quiz-cambel/.env` (o deploy **não** apaga esse arquivo).

`conversion_identifier` é o nome do evento no RD — serve para segmentação e automação. Não precisa existir antes; o RD cria no primeiro envio.

## Código

| Path | Função |
|------|--------|
| `src/lib/rdstation.ts` | Payload + POST |
| `src/lib/data/store.ts` | Chama o sync depois de gravar o laudo |
