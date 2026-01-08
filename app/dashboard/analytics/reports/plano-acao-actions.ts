'use server';

/**
 * Plano de Ação Report Actions
 *
 * Gera relatório de plano de ação com prioridades baseadas em evidências
 * Aplicável a NR-1 e Clima
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type {
  ReportGenerationResult,
  PlanoAcaoReport,
  ActionPriority,
  BacklogItem,
  GovernanceStructure,
  NLPTheme,
} from './types';
import { saveReport, checkAssessmentClosed, calculateCategoryRiskScores, type CategoryRiskScore } from './base-report-actions';
import { analyzeAllOpenQuestions } from './nlp-actions';

// ==========================================
// Geração de Prioridades com IA
// ==========================================

const PRIORITIES_PROMPT = `Você é um especialista em gestão de riscos psicossociais e saúde ocupacional.

Com base nos seguintes dados de avaliação organizacional, gere de 3 a 5 prioridades de ação:

SCORES POR CATEGORIA (1-5, menor = maior risco):
{categoryScores}

TEMAS DAS RESPOSTAS ABERTAS:
{themes}

Para cada prioridade, forneça:
1. Tema principal (ex: "Carga de Trabalho", "Liderança")
2. Descrição clara da ação
3. Evidências que justificam a prioridade
4. Indicador de sucesso sugerido

Responda APENAS com JSON válido:
{
  "priorities": [
    {
      "priority": 1,
      "theme": "Nome do Tema",
      "description": "Descrição clara da ação a ser tomada",
      "evidence": ["Evidência 1", "Evidência 2"],
      "indicator": "Indicador de sucesso"
    }
  ]
}

Ordene por urgência (1 = mais urgente).`;

async function generatePrioritiesWithAI(
  categoryScores: CategoryRiskScore[],
  themes: NLPTheme[]
): Promise<ActionPriority[]> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return generateDefaultPriorities(categoryScores);
  }

  try {
    const categoryScoresText = categoryScores
      .map((c) => `- ${c.categoryName}: ${c.avgScore.toFixed(2)} (${c.riskLevel === 'high' ? 'Alto Risco' : c.riskLevel === 'medium' ? 'Risco Médio' : 'Baixo Risco'})`)
      .join('\n');

    const themesText = themes.length > 0
      ? themes.map((t) => `- ${t.theme} (${t.sentiment}): ${t.count} menções`).join('\n')
      : 'Sem respostas abertas analisadas';

    const prompt = PRIORITIES_PROMPT
      .replace('{categoryScores}', categoryScoresText)
      .replace('{themes}', themesText);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor de gestão organizacional. Responda apenas com JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      console.error('[PlanoAcao] OpenAI error:', await response.text());
      return generateDefaultPriorities(categoryScores);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return generateDefaultPriorities(categoryScores);
    }

    const parsed = JSON.parse(content);
    return (parsed.priorities || []).map((p: any, idx: number) => ({
      id: `priority-${idx + 1}`,
      priority: p.priority || idx + 1,
      theme: p.theme || 'Tema não identificado',
      description: p.description || '',
      evidence: p.evidence || [],
      indicator: p.indicator,
      status: 'pending' as const,
    }));
  } catch (error) {
    console.error('[PlanoAcao] Error generating priorities:', error);
    return generateDefaultPriorities(categoryScores);
  }
}

function generateDefaultPriorities(categoryScores: CategoryRiskScore[]): ActionPriority[] {
  // Ordenar por risco (maior risco primeiro)
  const sorted = [...categoryScores].sort((a, b) => a.avgScore - b.avgScore);

  const priorities: ActionPriority[] = [];
  let priority = 1;

  for (const cat of sorted.slice(0, 5)) {
    if (cat.riskLevel === 'high' || cat.riskLevel === 'medium') {
      priorities.push({
        id: `priority-${priority}`,
        priority,
        theme: cat.categoryName,
        description: getDefaultAction(cat.category),
        evidence: [`Score médio de ${cat.avgScore.toFixed(2)}/5.0`, `Nível de risco: ${cat.riskLevel === 'high' ? 'Alto' : 'Médio'}`],
        indicator: getDefaultIndicator(cat.category),
        status: 'pending',
      });
      priority++;
    }
  }

  if (priorities.length === 0) {
    priorities.push({
      id: 'priority-1',
      priority: 1,
      theme: 'Manutenção',
      description: 'Manter práticas atuais e continuar monitoramento periódico',
      evidence: ['Indicadores gerais dentro de parâmetros aceitáveis'],
      indicator: 'Taxa de participação em próximas pesquisas',
      status: 'pending',
    });
  }

  return priorities;
}

function getDefaultAction(category: string): string {
  const actions: Record<string, string> = {
    demands_and_pace: 'Revisar dimensionamento de equipes e priorização de demandas',
    autonomy_clarity_change: 'Implementar comunicação mais clara sobre mudanças e expectativas',
    leadership_recognition: 'Desenvolver programa de capacitação de líderes e reconhecimento',
    relationships_communication: 'Criar canais de comunicação mais efetivos e resolução de conflitos',
    work_life_health: 'Implementar políticas de flexibilidade e promoção de saúde',
    violence_harassment: 'Reforçar canais de denúncia e treinamento sobre respeito',
  };
  return actions[category] || 'Investigar causas e desenvolver plano específico';
}

function getDefaultIndicator(category: string): string {
  const indicators: Record<string, string> = {
    demands_and_pace: 'Redução de 20% em horas extras não planejadas',
    autonomy_clarity_change: 'Aumento de 15% no score de clareza',
    leadership_recognition: 'Aumento de 20% no score de liderança',
    relationships_communication: 'Redução de 30% em conflitos reportados',
    work_life_health: 'Redução de 15% em absenteísmo',
    violence_harassment: 'Zero casos de violência ou assédio',
  };
  return indicators[category] || 'Melhoria de 15% no score da categoria';
}

// ==========================================
// Geração de Backlog por Tema
// ==========================================

const BACKLOG_PROMPT = `Com base nas seguintes prioridades de ação, gere um backlog detalhado por tema:

PRIORIDADES:
{priorities}

Para cada tema, liste 3-5 itens de ação específicos e estime o esforço (low, medium, high).

Responda APENAS com JSON válido:
{
  "backlog": [
    {
      "theme": "Nome do Tema",
      "items": ["Item 1", "Item 2", "Item 3"],
      "estimatedEffort": "medium"
    }
  ]
}`;

async function generateBacklog(priorities: ActionPriority[]): Promise<BacklogItem[]> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return generateDefaultBacklog(priorities);
  }

  try {
    const prioritiesText = priorities
      .map((p) => `${p.priority}. ${p.theme}: ${p.description}`)
      .join('\n');

    const prompt = BACKLOG_PROMPT.replace('{priorities}', prioritiesText);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um gerente de projetos organizacionais. Responda apenas com JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return generateDefaultBacklog(priorities);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return generateDefaultBacklog(priorities);
    }

    const parsed = JSON.parse(content);
    return (parsed.backlog || []).map((b: any, idx: number) => ({
      id: `backlog-${idx + 1}`,
      theme: b.theme || 'Tema',
      items: b.items || [],
      estimatedEffort: b.estimatedEffort || 'medium',
    }));
  } catch (error) {
    console.error('[PlanoAcao] Error generating backlog:', error);
    return generateDefaultBacklog(priorities);
  }
}

function generateDefaultBacklog(priorities: ActionPriority[]): BacklogItem[] {
  return priorities.map((p, idx) => ({
    id: `backlog-${idx + 1}`,
    theme: p.theme,
    items: [
      `Diagnóstico detalhado sobre ${p.theme.toLowerCase()}`,
      `Reunião com stakeholders para alinhamento`,
      `Definição de metas e cronograma`,
      `Implementação de quick wins`,
      `Avaliação de resultados em 30 dias`,
    ],
    estimatedEffort: p.priority <= 2 ? 'high' : 'medium',
  }));
}

// ==========================================
// Geração de Estrutura de Governança
// ==========================================

function generateGovernance(organizationName: string): GovernanceStructure {
  return {
    sponsor: `Diretor(a) de RH / Gestor(a) de Pessoas de ${organizationName}`,
    committee: [
      'Representante da Direção',
      'Gestor(a) de RH',
      'Representante do SESMT',
      'Representante dos Colaboradores (CIPA)',
      'Líderes das áreas prioritárias',
    ],
    reviewFrequency: 'Quinzenal nos primeiros 3 meses, depois mensal',
    escalationPath: 'Comitê → Direção de RH → Diretoria Executiva',
  };
}

// ==========================================
// Geração de Feedback/Devolutiva
// ==========================================

const FEEDBACK_PROMPT = `Gere um texto de devolutiva para os colaboradores sobre os resultados da pesquisa organizacional.

CONTEXTO:
- Taxa de participação: {responseRate}%
- Áreas prioritárias identificadas: {priorities}
- Principais ações planejadas: {actions}

O texto deve:
1. Agradecer a participação
2. Resumir os principais achados (sem culpabilizar)
3. Apresentar as ações que serão tomadas
4. Reforçar o compromisso com a melhoria contínua

Tom: Profissional, empático e transparente.
Tamanho: 3-4 parágrafos.

Responda APENAS com o texto da devolutiva.`;

async function generateFeedback(
  responseRate: number,
  priorities: ActionPriority[]
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return getDefaultFeedback(responseRate, priorities);
  }

  try {
    const prioritiesText = priorities.slice(0, 3).map((p) => p.theme).join(', ');
    const actionsText = priorities.slice(0, 3).map((p) => p.description).join('; ');

    const prompt = FEEDBACK_PROMPT
      .replace('{responseRate}', String(responseRate))
      .replace('{priorities}', prioritiesText)
      .replace('{actions}', actionsText);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em comunicação organizacional. Escreva de forma clara e empática.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      return getDefaultFeedback(responseRate, priorities);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || getDefaultFeedback(responseRate, priorities);
  } catch (error) {
    console.error('[PlanoAcao] Error generating feedback:', error);
    return getDefaultFeedback(responseRate, priorities);
  }
}

function getDefaultFeedback(responseRate: number, priorities: ActionPriority[]): string {
  const priorityThemes = priorities.slice(0, 3).map((p) => p.theme).join(', ');

  return `Agradecemos a todos os colaboradores que participaram da pesquisa organizacional. Com uma taxa de participação de ${responseRate}%, conseguimos obter uma visão representativa do nosso ambiente de trabalho.

A análise dos resultados nos permitiu identificar áreas de destaque e oportunidades de melhoria. As principais áreas que receberão atenção prioritária são: ${priorityThemes || 'identificadas no relatório detalhado'}.

Estamos comprometidos em transformar esses dados em ações concretas. Um comitê multidisciplinar foi formado para acompanhar a implementação das melhorias, com reuniões regulares de acompanhamento e métricas claras de sucesso.

Contamos com a participação contínua de todos para construirmos juntos um ambiente de trabalho cada vez melhor. Novas pesquisas serão realizadas periodicamente para avaliar o progresso e ajustar as ações conforme necessário.`;
}

// ==========================================
// Gerar Relatório Plano de Ação
// ==========================================

export async function generatePlanoAcaoReport(
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

    // Buscar participantes
    const { data: responses } = await (supabase
      .from('responses')
      .select('anonymous_id')
      .eq('assessment_id', assessmentId) as any);

    const uniqueParticipants = new Set(responses?.map((r: any) => r.anonymous_id) || []).size;

    // Verificar se há respostas suficientes para análise
    if (uniqueParticipants === 0) {
      return {
        success: false,
        error: 'INSUFFICIENT_DATA',
      };
    }

    const { count: participantCount } = await (supabase
      .from('assessment_participants')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', assessmentId) as any);

    const expectedParticipants = participantCount || uniqueParticipants;
    const responseRate = Math.round((uniqueParticipants / expectedParticipants) * 100);

    // Calcular scores por categoria
    const categoryScores = await calculateCategoryRiskScores(assessmentId);

    // Analisar respostas abertas
    const nlpResults = await analyzeAllOpenQuestions(assessmentId);
    const allThemes: NLPTheme[] = Object.values(nlpResults).flatMap((r) => r.themes);

    // Gerar prioridades com IA
    const priorities = await generatePrioritiesWithAI(categoryScores, allThemes);

    // Gerar backlog
    const backlog = await generateBacklog(priorities);

    // Gerar estrutura de governança
    const governance = generateGovernance(assessment.organizations?.name || 'Organização');

    // Gerar feedback/devolutiva
    const feedback = await generateFeedback(responseRate, priorities);

    // Gerar sumário
    const highRiskCount = categoryScores.filter((c) => c.riskLevel === 'high').length;
    const mediumRiskCount = categoryScores.filter((c) => c.riskLevel === 'medium').length;

    const summary = `Este plano de ação foi desenvolvido com base na análise de ${uniqueParticipants} respostas (taxa de ${responseRate}%). ` +
      `Foram identificadas ${highRiskCount} área(s) de alto risco e ${mediumRiskCount} área(s) de risco médio. ` +
      `O plano contempla ${priorities.length} prioridades de ação com backlog detalhado e estrutura de governança para acompanhamento.`;

    // Construir relatório
    const report: PlanoAcaoReport = {
      metadata: {
        type: 'plano_acao',
        title: `Plano de Ação - ${assessment.title}`,
        organizationName: assessment.organizations?.name || 'Organização',
        assessmentTitle: assessment.title,
        period: {
          start: assessment.start_date,
          end: assessment.end_date,
        },
        participants: uniqueParticipants,
        responseRate,
        generatedAt: new Date().toISOString(),
        aiModel: 'gpt-4.1-mini-2025-04-14',
      },
      summary,
      priorities,
      backlog,
      governance,
      feedback,
    };

    // Salvar relatório
    const generationTimeMs = Date.now() - startTime;
    const reportId = await saveReport({
      assessmentId,
      organizationId: assessment.organization_id,
      reportType: 'plano_acao',
      title: report.metadata.title,
      content: {
        metadata: report.metadata,
        sections: [
          { id: 'summary', title: 'Resumo Executivo', type: 'narrative', content: report.summary },
          { id: 'priorities', title: 'Prioridades de Ação', type: 'action_items', content: report.priorities },
          { id: 'backlog', title: 'Backlog por Tema', type: 'action_items', content: report.backlog },
          { id: 'governance', title: 'Estrutura de Governança', type: 'narrative', content: report.governance },
          { id: 'feedback', title: 'Devolutiva aos Colaboradores', type: 'narrative', content: report.feedback },
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
          { id: 'summary', title: 'Resumo Executivo', type: 'narrative', content: report.summary },
          { id: 'priorities', title: 'Prioridades de Ação', type: 'action_items', content: report.priorities },
          { id: 'backlog', title: 'Backlog por Tema', type: 'action_items', content: report.backlog },
          { id: 'governance', title: 'Estrutura de Governança', type: 'narrative', content: report.governance },
          { id: 'feedback', title: 'Devolutiva aos Colaboradores', type: 'narrative', content: report.feedback },
        ],
      },
    };

  } catch (error) {
    console.error('[PlanoAcao] Error generating report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar relatório',
    };
  }
}
