/**
 * Development API Route: Generate Sample Report
 *
 * POST /api/dev/generate-report
 * Body: { assessmentId: string, reportType: string }
 *
 * SECURITY: Only works in development or with admin secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Report types available
const REPORT_TYPES = [
  'riscos-psicossociais',
  'clima-mensal',
  'executivo-lideranca',
  'correlacao',
  'plano-acao',
] as const;

type ReportType = (typeof REPORT_TYPES)[number];

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret');
    const validSecret = querySecret === 'psicomapa-seed-2025';

    if (!validSecret && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assessmentId, reportType = 'riscos-psicossociais' } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId is required' },
        { status: 400 }
      );
    }

    if (!REPORT_TYPES.includes(reportType as ReportType)) {
      return NextResponse.json(
        { error: `Invalid reportType. Must be one of: ${REPORT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, title, questionnaire_id, organization_id, start_date, end_date')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: `Assessment not found: ${assessmentError?.message}` },
        { status: 404 }
      );
    }

    // 2. Get organization name
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', assessment.organization_id)
      .single();

    // 3. Get responses with questions
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select(`
        id,
        anonymous_id,
        question_id,
        value,
        response_text,
        questions (
          id,
          text,
          type,
          category,
          risk_inverted
        )
      `)
      .eq('assessment_id', assessmentId);

    if (responsesError) {
      return NextResponse.json(
        { error: `Failed to fetch responses: ${responsesError.message}` },
        { status: 500 }
      );
    }

    // 4. Process responses by category
    const categoryScores: Record<string, { scores: number[]; questions: Set<string> }> = {};
    const uniqueParticipants = new Set<string>();

    for (const r of responses || []) {
      const question = r.questions as {
        id: string;
        text: string;
        type: string;
        category: string;
        risk_inverted: boolean;
      } | null;

      if (!question) continue;
      if (question.type !== 'likert_scale') continue;

      const score = parseFloat(r.value || '0');
      if (isNaN(score)) continue;

      uniqueParticipants.add(r.anonymous_id);

      // Adjust score if inverted (higher score = lower risk)
      const adjustedScore = question.risk_inverted ? 6 - score : score;

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { scores: [], questions: new Set() };
      }

      categoryScores[question.category].scores.push(adjustedScore);
      categoryScores[question.category].questions.add(question.id);
    }

    // 5. Calculate category risk scores
    const categoryLabels: Record<string, string> = {
      demands_and_pace: 'Exigências e Ritmo de Trabalho',
      autonomy_clarity_change: 'Autonomia, Clareza e Mudanças',
      leadership_recognition: 'Liderança e Reconhecimento',
      relationships_communication: 'Relações e Comunicação',
      work_life_health: 'Equilíbrio Trabalho-Vida e Saúde',
      violence_harassment: 'Violência e Assédio',
      anchors: 'Âncoras (Indicadores de Efeito)',
    };

    const categoryResults = Object.entries(categoryScores).map(([category, data]) => {
      const avgScore =
        data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0;

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (avgScore < 2.5) {
        riskLevel = 'high';
      } else if (avgScore < 3.5) {
        riskLevel = 'medium';
      }

      return {
        category,
        categoryName: categoryLabels[category] || category,
        avgScore: Math.round(avgScore * 100) / 100,
        riskLevel,
        responseCount: data.scores.length,
        questionCount: data.questions.size,
      };
    });

    // 6. Calculate overall risk score
    const allScores = Object.values(categoryScores).flatMap((d) => d.scores);
    const overallAvg =
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0;

    let overallRiskLevel: 'low' | 'medium' | 'high' = 'low';
    if (overallAvg < 2.5) {
      overallRiskLevel = 'high';
    } else if (overallAvg < 3.5) {
      overallRiskLevel = 'medium';
    }

    // 7. Get open text responses
    const openResponses = (responses || [])
      .filter((r) => {
        const q = r.questions as { type: string } | null;
        return q?.type === 'open_text' && r.response_text?.trim();
      })
      .map((r) => ({
        questionId: r.question_id,
        text: r.response_text,
      }));

    // 8. Build report based on type
    const report = {
      metadata: {
        reportType,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        organizationName: org?.name || 'Organização',
        generatedAt: new Date().toISOString(),
        period: {
          start: assessment.start_date,
          end: assessment.end_date,
        },
        participants: uniqueParticipants.size,
        totalResponses: responses?.length || 0,
        responseRate: 100, // Placeholder
      },
      summary: {
        overallScore: Math.round(overallAvg * 100) / 100,
        overallRiskLevel,
        categoryCount: categoryResults.length,
        highRiskCategories: categoryResults.filter((c) => c.riskLevel === 'high').length,
        mediumRiskCategories: categoryResults.filter((c) => c.riskLevel === 'medium').length,
        lowRiskCategories: categoryResults.filter((c) => c.riskLevel === 'low').length,
      },
      categories: categoryResults.sort((a, b) => a.avgScore - b.avgScore),
      insights: generateInsights(categoryResults, overallAvg),
      recommendations: generateRecommendations(categoryResults),
      openResponsesSample: openResponses.slice(0, 5),
    };

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateInsights(
  categories: Array<{ category: string; categoryName: string; avgScore: number; riskLevel: string }>,
  overallAvg: number
): string[] {
  const insights: string[] = [];

  // Overall insight
  if (overallAvg < 2.5) {
    insights.push(
      'A organização apresenta níveis de risco psicossocial ELEVADOS que requerem atenção imediata.'
    );
  } else if (overallAvg < 3.5) {
    insights.push(
      'A organização apresenta níveis de risco psicossocial MODERADOS que merecem monitoramento.'
    );
  } else {
    insights.push(
      'A organização apresenta níveis de risco psicossocial BAIXOS, indicando ambiente saudável.'
    );
  }

  // Category-specific insights
  const highRisk = categories.filter((c) => c.riskLevel === 'high');
  if (highRisk.length > 0) {
    insights.push(
      `Áreas críticas identificadas: ${highRisk.map((c) => c.categoryName).join(', ')}.`
    );
  }

  const bestCategory = categories.reduce((a, b) => (a.avgScore > b.avgScore ? a : b));
  if (bestCategory.avgScore > 3.5) {
    insights.push(`Ponto forte da organização: ${bestCategory.categoryName}.`);
  }

  return insights;
}

function generateRecommendations(
  categories: Array<{ category: string; categoryName: string; avgScore: number; riskLevel: string }>
): Array<{ priority: string; area: string; action: string }> {
  const recommendations: Array<{ priority: string; area: string; action: string }> = [];

  for (const cat of categories) {
    if (cat.riskLevel === 'high') {
      recommendations.push({
        priority: 'Alta',
        area: cat.categoryName,
        action: getRecommendation(cat.category, 'high'),
      });
    } else if (cat.riskLevel === 'medium') {
      recommendations.push({
        priority: 'Média',
        area: cat.categoryName,
        action: getRecommendation(cat.category, 'medium'),
      });
    }
  }

  return recommendations.slice(0, 5); // Top 5 recommendations
}

function getRecommendation(category: string, level: string): string {
  const recs: Record<string, Record<string, string>> = {
    demands_and_pace: {
      high: 'Implementar imediatamente revisão de cargas de trabalho e prazos. Considerar contratação adicional.',
      medium: 'Monitorar distribuição de tarefas e implementar pausas regulares.',
    },
    autonomy_clarity_change: {
      high: 'Estabelecer processos claros de comunicação e dar mais autonomia às equipes.',
      medium: 'Melhorar documentação de processos e envolver equipes em decisões.',
    },
    leadership_recognition: {
      high: 'Capacitar lideranças em gestão de pessoas e implementar programa de reconhecimento.',
      medium: 'Fortalecer feedback regular e comunicação entre líderes e equipes.',
    },
    relationships_communication: {
      high: 'Promover ações de integração e estabelecer canais de comunicação efetivos.',
      medium: 'Incentivar trabalho colaborativo e melhorar fluxos de informação.',
    },
    work_life_health: {
      high: 'Implementar políticas de flexibilidade e programas de bem-estar.',
      medium: 'Revisar políticas de horário e promover atividades de saúde.',
    },
    violence_harassment: {
      high: 'AÇÃO URGENTE: Estabelecer canal de denúncias e política de tolerância zero.',
      medium: 'Reforçar treinamentos sobre respeito e conduta no ambiente de trabalho.',
    },
    anchors: {
      high: 'Investigar causas do baixo engajamento e satisfação geral.',
      medium: 'Monitorar indicadores de clima e ajustar ações preventivas.',
    },
  };

  return recs[category]?.[level] || 'Desenvolver plano de ação específico para esta área.';
}

// GET endpoint to list available report types
export async function GET() {
  return NextResponse.json({
    reportTypes: REPORT_TYPES,
    usage: {
      method: 'POST',
      body: '{ "assessmentId": "<id>", "reportType": "riscos-psicossociais" }',
      queryParams: '?secret=psicomapa-seed-2025',
    },
  });
}
