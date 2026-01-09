/**
 * Email service using Resend
 * Handles transactional emails for PsicoMapa
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// TODO: Verificar domínio psicomapa.cloud no Resend para usar noreply@psicomapa.cloud
const FROM_EMAIL = "PsicoMapa <onboarding@resend.dev>";
const REPLY_TO = "suporte@psicomapa.cloud";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping email send");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
      replyTo: REPLY_TO,
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent successfully to ${to}, id: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("[Email] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email after successful payment
 */
export async function sendWelcomeEmail({
  to,
  name,
  companyName,
  plan,
  passwordSetupUrl,
}: {
  to: string;
  name: string;
  companyName: string;
  plan: string;
  passwordSetupUrl: string;
}) {
  const planNames: Record<string, string> = {
    base: "Base",
    intermediario: "Intermediario",
    avancado: "Avancado",
  };

  const subject = `Bem-vindo ao PsicoMapa, ${name.split(" ")[0]}!`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao PsicoMapa</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F3EF;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #E8E4DC;">
              <div style="display: inline-block;">
                <span style="font-size: 28px; font-weight: bold; color: #5C6B4A;">Psico</span><span style="font-size: 28px; font-weight: bold; color: #C4704F;">Mapa</span>
                <span style="color: #C4704F; font-size: 20px;">&#9728;</span>
              </div>
              <p style="margin: 10px 0 0; color: #666; font-size: 14px;">Diagnostico NR-1</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Welcome Message -->
              <h1 style="margin: 0 0 20px; color: #5C6B4A; font-size: 24px; font-weight: 600;">
                Bem-vindo ao PsicoMapa!
              </h1>

              <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                Ola, <strong>${name}</strong>!
              </p>

              <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                Seu pagamento foi confirmado e sua conta para <strong>${companyName}</strong> esta pronta!
                Voce escolheu o plano <strong>${planNames[plan] || plan}</strong>.
              </p>

              <!-- Success Box -->
              <div style="background-color: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #2E7D32; font-size: 14px;">
                  <strong>&#10003; Pagamento confirmado</strong><br>
                  <strong>&#10003; Conta criada</strong><br>
                  <strong>&#10003; Plano ${planNames[plan] || plan} ativado</strong>
                </p>
              </div>

              <!-- CTA Button -->
              <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                <strong>Ultimo passo:</strong> Defina sua senha para acessar a plataforma:
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${passwordSetupUrl}"
                       style="display: inline-block; background-color: #5C6B4A; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Definir Minha Senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${passwordSetupUrl}" style="color: #5C6B4A; word-break: break-all;">${passwordSetupUrl}</a>
              </p>

              <!-- What's Next -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #E8E4DC;">
                <h2 style="margin: 0 0 15px; color: #5C6B4A; font-size: 18px; font-weight: 600;">
                  O que voce pode fazer no PsicoMapa:
                </h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #333; font-size: 14px; line-height: 2;">
                  <li>Criar avaliacoes de riscos psicossociais (NR-1)</li>
                  <li>Enviar questionarios para sua equipe</li>
                  <li>Acompanhar resultados em tempo real</li>
                  <li>Gerar relatorios completos</li>
                  <li>Criar planos de acao baseados em dados</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #F5F3EF; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-align: center;">
                Duvidas? Responda este email ou acesse nosso suporte.
              </p>
              <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                &copy; 2024 PsicoMapa - Diagnostico NR-1<br>
                Todos os direitos reservados.
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

  return sendEmail({ to, subject, html });
}
