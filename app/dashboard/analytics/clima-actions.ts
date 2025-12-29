"use server";

import { createClient } from "@/lib/supabase/server";

// IDs das perguntas do Clima (definidos na migration)
// Prefixado com _ para indicar que é referência de documentação
const _CLIMA_QUESTION_IDS = [
  'c1111111-0001-4000-8000-000000000001', // Q1 - Bem-estar
  'c1111111-0002-4000-8000-000000000002', // Q2 - Carga trabalho
  'c1111111-0003-4000-8000-000000000003', // Q3 - Carga trabalho
  'c1111111-0004-4000-8000-000000000004', // Q4 - Liderança
  'c1111111-0005-4000-8000-000000000005', // Q5 - Liderança
  'c1111111-0006-4000-8000-000000000006', // Q6 - Liderança
  'c1111111-0007-4000-8000-000000000007', // Q7 - Clima
  'c1111111-0008-4000-8000-000000000008', // Q8 - Clima
  'c1111111-0009-4000-8000-000000000009', // Q9 - Satisfação NPS
  'c1111111-0010-4000-8000-000000000010', // Q10 - Texto aberto
];

// Mapeamento de perguntas para temas
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

// Tipos
export interface ClimaQuestionData {
  questionId: string;
  questionNumber: number;
  questionText: string;
  theme: string;
  themeLabel: string;
  averageScore: number;
  responseCount: number;
  distribution: { value: string; count: number; percentage: number }[];
  scale: '1-5' | '0-10' | 'text';
}

export interface ClimaThemeData {
  theme: string;
  label: string;
  averageScore: number;
  questionCount: number;
  responseCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ClimaAnalytics {
  totalParticipants: number;
  questions: ClimaQuestionData[];
  themes: ClimaThemeData[];
  textResponses: { text: string; theme?: string }[];
  overallSatisfaction: number; // Q9 average (0-10)
}

/**
 * Busca analytics específicos para Pesquisa de Clima
 */
export async function getClimaAnalytics(assessmentId: string): Promise<ClimaAnalytics | null> {
  const supabase = await createClient();

  try {
    // 1. Buscar todas as respostas para este assessment
    const { data: responses, error: responsesError } = await supabase
      .from("responses")
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
      .eq("assessment_id", assessmentId);

    if (responsesError) {
      console.error('[Clima] Error fetching responses:', responsesError);
      return null;
    }

    if (!responses || responses.length === 0) {
      return {
        totalParticipants: 0,
        questions: [],
        themes: [],
        textResponses: [],
        overallSatisfaction: 0,
      };
    }

    // Type assertion for responses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedResponses = responses as any[];

    // 2. Calcular participantes únicos
    const uniqueParticipants = new Set(typedResponses.map(r => r.anonymous_id)).size;

    // 3. Agrupar respostas por pergunta
    const questionResponses = new Map<string, {
      questionId: string;
      questionText: string;
      questionType: string;
      orderIndex: number;
      minValue: number;
      maxValue: number;
      values: string[];
    }>();

    typedResponses.forEach((r) => {
      const question = Array.isArray(r.questions) ? r.questions[0] : r.questions;
      if (!question) return;

      const questionId = r.question_id;
      if (!questionResponses.has(questionId)) {
        questionResponses.set(questionId, {
          questionId,
          questionText: question.text || '',
          questionType: question.type || 'text',
          orderIndex: question.order_index || 0,
          minValue: question.min_value || 1,
          maxValue: question.max_value || 5,
          values: [],
        });
      }

      if (r.response_text && r.response_text.trim() !== '') {
        questionResponses.get(questionId)!.values.push(r.response_text);
      }
    });

    // 4. Calcular métricas por pergunta
    const questions: ClimaQuestionData[] = [];
    const textResponses: { text: string; theme?: string }[] = [];

    questionResponses.forEach((data, questionId) => {
      const themeInfo = QUESTION_THEMES[questionId] || { theme: 'outros', label: 'Outros' };
      const questionNumber = data.orderIndex;

      // Determinar escala
      let scale: '1-5' | '0-10' | 'text' = '1-5';
      if (data.questionType === 'text' || data.questionType === 'long_text') {
        scale = 'text';
      } else if (data.maxValue === 10) {
        scale = '0-10';
      }

      // Calcular distribuição e média
      const valueCounts: Record<string, number> = {};
      let sum = 0;
      let numericCount = 0;

      data.values.forEach(val => {
        valueCounts[val] = (valueCounts[val] || 0) + 1;

        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
          sum += numVal;
          numericCount++;
        }
      });

      const totalResponses = data.values.length;
      const averageScore = numericCount > 0 ? sum / numericCount : 0;

      // Distribuição
      const distribution = Object.entries(valueCounts)
        .map(([value, count]) => ({
          value,
          count,
          percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
        }))
        .sort((a, b) => {
          // Ordenar por valor numérico se possível
          const numA = parseFloat(a.value);
          const numB = parseFloat(b.value);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.value.localeCompare(b.value);
        });

      // Se for texto, adicionar às respostas de texto
      if (scale === 'text') {
        data.values.forEach(text => {
          textResponses.push({ text, theme: themeInfo.label });
        });
      }

      questions.push({
        questionId,
        questionNumber,
        questionText: data.questionText,
        theme: themeInfo.theme,
        themeLabel: themeInfo.label,
        averageScore: Math.round(averageScore * 100) / 100,
        responseCount: totalResponses,
        distribution,
        scale,
      });
    });

    // Ordenar por número da pergunta
    questions.sort((a, b) => a.questionNumber - b.questionNumber);

    // 5. Calcular métricas por tema
    const themeAggregates = new Map<string, {
      label: string;
      scores: number[];
      questionCount: number;
      responseCount: number;
    }>();

    questions.forEach(q => {
      if (q.scale === 'text') return; // Ignorar texto

      const theme = q.theme;
      if (!themeAggregates.has(theme)) {
        themeAggregates.set(theme, {
          label: q.themeLabel,
          scores: [],
          questionCount: 0,
          responseCount: 0,
        });
      }

      const agg = themeAggregates.get(theme)!;
      agg.questionCount++;
      agg.responseCount += q.responseCount;

      // Normalizar score para escala 1-5 se for NPS (0-10)
      if (q.scale === '0-10') {
        // Mapear 0-10 para 1-5: (score / 10) * 4 + 1
        const normalizedScore = (q.averageScore / 10) * 4 + 1;
        agg.scores.push(normalizedScore);
      } else {
        agg.scores.push(q.averageScore);
      }
    });

    const themes: ClimaThemeData[] = [];
    themeAggregates.forEach((agg, theme) => {
      const avgScore = agg.scores.length > 0
        ? agg.scores.reduce((a, b) => a + b, 0) / agg.scores.length
        : 0;

      // Determinar nível de risco (invertido: score alto = risco baixo)
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (avgScore < 2.5) {
        riskLevel = 'high';
      } else if (avgScore < 3.5) {
        riskLevel = 'medium';
      }

      themes.push({
        theme,
        label: agg.label,
        averageScore: Math.round(avgScore * 100) / 100,
        questionCount: agg.questionCount,
        responseCount: agg.responseCount,
        riskLevel,
      });
    });

    // 6. Satisfação geral (Q9)
    const q9 = questions.find(q => q.questionNumber === 9);
    const overallSatisfaction = q9?.averageScore || 0;

    return {
      totalParticipants: uniqueParticipants,
      questions,
      themes,
      textResponses,
      overallSatisfaction,
    };
  } catch (error) {
    console.error('[Clima] Unexpected error:', error);
    return null;
  }
}
