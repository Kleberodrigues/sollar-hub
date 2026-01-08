'use server';

/**
 * Executivo Liderança Report Actions
 *
 * Gera relatório executivo focado em líderes com roteiro de conversa
 * Aplicável a NR-1 e Clima
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type {
  ReportGenerationResult,
  ExecutivoLiderancaReport,
  FocusArea,
  RiskSignal,
  ConversationScript,
  NLPTheme,
} from './types';
import { saveReport, checkAssessmentClosed, calculateCategoryRiskScores, type CategoryRiskScore } from './base-report-actions';
import { analyzeAllOpenQuestions } from './nlp-actions';

// ==========================================
// Geração de Pulse do Período com IA
// ==========================================

const PULSE_PROMPT = `Você é um consultor executivo em gestão de pessoas.

Com base nos seguintes dados de pesquisa organizacional, gere 5 bullets executivos que resumem o período:

SCORES POR CATEGORIA (1-5, menor = maior risco):
{categoryScores}

TEMAS DAS RESPOSTAS ABERTAS:
{themes}

CONTEXTO:
- Participantes: {participants}
- Taxa de resposta: {responseRate}%

Cada bullet deve:
1. Ser direto e objetivo (máximo 2 frases)
2. Destacar um insight acionável
3. Ser adequado para apresentação à diretoria

Responda APENAS com JSON válido:
{
  "bullets": [
    "Bullet 1: insight executivo",
    "Bullet 2: insight executivo",
    "Bullet 3: insight executivo",
    "Bullet 4: insight executivo",
    "Bullet 5: insight executivo"
  ]
}`;

async function generatePulseWithAI(
  categoryScores: CategoryRiskScore[],
  themes: NLPTheme[],
  participants: number,
  responseRate: number
): Promise<string[]> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return generateDefaultPulse(categoryScores, participants, responseRate);
  }

  try {
    const categoryScoresText = categoryScores
      .map((c) => `- ${c.categoryName}: ${c.avgScore.toFixed(2)} (${c.riskLevel === 'high' ? 'Alto Risco' : c.riskLevel === 'medium' ? 'Risco Médio' : 'Baixo Risco'})`)
      .join('\n');

    const themesText = themes.length > 0
      ? themes.slice(0, 5).map((t) => `- ${t.theme} (${t.sentiment}): ${t.count} menções`).join('\n')
      : 'Sem respostas abertas disponíveis';

    const prompt = PULSE_PROMPT
      .replace('{categoryScores}', categoryScoresText)
      .replace('{themes}', themesText)
      .replace('{participants}', String(participants))
      .replace('{responseRate}', String(responseRate));

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
            content: 'Você é um consultor executivo. Responda apenas com JSON válido.',
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
      return generateDefaultPulse(categoryScores, participants, responseRate);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return generateDefaultPulse(categoryScores, participants, responseRate);
    }

    const parsed = JSON.parse(content);
    return parsed.bullets || generateDefaultPulse(categoryScores, participants, responseRate);
  } catch (error) {
    console.error('[ExecutivoLideranca] Error generating pulse:', error);
    return generateDefaultPulse(categoryScores, participants, responseRate);
  }
}

function generateDefaultPulse(
  categoryScores: CategoryRiskScore[],
  participants: number,
  responseRate: number
): string[] {
  const highRisk = categoryScores.filter((c) => c.riskLevel === 'high');
  const lowRisk = categoryScores.filter((c) => c.riskLevel === 'low');

  const bullets: string[] = [
    `Taxa de participação de ${responseRate}% (${participants} colaboradores), indicando ${responseRate >= 70 ? 'engajamento positivo' : 'oportunidade de melhorar comunicação'} com a pesquisa.`,
  ];

  if (highRisk.length > 0) {
    bullets.push(`${highRisk.length} área(s) requerem atenção prioritária: ${highRisk.map(c => c.categoryName).join(', ')}.`);
  }

  if (lowRisk.length > 0) {
    bullets.push(`Pontos fortes identificados em: ${lowRisk.map(c => c.categoryName).join(', ')}.`);
  }

  const avgScore = categoryScores.reduce((sum, c) => sum + c.avgScore, 0) / categoryScores.length;
  bullets.push(`Score médio geral de ${avgScore.toFixed(2)}/5.0, ${avgScore >= 3.5 ? 'dentro de parâmetros adequados' : 'sinalizando necessidade de intervenção'}.`);

  bullets.push('Recomenda-se acompanhamento quinzenal nos primeiros 3 meses de implementação das ações.');

  return bullets.slice(0, 5);
}

// ==========================================
// Geração de Focus Areas com IA
// ==========================================

const FOCUS_PROMPT = `Com base nos dados de pesquisa organizacional, identifique as 3 principais áreas de foco para liderança:

SCORES POR CATEGORIA:
{categoryScores}

Para cada área, forneça:
1. Nome da área
2. Por que é importante (why)
3. Ação recomendada (action)

Responda APENAS com JSON válido:
{
  "focusAreas": [
    {
      "area": "Nome da Área",
      "why": "Justificativa clara e objetiva",
      "action": "Ação específica recomendada"
    }
  ]
}`;

async function generateFocusAreasWithAI(categoryScores: CategoryRiskScore[]): Promise<FocusArea[]> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return generateDefaultFocusAreas(categoryScores);
  }

  try {
    const categoryScoresText = categoryScores
      .map((c) => `- ${c.categoryName}: ${c.avgScore.toFixed(2)} (${c.riskLevel})`)
      .join('\n');

    const prompt = FOCUS_PROMPT.replace('{categoryScores}', categoryScoresText);

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
            content: 'Você é um consultor de liderança executiva. Responda apenas com JSON válido.',
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
      return generateDefaultFocusAreas(categoryScores);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return generateDefaultFocusAreas(categoryScores);
    }

    const parsed = JSON.parse(content);
    return parsed.focusAreas || generateDefaultFocusAreas(categoryScores);
  } catch (error) {
    console.error('[ExecutivoLideranca] Error generating focus areas:', error);
    return generateDefaultFocusAreas(categoryScores);
  }
}

function generateDefaultFocusAreas(categoryScores: CategoryRiskScore[]): FocusArea[] {
  // Ordenar por risco (maior risco primeiro)
  const sorted = [...categoryScores].sort((a, b) => a.avgScore - b.avgScore);

  return sorted.slice(0, 3).map((cat) => ({
    area: cat.categoryName,
    why: getDefaultWhy(cat),
    action: getDefaultAction(cat.category),
  }));
}

function getDefaultWhy(cat: CategoryRiskScore): string {
  if (cat.riskLevel === 'high') {
    return `Score de ${cat.avgScore.toFixed(2)}/5.0 indica risco elevado que pode impactar produtividade e retenção.`;
  }
  if (cat.riskLevel === 'medium') {
    return `Score de ${cat.avgScore.toFixed(2)}/5.0 sinaliza oportunidade de melhoria antes de se tornar crítico.`;
  }
  return `Score de ${cat.avgScore.toFixed(2)}/5.0 representa ponto forte a ser mantido e celebrado.`;
}

function getDefaultAction(category: string): string {
  const actions: Record<string, string> = {
    demands_and_pace: 'Revisar alocação de demandas e realizar sessões de priorização com equipes',
    autonomy_clarity_change: 'Implementar comunicação estruturada sobre mudanças e expectativas',
    leadership_recognition: 'Desenvolver programa de feedback contínuo e reconhecimento',
    relationships_communication: 'Criar fóruns de diálogo e resolução de conflitos',
    work_life_health: 'Avaliar políticas de flexibilidade e programas de bem-estar',
    violence_harassment: 'Reforçar treinamento de respeito e canais de denúncia',
    anchors: 'Monitorar indicadores de satisfação e intenção de permanência',
  };
  return actions[category] || 'Investigar causas raiz e desenvolver plano de ação específico';
}

// ==========================================
// Geração de Risk Signals
// ==========================================

function generateRiskSignals(categoryScores: CategoryRiskScore[], themes: NLPTheme[]): RiskSignal[] {
  const signals: RiskSignal[] = [];

  // Sinais baseados em categorias de alto risco
  for (const cat of categoryScores) {
    if (cat.riskLevel === 'high') {
      signals.push({
        category: cat.categoryName,
        signal: `Score crítico de ${cat.avgScore.toFixed(2)}/5.0 requer ação imediata`,
        severity: 'critical',
      });
    } else if (cat.riskLevel === 'medium' && cat.avgScore < 3.0) {
      signals.push({
        category: cat.categoryName,
        signal: `Score de ${cat.avgScore.toFixed(2)}/5.0 em tendência de queda`,
        severity: 'alert',
      });
    }
  }

  // Sinais baseados em temas negativos
  const negativeThemes = themes.filter((t) => t.sentiment === 'negative');
  for (const theme of negativeThemes.slice(0, 2)) {
    if (theme.percentage >= 20) {
      signals.push({
        category: 'Voz do Colaborador',
        signal: `${theme.theme}: ${theme.count} menções (${theme.percentage}%)`,
        severity: theme.percentage >= 30 ? 'alert' : 'attention',
      });
    }
  }

  // Se não houver sinais críticos, adicionar sinal de atenção geral
  if (signals.length === 0) {
    signals.push({
      category: 'Monitoramento',
      signal: 'Indicadores dentro de parâmetros aceitáveis - manter acompanhamento regular',
      severity: 'attention',
    });
  }

  return signals.slice(0, 5);
}

// ==========================================
// Geração de Roteiro de Conversa com IA
// ==========================================

const SCRIPT_PROMPT = `Crie um roteiro de conversa para líderes discutirem os resultados da pesquisa com suas equipes.

CONTEXTO:
- Principais áreas de foco: {focusAreas}
- Sinais de risco: {riskSignals}

O roteiro deve incluir:
1. Abertura (como iniciar a conversa)
2. 3-4 perguntas-chave para discussão
3. Orientação de encerramento

Responda APENAS com JSON válido:
{
  "opening": "Texto de abertura da conversa",
  "keyQuestions": [
    "Pergunta 1",
    "Pergunta 2",
    "Pergunta 3"
  ],
  "closingGuidance": "Orientação para encerramento"
}`;

async function generateConversationScript(
  focusAreas: FocusArea[],
  riskSignals: RiskSignal[]
): Promise<ConversationScript> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return getDefaultScript(focusAreas);
  }

  try {
    const focusAreasText = focusAreas.map((f) => f.area).join(', ');
    const riskSignalsText = riskSignals.map((r) => `${r.category}: ${r.signal}`).join('; ');

    const prompt = SCRIPT_PROMPT
      .replace('{focusAreas}', focusAreasText)
      .replace('{riskSignals}', riskSignalsText);

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
            content: 'Você é um especialista em comunicação organizacional e liderança. Responda apenas com JSON válido.',
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
      return getDefaultScript(focusAreas);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return getDefaultScript(focusAreas);
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('[ExecutivoLideranca] Error generating script:', error);
    return getDefaultScript(focusAreas);
  }
}

function getDefaultScript(focusAreas: FocusArea[]): ConversationScript {
  const areas = focusAreas.map((f) => f.area).join(', ');

  return {
    opening: `Quero compartilhar com vocês os resultados da nossa última pesquisa organizacional. Agradeço a participação de todos - suas respostas são fundamentais para construirmos um ambiente de trabalho melhor. Vamos conversar sobre o que aprendemos e como podemos evoluir juntos.`,
    keyQuestions: [
      `Os resultados apontaram oportunidades em ${areas}. Vocês reconhecem esses pontos? O que contribui para essa percepção?`,
      'Quais são as barreiras que vocês enfrentam no dia a dia que poderíamos trabalhar para remover?',
      'Se pudéssemos melhorar uma coisa nos próximos 30 dias, o que seria mais impactante para vocês?',
      'Como posso apoiá-los melhor como líder? O que posso fazer diferente?',
    ],
    closingGuidance: 'Agradeça as contribuições, resuma os principais pontos levantados e comprometa-se com ações concretas. Estabeleça um prazo para retorno sobre o progresso (sugestão: 2-3 semanas). Reforce que a porta está aberta para conversas individuais.',
  };
}

// ==========================================
// Gerar Relatório Executivo Liderança
// ==========================================

export async function generateExecutivoLiderancaReport(
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

    // Gerar componentes do relatório com IA
    const [pulseOfPeriod, topFocusAreas] = await Promise.all([
      generatePulseWithAI(categoryScores, allThemes, uniqueParticipants, responseRate),
      generateFocusAreasWithAI(categoryScores),
    ]);

    // Gerar sinais de risco
    const riskSignals = generateRiskSignals(categoryScores, allThemes);

    // Gerar roteiro de conversa
    const teamConversationScript = await generateConversationScript(topFocusAreas, riskSignals);

    // Construir relatório
    const report: ExecutivoLiderancaReport = {
      metadata: {
        type: 'executivo_lideranca',
        title: `Relatório Executivo - ${assessment.title}`,
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
      pulseOfPeriod,
      topFocusAreas,
      riskSignals,
      teamConversationScript,
    };

    // Salvar relatório
    const generationTimeMs = Date.now() - startTime;
    const reportId = await saveReport({
      assessmentId,
      organizationId: assessment.organization_id,
      reportType: 'executivo_lideranca',
      title: report.metadata.title,
      content: {
        metadata: report.metadata,
        sections: [
          { id: 'pulse', title: 'Pulse do Período', type: 'narrative', content: report.pulseOfPeriod },
          { id: 'focus', title: 'Top 3 Áreas de Foco', type: 'action_items', content: report.topFocusAreas },
          { id: 'risks', title: 'Sinais de Risco', type: 'metrics', content: report.riskSignals },
          { id: 'script', title: 'Roteiro de Conversa', type: 'narrative', content: report.teamConversationScript },
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
          { id: 'pulse', title: 'Pulse do Período', type: 'narrative', content: report.pulseOfPeriod },
          { id: 'focus', title: 'Top 3 Áreas de Foco', type: 'action_items', content: report.topFocusAreas },
          { id: 'risks', title: 'Sinais de Risco', type: 'metrics', content: report.riskSignals },
          { id: 'script', title: 'Roteiro de Conversa', type: 'narrative', content: report.teamConversationScript },
        ],
      },
    };

  } catch (error) {
    console.error('[ExecutivoLideranca] Error generating report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar relatório',
    };
  }
}
