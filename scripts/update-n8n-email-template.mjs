/**
 * Script para atualizar o template de e-mail no n8n
 */

const N8N_API_URL = process.env.N8N_API_URL || 'https://sollar-n8n.7wxwzr.easypanel.host/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;
if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable is required');
  process.exit(1);
}
const WORKFLOW_ID = 'DJYJxu2Oe4LbOULs';

// Template HTML adaptado para n8n (usando expressões n8n ao invés de Handlebars)
const emailTemplateHTML = `<!DOCTYPE html>
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
                Você está recebendo o convite para participar da <strong>Pesquisa de Riscos Psicossociais</strong> da <strong>{{ $("Extrair Dados").first().json.organization_name || "sua empresa" }}</strong>.
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

async function getWorkflow() {
  const response = await fetch(`${N8N_API_URL}/workflows/${WORKFLOW_ID}`, {
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

async function updateWorkflow(workflow) {
  // Find the email node and update its message
  const emailNodeIndex = workflow.nodes.findIndex(n => n.name === 'Enviar Email');

  if (emailNodeIndex === -1) {
    throw new Error('Email node not found in workflow');
  }

  // Update the email template
  workflow.nodes[emailNodeIndex].parameters.message = `=${emailTemplateHTML}`;
  workflow.nodes[emailNodeIndex].parameters.subject = '=Sua participação é importante: {{ $("Extrair Dados").first().json.assessment_title }}';

  // Also add organization_name extraction if not present
  const extractNodeIndex = workflow.nodes.findIndex(n => n.name === 'Extrair Dados');
  if (extractNodeIndex !== -1) {
    const assignments = workflow.nodes[extractNodeIndex].parameters.assignments.assignments;
    const hasOrgName = assignments.some(a => a.name === 'organization_name');
    if (!hasOrgName) {
      assignments.push({
        id: 'set-org-name',
        name: 'organization_name',
        value: '={{ $json.body.data.organization_name || "sua empresa" }}',
        type: 'string'
      });
    }
  }

  // Keep only the fields that can be updated
  const updatePayload = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings,
    staticData: workflow.staticData
  };

  const response = await fetch(`${N8N_API_URL}/workflows/${WORKFLOW_ID}`, {
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

async function main() {
  console.log('🔄 Fetching workflow from n8n...');
  const workflow = await getWorkflow();
  console.log(`✅ Found workflow: ${workflow.name}`);

  console.log('📧 Updating email template...');
  const updated = await updateWorkflow(workflow);
  console.log(`✅ Workflow updated: ${updated.name}`);

  console.log('\n📋 New email subject: "Sua participação é importante: {{ assessment_title }}"');
  console.log('🎨 New design: PsicoMapa green (#7C9A2E)');
  console.log('🔒 Includes: Anonymity + LGPD sections');
}

main().catch(console.error);
