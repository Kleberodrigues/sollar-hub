'use server';

/**
 * AI Report Generation Actions
 *
 * Server actions para geração de relatórios com IA
 * Usa Anthropic Claude ou OpenAI como fallback
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CATEGORY_LABELS } from '@/types';

export interface AIReportResult {
  success: boolean;
  report?: AIReport;
  error?: string;
}

export interface AIReport {
  generatedAt: string;
  executiveSummary: string;
  riskAnalysis: {
    category: string;
    categoryName: string;
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    analysis: string;
    recommendations: string[];
  }[];
  overallRecommendations: string[];
  actionPriorities: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    timeline: string;
    responsible: string;
  }[];
  conclusion: string;
}

interface ReportData {
  assessmentTitle: string;
  organizationName: string;
  totalParticipants: number;
  completionRate: number;
  categoryScores: {
    category: string;
    categoryName: string;
    avgScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

/**
 * Gera relatório usando IA (Claude ou OpenAI)
 */
export async function generateAIReport(assessmentId: string): Promise<AIReportResult> {
  const supabase = await createClient();

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  try {
    // Buscar dados do assessment
    const reportData = await getReportDataForAI(assessmentId);

    // Verificar se há participantes suficientes
    if (reportData.totalParticipants < 3) {
      return {
        success: false,
        error: 'É necessário pelo menos 3 participantes para gerar o relatório com IA.',
      };
    }

    // Verificar se API key está configurada
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (anthropicKey) {
      return await generateWithAnthropic(reportData, anthropicKey);
    } else if (openaiKey) {
      return await generateWithOpenAI(reportData, openaiKey);
    } else {
      // Fallback: gerar relatório sem IA (template-based)
      return generateTemplateReport(reportData);
    }
  } catch (error) {
    console.error('[AI Report] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar relatório',
    };
  }
}

/**
 * Busca dados do assessment para geração de relatório
 */
async function getReportDataForAI(assessmentId: string): Promise<ReportData> {
  const supabase = await createClient();

  // Buscar assessment
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

  const totalQuestions = assessment.questionnaires?.[0]?.questions?.length || 0;
  const completionRate = totalQuestions > 0
    ? (responses.length / (uniqueParticipants * totalQuestions)) * 100
    : 0;

  // Calcular scores por categoria
  const categories = [
    'demands_and_pace',
    'autonomy_clarity_change',
    'leadership_recognition',
    'relationships_communication',
    'work_life_health',
    'violence_harassment',
  ];

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

    return {
      category,
      categoryName: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
      avgScore: Math.round(avgScore * 100) / 100,
      riskLevel,
    };
  });

  return {
    assessmentTitle: assessment.title,
    organizationName: org?.name || 'Organização',
    totalParticipants: uniqueParticipants,
    completionRate: Math.round(completionRate * 100) / 100,
    categoryScores,
  };
}

/**
 * Gera relatório usando Anthropic Claude
 */
async function generateWithAnthropic(data: ReportData, apiKey: string): Promise<AIReportResult> {
  const prompt = buildReportPrompt(data);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Anthropic API] Error:', error);
    // Fallback to template
    return generateTemplateReport(data);
  }

  const result = await response.json();
  const content = result.content?.[0]?.text;

  if (!content) {
    return generateTemplateReport(data);
  }

  try {
    const report = JSON.parse(content);
    return {
      success: true,
      report: {
        ...report,
        generatedAt: new Date().toLocaleString('pt-BR'),
      },
    };
  } catch {
    // If JSON parsing fails, use template
    return generateTemplateReport(data);
  }
}

/**
 * Gera relatório usando OpenAI
 */
async function generateWithOpenAI(data: ReportData, apiKey: string): Promise<AIReportResult> {
  const prompt = buildReportPrompt(data);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[OpenAI API] Error:', error);
    return generateTemplateReport(data);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    return generateTemplateReport(data);
  }

  try {
    const report = JSON.parse(content);
    return {
      success: true,
      report: {
        ...report,
        generatedAt: new Date().toLocaleString('pt-BR'),
      },
    };
  } catch {
    return generateTemplateReport(data);
  }
}

/**
 * Constrói o prompt para geração do relatório
 */
function buildReportPrompt(data: ReportData): string {
  const highRiskCategories = data.categoryScores.filter(c => c.riskLevel === 'high');
  const mediumRiskCategories = data.categoryScores.filter(c => c.riskLevel === 'medium');

  return `Você é um especialista em saúde ocupacional e riscos psicossociais (NR-1).
Analise os dados abaixo e gere um relatório executivo em português brasileiro.

DADOS DO ASSESSMENT:
- Organização: ${data.organizationName}
- Assessment: ${data.assessmentTitle}
- Participantes: ${data.totalParticipants}
- Taxa de Conclusão: ${data.completionRate}%

SCORES POR CATEGORIA (escala 1-5, menor = maior risco):
${data.categoryScores.map(c => `- ${c.categoryName}: ${c.avgScore} (${c.riskLevel === 'high' ? 'ALTO RISCO' : c.riskLevel === 'medium' ? 'MÉDIO RISCO' : 'BAIXO RISCO'})`).join('\n')}

${highRiskCategories.length > 0 ? `ÁREAS DE ALTO RISCO: ${highRiskCategories.map(c => c.categoryName).join(', ')}` : ''}
${mediumRiskCategories.length > 0 ? `ÁREAS DE ATENÇÃO: ${mediumRiskCategories.map(c => c.categoryName).join(', ')}` : ''}

Responda APENAS com um JSON válido no seguinte formato:
{
  "executiveSummary": "Resumo executivo de 2-3 parágrafos",
  "riskAnalysis": [
    {
      "category": "category_key",
      "categoryName": "Nome da Categoria",
      "score": 2.5,
      "riskLevel": "high|medium|low",
      "analysis": "Análise detalhada da categoria",
      "recommendations": ["Recomendação 1", "Recomendação 2"]
    }
  ],
  "overallRecommendations": ["Recomendação geral 1", "Recomendação geral 2"],
  "actionPriorities": [
    {
      "priority": "high|medium|low",
      "action": "Descrição da ação",
      "timeline": "Prazo sugerido",
      "responsible": "Responsável sugerido"
    }
  ],
  "conclusion": "Conclusão do relatório"
}`;
}

/**
 * Gera relatório usando templates (fallback quando IA não está disponível)
 */
function generateTemplateReport(data: ReportData): AIReportResult {
  const highRiskCategories = data.categoryScores.filter(c => c.riskLevel === 'high');
  const mediumRiskCategories = data.categoryScores.filter(c => c.riskLevel === 'medium');
  const lowRiskCategories = data.categoryScores.filter(c => c.riskLevel === 'low');

  const executiveSummary = `O assessment "${data.assessmentTitle}" da ${data.organizationName} contou com ${data.totalParticipants} participantes e alcançou uma taxa de conclusão de ${data.completionRate}%.

${highRiskCategories.length > 0
  ? `Foram identificadas ${highRiskCategories.length} área(s) de alto risco que requerem atenção imediata: ${highRiskCategories.map(c => c.categoryName).join(', ')}.`
  : 'Não foram identificadas áreas de alto risco.'}

${mediumRiskCategories.length > 0
  ? `${mediumRiskCategories.length} área(s) apresentam risco médio e merecem monitoramento: ${mediumRiskCategories.map(c => c.categoryName).join(', ')}.`
  : ''}`;

  const riskAnalysis = data.categoryScores.map(c => ({
    category: c.category,
    categoryName: c.categoryName,
    score: c.avgScore,
    riskLevel: c.riskLevel,
    analysis: getAnalysisTemplate(c.category, c.riskLevel),
    recommendations: getRecommendationsTemplate(c.category, c.riskLevel),
  }));

  const actionPriorities: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    timeline: string;
    responsible: string;
  }[] = [
    ...highRiskCategories.map(c => ({
      priority: 'high' as const,
      action: `Implementar medidas corretivas para ${c.categoryName}`,
      timeline: '30 dias',
      responsible: 'RH + Gestão',
    })),
    ...mediumRiskCategories.map(c => ({
      priority: 'medium' as const,
      action: `Desenvolver plano de melhoria para ${c.categoryName}`,
      timeline: '60 dias',
      responsible: 'RH',
    })),
  ];

  if (actionPriorities.length === 0) {
    actionPriorities.push({
      priority: 'low',
      action: 'Manter monitoramento contínuo dos indicadores',
      timeline: 'Contínuo',
      responsible: 'RH',
    });
  }

  return {
    success: true,
    report: {
      generatedAt: new Date().toLocaleString('pt-BR'),
      executiveSummary,
      riskAnalysis,
      overallRecommendations: [
        'Realizar pesquisas de acompanhamento trimestrais',
        'Implementar canal de comunicação aberto com colaboradores',
        'Capacitar lideranças em gestão de riscos psicossociais',
        'Documentar todas as ações implementadas para auditoria NR-1',
      ],
      actionPriorities,
      conclusion: `Este relatório apresenta o diagnóstico de riscos psicossociais conforme NR-1. ${
        highRiskCategories.length > 0
          ? 'É fundamental que as áreas de alto risco sejam tratadas com prioridade para garantir a conformidade regulatória e o bem-estar dos colaboradores.'
          : lowRiskCategories.length === data.categoryScores.length
            ? 'A organização apresenta indicadores saudáveis, recomendando-se a manutenção das práticas atuais.'
            : 'Recomenda-se atenção às áreas de risco médio para prevenir deterioração dos indicadores.'
      }`,
    },
  };
}

function getAnalysisTemplate(category: string, riskLevel: 'low' | 'medium' | 'high'): string {
  const templates: Record<string, Record<string, string>> = {
    demands_and_pace: {
      high: 'Os colaboradores relatam sobrecarga significativa de trabalho e ritmo excessivo, indicando necessidade urgente de revisão das demandas.',
      medium: 'Há indícios de pressão por demandas em alguns setores, requerendo monitoramento e ajustes pontuais.',
      low: 'As demandas de trabalho estão equilibradas e o ritmo é considerado adequado pelos colaboradores.',
    },
    autonomy_clarity_change: {
      high: 'Colaboradores demonstram baixa autonomia e falta de clareza sobre suas funções, gerando insegurança e estresse.',
      medium: 'Existem oportunidades de melhoria na comunicação de papéis e delegação de responsabilidades.',
      low: 'Os colaboradores têm clareza sobre suas responsabilidades e autonomia adequada para executá-las.',
    },
    leadership_recognition: {
      high: 'Há insatisfação significativa com a liderança e falta de reconhecimento, impactando a motivação.',
      medium: 'A relação com lideranças pode ser aprimorada, especialmente no aspecto de feedback e reconhecimento.',
      low: 'Os colaboradores demonstram satisfação com suas lideranças e sentem-se reconhecidos.',
    },
    relationships_communication: {
      high: 'O ambiente relacional apresenta conflitos e comunicação deficiente, afetando o clima organizacional.',
      medium: 'Existem desafios pontuais de comunicação e relacionamento entre equipes.',
      low: 'O ambiente é colaborativo com boa comunicação entre as equipes.',
    },
    work_life_health: {
      high: 'Colaboradores relatam dificuldade significativa em equilibrar trabalho e vida pessoal, com impactos na saúde.',
      medium: 'Há sinais de desequilíbrio trabalho-vida em alguns grupos, merecendo atenção.',
      low: 'Os colaboradores conseguem manter equilíbrio saudável entre trabalho e vida pessoal.',
    },
    violence_harassment: {
      high: 'ALERTA: Foram identificados relatos preocupantes relacionados a violência ou assédio. Ação imediata necessária.',
      medium: 'Existem situações que requerem investigação e ações preventivas relacionadas ao respeito no ambiente.',
      low: 'O ambiente é percebido como respeitoso e seguro pelos colaboradores.',
    },
  };

  return templates[category]?.[riskLevel] || 'Análise não disponível para esta categoria.';
}

function getRecommendationsTemplate(category: string, riskLevel: 'low' | 'medium' | 'high'): string[] {
  if (riskLevel === 'low') {
    return ['Manter práticas atuais', 'Continuar monitoramento periódico'];
  }

  const recommendations: Record<string, string[]> = {
    demands_and_pace: [
      'Revisar distribuição de tarefas entre equipes',
      'Implementar política de pausas regulares',
      'Avaliar necessidade de contratações ou redistribuição',
    ],
    autonomy_clarity_change: [
      'Documentar e comunicar claramente papéis e responsabilidades',
      'Capacitar gestores em delegação efetiva',
      'Estabelecer processos claros de comunicação de mudanças',
    ],
    leadership_recognition: [
      'Implementar programa de feedback contínuo',
      'Criar programa de reconhecimento formal',
      'Capacitar lideranças em gestão de pessoas',
    ],
    relationships_communication: [
      'Realizar workshops de comunicação não-violenta',
      'Implementar canais de comunicação transparente',
      'Promover atividades de integração entre equipes',
    ],
    work_life_health: [
      'Implementar política de desconexão',
      'Oferecer programa de bem-estar e qualidade de vida',
      'Flexibilizar horários quando possível',
    ],
    violence_harassment: [
      'Revisar e fortalecer canal de denúncias',
      'Realizar treinamento obrigatório sobre respeito no trabalho',
      'Investigar casos reportados com urgência',
    ],
  };

  return recommendations[category] || ['Desenvolver plano de ação específico para esta área'];
}
