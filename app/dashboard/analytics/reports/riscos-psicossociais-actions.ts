'use server';

/**
 * Relatório de Riscos Psicossociais - Actions
 *
 * Geração do relatório trimestral baseado no COPSOQ II-BR (NR-1)
 * Inclui análise por bloco, NLP de respostas abertas e hipóteses organizacionais
 */

import {
  getAssessmentData,
  getResponsesForAnalysis,
  getOpenResponses,
  checkReportPermissions,
  saveReport,
  calculateCategoryRiskScores,
} from './base-report-actions';
import {
  analyzeOpenResponses,
  generateBlockNarrative,
  generateOrganizationalHypotheses,
} from './nlp-actions';
import type {
  RiscosPsicossociaisReport,
  BlockAnalysis,
  ViolenceBlockAnalysis,
  AnchorAnalysis,
  Recommendation,
  NLPTheme,
  QuestionAnalysis,
  ReportGenerationResult,
  RiskLevel,
} from './types';

// Mapeamento de categorias para blocos
const BLOCK_MAPPING: Record<
  string,
  { blockId: string; blockName: string; order: number }
> = {
  demands_and_pace: {
    blockId: '1',
    blockName: 'Bloco 1: Exigências e Ritmo de Trabalho',
    order: 1,
  },
  autonomy_clarity_change: {
    blockId: '2',
    blockName: 'Bloco 2: Autonomia, Clareza e Mudanças',
    order: 2,
  },
  leadership_recognition: {
    blockId: '3',
    blockName: 'Bloco 3: Liderança e Reconhecimento',
    order: 3,
  },
  relationships_communication: {
    blockId: '4',
    blockName: 'Bloco 4: Relações e Comunicação',
    order: 4,
  },
  work_life_health: {
    blockId: '5',
    blockName: 'Bloco 5: Equilíbrio Trabalho-Vida e Saúde',
    order: 5,
  },
  violence_harassment: {
    blockId: '6',
    blockName: 'Bloco 6: Violência e Assédio',
    order: 6,
  },
  anchors: {
    blockId: '7',
    blockName: 'Bloco 7: Âncoras (Indicadores de Efeito)',
    order: 7,
  },
};

// ==========================================
// Geração do Relatório Principal
// ==========================================

export async function generateRiscosPsicossociaisReport(
  assessmentId: string
): Promise<ReportGenerationResult> {
  const startTime = Date.now();

  // Verificar permissões
  const permissions = await checkReportPermissions(assessmentId);
  if (!permissions.allowed) {
    return { success: false, error: permissions.reason };
  }

  // Buscar dados do assessment
  const assessmentData = await getAssessmentData(assessmentId);
  if (!assessmentData) {
    return { success: false, error: 'Assessment não encontrado' };
  }

  // Verificar se é NR-1
  if (assessmentData.questionnaireType !== 'nr1') {
    return {
      success: false,
      error: 'Este relatório é específico para avaliações NR-1',
    };
  }

  // Verificar se há respostas suficientes para análise
  if (assessmentData.totalParticipants === 0) {
    return {
      success: false,
      error: 'INSUFFICIENT_DATA',
    };
  }

  // Verificar mínimo de participantes para anonimato
  if (assessmentData.totalParticipants < 3) {
    return {
      success: false,
      error: 'É necessário pelo menos 3 participantes para garantir anonimato',
    };
  }

  try {
    // 1. Calcular scores por categoria
    const categoryScores = await calculateCategoryRiskScores(assessmentId);

    // 2. Buscar todas as respostas para análise detalhada
    const allResponses = await getResponsesForAnalysis(assessmentId);

    // 3. Construir análise por bloco
    const blocks = await buildBlockAnalyses(assessmentId, categoryScores, allResponses);

    // 4. Análise especial do Bloco 6 (Violência)
    const violenceBlock = await buildViolenceBlockAnalysis(
      assessmentId,
      categoryScores,
      allResponses
    );

    // 5. Análise NLP das respostas abertas
    const nlpThemes = await analyzeAllOpenQuestions(assessmentId);

    // 6. Gerar hipóteses organizacionais
    const allBlocks = [...blocks, violenceBlock];
    const hypotheses = await generateOrganizationalHypotheses(allBlocks);

    // 7. Análise das âncoras (Bloco 7)
    const anchors = await buildAnchorAnalysis(assessmentId, allResponses);

    // 8. Gerar resumo executivo
    const executiveSummary = generateExecutiveSummary(
      assessmentData,
      allBlocks,
      anchors
    );

    // 9. Gerar visão sistêmica
    const systemicView = generateSystemicView(allBlocks, anchors);

    // 10. Gerar recomendações
    const recommendations = generateRecommendations(allBlocks);

    // Montar relatório completo
    const report: RiscosPsicossociaisReport = {
      metadata: {
        type: 'riscos_psicossociais',
        title: 'Relatório de Riscos Psicossociais',
        organizationName: assessmentData.organizationName,
        assessmentTitle: assessmentData.assessmentTitle,
        period: {
          start: assessmentData.startDate,
          end: assessmentData.endDate,
        },
        participants: assessmentData.totalParticipants,
        responseRate: assessmentData.responseRate,
        generatedAt: new Date().toISOString(),
        aiModel: 'gpt-4.1-mini-2025-04-14',
      },
      executiveSummary,
      introduction: COPSOQ_INTRODUCTION,
      blocks,
      violenceBlock,
      nlpThemes,
      organizationalHypotheses: hypotheses,
      anchors,
      systemicView,
      recommendations,
    };

    // Salvar relatório no banco
    const reportId = await saveReport({
      assessmentId,
      organizationId: assessmentData.organizationId,
      reportType: 'riscos_psicossociais',
      title: `Relatório Riscos Psicossociais - ${assessmentData.assessmentTitle}`,
      content: {
        metadata: report.metadata,
        sections: [
          { id: 'summary', title: 'Resumo Executivo', type: 'narrative', content: report.executiveSummary },
          { id: 'blocks', title: 'Análise por Bloco', type: 'metrics', content: report.blocks },
          { id: 'violence', title: 'Bloco 6', type: 'metrics', content: report.violenceBlock },
          { id: 'themes', title: 'Temas NLP', type: 'themes', content: report.nlpThemes },
          { id: 'hypotheses', title: 'Hipóteses', type: 'narrative', content: report.organizationalHypotheses },
          { id: 'anchors', title: 'Âncoras', type: 'metrics', content: report.anchors },
          { id: 'recommendations', title: 'Recomendações', type: 'action_items', content: report.recommendations },
        ],
      },
      status: 'completed',
      aiModel: 'gpt-4.1-mini-2025-04-14',
      generationTimeMs: Date.now() - startTime,
    });

    return {
      success: true,
      reportId: reportId || undefined,
      content: {
        metadata: report.metadata,
        sections: [],
      },
    };
  } catch (error) {
    console.error('[RiscosPsicossociais] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar relatório',
    };
  }
}

// ==========================================
// Funções Auxiliares
// ==========================================

async function buildBlockAnalyses(
  assessmentId: string,
  categoryScores: Awaited<ReturnType<typeof calculateCategoryRiskScores>>,
  allResponses: Awaited<ReturnType<typeof getResponsesForAnalysis>>
): Promise<BlockAnalysis[]> {
  const blocks: BlockAnalysis[] = [];

  for (const score of categoryScores) {
    const mapping = BLOCK_MAPPING[score.category];
    if (!mapping || score.category === 'violence_harassment' || score.category === 'anchors') {
      continue;
    }

    // Agrupar respostas por pergunta
    const categoryResponses = allResponses.filter(
      (r) => r.questionCategory === score.category && r.questionType === 'likert_scale'
    );

    const questionMap = new Map<
      string,
      { text: string; scores: number[]; inverted: boolean }
    >();

    for (const r of categoryResponses) {
      if (!questionMap.has(r.questionId)) {
        questionMap.set(r.questionId, {
          text: r.questionText,
          scores: [],
          inverted: r.riskInverted,
        });
      }
      const value = parseFloat(r.value || '0');
      if (!isNaN(value)) {
        questionMap.get(r.questionId)!.scores.push(value);
      }
    }

    // Construir análise de perguntas
    const questions: QuestionAnalysis[] = [];
    for (const [qId, qData] of questionMap.entries()) {
      const avg =
        qData.scores.length > 0
          ? qData.scores.reduce((a, b) => a + b, 0) / qData.scores.length
          : 0;

      // Ajustar score se invertido
      const adjustedAvg = qData.inverted ? 6 - avg : avg;

      questions.push({
        questionId: qId,
        questionText: qData.text,
        avgScore: Math.round(adjustedAvg * 100) / 100,
        responseCount: qData.scores.length,
        riskLevel: getRiskLevel(adjustedAvg),
        distribution: calculateDistribution(qData.scores),
      });
    }

    // Gerar narrativa
    const blockData: Partial<BlockAnalysis> = {
      blockId: mapping.blockId,
      blockName: mapping.blockName,
      blockCategory: score.category,
      averageScore: score.avgScore,
      riskLevel: score.riskLevel,
      questions,
      responseCount: score.responseCount,
    };

    const narrative = await generateBlockNarrative(blockData);

    blocks.push({
      ...blockData,
      narrative,
    } as BlockAnalysis);
  }

  return blocks.sort((a, b) => {
    const orderA = BLOCK_MAPPING[a.blockCategory]?.order || 99;
    const orderB = BLOCK_MAPPING[b.blockCategory]?.order || 99;
    return orderA - orderB;
  });
}

async function buildViolenceBlockAnalysis(
  assessmentId: string,
  categoryScores: Awaited<ReturnType<typeof calculateCategoryRiskScores>>,
  allResponses: Awaited<ReturnType<typeof getResponsesForAnalysis>>
): Promise<ViolenceBlockAnalysis> {
  const violenceScore = categoryScores.find(
    (s) => s.category === 'violence_harassment'
  );

  const violenceResponses = allResponses.filter(
    (r) => r.questionCategory === 'violence_harassment'
  );

  // Contar "Prefiro não responder"
  const preferNotToAnswer = violenceResponses.filter(
    (r) =>
      r.responseText?.toLowerCase().includes('prefiro não') ||
      r.value === '0' ||
      r.value === 'skip'
  ).length;

  const totalResponses = violenceResponses.length;
  const skipPercentage =
    totalResponses > 0 ? (preferNotToAnswer / totalResponses) * 100 : 0;

  // Construir análise de perguntas
  const questionMap = new Map<
    string,
    { text: string; scores: number[]; inverted: boolean }
  >();

  for (const r of violenceResponses.filter((r) => r.questionType === 'likert_scale')) {
    if (!questionMap.has(r.questionId)) {
      questionMap.set(r.questionId, {
        text: r.questionText,
        scores: [],
        inverted: r.riskInverted,
      });
    }
    const value = parseFloat(r.value || '0');
    if (!isNaN(value)) {
      questionMap.get(r.questionId)!.scores.push(value);
    }
  }

  const questions: QuestionAnalysis[] = [];
  for (const [qId, qData] of questionMap.entries()) {
    const avg =
      qData.scores.length > 0
        ? qData.scores.reduce((a, b) => a + b, 0) / qData.scores.length
        : 0;
    const adjustedAvg = qData.inverted ? 6 - avg : avg;

    questions.push({
      questionId: qId,
      questionText: qData.text,
      avgScore: Math.round(adjustedAvg * 100) / 100,
      responseCount: qData.scores.length,
      riskLevel: getRiskLevel(adjustedAvg),
      distribution: calculateDistribution(qData.scores),
    });
  }

  const blockData: Partial<BlockAnalysis> = {
    blockId: '6',
    blockName: 'Bloco 6: Violência e Assédio',
    blockCategory: 'violence_harassment',
    averageScore: violenceScore?.avgScore || 0,
    riskLevel: violenceScore?.riskLevel || 'low',
    questions,
    responseCount: violenceScore?.responseCount || 0,
  };

  const narrative = await generateBlockNarrative(blockData);

  return {
    ...blockData,
    narrative,
    preferNotToAnswer: {
      count: preferNotToAnswer,
      percentage: Math.round(skipPercentage * 100) / 100,
      alert: skipPercentage > 10, // Alerta se mais de 10% preferiram não responder
    },
  } as ViolenceBlockAnalysis;
}

async function buildAnchorAnalysis(
  assessmentId: string,
  allResponses: Awaited<ReturnType<typeof getResponsesForAnalysis>>
): Promise<AnchorAnalysis> {
  const anchorResponses = allResponses.filter(
    (r) => r.questionCategory === 'anchors'
  );

  // Análise NPS (0-10)
  const npsResponses = anchorResponses
    .filter((r) => r.questionText.toLowerCase().includes('recomendaria'))
    .map((r) => parseFloat(r.value || '0'))
    .filter((v) => !isNaN(v));

  const promoters = npsResponses.filter((v) => v >= 9).length;
  const passives = npsResponses.filter((v) => v >= 7 && v < 9).length;
  const detractors = npsResponses.filter((v) => v < 7).length;
  const npsScore =
    npsResponses.length > 0
      ? ((promoters - detractors) / npsResponses.length) * 100
      : 0;

  // Análise Satisfação (0-10)
  const satisfactionResponses = anchorResponses
    .filter((r) => r.questionText.toLowerCase().includes('satisfa'))
    .map((r) => parseFloat(r.value || '0'))
    .filter((v) => !isNaN(v));

  const satisfactionAvg =
    satisfactionResponses.length > 0
      ? satisfactionResponses.reduce((a, b) => a + b, 0) / satisfactionResponses.length
      : 0;

  // Análise Permanência
  const permanenceResponses = anchorResponses.filter(
    (r) =>
      r.questionText.toLowerCase().includes('continuar') ||
      r.questionText.toLowerCase().includes('permanecer')
  );

  const stay = permanenceResponses.filter(
    (r) => r.responseText?.toLowerCase().includes('sim') || r.value === '1'
  ).length;
  const leave = permanenceResponses.filter(
    (r) => r.responseText?.toLowerCase().includes('não') || r.value === '0'
  ).length;
  const undecided = permanenceResponses.length - stay - leave;

  const totalPermanence = permanenceResponses.length || 1;

  // Análise Saúde
  const healthResponses = anchorResponses.filter(
    (r) =>
      r.questionText.toLowerCase().includes('saúde') ||
      r.questionText.toLowerCase().includes('bem-estar')
  );

  const healthScores = healthResponses
    .map((r) => parseFloat(r.value || '0'))
    .filter((v) => !isNaN(v));

  const excellent = healthScores.filter((v) => v >= 9).length;
  const good = healthScores.filter((v) => v >= 7 && v < 9).length;
  const fair = healthScores.filter((v) => v >= 5 && v < 7).length;
  const poor = healthScores.filter((v) => v < 5).length;

  return {
    nps: {
      score: Math.round(npsScore),
      promoters,
      passives,
      detractors,
    },
    satisfaction: {
      average: Math.round(satisfactionAvg * 10) / 10,
      distribution: {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
      },
    },
    permanence: {
      stayPercentage: Math.round((stay / totalPermanence) * 100),
      leavePercentage: Math.round((leave / totalPermanence) * 100),
      undecidedPercentage: Math.round((undecided / totalPermanence) * 100),
    },
    health: {
      excellent,
      good,
      fair,
      poor,
    },
  };
}

async function analyzeAllOpenQuestions(
  assessmentId: string
): Promise<Record<string, NLPTheme[]>> {
  const openQuestions = await getOpenResponses(assessmentId);
  const results: Record<string, NLPTheme[]> = {};

  for (const q of openQuestions) {
    const analysis = await analyzeOpenResponses({
      assessmentId,
      questionId: q.questionId,
      responses: q.responses,
    });
    results[q.questionId] = analysis.themes;
  }

  return results;
}

function generateExecutiveSummary(
  assessmentData: Awaited<ReturnType<typeof getAssessmentData>>,
  blocks: BlockAnalysis[],
  anchors: AnchorAnalysis
): string {
  if (!assessmentData) return '';

  const highRiskBlocks = blocks.filter((b) => b.riskLevel === 'high');
  const mediumRiskBlocks = blocks.filter((b) => b.riskLevel === 'medium');

  let summary = `O assessment "${assessmentData.assessmentTitle}" da ${assessmentData.organizationName} contou com ${assessmentData.totalParticipants} participantes, alcançando taxa de resposta de ${assessmentData.responseRate}%.

`;

  if (highRiskBlocks.length > 0) {
    summary += `Foram identificadas ${highRiskBlocks.length} área(s) de alto risco que requerem atenção imediata: ${highRiskBlocks.map((b) => b.blockName.replace('Bloco ', '').split(':')[1]?.trim() || b.blockName).join(', ')}. `;
  } else {
    summary += 'Não foram identificadas áreas de alto risco. ';
  }

  if (mediumRiskBlocks.length > 0) {
    summary += `${mediumRiskBlocks.length} área(s) apresentam risco médio e merecem monitoramento. `;
  }

  summary += `

Os indicadores de efeito (Bloco 7) mostram NPS de ${anchors.nps.score}, satisfação média de ${anchors.satisfaction.average}/10, e ${anchors.permanence.stayPercentage}% dos colaboradores com intenção de permanência.`;

  return summary;
}

function generateSystemicView(
  blocks: BlockAnalysis[],
  anchors: AnchorAnalysis
): string {
  const highRisk = blocks.filter((b) => b.riskLevel === 'high');

  if (highRisk.length === 0) {
    return 'A análise sistêmica indica equilíbrio entre os fatores avaliados, com indicadores de efeito (satisfação, permanência, saúde) alinhados aos fatores de causa (blocos 1-6). Recomenda-se manter monitoramento contínuo.';
  }

  let view = 'A análise sistêmica revela interconexões importantes entre os blocos: ';

  if (highRisk.some((b) => b.blockCategory === 'demands_and_pace')) {
    view +=
      'A sobrecarga identificada no Bloco 1 pode estar impactando diretamente os indicadores de saúde e equilíbrio trabalho-vida. ';
  }

  if (highRisk.some((b) => b.blockCategory === 'leadership_recognition')) {
    view +=
      'Questões de liderança (Bloco 3) frequentemente correlacionam-se com intenção de permanência e satisfação geral. ';
  }

  if (anchors.nps.score < 0) {
    view +=
      'O NPS negativo sinaliza necessidade de investigação aprofundada sobre os fatores que afetam a recomendação. ';
  }

  return view;
}

function generateRecommendations(blocks: BlockAnalysis[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const highRisk = blocks.filter((b) => b.riskLevel === 'high');
  const mediumRisk = blocks.filter((b) => b.riskLevel === 'medium');

  for (const block of highRisk) {
    recommendations.push({
      category: block.blockName,
      priority: 'high',
      action: `Implementar medidas corretivas imediatas para ${block.blockName.split(':')[1]?.trim() || block.blockName}`,
      timeline: '30 dias',
      responsible: 'RH + Gestão',
      indicator: `Redução do score de risco em 20%`,
    });
  }

  for (const block of mediumRisk) {
    recommendations.push({
      category: block.blockName,
      priority: 'medium',
      action: `Desenvolver plano de melhoria para ${block.blockName.split(':')[1]?.trim() || block.blockName}`,
      timeline: '60 dias',
      responsible: 'RH',
      indicator: `Manutenção ou melhoria do score atual`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      category: 'Geral',
      priority: 'low',
      action: 'Manter monitoramento contínuo e práticas atuais',
      timeline: 'Contínuo',
      responsible: 'RH',
      indicator: 'Manutenção dos indicadores positivos',
    });
  }

  return recommendations;
}

function getRiskLevel(score: number): RiskLevel {
  if (score < 2.5) return 'high';
  if (score < 3.5) return 'medium';
  return 'low';
}

function calculateDistribution(scores: number[]): {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
} {
  const dist = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  for (const score of scores) {
    const rounded = Math.round(score);
    if (rounded >= 1 && rounded <= 5) {
      dist[rounded.toString() as keyof typeof dist]++;
    }
  }

  return dist;
}

// Texto de introdução sobre COPSOQ II-BR e NR-1
const COPSOQ_INTRODUCTION = `Este relatório apresenta os resultados da avaliação de riscos psicossociais realizada com base no COPSOQ II-BR (Copenhagen Psychosocial Questionnaire), instrumento validado para o contexto brasileiro e alinhado às exigências da NR-1 (Norma Regulamentadora nº 1) sobre gerenciamento de riscos ocupacionais.

A avaliação abrange sete dimensões fundamentais: Exigências e Ritmo de Trabalho, Autonomia e Clareza, Liderança e Reconhecimento, Relações e Comunicação, Equilíbrio Trabalho-Vida, Violência e Assédio, e Indicadores de Efeito (Âncoras).

A metodologia utiliza escala Likert de 5 pontos, onde scores mais baixos indicam maior risco. A interpretação segue os parâmetros: Score < 2.5 (Alto Risco), Score 2.5-3.4 (Risco Médio), Score ≥ 3.5 (Baixo Risco).`;
