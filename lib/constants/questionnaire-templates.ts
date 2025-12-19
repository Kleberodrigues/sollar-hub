/**
 * IDs dos questionários padrão NR-1/NR-17 (templates globais)
 *
 * Estes questionários são templates baseados nas normas regulamentadoras:
 * - NR-1: Disposições Gerais e Gerenciamento de Riscos Ocupacionais
 * - NR-17: Ergonomia
 *
 * São visíveis para todas as organizações e não devem ser editados.
 * Questionários com is_locked=true são protegidos no banco de dados via triggers.
 */

export const QUESTIONNAIRE_TEMPLATE_IDS = {
  SOLLAR_PSICOSSOCIAL: 'a1111111-1111-1111-1111-111111111111',
  PULSE_MENSAL: 'b2222222-2222-2222-2222-222222222222',
} as const;

export const TEMPLATE_IDS_ARRAY = Object.values(QUESTIONNAIRE_TEMPLATE_IDS);

/**
 * Informações sobre templates protegidos por regulamentação
 */
export const LOCKED_QUESTIONNAIRE_INFO = {
  [QUESTIONNAIRE_TEMPLATE_IDS.SOLLAR_PSICOSSOCIAL]: {
    name: 'Diagnóstico de Riscos Psicossociais',
    regulation: 'Portaria NR-1',
    description: 'Segue a metodologia da Norma Regulamentadora NR-1 para avaliação de riscos psicossociais no ambiente de trabalho.',
  },
  [QUESTIONNAIRE_TEMPLATE_IDS.PULSE_MENSAL]: {
    name: 'Pulse Mensal',
    regulation: 'Portaria NR-1',
    description: 'Questionário de acompanhamento mensal baseado na NR-1.',
  },
} as const;

/**
 * Verifica se um questionário é um template global (verificação por ID)
 */
export function isTemplateQuestionnaire(questionnaireId: string): boolean {
  return TEMPLATE_IDS_ARRAY.includes(questionnaireId as typeof TEMPLATE_IDS_ARRAY[number]);
}

/**
 * Obtém informações de regulamentação de um questionário protegido
 */
export function getLockedQuestionnaireInfo(questionnaireId: string) {
  return LOCKED_QUESTIONNAIRE_INFO[questionnaireId as keyof typeof LOCKED_QUESTIONNAIRE_INFO] || null;
}

/**
 * Mensagens de erro para questionários protegidos
 */
export const LOCKED_QUESTIONNAIRE_MESSAGES = {
  cannotEdit: 'Este questionário é protegido pela Portaria NR-1 e não pode ser editado.',
  cannotDelete: 'Este questionário é protegido pela Portaria NR-1 e não pode ser excluído.',
  cannotAddQuestions: 'Não é possível adicionar perguntas a um questionário protegido.',
  cannotModifyQuestions: 'As perguntas deste questionário são protegidas e não podem ser modificadas.',
} as const;
