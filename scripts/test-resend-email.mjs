/**
 * Script para testar envio de e-mail via Resend API diretamente
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_ioFx1gJf_FSxuB8Y78SJa76ZkVJD1WpUo';

async function sendTestEmail() {
  const emailData = {
    from: 'PsicoMapa <noreply@mail.psicomapa.cloud>',
    to: ['kleber@psicomapa.cloud'],
    subject: '✅ Teste de E-mail - PsicoMapa via Resend',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F5F7F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #7C9A2E; padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600;">🌿 PsicoMapa</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Teste de E-mail</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #7C9A2E; font-size: 20px;">✅ E-mail de Teste Enviado com Sucesso!</h2>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Este é um e-mail de teste enviado através da API do Resend.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: #333333; font-size: 16px; font-weight: 600;">📋 Detalhes:</h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                      <li><strong>API:</strong> Resend</li>
                      <li><strong>Domínio:</strong> mail.psicomapa.cloud</li>
                      <li><strong>Região:</strong> São Paulo (sa-east-1)</li>
                      <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #666666; font-size: 14px;">
                Se você recebeu este e-mail, a configuração está funcionando corretamente.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F5F7F0; padding: 20px 40px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © 2024 Sollar Insight Hub. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };

  console.log('📧 Enviando e-mail de teste via Resend API...');
  console.log(`   Para: ${emailData.to[0]}`);
  console.log(`   De: ${emailData.from}`);
  console.log(`   Assunto: ${emailData.subject}`);
  console.log('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  const result = await response.json();

  if (response.ok) {
    console.log('✅ E-mail enviado com sucesso!');
    console.log(`   ID: ${result.id}`);
  } else {
    console.log('❌ Erro ao enviar e-mail:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Mensagem: ${result.message || JSON.stringify(result)}`);

    if (result.message && result.message.includes('verify')) {
      console.log('');
      console.log('⚠️  O domínio mail.psicomapa.cloud precisa ser verificado primeiro.');
      console.log('');
      console.log('📋 Adicione os seguintes registros DNS no seu provedor:');
      console.log('');
      console.log('1. DKIM (TXT):');
      console.log('   Nome: resend._domainkey.mail');
      console.log('   Valor: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0E6PzU+...');
      console.log('');
      console.log('2. MX:');
      console.log('   Nome: send.mail');
      console.log('   Valor: feedback-smtp.sa-east-1.amazonses.com');
      console.log('   Prioridade: 10');
      console.log('');
      console.log('3. SPF (TXT):');
      console.log('   Nome: send.mail');
      console.log('   Valor: v=spf1 include:amazonses.com ~all');
    }
  }

  return result;
}

sendTestEmail().catch(console.error);
