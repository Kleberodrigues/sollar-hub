# Integração n8n - Sollar Insight Hub

Guia de configuração e exemplos de workflows n8n para automação de eventos do Sollar.

## Visão Geral

O Sollar emite webhooks para eventos importantes que podem ser capturados pelo n8n para automações como:
- Notificações por email/Slack/Teams
- Alertas de risco crítico
- Relatórios automáticos
- Integrações com sistemas externos

## Configuração Inicial

### 1. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```bash
# URL do webhook do n8n
N8N_WEBHOOK_URL=https://seu-n8n.exemplo.com/webhook/sollar-events

# Secret para validação HMAC-SHA256 (gere um valor seguro)
N8N_WEBHOOK_SECRET=sua-chave-secreta-aqui
```

### 2. Configurar Webhook no n8n

1. Crie um novo workflow no n8n
2. Adicione um node **Webhook**
3. Configure:
   - **HTTP Method**: POST
   - **Path**: `/sollar-events` (ou personalizado)
   - **Authentication**: None (validação via header X-Webhook-Signature)

---

## Eventos Disponíveis

### 1. `diagnostic.activated`

**Disparado quando**: Um assessment é ativado pelo wizard.

**Payload**:
```json
{
  "event_type": "diagnostic.activated",
  "organization_id": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "diagnostic_id": "uuid",
    "title": "Assessment NR-1 Q1 2024",
    "public_url": "https://app.sollar.com/assess/uuid",
    "target_departments": ["dept-1", "dept-2"],
    "all_organization": false,
    "start_date": "2024-01-15",
    "end_date": "2024-02-15"
  },
  "metadata": {
    "triggered_by": "assessment-wizard"
  }
}
```

**Uso sugerido**:
- Enviar email para gestores com link do assessment
- Notificar equipe de RH
- Criar evento no calendário

---

### 2. `diagnostic.response_received`

**Disparado quando**: Um participante submete suas respostas.

**Payload**:
```json
{
  "event_type": "diagnostic.response_received",
  "organization_id": "uuid",
  "timestamp": "2024-01-16T14:22:00Z",
  "data": {
    "diagnostic_id": "uuid",
    "diagnostic_title": "Assessment NR-1 Q1 2024",
    "anonymous_id": "uuid",
    "response_count": 42,
    "total_answers": 840
  },
  "metadata": {
    "triggered_by": "public-response-form"
  }
}
```

**Uso sugerido**:
- Atualizar dashboard em tempo real
- Enviar resumo diário de participação
- Disparar lembrete quando atingir X% de participação

---

### 3. `diagnostic.completed`

**Disparado quando**: Assessment muda status para "completed".

**Payload**:
```json
{
  "event_type": "diagnostic.completed",
  "organization_id": "uuid",
  "timestamp": "2024-02-15T18:00:00Z",
  "data": {
    "diagnostic_id": "uuid",
    "title": "Assessment NR-1 Q1 2024",
    "total_responses": 156,
    "completion_rate": 87.5,
    "duration_days": 31,
    "started_at": "2024-01-15",
    "completed_at": "2024-02-15"
  },
  "metadata": {
    "triggered_by": "assessment-completion"
  }
}
```

**Uso sugerido**:
- Gerar e enviar relatório PDF
- Notificar stakeholders
- Agendar reunião de resultados

---

### 4. `risk.threshold.exceeded`

**Disparado quando**: Uma categoria atinge score de risco >= 3.5.

**Payload**:
```json
{
  "event_type": "risk.threshold.exceeded",
  "organization_id": "uuid",
  "timestamp": "2024-01-20T09:15:00Z",
  "data": {
    "diagnostic_id": "uuid",
    "diagnostic_title": "Assessment NR-1 Q1 2024",
    "category": "violence_harassment",
    "category_name": "Violência e Assédio",
    "current_score": 4.2,
    "threshold": 3.5,
    "risk_level": "critical"
  },
  "metadata": {
    "triggered_by": "analytics-calculation"
  }
}
```

**Uso sugerido**:
- Alerta imediato para diretoria/RH
- Criar ticket no sistema de gestão
- Disparar protocolo de intervenção

---

## Validação de Assinatura

Todos os webhooks incluem um header `X-Webhook-Signature` com HMAC-SHA256.

### Validar no n8n (Code Node)

```javascript
const crypto = require('crypto');

const payload = JSON.stringify($input.all()[0].json);
const secret = 'seu-webhook-secret';
const receivedSignature = $input.all()[0].headers['x-webhook-signature'];

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (receivedSignature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}

return $input.all();
```

---

## Workflows de Exemplo

### Workflow 1: Email de Ativação

```
[Webhook] → [IF: event_type = diagnostic.activated] → [Send Email]
```

**Configuração do Email**:
- **To**: gestores@empresa.com
- **Subject**: Novo Assessment Ativado: {{$json.data.title}}
- **Body**:
  ```
  Um novo assessment foi ativado na sua organização.

  Título: {{$json.data.title}}
  Link: {{$json.data.public_url}}
  Período: {{$json.data.start_date}} até {{$json.data.end_date}}

  Por favor, compartilhe o link com os participantes.
  ```

---

### Workflow 2: Alerta de Risco Crítico

```
[Webhook] → [IF: event_type = risk.threshold.exceeded]
         → [IF: risk_level = critical]
         → [Send Email Urgente] + [Send Slack]
```

**Configuração Slack**:
- **Channel**: #alertas-rh
- **Message**:
  ```
  :rotating_light: *ALERTA CRÍTICO DE RISCO*

  Assessment: {{$json.data.diagnostic_title}}
  Categoria: {{$json.data.category_name}}
  Score: {{$json.data.current_score}} (threshold: {{$json.data.threshold}})

  Ação imediata requerida!
  ```

---

### Workflow 3: Resumo Diário de Participação

```
[Schedule Trigger: 18h] → [HTTP Request: GET /api/assessments/active]
                       → [Loop: cada assessment]
                       → [IF: completion_rate < 50%]
                       → [Send Email Summary]
```

---

### Workflow 4: Integração com Google Sheets

```
[Webhook: response_received] → [Google Sheets: Append Row]
```

**Dados para Sheet**:
| Timestamp | Assessment | Respostas | Taxa |
|-----------|------------|-----------|------|
| {{$json.timestamp}} | {{$json.data.diagnostic_title}} | {{$json.data.response_count}} | - |

---

## API Endpoints Úteis

Para workflows que precisam buscar dados adicionais:

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/assessments` | Listar assessments |
| `GET /api/assessments/:id` | Detalhes do assessment |
| `GET /api/assessments/:id/analytics` | Analytics completo |
| `GET /api/organizations/:id` | Dados da organização |

---

## Troubleshooting

### Webhook não está sendo recebido

1. Verifique se `N8N_WEBHOOK_URL` está correto no `.env.local`
2. Confirme que o workflow n8n está **ativo**
3. Verifique logs do n8n para erros de conexão

### Signature inválida

1. Confirme que `N8N_WEBHOOK_SECRET` é idêntico no Sollar e no n8n
2. Verifique se não há espaços extras na variável
3. O payload deve ser JSON stringificado exatamente como enviado

### Eventos duplicados

- O Sollar tem retry automático (3 tentativas)
- Implemente idempotência usando `event_id` no payload
- Use o campo `timestamp` para deduplicação

---

## Tabela webhook_events

Todos os eventos são registrados na tabela `webhook_events` para auditoria:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único do evento |
| organization_id | uuid | Organização |
| event_type | text | Tipo do evento |
| payload | jsonb | Dados completos |
| status | text | pending/sent/delivered/failed |
| attempts | int | Tentativas de envio |
| last_error | text | Último erro (se houver) |
| created_at | timestamp | Data de criação |
| delivered_at | timestamp | Data de entrega |

---

## Suporte

Para dúvidas sobre integração:
- Email: suporte@sollar.com.br
- Documentação: https://docs.sollar.com.br/integracoes/n8n
