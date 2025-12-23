/**
 * Script para atualizar workflow de membros no n8n para usar Resend API
 */

const N8N_API_URL = process.env.N8N_API_URL || 'https://sollar-n8n.7wxwzr.easypanel.host/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;
if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable is required');
  process.exit(1);
}

// Resend API Key - MUST be set via environment variable
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required');
  process.exit(1);
}

// Workflow de membros ID
const WORKFLOW_MEMBROS_ID = 'qGpyYgJQpjwRTk31';

// Template HTML para convite de membro da plataforma
const memberEmailHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F7F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F7F0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #7C9A2E; padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600;">🌿 PsicoMapa</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Gestão de Riscos Psicossociais</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá, <strong>{{ $json.name }}</strong>!
              </p>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Você foi convidado a acessar a <strong>PsicoMapa</strong>, nossa plataforma de acompanhamento de riscos psicossociais, para visualizar os resultados e indicadores da sua área na <strong>{{ $('Extrair Dados').first().json.organization_name }}</strong>.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: #7C9A2E; font-size: 16px; font-weight: 600;">🚀 Como criar seu acesso (leva 1 minuto):</h3>
                    <ol style="margin: 0; padding: 0 0 0 20px; color: #333333; font-size: 14px; line-height: 2;">
                      <li>Clique no botão abaixo para criar sua conta</li>
                      <li>Cadastre seu e-mail e defina uma senha</li>
                      <li>Após o login, você verá o painel da sua empresa</li>
                    </ol>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="{{ $('Extrair Dados').first().json.invite_url }}" target="_blank" style="display: inline-block; background-color: #7C9A2E; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">Criar Minha Conta</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 12px; text-align: center; word-break: break-all;">
                Ou copie e cole: <a href="{{ $('Extrair Dados').first().json.invite_url }}" style="color: #7C9A2E;">{{ $('Extrair Dados').first().json.invite_url }}</a>
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px; border-left: 4px solid #7C9A2E;">
                    <h3 style="margin: 0 0 12px 0; color: #7C9A2E; font-size: 16px; font-weight: 600;">🔐 Segurança e Confidencialidade (LGPD)</h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                      <li>Você verá apenas <strong>dados agregados</strong> da sua área (não há acesso a respostas individuais).</li>
                      <li>O acesso é controlado por permissões e segue boas práticas de segurança e <strong>LGPD</strong>.</li>
                      <li>Recomendamos não compartilhar prints/dados fora dos canais oficiais da empresa.</li>
                      <li>Tenha <strong>muito cuidado</strong> ao acessar essas informações, por se tratarem de tópicos sensíveis.</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #E0E5D8; margin: 30px 0;">
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Se tiver qualquer dificuldade para acessar, responda este e-mail.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F5F7F0; padding: 20px 40px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px;">
                Este e-mail foi enviado automaticamente pelo sistema PsicoMapa.<br>
                © 2024 Sollar Insight Hub. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

async function getWorkflow(workflowId) {
  const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}`, {
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get workflow: ${response.status}`);
  }

  return response.json();
}

async function updateWorkflow(workflowId, workflow) {
  const updatePayload = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings,
    staticData: workflow.staticData
  };

  const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update workflow: ${response.status} - ${text}`);
  }

  return response.json();
}

async function updateMembersWorkflow() {
  console.log('🔄 Fetching members workflow...');
  const workflow = await getWorkflow(WORKFLOW_MEMBROS_ID);
  console.log(`✅ Found workflow: ${workflow.name}`);

  // Find the email node
  const emailNodeIndex = workflow.nodes.findIndex(n => n.name === 'Enviar Email');

  if (emailNodeIndex === -1) {
    throw new Error('Email node not found in workflow');
  }

  // Get the position of the old node
  const oldPosition = workflow.nodes[emailNodeIndex].position;

  // Replace Gmail node with HTTP Request node for Resend API
  // Using no authentication and passing Authorization header directly
  workflow.nodes[emailNodeIndex] = {
    parameters: {
      method: 'POST',
      url: 'https://api.resend.com/emails',
      authentication: 'none',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          {
            name: 'Authorization',
            value: `Bearer ${RESEND_API_KEY}`
          },
          {
            name: 'Content-Type',
            value: 'application/json'
          }
        ]
      },
      sendBody: true,
      specifyBody: 'keypair',
      bodyParameters: {
        parameters: [
          {
            name: 'from',
            value: 'PsicoMapa <noreply@mail.psicomapa.cloud>'
          },
          {
            name: 'to',
            value: '={{ [$json.email] }}'
          },
          {
            name: 'subject',
            value: 'Você está sendo convidado para acessar a PsicoMapa'
          },
          {
            name: 'html',
            value: `=${memberEmailHTML}`
          }
        ]
      },
      options: {
        bodyContentType: 'json'
      }
    },
    id: 'send-resend-email',
    name: 'Enviar Email',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: oldPosition
  };

  console.log('📧 Updating workflow with Resend HTTP Request...');
  const updated = await updateWorkflow(WORKFLOW_MEMBROS_ID, workflow);
  console.log(`✅ Workflow updated: ${updated.name}`);

  return updated;
}

async function main() {
  console.log('🚀 Updating members workflow to use Resend API...\n');
  await updateMembersWorkflow();
  console.log('\n✅ Members workflow updated!');
  console.log('\n📋 From email: noreply@mail.psicomapa.cloud');
  console.log('📨 API: Resend (São Paulo region)');
}

main().catch(console.error);
