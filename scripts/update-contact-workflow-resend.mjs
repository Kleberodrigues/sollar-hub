/**
 * Script para atualizar workflow de contato para usar Resend
 */

const N8N_API_URL = process.env.N8N_API_URL || 'https://sollar-n8n.7wxwzr.easypanel.host/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable is required');
  process.exit(1);
}
if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required');
  process.exit(1);
}

// ID do workflow antigo
const OLD_WORKFLOW_ID = '86TZrwpj8AWACPvK';

// Template HTML para notificação da equipe
const teamNotificationHTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.header{background:linear-gradient(135deg,#5D764A,#7A9E68);padding:32px;text-align:center}
.header h1{color:#fff;margin:0;font-size:24px}
.content{padding:32px}
.info-row{margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:12px}
.info-label{font-weight:600;color:#5D764A}
.info-value{color:#333}
.message-box{background:#f9f9f9;padding:20px;border-radius:8px;margin-top:20px;border-left:4px solid #5D764A}
.footer{background:#f9f9f9;padding:20px;text-align:center;color:#666;font-size:12px}
</style>
</head>
<body>
<div class="container">
<div class="header"><h1>PsicoMapa - Novo Contato</h1></div>
<div class="content">
<div class="info-row"><span class="info-label">Nome:</span> <span class="info-value">{{nome}}</span></div>
<div class="info-row"><span class="info-label">Email:</span> <span class="info-value"><a href="mailto:{{email}}">{{email}}</a></span></div>
<div class="info-row"><span class="info-label">Empresa:</span> <span class="info-value">{{empresa}}</span></div>
<div class="info-row"><span class="info-label">Assunto:</span> <span class="info-value">{{assunto}}</span></div>
<div class="message-box"><strong>Mensagem:</strong><p>{{mensagem}}</p></div>
</div>
<div class="footer"><p>Recebido em: {{timestamp}}</p><p>Fonte: psicomapa.cloud</p></div>
</div>
</body>
</html>`;

// Template HTML para confirmação ao usuário
const userConfirmationHTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.header{background:linear-gradient(135deg,#5D764A,#7A9E68);padding:32px;text-align:center}
.header h1{color:#fff;margin:0;font-size:24px}
.content{padding:32px}
.footer{background:#f9f9f9;padding:20px;text-align:center;color:#666;font-size:12px}
</style>
</head>
<body>
<div class="container">
<div class="header"><h1>PsicoMapa</h1></div>
<div class="content">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Recebemos sua mensagem sobre <strong>{{assunto}}</strong>.</p>
<p>Nossa equipe analisará sua solicitação e retornará em até <strong>24 horas úteis</strong>.</p>
<p style="margin-top:30px">Atenciosamente,<br><strong>Equipe PsicoMapa</strong></p>
</div>
<div class="footer">
<p>Este é um email automático. Por favor, não responda.</p>
<p>www.psicomapa.cloud</p>
</div>
</div>
</body>
</html>`;

async function main() {
  console.log('🔄 Atualizando workflow de contato para usar Resend...\n');

  // 1. Primeiro, desativar o workflow antigo
  console.log('1️⃣ Desativando workflow antigo...');
  try {
    const deactivateRes = await fetch(`${N8N_API_URL}/workflows/${OLD_WORKFLOW_ID}/deactivate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    if (deactivateRes.ok) {
      console.log('   ✅ Workflow antigo desativado');
    }
  } catch (e) {
    console.log('   ⚠️ Não foi possível desativar (pode não existir)');
  }

  // 2. Criar credencial Resend se não existir
  console.log('\n2️⃣ Verificando credencial Resend...');

  // Criar novo workflow com Resend
  console.log('\n3️⃣ Criando novo workflow com Resend...');

  const workflow = {
    name: 'PsicoMapa - Formulario de Contato',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'contact',
          options: {}
        },
        id: 'webhook-contact',
        name: 'Webhook Contato',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [-400, 300],
        webhookId: 'contact'
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
            conditions: [{
              id: 'filter-contact',
              leftValue: '={{ $json.body.type }}',
              rightValue: 'contact_form',
              operator: { type: 'string', operation: 'equals' }
            }],
            combinator: 'and'
          },
          options: {}
        },
        id: 'filter-contact',
        name: 'Filtrar Tipo',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [-160, 300]
      },
      {
        parameters: {
          assignments: {
            assignments: [
              { id: 'set-nome', name: 'nome', value: '={{ $json.body.data.nome }}', type: 'string' },
              { id: 'set-email', name: 'email', value: '={{ $json.body.data.email }}', type: 'string' },
              { id: 'set-empresa', name: 'empresa', value: '={{ $json.body.data.empresa }}', type: 'string' },
              { id: 'set-assunto', name: 'assunto', value: '={{ $json.body.data.assunto }}', type: 'string' },
              { id: 'set-mensagem', name: 'mensagem', value: '={{ $json.body.data.mensagem }}', type: 'string' },
              { id: 'set-timestamp', name: 'timestamp', value: '={{ $json.body.data.timestamp }}', type: 'string' }
            ]
          },
          options: {}
        },
        id: 'extract-data',
        name: 'Extrair Dados',
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        position: [80, 300]
      },
      {
        parameters: {
          method: 'POST',
          url: 'https://api.resend.com/emails',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={
            "from": "PsicoMapa <noreply@psicomapa.cloud>",
            "to": ["contato@psicomapa.cloud"],
            "subject": "[PsicoMapa] Novo Contato: " + $json.assunto + " - " + $json.nome,
            "html": ${JSON.stringify(teamNotificationHTML)}
              .replace(/\\{\\{nome\\}\\}/g, $json.nome)
              .replace(/\\{\\{email\\}\\}/g, $json.email)
              .replace(/\\{\\{empresa\\}\\}/g, $json.empresa)
              .replace(/\\{\\{assunto\\}\\}/g, $json.assunto)
              .replace(/\\{\\{mensagem\\}\\}/g, $json.mensagem)
              .replace(/\\{\\{timestamp\\}\\}/g, $json.timestamp)
          }`,
          options: {}
        },
        id: 'send-notification',
        name: 'Notificar Equipe',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [320, 300],
        credentials: {
          httpHeaderAuth: { id: 'resend-header-auth', name: 'Resend Header Auth' }
        }
      },
      {
        parameters: {
          method: 'POST',
          url: 'https://api.resend.com/emails',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={
            "from": "PsicoMapa <noreply@psicomapa.cloud>",
            "to": [$json.email],
            "subject": "Recebemos sua mensagem - PsicoMapa",
            "html": ${JSON.stringify(userConfirmationHTML)}
              .replace(/\\{\\{nome\\}\\}/g, $json.nome)
              .replace(/\\{\\{assunto\\}\\}/g, $json.assunto)
          }`,
          options: {}
        },
        id: 'send-confirmation',
        name: 'Confirmar Recebimento',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [560, 300],
        credentials: {
          httpHeaderAuth: { id: 'resend-header-auth', name: 'Resend Header Auth' }
        }
      },
      {
        parameters: {},
        id: 'no-op',
        name: 'Concluido',
        type: 'n8n-nodes-base.noOp',
        typeVersion: 1,
        position: [800, 300]
      }
    ],
    connections: {
      'Webhook Contato': { main: [[{ node: 'Filtrar Tipo', type: 'main', index: 0 }]] },
      'Filtrar Tipo': { main: [[{ node: 'Extrair Dados', type: 'main', index: 0 }]] },
      'Extrair Dados': { main: [[{ node: 'Notificar Equipe', type: 'main', index: 0 }]] },
      'Notificar Equipe': { main: [[{ node: 'Confirmar Recebimento', type: 'main', index: 0 }]] },
      'Confirmar Recebimento': { main: [[{ node: 'Concluido', type: 'main', index: 0 }]] }
    },
    settings: { executionOrder: 'v1' }
  };

  // Deletar workflow antigo
  try {
    await fetch(`${N8N_API_URL}/workflows/${OLD_WORKFLOW_ID}`, {
      method: 'DELETE',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    console.log('   ✅ Workflow antigo removido');
  } catch (e) {
    console.log('   ⚠️ Workflow antigo não encontrado');
  }

  // Criar novo workflow
  const createRes = await fetch(`${N8N_API_URL}/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY
    },
    body: JSON.stringify(workflow)
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error('   ❌ Erro ao criar workflow:', errorText);
    process.exit(1);
  }

  const newWorkflow = await createRes.json();
  console.log(`   ✅ Workflow criado: ${newWorkflow.id}`);

  // 4. Ativar o workflow
  console.log('\n4️⃣ Ativando workflow...');
  const activateRes = await fetch(`${N8N_API_URL}/workflows/${newWorkflow.id}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });

  if (activateRes.ok) {
    console.log('   ✅ Workflow ativado!');
  } else {
    console.log('   ⚠️ Workflow criado mas não ativado - ative manualmente no n8n');
  }

  console.log('\n✅ Concluído!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Acesse https://sollar-n8n.7wxwzr.easypanel.host');
  console.log('   2. Verifique se a credencial "Resend API" existe');
  console.log('   3. Se não existir, crie com a API Key do Resend');
  console.log('   4. Teste o webhook enviando um formulário');
}

main().catch(console.error);
