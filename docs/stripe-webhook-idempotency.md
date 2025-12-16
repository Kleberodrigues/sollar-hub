# Stripe Webhook Idempotency

## Overview

Implementação de idempotência nos webhooks do Stripe para evitar processamento duplicado de eventos. Esta é uma prática essencial para garantir que eventos sejam processados apenas uma vez, mesmo que o Stripe envie o mesmo evento múltiplas vezes.

## Problema

O Stripe pode enviar o mesmo webhook múltiplas vezes devido a:
- Timeouts de rede
- Retries automáticos
- Falhas temporárias
- Problemas de conectividade

Sem idempotência, isso pode resultar em:
- Cobranças duplicadas
- Estados inconsistentes
- Notificações em duplicidade
- Dados corrompidos

## Solução Implementada

### 1. Tabela de Eventos Processados

Criada a tabela `stripe_webhook_events` para rastrear eventos já processados:

```sql
CREATE TABLE stripe_webhook_events (
    id UUID PRIMARY KEY,
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
```

**Características:**
- `stripe_event_id`: ID único do evento Stripe (evt_xxx)
- Índice único garante impossibilidade de duplicatas
- RLS habilitado para segurança
- Service role tem acesso total (webhooks)
- Admins podem visualizar eventos

### 2. Fluxo de Processamento

```typescript
// 1. Verificar se evento já foi processado
const { data: existingEvent } = await supabase
  .from("stripe_webhook_events")
  .select("id, processed_at")
  .eq("stripe_event_id", eventId)
  .single();

if (existingEvent) {
  // Evento já processado, retornar sucesso sem reprocessar
  return NextResponse.json({
    received: true,
    duplicate: true,
    event_id: eventId,
  });
}

// 2. Registrar evento como processado (antes de processar)
await supabase
  .from("stripe_webhook_events")
  .insert({
    stripe_event_id: eventId,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  });

// 3. Processar evento normalmente
// ...
```

### 3. Proteções Implementadas

#### Race Condition Protection
```typescript
if (insertError.code === "23505") { // Unique violation
  // Outro request está processando este evento
  return NextResponse.json({
    received: true,
    duplicate: true,
    event_id: eventId,
  });
}
```

#### Error Handling Resiliente
```typescript
try {
  // Idempotency check
} catch (error) {
  console.error("[Stripe Webhook] Idempotency check error:", error);
  // Continue processing despite check error
  // Melhor processar possivelmente duas vezes que perder evento
}
```

## Comportamento

### Primeiro Request
1. Verifica na tabela → não encontra
2. Insere registro de evento
3. Processa evento normalmente
4. Retorna `{ received: true }`

### Request Duplicado
1. Verifica na tabela → encontra registro
2. Retorna `{ received: true, duplicate: true }`
3. **Não reprocessa** o evento

### Requests Concorrentes (Race Condition)
1. Request A: verifica → não encontra
2. Request B: verifica → não encontra
3. Request A: tenta inserir → sucesso
4. Request B: tenta inserir → falha (unique violation)
5. Request B: retorna duplicate
6. Apenas Request A processa o evento

## Vantagens

✅ **Segurança**: Garante processamento único via constraint de BD
✅ **Performance**: Verificação rápida via índice único
✅ **Resiliência**: Continua funcionando mesmo com erros de check
✅ **Auditoria**: Histórico de todos eventos processados
✅ **Conformidade**: Seguindo best practices do Stripe

## Manutenção

### Limpeza de Eventos Antigos

Eventos processados há mais de 30 dias podem ser limpos:

```sql
DELETE FROM stripe_webhook_events
WHERE created_at < NOW() - INTERVAL '30 days';
```

**Recomendação**: Configurar job cron para executar mensalmente.

### Monitoramento

Queries úteis para monitoramento:

```sql
-- Eventos processados nas últimas 24h
SELECT event_type, COUNT(*)
FROM stripe_webhook_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- Eventos duplicados detectados
SELECT COUNT(*) as duplicate_count
FROM stripe_webhook_events
WHERE created_at > NOW() - INTERVAL '7 days';
```

## Testes

### Testar Idempotência

1. Enviar mesmo evento duas vezes via Stripe CLI:
```bash
stripe trigger customer.subscription.updated
# Enviar novamente o mesmo evento
```

2. Verificar logs:
```
[Stripe Webhook] Processing event: customer.subscription.updated
[Stripe Webhook] Event evt_xxx already processed at 2025-12-09...
```

3. Segundo request deve retornar `duplicate: true`

### Testar Race Conditions

Usar ferramenta como `ab` (Apache Bench) para enviar múltiplos requests simultâneos:

```bash
# Enviar 10 requests simultâneos
ab -n 10 -c 10 -T 'application/json' \
  -H 'stripe-signature: ...' \
  -p event.json \
  https://your-domain.com/api/webhooks/stripe
```

Apenas 1 evento deve ser processado, os outros 9 devem retornar `duplicate: true`.

## Referências

- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Idempotency Keys](https://stripe.com/docs/api/idempotent_requests)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)

## Migration

Arquivo: `20251209000003_create_stripe_webhook_events.sql`

Para aplicar:
```bash
# Via Supabase CLI
supabase db push

# Via Supabase Dashboard
# Upload do arquivo na seção Migrations
```
