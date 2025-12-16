/**
 * Export Actions for Analytics Dashboard
 *
 * Server actions para exportação de dados em PDF, CSV e XLSX
 * Todas as ações verificam permissões de plano antes de exportar
 * Aplica regras de anonimato para proteger identidade dos respondentes
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getServerPlanFeatures, getUpgradeInfo, type ExportFormat } from '@/lib/stripe';
import { ANONYMITY_THRESHOLDS, SUPPRESSION_MESSAGES } from '@/lib/constants/anonymity-thresholds';
import { CATEGORY_LABELS } from '@/types';

/**
 * Resultado padrão para exports
 */
export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
  upgradeRequired?: boolean;
  requiredPlan?: string;
  anonymityProtected?: boolean;
  suppressionNote?: string;
}

/**
 * Verifica se o usuário pode exportar no formato especificado
 */
async function checkExportPermission(format: ExportFormat): Promise<ExportResult | null> {
  const planFeatures = await getServerPlanFeatures();

  if (!planFeatures.canExport(format)) {
    const upgradeInfo = getUpgradeInfo(format);
    return {
      success: false,
      error: upgradeInfo.message,
      upgradeRequired: true,
      requiredPlan: upgradeInfo.requiredPlan,
    };
  }

  return null; // Permission granted
}

/**
 * Formata dados para export PDF
 * Retorna dados formatados para geração de relatório PDF
 */
export async function getReportData(assessmentId: string): Promise<ExportResult | {
  assessmentTitle: string;
  organizationName: string;
  totalParticipants: number;
  totalQuestions: number;
  completionRate: number;
  lastResponseDate: string;
  categoryScores: Array<{
    category: string;
    categoryName: string;
    avgScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskLabel: string;
    responseCount: number;
    questionCount: number;
  }>;
  generatedAt: string;
}> {
  // Verificar permissão de plano para PDF
  const permissionError = await checkExportPermission('pdf');
  if (permissionError) return permissionError;

  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Buscar dados do assessment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error: assessmentError } = await (supabase
    .from('assessments')
    .select(
      `
      *,
      questionnaires (
        id,
        title,
        questions (
          id,
          text,
          type,
          category
        )
      )
    `
    )
    .eq('id', assessmentId)
    .single() as any);

  if (assessmentError || !assessment) {
    throw new Error('Assessment não encontrado');
  }

  // Buscar organização
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase
    .from('organizations')
    .select('name')
    .eq('id', assessment.organization_id)
    .single() as any);

  // Buscar respostas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: responses } = await (supabase
    .from('responses')
    .select(
      `
      *,
      questions (
        id,
        category,
        type
      )
    `
    )
    .eq('assessment_id', assessmentId) as any);

  if (!responses) {
    throw new Error('Erro ao buscar respostas');
  }

  // Calcular métricas
  const uniqueParticipants = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responses.map((r: any) => r.anonymous_id)
  ).size;

  // Verificar threshold de anonimato antes de gerar relatório
  if (uniqueParticipants < ANONYMITY_THRESHOLDS.ASSESSMENT_MINIMUM) {
    return {
      success: false,
      error: SUPPRESSION_MESSAGES.insufficientResponses,
      anonymityProtected: true,
      suppressionNote: `Mínimo de ${ANONYMITY_THRESHOLDS.ASSESSMENT_MINIMUM} participantes necessário. Atual: ${uniqueParticipants}`,
    };
  }

  const totalQuestions = assessment.questionnaires[0]?.questions?.length || 0;
  const completionRate =
    totalQuestions > 0
      ? (responses.length / (uniqueParticipants * totalQuestions)) * 100
      : 0;

  // Última resposta
  const sortedResponses = [...responses].sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const lastResponse = sortedResponses[0];

  // Calcular scores por categoria (Sollar 8-block structure)
  const categories = [
    'demands_and_pace',
    'autonomy_clarity_change',
    'leadership_recognition',
    'relationships_communication',
    'work_life_health',
    'violence_harassment',
    'anchors',
    'suggestions',
  ];
  // Using centralized CATEGORY_LABELS from @/types

  const categoryScores = categories.map((category) => {
    const categoryResponses = responses.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => r.questions?.category === category && r.questions?.type === 'likert_scale'
    );

    const scores = categoryResponses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => parseFloat(r.value || r.response_text || '0'))
      .filter((v: number) => !isNaN(v));

    const avgScore = scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (avgScore < 2.5) {
      riskLevel = 'high';
    } else if (avgScore < 3.5) {
      riskLevel = 'medium';
    }

    const riskLabels: Record<string, string> = {
      low: 'Baixo',
      medium: 'Médio',
      high: 'Alto',
    };

    const questionCount = assessment.questionnaires[0]?.questions?.filter(
      (q: { category: string }) => q.category === category
    ).length || 0;

    return {
      category,
      categoryName: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
      avgScore: Math.round(avgScore * 100) / 100,
      riskLevel,
      riskLabel: riskLabels[riskLevel],
      responseCount: categoryResponses.length,
      questionCount,
    };
  });

  // Formatar data
  const generatedAt = new Date().toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const lastResponseDate = lastResponse
    ? new Date(lastResponse.created_at).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : 'N/A';

  return {
    assessmentTitle: assessment.title,
    organizationName: org?.name || 'Organização',
    totalParticipants: uniqueParticipants,
    totalQuestions,
    completionRate: Math.round(completionRate * 100) / 100,
    lastResponseDate,
    categoryScores,
    generatedAt,
  };
}

/**
 * Exportar dados de respostas em formato CSV
 */
export async function exportResponsesCSV(assessmentId: string): Promise<ExportResult | string> {
  // Verificar permissão de plano
  const permissionError = await checkExportPermission('csv');
  if (permissionError) return permissionError;

  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Buscar respostas com join de perguntas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: responses, error } = await (supabase
    .from('responses')
    .select(
      `
      id,
      anonymous_id,
      value,
      response_text,
      created_at,
      questions (
        text,
        type,
        category
      )
    `
    )
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true }) as any);

  if (error || !responses) {
    throw new Error('Erro ao buscar respostas para export');
  }

  // Verificar threshold de anonimato para respostas detalhadas
  const uniqueParticipants = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responses.map((r: any) => r.anonymous_id)
  ).size;

  if (uniqueParticipants < ANONYMITY_THRESHOLDS.DETAILED_RESPONSES) {
    return {
      success: false,
      error: SUPPRESSION_MESSAGES.detailedResponsesBlocked,
      anonymityProtected: true,
      suppressionNote: `Export de respostas detalhadas requer mínimo de ${ANONYMITY_THRESHOLDS.DETAILED_RESPONSES} participantes. Atual: ${uniqueParticipants}`,
    };
  }

  // Gerar CSV
  const headers = [
    'ID Resposta',
    'ID Anônimo',
    'Pergunta',
    'Categoria',
    'Tipo',
    'Resposta',
    'Data/Hora',
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = responses.map((r: any) => {
    const question = Array.isArray(r.questions) ? r.questions[0] : r.questions;
    return [
      r.id,
      r.anonymous_id,
      question?.text || '',
      question?.category || '',
      question?.type || '',
      r.response_text || r.value || '',
      new Date(r.created_at).toLocaleString('pt-BR'),
    ];
  });

  // Montar CSV
  const csvContent = [
    headers.join(','),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...rows.map((row: any) =>
      row
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((cell: any) => {
          // Escapar vírgulas e aspas
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    ),
  ].join('\n');

  // Adicionar BOM para UTF-8 no Excel
  const BOM = '\uFEFF';
  return BOM + csvContent;
}

/**
 * Exportar sumário de análise em CSV
 */
export async function exportAnalyticsSummaryCSV(assessmentId: string): Promise<ExportResult | string> {
  // Verificar permissão de plano
  const permissionError = await checkExportPermission('csv');
  if (permissionError) return permissionError;

  const data = await getReportData(assessmentId);

  // Se retornou erro de permissão, propagar
  if ('success' in data && !data.success) {
    return data as ExportResult;
  }

  // Type assertion para dados válidos
  const reportData = data as Exclude<typeof data, ExportResult>;

  const headers = [
    'Categoria',
    'Pontuação Média',
    'Nível de Risco',
    'Total de Respostas',
    'Total de Perguntas',
  ];

  const rows = reportData.categoryScores.map((cat) => [
    cat.categoryName,
    cat.avgScore.toString(),
    cat.riskLabel,
    cat.responseCount.toString(),
    cat.questionCount.toString(),
  ]);

  // Adicionar métricas gerais no início
  const summaryRows = [
    ['RESUMO EXECUTIVO', '', '', '', ''],
    ['Assessment', reportData.assessmentTitle, '', '', ''],
    ['Organização', reportData.organizationName, '', '', ''],
    ['Total de Participantes', reportData.totalParticipants.toString(), '', '', ''],
    ['Taxa de Conclusão', `${reportData.completionRate}%`, '', '', ''],
    ['Última Resposta', reportData.lastResponseDate, '', '', ''],
    ['', '', '', '', ''],
    ['ANÁLISE POR CATEGORIA', '', '', '', ''],
  ];

  const csvContent = [
    ...summaryRows.map((row) => row.join(',')),
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Adicionar BOM para UTF-8 no Excel
  const BOM = '\uFEFF';
  return BOM + csvContent;
}

/**
 * Exportar relatório completo em formato XLSX (Enterprise only)
 */
export async function exportAnalyticsXLSX(assessmentId: string): Promise<ExportResult> {
  // Verificar permissão de plano (XLSX requer Enterprise)
  const permissionError = await checkExportPermission('xlsx');
  if (permissionError) return permissionError;

  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  try {
    // Buscar dados do relatório
    const reportData = await getReportDataInternal(assessmentId);

    // Buscar respostas detalhadas para incluir no XLSX
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: responses } = await (supabase
      .from('responses')
      .select(`
        id,
        anonymous_id,
        value,
        response_text,
        created_at,
        questions (
          text,
          type,
          category
        )
      `)
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: true }) as any);

    // Verificar threshold de anonimato para respostas detalhadas
    const uniqueParticipants = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responses?.map((r: any) => r.anonymous_id) || []
    ).size;

    // Se não houver participantes suficientes para o assessment, bloquear export
    if (uniqueParticipants < ANONYMITY_THRESHOLDS.ASSESSMENT_MINIMUM) {
      return {
        success: false,
        error: SUPPRESSION_MESSAGES.insufficientResponses,
        anonymityProtected: true,
        suppressionNote: `Mínimo de ${ANONYMITY_THRESHOLDS.ASSESSMENT_MINIMUM} participantes necessário para exportar. Atual: ${uniqueParticipants}`,
      };
    }

    // Se houver participantes suficientes para relatório mas não para respostas detalhadas,
    // exportar relatório sem as respostas individuais
    const includeDetailedResponses = uniqueParticipants >= ANONYMITY_THRESHOLDS.DETAILED_RESPONSES;

    // Formatar respostas para o XLSX (somente se permitido)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedResponses = responses?.map((r: any) => {
      const question = Array.isArray(r.questions) ? r.questions[0] : r.questions;
      return {
        id: r.id,
        anonymous_id: r.anonymous_id,
        question_text: question?.text || '',
        category: question?.category || '',
        type: question?.type || '',
        response: r.response_text || r.value || '',
        created_at: new Date(r.created_at).toLocaleString('pt-BR'),
      };
    }) || [];

    // Importar gerador XLSX dinamicamente
    const { generateAnalyticsXLSX } = await import('@/lib/exports/xlsx-generator');

    // Gerar XLSX (com ou sem respostas detalhadas baseado no threshold)
    // Note: anonymityNote is not passed to the generator - if detailed responses are omitted,
    // the XLSX will simply not have that sheet/data
    const buffer = await generateAnalyticsXLSX({
      ...reportData,
      responses: includeDetailedResponses ? formattedResponses : [],
    });

    // Converter para base64
    const base64 = buffer.toString('base64');

    return {
      success: true,
      data: base64,
      filename: `relatorio-analytics-${assessmentId}-${Date.now()}.xlsx`,
    };
  } catch (error) {
    console.error('[Export XLSX] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar arquivo XLSX',
    };
  }
}

/**
 * Versão interna de getReportData sem verificação de plano
 * Usada internamente por outras funções de export
 */
async function getReportDataInternal(assessmentId: string) {
  const supabase = await createClient();

  // Buscar dados do assessment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error: assessmentError } = await (supabase
    .from('assessments')
    .select(`
      *,
      questionnaires (
        id,
        title,
        questions (
          id,
          text,
          type,
          category
        )
      )
    `)
    .eq('id', assessmentId)
    .single() as any);

  if (assessmentError || !assessment) {
    throw new Error('Assessment não encontrado');
  }

  // Buscar organização
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase
    .from('organizations')
    .select('name')
    .eq('id', assessment.organization_id)
    .single() as any);

  // Buscar respostas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: responses } = await (supabase
    .from('responses')
    .select(`
      *,
      questions (
        id,
        category,
        type
      )
    `)
    .eq('assessment_id', assessmentId) as any);

  if (!responses) {
    throw new Error('Erro ao buscar respostas');
  }

  // Calcular métricas
  const uniqueParticipants = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responses.map((r: any) => r.anonymous_id)
  ).size;
  const totalQuestions = assessment.questionnaires[0]?.questions?.length || 0;
  const completionRate =
    totalQuestions > 0
      ? (responses.length / (uniqueParticipants * totalQuestions)) * 100
      : 0;

  // Última resposta
  const sortedResponses = [...responses].sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const lastResponse = sortedResponses[0];

  // Calcular scores por categoria
  const categories = [
    'demands_and_pace',
    'autonomy_clarity_change',
    'leadership_recognition',
    'relationships_communication',
    'work_life_health',
    'violence_harassment',
    'anchors',
    'suggestions',
  ];
  // Using centralized CATEGORY_LABELS from @/types

  const categoryScores = categories.map((category) => {
    const categoryResponses = responses.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => r.questions?.category === category && r.questions?.type === 'likert_scale'
    );

    const scores = categoryResponses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => parseFloat(r.value || r.response_text || '0'))
      .filter((v: number) => !isNaN(v));

    const avgScore = scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (avgScore < 2.5) {
      riskLevel = 'high';
    } else if (avgScore < 3.5) {
      riskLevel = 'medium';
    }

    const riskLabels: Record<string, string> = {
      low: 'Baixo',
      medium: 'Médio',
      high: 'Alto',
    };

    const questionCount = assessment.questionnaires[0]?.questions?.filter(
      (q: { category: string }) => q.category === category
    ).length || 0;

    return {
      category,
      categoryName: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
      avgScore: Math.round(avgScore * 100) / 100,
      riskLevel,
      riskLabel: riskLabels[riskLevel],
      responseCount: categoryResponses.length,
      questionCount,
    };
  });

  // Formatar data
  const generatedAt = new Date().toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const lastResponseDate = lastResponse
    ? new Date(lastResponse.created_at).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : 'N/A';

  return {
    assessmentTitle: assessment.title,
    organizationName: org?.name || 'Organização',
    totalParticipants: uniqueParticipants,
    totalQuestions,
    completionRate: Math.round(completionRate * 100) / 100,
    lastResponseDate,
    categoryScores,
    generatedAt,
  };
}
