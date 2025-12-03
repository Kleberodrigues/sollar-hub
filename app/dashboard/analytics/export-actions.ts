/**
 * Export Actions for Analytics Dashboard
 *
 * Server actions para exportação de dados em PDF e CSV
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Formata dados para export PDF
 */
export async function getReportData(assessmentId: string) {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Buscar dados do assessment
  const { data: assessment, error: assessmentError } = await supabase
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
    .single();

  if (assessmentError || !assessment) {
    throw new Error('Assessment não encontrado');
  }

  // Buscar organização
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', assessment.organization_id)
    .single();

  // Buscar respostas
  const { data: responses } = await supabase
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
    .eq('assessment_id', assessmentId);

  if (!responses) {
    throw new Error('Erro ao buscar respostas');
  }

  // Calcular métricas
  const uniqueParticipants = new Set(
    responses.map((r) => r.anonymous_id)
  ).size;
  const totalQuestions = assessment.questionnaires[0]?.questions?.length || 0;
  const completionRate =
    totalQuestions > 0
      ? (responses.length / (uniqueParticipants * totalQuestions)) * 100
      : 0;

  // Última resposta
  const sortedResponses = [...responses].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const lastResponse = sortedResponses[0];

  // Calcular scores por categoria
  const categories = [
    'demands',
    'control',
    'support',
    'relationships',
    'role',
    'change',
  ];
  const categoryNames: Record<string, string> = {
    demands: 'Demandas',
    control: 'Controle',
    support: 'Apoio',
    relationships: 'Relacionamentos',
    role: 'Papel',
    change: 'Mudança',
  };

  const categoryScores = categories.map((category) => {
    const categoryResponses = responses.filter(
      (r) => r.questions?.category === category && r.questions?.type === 'likert_scale'
    );

    const scores = categoryResponses
      .map((r) => parseFloat(r.value))
      .filter((v) => !isNaN(v));

    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
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
      (q: any) => q.category === category
    ).length || 0;

    return {
      category,
      categoryName: categoryNames[category] || category,
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
export async function exportResponsesCSV(assessmentId: string) {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Buscar respostas com join de perguntas
  const { data: responses, error } = await supabase
    .from('responses')
    .select(
      `
      id,
      anonymous_id,
      value,
      created_at,
      questions (
        text,
        type,
        category
      )
    `
    )
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error || !responses) {
    throw new Error('Erro ao buscar respostas para export');
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

  const rows = responses.map((r) => {
    const question = Array.isArray(r.questions) ? r.questions[0] : r.questions;
    return [
      r.id,
      r.anonymous_id,
      question?.text || '',
      question?.category || '',
      question?.type || '',
      r.value,
      new Date(r.created_at).toLocaleString('pt-BR'),
    ];
  });

  // Montar CSV
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
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
export async function exportAnalyticsSummaryCSV(assessmentId: string) {
  const data = await getReportData(assessmentId);

  const headers = [
    'Categoria',
    'Pontuação Média',
    'Nível de Risco',
    'Total de Respostas',
    'Total de Perguntas',
  ];

  const rows = data.categoryScores.map((cat) => [
    cat.categoryName,
    cat.avgScore.toString(),
    cat.riskLabel,
    cat.responseCount.toString(),
    cat.questionCount.toString(),
  ]);

  // Adicionar métricas gerais no início
  const summaryRows = [
    ['RESUMO EXECUTIVO', '', '', '', ''],
    ['Assessment', data.assessmentTitle, '', '', ''],
    ['Organização', data.organizationName, '', '', ''],
    ['Total de Participantes', data.totalParticipants.toString(), '', '', ''],
    ['Taxa de Conclusão', `${data.completionRate}%`, '', '', ''],
    ['Última Resposta', data.lastResponseDate, '', '', ''],
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
