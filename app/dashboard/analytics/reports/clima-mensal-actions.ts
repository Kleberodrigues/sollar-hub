'use server';

/**
 * Clima Mensal Report Actions
 *
 * Gera relatório mensal de clima organizacional
 * Estrutura: 9 eixos + voz do colaborador (Q10)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type {
  ReportGenerationResult,
  ClimaMensalReport,
  AxisAnalysis,
  SegmentInfo,
  NLPTheme,
} from './types';
import { saveReport, checkAssessmentClosed } from './base-report-actions';
import { analyzeOpenResponses, generateClimateInsights } from './nlp-actions';

// ==========================================
// Configuração dos Eixos do Clima
// ==========================================

const CLIMA_AXES: Record<string, { name: string; description: string }> = {
  bem_estar: {
    name: 'Bem-estar',
    description: 'Percepção geral de bem-estar no trabalho',
  },
  carga_trabalho: {
    name: 'Carga de Trabalho',
    description: 'Equilíbrio entre demandas e capacidade',
  },
  lideranca: {
    name: 'Liderança',
    description: 'Qualidade da gestão e suporte da liderança',
  },
  clima: {
    name: 'Clima e Segurança',
    description: 'Ambiente de trabalho e segurança psicológica',
  },
  satisfacao: {
    name: 'Satisfação Geral',
    description: 'Nível de satisfação e recomendação (NPS)',
  },
};

// ==========================================
// Buscar Dados do Clima
// ==========================================

interface ClimaResponseData {
  questionId: string;
  questionText: string;
  theme: string;
  themeLabel: string;
  scale: '1-5' | '0-10' | 'text';
  averageScore: number;
  responseCount: number;
  trend?: 'up' | 'down' | 'stable';
}

async function getClimaData(assessmentId: string): Promise<{
  responses: ClimaResponseData[];
  textResponses: string[];
  totalParticipants: number;
  segments: SegmentInfo[];
} | null> {
  const supabase = await createClient();

  // Buscar respostas
  const { data: responses, error } = await (supabase
    .from('responses')
    .select(`
      id,
      question_id,
      response_text,
      anonymous_id,
      questions (
        id,
        text,
        type,
        category,
        order_index,
        min_value,
        max_value
      )
    `)
    .eq('assessment_id', assessmentId) as any);

  if (error || !responses) {
    console.error('[ClimaMensal] Error fetching responses:', error);
    return null;
  }

  if (responses.length === 0) {
    return {
      responses: [],
      textResponses: [],
      totalParticipants: 0,
      segments: [],
    };
  }

  // Participantes únicos
  const uniqueParticipants = new Set(responses.map((r: any) => r.anonymous_id)).size;

  // Mapeamento de temas
  const QUESTION_THEMES: Record<string, { theme: string; label: string }> = {
    'c1111111-0001-4000-8000-000000000001': { theme: 'bem_estar', label: 'Bem-estar' },
    'c1111111-0002-4000-8000-000000000002': { theme: 'carga_trabalho', label: 'Carga de Trabalho' },
    'c1111111-0003-4000-8000-000000000003': { theme: 'carga_trabalho', label: 'Carga de Trabalho' },
    'c1111111-0004-4000-8000-000000000004': { theme: 'lideranca', label: 'Liderança' },
    'c1111111-0005-4000-8000-000000000005': { theme: 'lideranca', label: 'Liderança' },
    'c1111111-0006-4000-8000-000000000006': { theme: 'lideranca', label: 'Liderança' },
    'c1111111-0007-4000-8000-000000000007': { theme: 'clima', label: 'Clima & Segurança' },
    'c1111111-0008-4000-8000-000000000008': { theme: 'clima', label: 'Clima & Segurança' },
    'c1111111-0009-4000-8000-000000000009': { theme: 'satisfacao', label: 'Satisfação (NPS)' },
    'c1111111-0010-4000-8000-000000000010': { theme: 'qualitativo', label: 'Feedback Aberto' },
  };

  // Agrupar por pergunta
  const questionData = new Map<string, {
    questionId: string;
    questionText: string;
    theme: string;
    themeLabel: string;
    orderIndex: number;
    maxValue: number;
    values: string[];
  }>();

  const textResponses: string[] = [];

  responses.forEach((r: any) => {
    const question = Array.isArray(r.questions) ? r.questions[0] : r.questions;
    if (!question) return;

    const questionId = r.question_id;
    const themeInfo = QUESTION_THEMES[questionId] || { theme: 'outros', label: 'Outros' };

    if (!questionData.has(questionId)) {
      questionData.set(questionId, {
        questionId,
        questionText: question.text || '',
        theme: themeInfo.theme,
        themeLabel: themeInfo.label,
        orderIndex: question.order_index || 0,
        maxValue: question.max_value || 5,
        values: [],
      });
    }

    if (r.response_text?.trim()) {
      const data = questionData.get(questionId)!;
      data.values.push(r.response_text.trim());

      // Coletar respostas de texto (Q10)
      if (question.type === 'text' || question.type === 'long_text') {
        textResponses.push(r.response_text.trim());
      }
    }
  });

  // Calcular métricas por pergunta
  const climaResponses: ClimaResponseData[] = [];

  questionData.forEach((data) => {
    const isText = data.theme === 'qualitativo';
    const scale: '1-5' | '0-10' | 'text' = isText ? 'text' : (data.maxValue === 10 ? '0-10' : '1-5');

    let averageScore = 0;
    if (!isText) {
      const numericValues = data.values
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));

      if (numericValues.length > 0) {
        averageScore = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      }
    }

    climaResponses.push({
      questionId: data.questionId,
      questionText: data.questionText,
      theme: data.theme,
      themeLabel: data.themeLabel,
      scale,
      averageScore: Math.round(averageScore * 100) / 100,
      responseCount: data.values.length,
    });
  });

  // Ordenar por ordem da pergunta
  climaResponses.sort((a, b) => {
    const orderA = Array.from(questionData.values()).find(q => q.questionId === a.questionId)?.orderIndex || 0;
    const orderB = Array.from(questionData.values()).find(q => q.questionId === b.questionId)?.orderIndex || 0;
    return orderA - orderB;
  });

  return {
    responses: climaResponses,
    textResponses,
    totalParticipants: uniqueParticipants,
    segments: [], // TODO: Implementar segmentação por departamento
  };
}

// ==========================================
// Gerar Narrativa por Eixo
// ==========================================

function generateAxisNarrative(
  axisName: string,
  score: number,
  scale: '1-5' | '0-10'
): string {
  // Normalizar para escala 0-100
  const normalizedScore = scale === '0-10'
    ? score * 10
    : ((score - 1) / 4) * 100;

  if (normalizedScore >= 80) {
    return `O eixo "${axisName}" apresenta resultados excelentes (${score.toFixed(1)}), indicando alta satisfação dos colaboradores nesta dimensão. A equipe demonstra percepção muito positiva, sendo um ponto forte a ser mantido e celebrado.`;
  } else if (normalizedScore >= 60) {
    return `O eixo "${axisName}" apresenta resultados satisfatórios (${score.toFixed(1)}). A maioria dos colaboradores tem percepção positiva, porém há espaço para melhorias pontuais que podem elevar ainda mais a satisfação.`;
  } else if (normalizedScore >= 40) {
    return `O eixo "${axisName}" apresenta resultados intermediários (${score.toFixed(1)}), sinalizando oportunidades de melhoria. Recomenda-se investigar os fatores que impactam negativamente esta dimensão e desenvolver ações corretivas.`;
  } else {
    return `O eixo "${axisName}" apresenta resultados que requerem atenção (${score.toFixed(1)}). Este é um ponto crítico que merece prioridade nas ações de melhoria, com investigação das causas raiz e intervenções direcionadas.`;
  }
}

// ==========================================
// Gerar Relatório Clima Mensal
// ==========================================

export async function generateClimaMensalReport(
  assessmentId: string
): Promise<ReportGenerationResult> {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }

    // Verificar encerramento
    const closureCheck = await checkAssessmentClosed(assessmentId);
    if (!closureCheck.canGenerateReport) {
      return {
        success: false,
        error: closureCheck.message || 'Assessment ainda não foi encerrado',
      };
    }

    // Buscar dados do assessment
    const { data: assessment } = await (supabase
      .from('assessments')
      .select(`
        id,
        title,
        start_date,
        end_date,
        organization_id,
        organizations (name)
      `)
      .eq('id', assessmentId)
      .single() as any);

    if (!assessment) {
      return { success: false, error: 'Assessment não encontrado' };
    }

    // Buscar dados do clima
    const climaData = await getClimaData(assessmentId);
    if (!climaData) {
      return { success: false, error: 'Erro ao buscar dados do clima' };
    }

    if (climaData.totalParticipants === 0) {
      return { success: false, error: 'INSUFFICIENT_DATA' };
    }

    // Calcular taxa de resposta (estimativa)
    const { count: participantCount } = await (supabase
      .from('assessment_participants')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', assessmentId) as any);

    const expectedParticipants = participantCount || climaData.totalParticipants;
    const responseRate = Math.round((climaData.totalParticipants / expectedParticipants) * 100);

    // Agrupar por eixo e calcular médias
    const axisScores = new Map<string, { scores: number[]; scale: '1-5' | '0-10'; questionText: string }>();

    climaData.responses.forEach(r => {
      if (r.scale === 'text') return;

      if (!axisScores.has(r.theme)) {
        axisScores.set(r.theme, { scores: [], scale: r.scale, questionText: r.questionText });
      }

      const data = axisScores.get(r.theme)!;
      data.scores.push(r.averageScore);
    });

    // Construir análise por eixo
    const axes: AxisAnalysis[] = [];
    let overallSum = 0;
    let overallCount = 0;

    axisScores.forEach((data, theme) => {
      const axisConfig = CLIMA_AXES[theme];
      if (!axisConfig) return;

      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;

      // Normalizar para escala 0-10 para comparação
      const normalizedScore = data.scale === '0-10' ? avgScore : ((avgScore - 1) / 4) * 10;
      overallSum += normalizedScore;
      overallCount++;

      axes.push({
        axisId: theme,
        axisName: axisConfig.name,
        questionText: data.questionText,
        average: Math.round(avgScore * 100) / 100,
        narrative: generateAxisNarrative(axisConfig.name, avgScore, data.scale),
      });
    });

    // Ordenar eixos por score (menor primeiro para priorização)
    axes.sort((a, b) => a.average - b.average);

    // Calcular números essenciais
    const overallAverage = overallCount > 0 ? overallSum / overallCount : 0;
    const sortedAxes = [...axes].sort((a, b) => b.average - a.average);
    const highestScore = sortedAxes[0] || { axis: 'N/A', score: 0 };
    const lowestScore = sortedAxes[sortedAxes.length - 1] || { axis: 'N/A', score: 0 };

    // Analisar voz do colaborador (Q10) com NLP
    let voiceOfEmployee: NLPTheme[] = [];
    if (climaData.textResponses.length > 0) {
      const nlpResult = await analyzeOpenResponses({
        assessmentId,
        questionId: 'c1111111-0010-4000-8000-000000000010',
        responses: climaData.textResponses,
      });
      voiceOfEmployee = nlpResult.themes;
    }

    // Gerar insights com IA
    const insightsData = await generateClimateInsights({
      axes: axes.map(a => ({ name: a.axisName, score: a.average })),
      themes: voiceOfEmployee,
    });

    // Construir relatório
    const report: ClimaMensalReport = {
      metadata: {
        type: 'clima_mensal',
        title: `Relatório Mensal de Clima - ${assessment.title}`,
        organizationName: assessment.organizations?.name || 'Organização',
        assessmentTitle: assessment.title,
        period: {
          start: assessment.start_date,
          end: assessment.end_date,
        },
        participants: climaData.totalParticipants,
        responseRate,
        segmentation: climaData.segments,
        generatedAt: new Date().toISOString(),
        aiModel: 'gpt-4.1-mini-2025-04-14',
      },
      opening: {
        n: climaData.totalParticipants,
        responseRate,
        segments: climaData.segments,
      },
      axes,
      essentialNumbers: {
        overallAverage: Math.round(overallAverage * 10) / 10,
        highestScore: {
          axis: highestScore.axisName,
          score: highestScore.average,
        },
        lowestScore: {
          axis: lowestScore.axisName,
          score: lowestScore.average,
        },
      },
      voiceOfEmployee,
      insights: insightsData,
    };

    // Salvar relatório
    const generationTimeMs = Date.now() - startTime;
    const reportId = await saveReport({
      assessmentId,
      organizationId: assessment.organization_id,
      reportType: 'clima_mensal',
      title: report.metadata.title,
      content: {
        metadata: report.metadata,
        sections: [
          { id: 'opening', title: 'Abertura', type: 'metrics', content: report.opening },
          { id: 'axes', title: 'Análise por Eixo', type: 'narrative', content: report.axes },
          { id: 'essential', title: 'Números Essenciais', type: 'metrics', content: report.essentialNumbers },
          { id: 'voice', title: 'Voz do Colaborador', type: 'themes', content: report.voiceOfEmployee },
          { id: 'insights', title: 'Insights', type: 'narrative', content: report.insights },
        ],
      },
      status: 'completed',
      aiModel: 'gpt-4.1-mini-2025-04-14',
      generationTimeMs,
    });

    return {
      success: true,
      reportId: reportId || undefined,
      content: {
        metadata: report.metadata,
        sections: [
          { id: 'opening', title: 'Abertura', type: 'metrics', content: report.opening },
          { id: 'axes', title: 'Análise por Eixo', type: 'narrative', content: report.axes },
          { id: 'essential', title: 'Números Essenciais', type: 'metrics', content: report.essentialNumbers },
          { id: 'voice', title: 'Voz do Colaborador', type: 'themes', content: report.voiceOfEmployee },
          { id: 'insights', title: 'Insights', type: 'narrative', content: report.insights },
        ],
      },
    };

  } catch (error) {
    console.error('[ClimaMensal] Error generating report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar relatório',
    };
  }
}
