/**
 * Script para criar workflow de convite de membros no n8n
 */

const N8N_API_URL = 'https://sollar-n8n.7wxwzr.easypanel.host/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NmIzOTJhNC0yYzA4LTRhZDEtYmZjOS1jOWViODU4YjkwNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1NDgyMTU1fQ.vu_dpD-6UdjYgW4enAkB--ep7PPLBkPX0A6c1qix7ZQ';

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
                Você foi convidado a acessar a <strong>PsicoMapa</strong>, nossa plataforma de acompanhamento de riscos psicossociais, para visualizar os resultados e indicadores da sua área na <strong>{{ $("Extrair Dados").first().json.organization_name }}</strong>.
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

const workflowDefinition = {
  name: 'Sollar - Convite Membros Plataforma',
  nodes: [
    {
      parameters: {
        httpMethod: 'POST',
        path: 'sollar-member-invite',
        options: {}
      },
      id: 'webhook-member-invite',
      name: 'Webhook Convite Membro',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [-400, 300],
      webhookId: 'sollar-member-invite'
    },
    {
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '',
            typeValidation: 'strict'
          },
          conditions: [
            {
              id: 'filter-event',
              leftValue: '={{ $json.body.event }}',
              rightValue: 'member.invited',
              operator: {
                type: 'string',
                operation: 'equals'
              }
            }
          ],
          combinator: 'and'
        },
        options: {}
      },
      id: 'filter-member-invite',
      name: 'Filtrar Evento',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [-160, 300]
    },
    {
      parameters: {
        assignments: {
          assignments: [
            {
              id: 'set-org-name',
              name: 'organization_name',
              value: '={{ $json.body.data.organization_name }}',
              type: 'string'
            },
            {
              id: 'set-invite-url',
              name: 'invite_url',
              value: '={{ $json.body.data.invite_url }}',
              type: 'string'
            },
            {
              id: 'set-members',
              name: 'members',
              value: '={{ $json.body.data.members }}',
              type: 'array'
            }
          ]
        },
        options: {}
      },
      id: 'extract-member-data',
      name: 'Extrair Dados',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [80, 300]
    },
    {
      parameters: {
        fieldToSplitOut: 'members',
        options: {}
      },
      id: 'split-members',
      name: 'Separar Membros',
      type: 'n8n-nodes-base.splitOut',
      typeVersion: 1,
      position: [320, 300]
    },
    {
      parameters: {
        sendTo: '={{ $json.email }}',
        subject: '=Você está sendo convidado para acessar a PsicoMapa',
        message: `=${memberEmailHTML}`,
        options: {}
      },
      id: 'send-member-email',
      name: 'Enviar Email',
      type: 'n8n-nodes-base.gmail',
      typeVersion: 2.2,
      position: [560, 300],
      credentials: {
        gmailOAuth2: {
          id: 'qUO4rhqI3RcVhau8',
          name: 'Gmail account'
        }
      }
    },
    {
      parameters: {},
      id: 'member-complete',
      name: 'Concluido',
      type: 'n8n-nodes-base.noOp',
      typeVersion: 1,
      position: [800, 300]
    }
  ],
  connections: {
    'Webhook Convite Membro': {
      main: [[{ node: 'Filtrar Evento', type: 'main', index: 0 }]]
    },
    'Filtrar Evento': {
      main: [[{ node: 'Extrair Dados', type: 'main', index: 0 }]]
    },
    'Extrair Dados': {
      main: [[{ node: 'Separar Membros', type: 'main', index: 0 }]]
    },
    'Separar Membros': {
      main: [[{ node: 'Enviar Email', type: 'main', index: 0 }]]
    },
    'Enviar Email': {
      main: [[{ node: 'Concluido', type: 'main', index: 0 }]]
    }
  },
  settings: {
    executionOrder: 'v1'
  }
};

async function createWorkflow() {
  const response = await fetch(`${N8N_API_URL}/workflows`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workflowDefinition)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create workflow: ${response.status} - ${text}`);
  }

  return response.json();
}

async function activateWorkflow(workflowId) {
  const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}/activate`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to activate workflow: ${response.status} - ${text}`);
  }

  return response.json();
}

async function main() {
  console.log('📧 Creating member invitation workflow...');
  const workflow = await createWorkflow();
  console.log(`✅ Workflow created: ${workflow.name} (ID: ${workflow.id})`);

  console.log('🔄 Activating workflow...');
  await activateWorkflow(workflow.id);
  console.log('✅ Workflow activated!');

  console.log('\n📋 Webhook URL: https://sollar-n8n.7wxwzr.easypanel.host/webhook/sollar-member-invite');
  console.log('📨 Event type: member.invited');
  console.log('🎨 Design: PsicoMapa green (#7C9A2E)');
}

main().catch(console.error);
