/**
 * Anonymity Thresholds - Protecao de Anonimato em Analytics
 *
 * Define limites minimos de respostas/funcionarios para exibir dados.
 * Isso previne que gestores identifiquem respondentes em grupos pequenos.
 */

export const ANONYMITY_THRESHOLDS = {
  /** Minimo de respostas para mostrar qualquer analise do assessment */
  ASSESSMENT_MINIMUM: 5,

  /** Minimo de respostas por categoria/bloco NR-1 */
  CATEGORY_MINIMUM: 5,

  /** Minimo de funcionarios no departamento para mostrar analise */
  DEPARTMENT_MINIMUM: 5,

  /** Minimo de respostas para mostrar distribuicao de uma pergunta */
  QUESTION_MINIMUM: 3,

  /** Minimo de respostas para habilitar tab de respostas detalhadas */
  DETAILED_RESPONSES: 10,
} as const;

export type AnonymityThresholdKey = keyof typeof ANONYMITY_THRESHOLDS;

/**
 * Mensagens padronizadas para dados suprimidos
 */
export const SUPPRESSION_MESSAGES = {
  insufficientResponses: 'Dados suprimidos para proteger o anonimato dos respondentes',
  departmentTooSmall: 'Departamento com poucos funcionarios para exibir analise',
  waitingMoreResponses: 'Aguardando mais respostas para exibir analise',
  categoryInsufficient: 'Categoria com respostas insuficientes',
  questionInsufficient: 'Pergunta com respostas insuficientes',
  detailedResponsesBlocked: 'Respostas detalhadas requerem mais participantes',
} as const;

/**
 * Verifica se a contagem atende ao threshold minimo
 */
export function meetsThreshold(
  count: number,
  thresholdKey: AnonymityThresholdKey
): boolean {
  return count >= ANONYMITY_THRESHOLDS[thresholdKey];
}

/**
 * Calcula quantas respostas faltam para atingir o threshold
 */
export function responsesNeeded(
  currentCount: number,
  thresholdKey: AnonymityThresholdKey
): number {
  const threshold = ANONYMITY_THRESHOLDS[thresholdKey];
  return Math.max(0, threshold - currentCount);
}

/**
 * Retorna informacoes formatadas sobre o status de supressao
 */
export function getSuppressionStatus(
  currentCount: number,
  thresholdKey: AnonymityThresholdKey
): {
  isSuppressed: boolean;
  currentCount: number;
  minimumRequired: number;
  remaining: number;
  percentComplete: number;
} {
  const threshold = ANONYMITY_THRESHOLDS[thresholdKey];
  const remaining = Math.max(0, threshold - currentCount);
  const percentComplete = Math.min(100, (currentCount / threshold) * 100);

  return {
    isSuppressed: currentCount < threshold,
    currentCount,
    minimumRequired: threshold,
    remaining,
    percentComplete,
  };
}
