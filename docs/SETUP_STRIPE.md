# Configuracao do Stripe - Sollar Insight Hub

Este guia explica como configurar o Stripe para billing e subscriptions.

## Passo 1: Criar Conta no Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Crie uma conta ou faca login
3. Ative o modo de teste (Test Mode) para desenvolvimento

## Passo 2: Obter Chaves de API

1. Acesse [API Keys](https://dashboard.stripe.com/apikeys)
2. Copie as chaves:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

## Passo 3: Criar Produtos e Precos

### Produto 1: Sollar Pro

1. Acesse [Products](https://dashboard.stripe.com/products)
2. Clique em **Add product**
3. Preencha:
   - Nome: `Sollar Pro`
   - Descricao: `Para empresas em crescimento`
4. Adicione precos:
   - **Mensal**: R$299,00/mes (Recurring)
   - **Anual**: R$2.990,00/ano (Recurring)
5. Copie os Price IDs gerados

### Produto 2: Sollar Enterprise

1. Clique em **Add product**
2. Preencha:
   - Nome: `Sollar Enterprise`
   - Descricao: `Para grandes organizacoes`
3. Adicione precos:
   - **Mensal**: R$999,00/mes (Recurring)
   - **Anual**: R$9.990,00/ano (Recurring)
4. Copie os Price IDs gerados

## Passo 4: Configurar Webhook

1. Acesse [Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **Add endpoint**
3. Configure:
   - URL: `https://seu-dominio.com/api/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
4. Copie o **Signing secret**: `whsec_...`

## Passo 5: Configurar Customer Portal

1. Acesse [Customer Portal Settings](https://dashboard.stripe.com/settings/billing/portal)
2. Habilite:
   - Invoice history
   - Payment method management
   - Subscription cancellation
   - Subscription updates (optional)

## Passo 6: Adicionar Variaveis de Ambiente

Adicione ao seu `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
```

## Passo 7: Testar Localmente (Opcional)

Para testar webhooks localmente, use o Stripe CLI:

```bash
# Instalar Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copie o webhook signing secret temporario para .env.local
```

## Cartoes de Teste

Use estes cartoes em modo teste:

| Cenario | Numero do Cartao |
|---------|------------------|
| Sucesso | 4242 4242 4242 4242 |
| Recusado | 4000 0000 0000 0002 |
| Requer autenticacao | 4000 0025 0000 3155 |
| Fundos insuficientes | 4000 0000 0000 9995 |

- Data de expiracao: Qualquer data futura
- CVC: Qualquer 3 digitos
- CEP: Qualquer CEP valido

## Modelo de Precos

| Plano | Mensal | Anual | Features |
|-------|--------|-------|----------|
| **Free** | R$0 | R$0 | 1 assessment, 30 perguntas, CSV export |
| **Pro** | R$299 | R$2.990 | Ilimitado, 100 perguntas, PDF+CSV |
| **Enterprise** | R$999 | R$9.990 | Tudo + API + Suporte dedicado |

## Arquivos Implementados

### Backend
- `lib/stripe/config.ts` - Configuracao e planos
- `lib/stripe/subscription.ts` - Gerenciamento de subscriptions
- `app/api/stripe/checkout/route.ts` - Criar checkout session
- `app/api/stripe/portal/route.ts` - Customer portal
- `app/api/webhooks/stripe/route.ts` - Processar webhooks

### Frontend
- `hooks/usePlanFeatures.ts` - Hook para feature gating
- `app/dashboard/configuracoes/billing/page.tsx` - Dashboard de billing
- `app/dashboard/configuracoes/billing/pricing-cards.tsx` - Cards de precos
- `app/dashboard/configuracoes/billing/billing-actions.tsx` - Acoes de billing

### Database
- `supabase/migrations/20251209000002_create_billing_tables.sql`
  - Tabela `billing_customers`
  - Tabela `subscriptions`
  - Tabela `payment_history`
  - RLS policies

## Seguranca

- **NUNCA** exponha `STRIPE_SECRET_KEY` no cliente
- Use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` apenas para o frontend
- Sempre valide webhook signatures
- Implemente idempotency para webhooks (ja implementado)

## Troubleshooting

### Webhook nao esta funcionando
1. Verifique se a URL esta acessivel publicamente
2. Confirme o webhook secret
3. Verifique os logs em Stripe Dashboard > Webhooks > Events

### Checkout nao redireciona
1. Verifique se `NEXT_PUBLIC_APP_URL` esta correto
2. Confirme que os Price IDs existem
3. Verifique logs do servidor

### Subscription nao atualiza
1. Confirme que o webhook esta configurado
2. Verifique se `organization_id` esta nos metadados
3. Cheque logs da tabela `stripe_webhook_events`
