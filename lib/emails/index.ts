/**
 * Email System - Main Exports
 *
 * Sistema de templates de e-mail para PsicoMapa
 *
 * @example
 * ```ts
 * import { generateParticipantInvitation, generateMemberInvitation } from '@/lib/emails';
 *
 * // Gerar e-mail de convite para pesquisa
 * const surveyEmail = generateParticipantInvitation({
 *   nome: 'João Silva',
 *   empresa: 'Empresa ABC',
 *   linkPesquisa: 'https://app.psicomapa.com/assess/abc123',
 *   codigo: 'XYZ789',
 *   prazo: '31/01/2025'
 * });
 *
 * // Gerar e-mail de convite para plataforma
 * const platformEmail = generateMemberInvitation({
 *   nome: 'Maria Santos',
 *   empresa: 'Empresa ABC',
 *   linkConvite: 'https://app.psicomapa.com/invite/abc123'
 * });
 *
 * // Usar o HTML gerado
 * console.log(surveyEmail.subject);
 * console.log(surveyEmail.html);
 * console.log(surveyEmail.text);
 * ```
 */

// Types
export type {
  EmailTemplate,
  ParticipantInvitationData,
  MemberInvitationData,
  EmailTemplateType,
  EmailTemplateMap,
} from "./types";

// Templates
export {
  generateParticipantInvitation,
  generateParticipantInvitationN8nTemplate,
  generateMemberInvitation,
  generateMemberInvitationN8nTemplate,
} from "./templates";
