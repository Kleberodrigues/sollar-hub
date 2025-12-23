/**
 * Template de E-mail: Convite para Acessar a Plataforma PsicoMapa
 *
 * Enviado para membros convidados a criar conta na plataforma
 */

import type { EmailTemplate, MemberInvitationData } from "../types";

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
 * Gera o template de e-mail para convite de plataforma
 */
export function generateMemberInvitation(
  data: MemberInvitationData
): EmailTemplate {
  const subject = `Você está sendo convidado para acessar a PsicoMapa`;

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
                Gestão de Riscos Psicossociais
              </p>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
                Olá, <strong>${data.nome}</strong>!
              </p>

              <p style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 16px; line-height: 1.6;">
                Você foi convidado a acessar a <strong>PsicoMapa</strong>, nossa plataforma de acompanhamento de riscos psicossociais, para visualizar os resultados e indicadores da sua área na <strong>${data.empresa}</strong>.
              </p>

              <!-- Box Como Criar Acesso -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: ${COLORS.background}; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: ${COLORS.primary}; font-size: 16px; font-weight: 600;">
                      🚀 Como criar seu acesso (leva 1 minuto):
                    </h3>
                    <ol style="margin: 0; padding: 0 0 0 20px; color: ${COLORS.text}; font-size: 14px; line-height: 2;">
                      <li>Clique no botão abaixo para criar sua conta</li>
                      <li>Cadastre seu e-mail e defina uma senha</li>
                      <li>Após o login, você verá o painel da sua empresa</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${data.linkConvite}" target="_blank" style="display: inline-block; background-color: ${COLORS.primary}; color: ${COLORS.white}; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(124, 154, 46, 0.3);">
                      Criar Minha Conta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 0 0 30px 0; color: ${COLORS.textLight}; font-size: 12px; text-align: center; word-break: break-all;">
                Ou copie e cole este link no navegador:<br>
                <a href="${data.linkConvite}" style="color: ${COLORS.primary};">${data.linkConvite}</a>
              </p>

              <!-- Box de Segurança -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: ${COLORS.background}; padding: 20px; border-radius: 8px; border-left: 4px solid ${COLORS.primary};">
                    <h3 style="margin: 0 0 12px 0; color: ${COLORS.primary}; font-size: 16px; font-weight: 600;">
                      🔐 Segurança e Confidencialidade (LGPD)
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.8;">
                      <li>Você verá apenas <strong>dados agregados</strong> da sua área (não há acesso a respostas individuais).</li>
                      <li>O acesso é controlado por permissões e segue boas práticas de segurança e <strong>LGPD</strong>.</li>
                      <li>Recomendamos não compartilhar prints/dados fora dos canais oficiais da empresa.</li>
                      <li>Tenha <strong>muito cuidado</strong> ao acessar essas informações, por se tratarem de tópicos sensíveis.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 30px 0;">

              <p style="margin: 0; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.6;">
                Se tiver qualquer dificuldade para acessar, responda este e-mail.
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
Olá, ${data.nome}!

Você foi convidado a acessar a PsicoMapa, nossa plataforma de acompanhamento de riscos psicossociais, para visualizar os resultados e indicadores da sua área na ${data.empresa}.

COMO CRIAR SEU ACESSO (LEVA 1 MINUTO):
1. Clique no link abaixo para criar sua conta: ${data.linkConvite}
2. Cadastre seu e-mail e defina uma senha
3. Após o login, você verá o painel da sua empresa

SEGURANÇA E CONFIDENCIALIDADE (LGPD):
- Você verá apenas dados agregados da sua área (não há acesso a respostas individuais).
- O acesso é controlado por permissões e segue boas práticas de segurança e LGPD.
- Recomendamos não compartilhar prints/dados fora dos canais oficiais da empresa.
- Recomendamos que você tenha muito cuidado ao acessar essas informações, por se tratarem de tópicos sensíveis.

Se tiver qualquer dificuldade para acessar, responda este e-mail.

---
Este e-mail foi enviado automaticamente pelo sistema PsicoMapa.
© ${new Date().getFullYear()} Sollar Insight Hub. Todos os direitos reservados.
`;

  return { subject, html, text };
}

/**
 * Gera HTML estático com variáveis Handlebars para uso no n8n
 */
export function generateMemberInvitationN8nTemplate(): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você está sendo convidado para acessar a PsicoMapa</title>
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
                Gestão de Riscos Psicossociais
              </p>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá, <strong>{{nome}}</strong>!
              </p>

              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Você foi convidado a acessar a <strong>PsicoMapa</strong>, nossa plataforma de acompanhamento de riscos psicossociais, para visualizar os resultados e indicadores da sua área na <strong>{{empresa}}</strong>.
              </p>

              <!-- Box Como Criar Acesso -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: #7C9A2E; font-size: 16px; font-weight: 600;">
                      🚀 Como criar seu acesso (leva 1 minuto):
                    </h3>
                    <ol style="margin: 0; padding: 0 0 0 20px; color: #333333; font-size: 14px; line-height: 2;">
                      <li>Clique no botão abaixo para criar sua conta</li>
                      <li>Cadastre seu e-mail e defina uma senha</li>
                      <li>Após o login, você verá o painel da sua empresa</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="{{linkConvite}}" target="_blank" style="display: inline-block; background-color: #7C9A2E; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(124, 154, 46, 0.3);">
                      Criar Minha Conta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 12px; text-align: center; word-break: break-all;">
                Ou copie e cole este link no navegador:<br>
                <a href="{{linkConvite}}" style="color: #7C9A2E;">{{linkConvite}}</a>
              </p>

              <!-- Box de Segurança -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #F5F7F0; padding: 20px; border-radius: 8px; border-left: 4px solid #7C9A2E;">
                    <h3 style="margin: 0 0 12px 0; color: #7C9A2E; font-size: 16px; font-weight: 600;">
                      🔐 Segurança e Confidencialidade (LGPD)
                    </h3>
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
