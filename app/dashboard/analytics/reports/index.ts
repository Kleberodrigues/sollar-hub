/**
 * Reports Index
 *
 * Exports de todas as actions de relatórios
 */

// Types
export * from './types';

// Base utilities
export {
  checkAssessmentClosed,
  getAssessmentData,
  saveReport,
  getReportHistory,
  getReportById,
  getResponsesForAnalysis,
  getOpenResponses,
  calculateCategoryRiskScores,
  checkReportPermissions,
  type AssessmentClosureCheck,
  type GeneratedReport,
} from './base-report-actions';

// NLP utilities
export {
  analyzeOpenResponses,
  analyzeAllOpenQuestions,
  generateBlockNarrative,
  generateOrganizationalHypotheses,
  generateClimateInsights,
} from './nlp-actions';

// Report generators
export { generateRiscosPsicossociaisReport } from './riscos-psicossociais-actions';
export { generateClimaMensalReport } from './clima-mensal-actions';
export { generatePlanoAcaoReport } from './plano-acao-actions';
export { generateExecutivoLiderancaReport } from './executivo-lideranca-actions';
export { generateCorrelacaoReport } from './correlacao-actions';
