# Configuração DNS - Resend (mail.psicomapa.cloud)

## Provedor DNS Identificado: Hostinger
Link direto: https://hpanel.hostinger.com/domain/mail.psicomapa.cloud/dns

---

## Registros Necessários

### 1. DKIM (Domain Verification)

| Campo | Valor |
|-------|-------|
| **Type** | TXT |
| **Name** | `resend._domainkey.mail` |
| **Content** | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0E6PzU+GeiQ1Klu/bIit/4zPx/FXiKru2VU3z9iYx7ui9ZXLgmrzaiUN8aQUFQD4JdT8Hr5/BR6WTMeI+t1ITb9egMYjHuS2bOu3wthy40Zu8quL6NGBeCe2LPVvrqm/42h4Nu7OhX2plNigvRlujEcDlw0VoUeqV2OfXkAA8AQIDAQAB` |
| **TTL** | Auto |

---

### 2. SPF - MX Record (Enable Sending)

| Campo | Valor |
|-------|-------|
| **Type** | MX |
| **Name** | `send.mail` |
| **Content** | `feedback-smtp.sa-east-1.amazonses.com` |
| **TTL** | 3600 |
| **Priority** | 10 |

---

### 3. SPF - TXT Record (Enable Sending)

| Campo | Valor |
|-------|-------|
| **Type** | TXT |
| **Name** | `send.mail` |
| **Content** | `v=spf1 include:amazonses.com ~all` |
| **TTL** | 3600 |

---

### 4. DMARC (Opcional, mas recomendado)

| Campo | Valor |
|-------|-------|
| **Type** | TXT |
| **Name** | `_dmarc` |
| **Content** | `v=DMARC1; p=none;` |
| **TTL** | Auto |

---

## Passos para Configurar na Hostinger

1. Acesse: https://hpanel.hostinger.com/domain/mail.psicomapa.cloud/dns
2. Clique em "Gerenciar" ou "Manage DNS"
3. Adicione cada registro acima
4. Aguarde a propagação (pode levar até 48h, mas geralmente 15-30 min)
5. Volte ao Resend e clique em "Verify DNS Records"

---

## Verificação

Após adicionar os registros, execute:
```bash
node scripts/test-resend-email.mjs
```

Se o e-mail for enviado com sucesso, a configuração está completa.

---

## Credenciais Resend

| Campo | Valor |
|-------|-------|
| **Conta** | ***REMOVED_EMAIL*** |
| **API Key** | `re_ioFx1gJf_FSxuB8Y78SJa76ZkVJD1WpUo` |
| **Domínio** | mail.psicomapa.cloud |
| **Região** | São Paulo (sa-east-1) |
| **From Email** | noreply@mail.psicomapa.cloud |

---

## Workflows n8n Atualizados

- ✅ Sollar - Disparo Emails Participantes (ID: DJYJxu2Oe4LbOULs)
- ✅ Sollar - Convite Membros Plataforma (ID: qGpyYgJQpjwRTk31)

Ambos configurados para usar Resend API via HTTP Request.
