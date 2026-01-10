/* eslint-disable no-console */
'use server';

/**
 * AI Action Plan Generation Actions
 *
 * Server actions para geração de plano de ação com IA
 * Usa OpenAI GPT-4.1-mini ou Anthropic Claude
 */

import { createClient } from '@/lib/supabase/server';
import { CATEGORY_LABELS } from '@/types';

export interface ActionItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  timeline: string;
  responsible: string;
  expectedImpact: string;
}

export interface AIActionPlanResult {
  success: boolean;
  actions?: ActionItem[];
  error?: string;
}

interface HighRiskCategory {
  category: string;
  score: number;
}

/**
 * Gera plano de ação usando IA (OpenAI ou Claude)
 */
export async function generateAIActionPlan(
  assessmentId: string,
  highRiskCategories: HighRiskCategory[]
): Promise<AIActionPlanResult> {
  console.log('[AI Action Plan] Starting generation for assessment:', assessmentId);
  console.log('[AI Action Plan] High risk categories:', highRiskCategories);

  const supabase = await createClient();

  // Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('[AI Action Plan] Auth error:', authError);
    return {
      success: false,
      error: 'Usuário não autenticado. Faça login novamente.',
    };
  }

  try {
    // Buscar dados do assessment e verificar se há respostas
    const assessmentData = await getAssessmentContext(assessmentId);
    console.log('[AI Action Plan] Assessment data:', assessmentData);

    // Verificar se há respostas suficientes para análise
    if (assessmentData.responseCount === 0) {
      console.log('[AI Action Plan] No responses found');
      return {
        success: false,
        error: 'INSUFFICIENT_DATA',
      };
    }

    // Verificar se API key está configurada
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    console.log('[AI Action Plan] OpenAI key configured:', !!openaiKey);
    console.log('[AI Action Plan] Anthropic key configured:', !!anthropicKey);

    if (openaiKey) {
      console.log('[AI Action Plan] Using OpenAI...');
      return await generateWithOpenAI(assessmentData, highRiskCategories, openaiKey);
    } else if (anthropicKey) {
      console.log('[AI Action Plan] Using Anthropic...');
      return await generateWithAnthropic(assessmentData, highRiskCategories, anthropicKey);
    } else {
      console.log('[AI Action Plan] No API keys, using template fallback...');
      // Fallback: gerar plano template-based
      return generateTemplateActionPlan(highRiskCategories);
    }
  } catch (error) {
    console.error('[AI Action Plan] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar plano de ação',
    };
  }
}

/**
 * Busca contexto do assessment
 */
async function getAssessmentContext(assessmentId: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment } = await (supabase
    .from('assessments')
    .select(`
      *,
      questionnaires (
        id,
        title
      )
    `)
    .eq('id', assessmentId)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase
    .from('organizations')
    .select('name, employee_count')
    .eq('id', assessment?.organization_id)
    .single() as any);

  // Contar respostas do assessment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: responseCount } = await (supabase
    .from('responses')
    .select('id', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId) as any);

  return {
    assessmentTitle: assessment?.title || 'Assessment',
    organizationName: org?.name || 'Organização',
    employeeCount: org?.employee_count || 0,
    responseCount: responseCount || 0,
  };
}

/**
 * Gera plano de ação usando OpenAI GPT-4o-mini
 */
async function generateWithOpenAI(
  assessmentData: { assessmentTitle: string; organizationName: string; employeeCount: number },
  highRiskCategories: HighRiskCategory[],
  apiKey: string
): Promise<AIActionPlanResult> {
  const prompt = buildActionPlanPrompt(assessmentData, highRiskCategories);
  console.log('[OpenAI] Sending request...');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor especialista em saúde ocupacional e riscos psicossociais (NR-1). Sempre responda em JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    console.log('[OpenAI] Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[OpenAI API] Error response:', error);
      console.log('[OpenAI] Falling back to template...');
      return generateTemplateActionPlan(highRiskCategories);
    }

    const result = await response.json();
    console.log('[OpenAI] Response received, choices:', result.choices?.length);
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.log('[OpenAI] No content in response, using template...');
      return generateTemplateActionPlan(highRiskCategories);
    }

    try {
      // Tentar extrair JSON do conteúdo
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('[OpenAI] No JSON found in content, using template...');
        return generateTemplateActionPlan(highRiskCategories);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const actions = parsed.actions || parsed;

      console.log('[OpenAI] Successfully parsed', Array.isArray(actions) ? actions.length : 0, 'actions');
      return {
        success: true,
        actions: Array.isArray(actions) ? actions.map((a: ActionItem, i: number) => ({
          ...a,
          id: a.id || `ai-${i + 1}`,
        })) : [],
      };
    } catch (parseError) {
      console.error('[OpenAI] JSON parse error:', parseError);
      return generateTemplateActionPlan(highRiskCategories);
    }
  } catch (fetchError) {
    console.error('[OpenAI] Fetch error:', fetchError);
    return generateTemplateActionPlan(highRiskCategories);
  }
}

/**
 * Gera plano de ação usando Anthropic Claude
 */
async function generateWithAnthropic(
  assessmentData: { assessmentTitle: string; organizationName: string; employeeCount: number },
  highRiskCategories: HighRiskCategory[],
  apiKey: string
): Promise<AIActionPlanResult> {
  const prompt = buildActionPlanPrompt(assessmentData, highRiskCategories);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
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
    return generateTemplateActionPlan(highRiskCategories);
  }

  const result = await response.json();
  const content = result.content?.[0]?.text;

  if (!content) {
    return generateTemplateActionPlan(highRiskCategories);
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateTemplateActionPlan(highRiskCategories);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const actions = parsed.actions || parsed;

    return {
      success: true,
      actions: Array.isArray(actions) ? actions.map((a: ActionItem, i: number) => ({
        ...a,
        id: a.id || `ai-${i + 1}`,
      })) : [],
    };
  } catch {
    return generateTemplateActionPlan(highRiskCategories);
  }
}

/**
 * Constrói o prompt para geração do plano de ação
 */
function buildActionPlanPrompt(
  assessmentData: { assessmentTitle: string; organizationName: string; employeeCount: number },
  highRiskCategories: HighRiskCategory[]
): string {
  return `Analise os dados abaixo e gere um plano de ação prático para mitigar os riscos psicossociais identificados.

CONTEXTO:
- Organização: ${assessmentData.organizationName}
- Assessment: ${assessmentData.assessmentTitle}
- Colaboradores: ${assessmentData.employeeCount || 'Não informado'}

ÁREAS DE ALTO RISCO IDENTIFICADAS:
${highRiskCategories.map(c => `- ${CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS] || c.category}: Score ${c.score.toFixed(2)}`).join('\n')}

Para cada área de risco, sugira ações específicas, práticas e mensuráveis.

Responda APENAS com um JSON válido no seguinte formato:
{
  "actions": [
    {
      "priority": "high|medium|low",
      "category": "Nome da categoria em português",
      "title": "Título curto da ação",
      "description": "Descrição detalhada do que fazer",
      "timeline": "Prazo sugerido (ex: 2-4 semanas)",
      "responsible": "Quem deve executar (ex: RH, Gestores)",
      "expectedImpact": "Impacto esperado (ex: Redução de 30% em sobrecarga)"
    }
  ]
}

Gere entre 3-8 ações, priorizando as de alto impacto.`;
}

/**
 * Mapeia nomes de categorias em português para chaves internas em inglês
 */
function mapCategoryToKey(category: string): string {
  const mapping: Record<string, string> = {
    // Português -> English keys
    'Demandas e Ritmo de Trabalho': 'demands_and_pace',
    'Demandas e Ritmo': 'demands_and_pace',
    'Gestão do Tempo e Sobrecarga': 'demands_and_pace',
    'demands_and_pace': 'demands_and_pace',

    'Autonomia, Clareza e Mudanças': 'autonomy_clarity_change',
    'Autonomia e Clareza': 'autonomy_clarity_change',
    'autonomy_clarity_change': 'autonomy_clarity_change',

    'Liderança e Reconhecimento': 'leadership_recognition',
    'leadership_recognition': 'leadership_recognition',

    'Relações, Clima e Comunicação': 'relationships_communication',
    'Relações e Comunicação': 'relationships_communication',
    'relationships_communication': 'relationships_communication',

    'Equilíbrio Trabalho–Vida e Saúde': 'work_life_health',
    'Equilíbrio Trabalho-Vida e Saúde': 'work_life_health',
    'Equilíbrio Vida-Trabalho': 'work_life_health',
    'work_life_health': 'work_life_health',

    'Violência, Assédio e Medo de Repressão': 'violence_harassment',
    'Violência e Assédio': 'violence_harassment',
    'violence_harassment': 'violence_harassment',

    'Âncoras (Satisfação, Saúde, Permanência)': 'anchors',
    'Âncoras': 'anchors',
    'Satisfação e Engajamento': 'anchors',
    'anchors': 'anchors',

    'Sugestões': 'suggestions',
    'suggestions': 'suggestions',
  };

  return mapping[category] || category;
}

/**
 * Gera plano de ação usando templates (fallback)
 */
function generateTemplateActionPlan(highRiskCategories: HighRiskCategory[]): AIActionPlanResult {
  console.log('[Template] High risk categories received:', highRiskCategories);

  const actionTemplates: Record<string, ActionItem[]> = {
    demands_and_pace: [
      {
        id: 't1',
        priority: 'high',
        category: 'Demandas e Ritmo',
        title: 'Revisão da distribuição de tarefas',
        description: 'Realizar análise da carga de trabalho por colaborador e redistribuir demandas de forma equilibrada.',
        timeline: '2-4 semanas',
        responsible: 'Gestores de Área',
        expectedImpact: 'Redução de 30% nas queixas de sobrecarga',
      },
      {
        id: 't2',
        priority: 'medium',
        category: 'Demandas e Ritmo',
        title: 'Implementar pausas programadas',
        description: 'Estabelecer política de pausas regulares durante a jornada de trabalho.',
        timeline: '1-2 semanas',
        responsible: 'RH',
        expectedImpact: 'Aumento de 20% na produtividade',
      },
    ],
    autonomy_clarity_change: [
      {
        id: 't3',
        priority: 'high',
        category: 'Autonomia e Clareza',
        title: 'Definir papéis e responsabilidades',
        description: 'Documentar e comunicar claramente as responsabilidades de cada função.',
        timeline: '3-4 semanas',
        responsible: 'Gestão + RH',
        expectedImpact: 'Redução de 40% em conflitos de papel',
      },
    ],
    leadership_recognition: [
      {
        id: 't4',
        priority: 'high',
        category: 'Liderança e Reconhecimento',
        title: 'Programa de feedback contínuo',
        description: 'Implementar ciclos regulares de feedback entre líderes e equipes.',
        timeline: '4-6 semanas',
        responsible: 'Liderança',
        expectedImpact: 'Aumento de 25% no engajamento',
      },
    ],
    relationships_communication: [
      {
        id: 't5',
        priority: 'medium',
        category: 'Relações e Comunicação',
        title: 'Workshops de comunicação',
        description: 'Realizar treinamentos sobre comunicação não-violenta e resolução de conflitos.',
        timeline: '4-8 semanas',
        responsible: 'RH + Consultoria',
        expectedImpact: 'Melhoria de 35% no clima organizacional',
      },
    ],
    work_life_health: [
      {
        id: 't6',
        priority: 'high',
        category: 'Equilíbrio Trabalho-Vida',
        title: 'Política de desconexão',
        description: 'Implementar política que limite comunicações fora do horário de trabalho.',
        timeline: '2-3 semanas',
        responsible: 'Diretoria + RH',
        expectedImpact: 'Redução de 50% em burnout',
      },
    ],
    violence_harassment: [
      {
        id: 't7',
        priority: 'high',
        category: 'Violência e Assédio',
        title: 'Canal de denúncias confidencial',
        description: 'Implementar ou fortalecer canal seguro para relatos de assédio.',
        timeline: '1-2 semanas',
        responsible: 'Compliance + RH',
        expectedImpact: '100% de cobertura em casos reportados',
      },
    ],
    anchors: [
      {
        id: 't8',
        priority: 'medium',
        category: 'Satisfação e Engajamento',
        title: 'Programa de reconhecimento',
        description: 'Implementar programa de reconhecimento para valorizar contribuições dos colaboradores.',
        timeline: '4-6 semanas',
        responsible: 'RH + Liderança',
        expectedImpact: 'Aumento de 20% na satisfação geral',
      },
      {
        id: 't9',
        priority: 'medium',
        category: 'Satisfação e Engajamento',
        title: 'Pesquisa de clima aprofundada',
        description: 'Realizar entrevistas ou grupos focais para entender fatores de insatisfação.',
        timeline: '2-3 semanas',
        responsible: 'RH',
        expectedImpact: 'Identificação de 80% das causas de insatisfação',
      },
    ],
  };

  const actions: ActionItem[] = [];
  let idCounter = 1;

  highRiskCategories.forEach(({ category }) => {
    // Mapear nome da categoria para chave do template
    const categoryKey = mapCategoryToKey(category);
    console.log(`[Template] Category "${category}" mapped to key "${categoryKey}"`);

    const categoryActions = actionTemplates[categoryKey] || [];
    console.log(`[Template] Found ${categoryActions.length} template actions for "${categoryKey}"`);

    categoryActions.forEach(action => {
      actions.push({
        ...action,
        id: `action-${idCounter++}`,
      });
    });
  });

  console.log(`[Template] Total actions generated: ${actions.length}`);

  if (actions.length === 0) {
    actions.push({
      id: 'default',
      priority: 'low',
      category: 'Geral',
      title: 'Manter monitoramento contínuo',
      description: 'Continuar acompanhando indicadores e realizando pesquisas periódicas.',
      timeline: 'Contínuo',
      responsible: 'RH',
      expectedImpact: 'Manutenção dos níveis atuais',
    });
  }

  return {
    success: true,
    actions,
  };
}
