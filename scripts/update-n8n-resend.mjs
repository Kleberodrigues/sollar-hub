/**
 * Script para atualizar workflows n8n para usar Resend API
 *
 * Substitui o nó Gmail pelo nó HTTP Request com Resend API
 */

const N8N_API_URL = 'https://sollar-n8n.7wxwzr.easypanel.host/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NmIzOTJhNC0yYzA4LTRhZDEtYmZjOS1jOWViODU4YjkwNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1NDgyMTU1fQ.vu_dpD-6UdjYgW4enAkB--ep7PPLBkPX0A6c1qix7ZQ';

// Resend API Key
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_ioFx1gJf_FSxuB8Y78SJa76ZkVJD1WpUo';

// Workflows IDs
const WORKFLOW_PARTICIPANTES_ID = 'DJYJxu2Oe4LbOULs';

// Template HTML para convite de pesquisa (participantes)
const participantEmailHTML = `<!DOCTYPE html>
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
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Pesquisa de Riscos Psicossociais</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá, <strong>{{ $json.name }}</strong>! Tudo bem?
              </p>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Você está recebendo o convite para participar da <strong>Pesquisa de Riscos Psicossociais</strong> da <strong>{{ $('Extrair Dados').first().json.organization_name || "sua empresa" }}</strong>.
              </p>
              <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Sua participação é muito importante para entendermos como está o dia a dia de trabalho e definirmos ações de melhoria.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px; border-left: 4px solid #7C9A2E;">
                    <h3 style="margin: 0 0 12px 0; color: #7C9A2E; font-size: 16px; font-weight: 600;">🔒 Anonimato e LGPD</h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                      <li>A pesquisa é <strong>anônima</strong>: suas respostas não serão associadas ao seu nome.</li>
                      <li>Os resultados serão analisados de forma agrupada e não serão divulgadas respostas individuais.</li>
                      <li>O tratamento segue as boas práticas da <strong>LGPD</strong>.</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: #333333; font-size: 16px; font-weight: 600;">📝 Como responder</h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                      <li>Acesse o link abaixo</li>
                      <li>⏱️ Tempo estimado: <strong>15 minutos</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="{{ $('Extrair Dados').first().json.public_url }}" target="_blank" style="display: inline-block; background-color: #7C9A2E; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">Responder Pesquisa</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 12px; text-align: center; word-break: break-all;">
                Ou copie e cole: <a href="{{ $('Extrair Dados').first().json.public_url }}" style="color: #7C9A2E;">{{ $('Extrair Dados').first().json.public_url }}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #E0E5D8; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Se tiver qualquer dúvida, procure sua área de RH.
              </p>
              <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 500;">
                Agradecemos pela sua participação!
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
  // Keep only the fields that can be updated
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

async function updateParticipantsWorkflow() {
  console.log('🔄 Fetching participants workflow...');
  const workflow = await getWorkflow(WORKFLOW_PARTICIPANTES_ID);
  console.log(`✅ Found workflow: ${workflow.name}`);

  // Find the Gmail email node
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
            value: "=Sua participação é importante: {{ $('Extrair Dados').first().json.assessment_title }}"
          },
          {
            name: 'html',
            value: `=${participantEmailHTML}`
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
  const updated = await updateWorkflow(WORKFLOW_PARTICIPANTES_ID, workflow);
  console.log(`✅ Workflow updated: ${updated.name}`);

  return updated;
}

async function listWorkflows() {
  const response = await fetch(`${N8N_API_URL}/workflows`, {
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to list workflows: ${response.status}`);
  }

  return response.json();
}

async function main() {
  console.log('📋 Listing all workflows...\n');
  const workflows = await listWorkflows();

  for (const wf of workflows.data) {
    console.log(`  - ${wf.name} (ID: ${wf.id}) [${wf.active ? '✅ Active' : '❌ Inactive'}]`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  console.log('🚀 Updating workflows to use Resend API...\n');
  await updateParticipantsWorkflow();
  console.log('\n✅ All workflows updated!');
  console.log('\n📋 From email: noreply@mail.psicomapa.cloud');
  console.log('📨 API: Resend (São Paulo region)');
  console.log('\n⚠️  NOTA: Configure os registros DNS no seu provedor para verificar o domínio mail.psicomapa.cloud');
}

main().catch(console.error);
