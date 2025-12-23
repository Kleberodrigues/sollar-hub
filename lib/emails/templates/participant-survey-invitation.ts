/**
 * Template de E-mail: Convite para Pesquisa de Riscos Psicossociais
 *
 * Enviado para participantes convidados a responder a pesquisa
 */

import type { EmailTemplate, ParticipantInvitationData } from "../types";

/**
 * Cores do design system Sollar/PsicoMapa
 */
const COLORS = {
  primary: "#7C9A2E", // Verde oliva
  primaryDark: "#5A7220",
  background: "#F5F7F0",
  text: "#333333",
  textLight: "#666666",
  white: "#FFFFFF",
  border: "#E0E5D8",
};

/**
 * Gera o template de e-mail para convite de pesquisa
 */
export function generateParticipantInvitation(
  data: ParticipantInvitationData
): EmailTemplate {
  const subject = `Sua participação é importante: Responda a Pesquisa de Riscos Psicossociais`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${COLORS.background};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: ${COLORS.white}; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header com Logo -->
          <tr>
            <td style="background-color: ${COLORS.primary}; padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 24px; font-weight: 600;">
                🌿 PsicoMapa
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Pesquisa de Riscos Psicossociais
              </p>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
                Olá, <strong>${data.nome}</strong>! Tudo bem?
              </p>

              <p style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
                Você está recebendo o convite para participar da <strong>Pesquisa de Riscos Psicossociais</strong> da <strong>${data.empresa}</strong>.
              </p>

              <p style="margin: 0 0 30px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
                Sua participação é muito importante para entendermos como está o dia a dia de trabalho e definirmos ações de melhoria.
              </p>

              <!-- Box de Anonimato -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: ${COLORS.background}; padding: 20px; border-radius: 8px; border-left: 4px solid ${COLORS.primary};">
                    <h3 style="margin: 0 0 12px 0; color: ${COLORS.primary}; font-size: 16px; font-weight: 600;">
                      🔒 Anonimato e LGPD
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.8;">
                      <li>A pesquisa é <strong>anônima</strong>: suas respostas não serão associadas ao seu nome.</li>
                      <li>Os resultados serão analisados de forma agrupada (por equipes/áreas) e não serão divulgadas respostas individuais.</li>
                      <li>O tratamento das informações segue as boas práticas da <strong>LGPD</strong>, com acesso restrito e uso exclusivamente para fins de diagnóstico e melhoria do ambiente de trabalho.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Box Como Responder -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: ${COLORS.background}; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: ${COLORS.text}; font-size: 16px; font-weight: 600;">
                      📝 Como responder
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: ${COLORS.text}; font-size: 14px; line-height: 1.8;">
                      <li>Acesse o link abaixo</li>
                      ${data.codigo ? `<li>Insira o código de acesso: <strong>${data.codigo}</strong></li>` : ""}
                      <li>⏱️ Tempo estimado: <strong>15 minutos</strong></li>
                      <li>📅 Prazo para responder: <strong>${data.prazo}</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${data.linkPesquisa}" target="_blank" style="display: inline-block; background-color: ${COLORS.primary}; color: ${COLORS.white}; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(124, 154, 46, 0.3);">
                      Responder Pesquisa
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 0 0 20px 0; color: ${COLORS.textLight}; font-size: 12px; text-align: center; word-break: break-all;">
                Ou copie e cole este link no navegador:<br>
                <a href="${data.linkPesquisa}" style="color: ${COLORS.primary};">${data.linkPesquisa}</a>
              </p>

              <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 30px 0;">

              <p style="margin: 0 0 10px 0; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.6;">
                Se tiver qualquer dúvida sobre o processo, você pode procurar sua área de RH.
              </p>

              <p style="margin: 0; color: ${COLORS.text}; font-size: 16px; font-weight: 500;">
                Agradecemos pela sua participação!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.background}; padding: 20px 40px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: ${COLORS.textLight}; font-size: 12px;">
                Este e-mail foi enviado automaticamente pelo sistema PsicoMapa.<br>
                © ${new Date().getFullYear()} Sollar Insight Hub. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Olá, ${data.nome}! Tudo bem?

Você está recebendo o convite para participar da Pesquisa de Riscos Psicossociais da ${data.empresa}.

Sua participação é muito importante para entendermos como está o dia a dia de trabalho e definirmos ações de melhoria.

ANONIMATO E LGPD
- A pesquisa é anônima: suas respostas não serão associadas ao seu nome.
- Os resultados serão analisados de forma agrupada (por equipes/áreas) e não serão divulgadas respostas individuais.
- O tratamento das informações segue as boas práticas da LGPD, com acesso restrito e uso exclusivamente para fins de diagnóstico e melhoria do ambiente de trabalho.

COMO RESPONDER
- Acesse o link: ${data.linkPesquisa}
${data.codigo ? `- Insira o código de acesso: ${data.codigo}` : ""}
- Tempo estimado: 15 minutos
- Prazo para responder: ${data.prazo}

Se tiver qualquer dúvida sobre o processo, você pode procurar sua área de RH.

Agradecemos pela sua participação!

---
Este e-mail foi enviado automaticamente pelo sistema PsicoMapa.
© ${new Date().getFullYear()} Sollar Insight Hub. Todos os direitos reservados.
`;

  return { subject, html, text };
}

/**
 * Gera HTML estático com variáveis Handlebars para uso no n8n
 */
export function generateParticipantInvitationN8nTemplate(): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sua participação é importante: Responda a Pesquisa de Riscos Psicossociais</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F7F0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F7F0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header com Logo -->
          <tr>
            <td style="background-color: #7C9A2E; padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600;">
                🌿 PsicoMapa
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Pesquisa de Riscos Psicossociais
              </p>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá, <strong>{{nome}}</strong>! Tudo bem?
              </p>

              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Você está recebendo o convite para participar da <strong>Pesquisa de Riscos Psicossociais</strong> da <strong>{{empresa}}</strong>.
              </p>

              <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Sua participação é muito importante para entendermos como está o dia a dia de trabalho e definirmos ações de melhoria.
              </p>

              <!-- Box de Anonimato -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px; border-left: 4px solid #7C9A2E;">
                    <h3 style="margin: 0 0 12px 0; color: #7C9A2E; font-size: 16px; font-weight: 600;">
                      🔒 Anonimato e LGPD
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                      <li>A pesquisa é <strong>anônima</strong>: suas respostas não serão associadas ao seu nome.</li>
                      <li>Os resultados serão analisados de forma agrupada (por equipes/áreas) e não serão divulgadas respostas individuais.</li>
                      <li>O tratamento das informações segue as boas práticas da <strong>LGPD</strong>, com acesso restrito e uso exclusivamente para fins de diagnóstico e melhoria do ambiente de trabalho.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Box Como Responder -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: #333333; font-size: 16px; font-weight: 600;">
                      📝 Como responder
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                      <li>Acesse o link abaixo</li>
                      {{#if codigo}}<li>Insira o código de acesso: <strong>{{codigo}}</strong></li>{{/if}}
                      <li>⏱️ Tempo estimado: <strong>15 minutos</strong></li>
                      <li>📅 Prazo para responder: <strong>{{prazo}}</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="{{linkPesquisa}}" target="_blank" style="display: inline-block; background-color: #7C9A2E; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(124, 154, 46, 0.3);">
                      Responder Pesquisa
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 12px; text-align: center; word-break: break-all;">
                Ou copie e cole este link no navegador:<br>
                <a href="{{linkPesquisa}}" style="color: #7C9A2E;">{{linkPesquisa}}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #E0E5D8; margin: 30px 0;">

              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Se tiver qualquer dúvida sobre o processo, você pode procurar sua área de RH.
              </p>

              <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 500;">
                Agradecemos pela sua participação!
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
</html>
`;
}
