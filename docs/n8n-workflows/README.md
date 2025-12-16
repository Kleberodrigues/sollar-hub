# Workflows n8n - Sollar Insight Hub

Workflows prontos para importar no n8n.

## Como Importar

1. Acesse seu n8n: `https://sollar-n8n.7wxwzr.easypanel.host`
2. Clique em **Workflows** > **Add workflow** > **Import from file**
3. Selecione o arquivo JSON desejado
4. Configure as credenciais necessárias (SMTP, Slack, etc.)
5. **Ative o workflow**

## Workflows Disponíveis

### 1. `01-diagnostic-activated.json`
**Evento:** `diagnostic.activated`

Envia email quando um assessment é ativado.

**Configurar:**
- Credencial SMTP/Gmail no node "Enviar Email"
- Variável de ambiente `NOTIFICATION_EMAIL` ou editar destinatário

---

### 2. `02-risk-threshold-alert.json`
**Evento:** `risk.threshold.exceeded`

Alerta urgente quando uma categoria atinge score de risco >= 3.5.

**Features:**
- Diferencia risco "high" (amarelo) de "critical" (vermelho)
- Email formatado com detalhes do risco

**Configurar:**
- Credencial SMTP/Gmail
- Variável `ALERT_EMAIL` ou editar destinatário

---

### 3. `03-response-received.json`
**Evento:** `diagnostic.response_received`

Notifica quando atingir marcos de participação (10, 50, 100 respostas).

**Features:**
- Filtra por marcos específicos
- Evita spam de notificações

**Configurar:**
- Credencial SMTP/Gmail
- Editar marcos conforme necessidade

---

### 4. `04-all-events-unified.json`
**Hub Central** - Recebe TODOS os eventos

Workflow base com router que separa eventos por tipo.

**Features:**
- Switch node que roteia por `event_type`
- Nodes de processamento para cada tipo
- Pronto para conectar suas ações (Email, Slack, etc.)

**Usar quando:**
- Quer um único endpoint para todos os eventos
- Quer customizar ações específicas

---

## URL do Webhook

Após importar e ativar, a URL será:
```
https://sollar-n8n.7wxwzr.easypanel.host/webhook/sollar-events
```

Configure no `.env.local` do Sollar:
```bash
N8N_WEBHOOK_URL=https://sollar-n8n.7wxwzr.easypanel.host/webhook/sollar-events
N8N_WEBHOOK_SECRET=sua-chave-secreta
```

---

## Testando

### Via curl:
```bash
curl -X POST https://sollar-n8n.7wxwzr.easypanel.host/webhook/sollar-events \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "diagnostic.activated",
    "organization_id": "test-org-123",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
      "diagnostic_id": "test-123",
      "title": "Assessment de Teste",
      "public_url": "https://app.sollar.com/assess/test-123",
      "target_departments": [],
      "all_organization": true,
      "start_date": "2024-01-15",
      "end_date": "2024-02-15"
    }
  }'
```

### Via Sollar:
1. Crie um novo assessment no wizard
2. Ative o assessment
3. Verifique as execuções no n8n

---

## Eventos Suportados

| Evento | Descrição |
|--------|-----------|
| `diagnostic.activated` | Assessment ativado |
| `diagnostic.response_received` | Resposta recebida |
| `diagnostic.completed` | Assessment finalizado |
| `risk.threshold.exceeded` | Risco alto detectado |

---

## Troubleshooting

**Webhook não recebe dados:**
- Verifique se o workflow está **ativo** (toggle verde)
- Confirme a URL no `.env.local`

**Email não envia:**
- Configure credenciais SMTP no n8n
- Verifique spam/lixeira

**Eventos duplicados:**
- Normal se houver retry (3 tentativas)
- Use `event_id` para deduplicação
