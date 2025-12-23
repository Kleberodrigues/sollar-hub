/**
 * Email Templates - Type Definitions
 *
 * Interfaces e tipos para os templates de e-mail do sistema
 */

/**
 * Estrutura base de um template de e-mail
 */
export interface EmailTemplate {
  /** Assunto do e-mail */
  subject: string;
  /** Conteúdo HTML do e-mail */
  html: string;
  /** Conteúdo texto puro (fallback) */
  text: string;
}

/**
 * Dados para o e-mail de convite de pesquisa (participantes)
 */
export interface ParticipantInvitationData {
  /** Nome do participante */
  nome: string;
  /** Nome da empresa */
  empresa: string;
  /** URL completa da pesquisa */
  linkPesquisa: string;
  /** Código de acesso (opcional) */
  codigo?: string;
  /** Data limite para resposta (formato: DD/MM/AAAA) */
  prazo: string;
}

/**
 * Dados para o e-mail de convite de plataforma (membros)
 */
export interface MemberInvitationData {
  /** Nome do usuário */
  nome: string;
  /** Nome da empresa */
  empresa: string;
  /** URL do convite para criar conta */
  linkConvite: string;
}

/**
 * Tipos de template disponíveis
 */
export type EmailTemplateType = "participant-survey" | "platform-member";

/**
 * Mapa de templates por tipo
 */
export interface EmailTemplateMap {
  "participant-survey": ParticipantInvitationData;
  "platform-member": MemberInvitationData;
}
