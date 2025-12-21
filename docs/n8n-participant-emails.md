# n8n Workflow - Disparo de Emails para Participantes

## Visão Geral

Este documento descreve como configurar o workflow n8n para enviar emails automaticamente quando participantes são importados para um assessment.

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Sollar App     │────▶│   n8n Webhook   │────▶│  Email Service  │
│  (Import CSV)   │     │   (Workflow)    │     │  (SMTP/SendGrid)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Supabase      │◀────│  Update Status  │◀────│  Delivery Log   │
│   (Database)    │     │  via API        │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Eventos Disparados

### `participants.imported`
Disparado automaticamente quando participantes são importados via CSV.

**Payload:**
```json
{
  "event": "participants.imported",
  "timestamp": "2025-12-21T14:00:00.000Z",
  "organization_id": "uuid",
  "data": {
    "assessment_id": "uuid",
    "assessment_title": "Avaliação NR-1 - Janeiro 2025",
    "organization_id": "uuid",
    "participants": [
      {
        "id": "uuid",
        "email": "joao@empresa.com",
        "name": "João Silva",
        "department": "TI",
        "role": "Desenvolvedor"
      }
    ],
    "total_count": 5,
    "public_url": "https://app.sollarsaude.com.br/assessments/uuid/respond",
    "imported_by": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@empresa.com"
    }
  }
}
```

### `participants.email_requested`
Disparado manualmente via API para reenviar emails.

## Configuração do Workflow n8n

### 1. Criar Webhook Trigger

- **Node**: Webhook
- **HTTP Method**: POST
- **Path**: `/sollar-events`
- **Authentication**: Header Auth
  - Header Name: `x-webhook-signature`

### 2. Filtrar Evento

- **Node**: IF
- **Condition**: `{{ $json.event === 'participants.imported' }}`

### 3. Loop por Participantes

- **Node**: Split In Batches
- **Batch Size**: 10 (para rate limiting)
- **Field**: `{{ $json.data.participants }}`

### 4. Enviar Email

- **Node**: Email (SMTP) ou SendGrid/Mailgun

**Template de Email:**
```html
Olá {{ $json.name }},

Você foi convidado(a) a participar da avaliação "{{ $('Webhook').item.json.data.assessment_title }}".

Por favor, acesse o link abaixo para responder:
{{ $('Webhook').item.json.data.public_url }}

Este é um questionário confidencial para avaliação de riscos psicossociais.
Suas respostas são anônimas e protegidas.

Atenciosamente,
Equipe Sollar Saúde
```

### 5. Atualizar Status no Sollar

- **Node**: HTTP Request
- **Method**: PATCH
- **URL**: `https://app.sollarsaude.com.br/api/n8n/participants`
- **Headers**:
  - `x-api-key`: `{{ $env.N8N_API_KEY }}`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "participant_id": "{{ $json.id }}",
  "status": "sent"
}
```

### 6. Atualização em Lote (Alternativa)

Para atualizar múltiplos participantes de uma vez:

```json
{
  "bulk": [
    { "participant_id": "uuid1", "status": "sent" },
    { "participant_id": "uuid2", "status": "sent" }
  ]
}
```

## API Endpoints

### GET /api/n8n/participants
Buscar participantes pendentes.

**Query Parameters:**
- `assessment_id` - Filtrar por assessment
- `organization_id` - Filtrar por organização
- `status` - Status (default: pending)
- `limit` - Máximo de resultados (default: 100)

**Headers:**
- `x-api-key` - Chave de API do n8n

**Response:**
```json
{
  "success": true,
  "count": 5,
  "assessment": {
    "id": "uuid",
    "title": "Avaliação NR-1",
    "status": "active",
    "public_url": "https://..."
  },
  "participants": [...]
}
```

### PATCH /api/n8n/participants
Atualizar status de participantes.

**Headers:**
- `x-api-key` - Chave de API do n8n

**Body (single):**
```json
{
  "participant_id": "uuid",
  "status": "sent"
}
```

**Body (bulk):**
```json
{
  "bulk": [
    { "participant_id": "uuid1", "status": "sent" },
    { "participant_id": "uuid2", "status": "bounced" }
  ]
}
```

### POST /api/n8n/participants
Solicitar reenvio de emails.

**Body:**
```json
{
  "assessment_id": "uuid",
  "participant_ids": ["uuid1", "uuid2"]  // opcional
}
```

## Variáveis de Ambiente

```env
# URL do webhook n8n
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/sollar-events

# Secret para assinatura de webhooks
N8N_WEBHOOK_SECRET=sua-chave-secreta

# API Key para autenticação
N8N_API_KEY=sua-api-key
```

## Status de Participantes

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando envio do email |
| `sent` | Email enviado com sucesso |
| `responded` | Participante respondeu o questionário |
| `bounced` | Email retornou (inválido) |
| `opted_out` | Participante optou por não participar |

## Workflow Completo (JSON)

```json
{
  "name": "Sollar - Disparo de Emails",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "sollar-events"
      }
    },
    {
      "name": "Filter participants.imported",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.event }}",
            "value2": "participants.imported"
          }]
        }
      }
    },
    {
      "name": "Loop Participants",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 10,
        "options": {}
      }
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "={{ $json.email }}",
        "subject": "Convite: {{ $node.Webhook.json.data.assessment_title }}",
        "text": "Olá {{ $json.name }},\n\nVocê foi convidado(a) a participar...",
        "html": "<p>Olá <strong>{{ $json.name }}</strong>,</p>..."
      }
    },
    {
      "name": "Update Status",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "PATCH",
        "url": "https://app.sollarsaude.com.br/api/n8n/participants",
        "headers": {
          "x-api-key": "={{ $env.N8N_API_KEY }}"
        },
        "body": {
          "participant_id": "={{ $json.id }}",
          "status": "sent"
        }
      }
    }
  ]
}
```

## Troubleshooting

### Emails não estão sendo enviados
1. Verificar se `N8N_WEBHOOK_URL` está configurado
2. Verificar logs do n8n
3. Verificar tabela `webhook_events` no Supabase

### Status não está atualizando
1. Verificar se `N8N_API_KEY` está correto
2. Verificar resposta da API no n8n
3. Verificar logs do console

### Webhook não está sendo recebido
1. Verificar URL do webhook no n8n
2. Verificar se o webhook está ativo
3. Testar com curl:
```bash
curl -X POST https://seu-n8n.com/webhook/sollar-events \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'
```
