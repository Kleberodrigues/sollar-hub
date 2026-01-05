'use server';

/**
 * NLP Actions for Report Generation
 *
 * Usa OpenAI para análise de texto das respostas abertas
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import type { NLPTheme, NLPAnalysisResult, BlockAnalysis, Sentiment } from './types';
import { getOpenResponses } from './base-report-actions';

// ==========================================
// Cache de Análises NLP
// ==========================================

interface CachedNLPAnalysis {
  themes: NLPTheme[];
  totalResponses: number;
  analyzedAt: string;
}

async function getCachedAnalysis(
  assessmentId: string,
  questionId: string
): Promise<CachedNLPAnalysis | null> {
  const supabase = await createClient();

  const { data } = await (supabase
    .from('report_nlp_analyses')
    .select('content, created_at')
    .eq('assessment_id', assessmentId)
    .eq('question_id', questionId)
    .eq('analysis_type', 'themes')
    .gt('expires_at', new Date().toISOString())
    .single() as any);

  if (data?.content) {
    return {
      ...data.content,
      analyzedAt: data.created_at,
    } as CachedNLPAnalysis;
  }

  return null;
}

async function cacheAnalysis(
  assessmentId: string,
  questionId: string,
  analysis: CachedNLPAnalysis
): Promise<void> {
  const supabase = await createClient();

  await (supabase.from('report_nlp_analyses').upsert(
    {
      assessment_id: assessmentId,
      question_id: questionId,
      analysis_type: 'themes',
      content: analysis,
      response_count: analysis.totalResponses,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
    } as any,
    {
      onConflict: 'assessment_id,question_id,analysis_type',
    }
  ) as any);
}

// ==========================================
// Análise de Temas com OpenAI
// ==========================================

const THEME_EXTRACTION_PROMPT = `Você é um especialista em análise qualitativa de pesquisas organizacionais.

Analise as seguintes respostas abertas de colaboradores e extraia os principais temas.

RESPOSTAS:
{responses}

Retorne APENAS um JSON válido no seguinte formato:
{
  "themes": [
    {
      "theme": "Nome curto do tema (máx 5 palavras)",
      "count": <número de respostas que mencionam este tema>,
      "percentage": <porcentagem do total>,
      "sentiment": "positive" | "neutral" | "negative",
      "examples": ["exemplo 1", "exemplo 2"]
    }
  ]
}

Regras:
- Identifique de 3 a 7 temas principais
- Agrupe temas similares
- O sentimento deve refletir o tom geral das menções
- Inclua até 2 exemplos representativos por tema (anonimizados se necessário)
- Ordene por frequência (maior primeiro)`;

export async function analyzeOpenResponses(params: {
  assessmentId: string;
  questionId: string;
  responses: string[];
}): Promise<NLPAnalysisResult> {
  const { assessmentId, questionId, responses } = params;

  // Verificar cache
  const cached = await getCachedAnalysis(assessmentId, questionId);
  if (cached) {
    return cached;
  }

  // Se não houver respostas, retornar vazio
  if (!responses || responses.length === 0) {
    return {
      themes: [],
      totalResponses: 0,
      analyzedAt: new Date().toISOString(),
    };
  }

  // Se houver poucas respostas, análise simplificada
  if (responses.length < 5) {
    const simpleAnalysis: NLPAnalysisResult = {
      themes: [
        {
          theme: 'Respostas coletadas',
          count: responses.length,
          percentage: 100,
          sentiment: 'neutral',
          examples: responses.slice(0, 2),
        },
      ],
      totalResponses: responses.length,
      analyzedAt: new Date().toISOString(),
    };

    await cacheAnalysis(assessmentId, questionId, simpleAnalysis);
    return simpleAnalysis;
  }

  // Chamar OpenAI para análise
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.warn('[NLP] OpenAI API key not configured');
    return fallbackAnalysis(responses);
  }

  try {
    const prompt = THEME_EXTRACTION_PROMPT.replace(
      '{responses}',
      responses.map((r, i) => `${i + 1}. "${r}"`).join('\n')
    );

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
            content:
              'Você é um analista de pesquisas organizacionais. Responda apenas com JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('[NLP] OpenAI error:', await response.text());
      return fallbackAnalysis(responses);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return fallbackAnalysis(responses);
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    const analysis: NLPAnalysisResult = {
      themes: parsed.themes || [],
      totalResponses: responses.length,
      analyzedAt: new Date().toISOString(),
    };

    // Cachear resultado
    await cacheAnalysis(assessmentId, questionId, analysis);

    return analysis;
  } catch (error) {
    console.error('[NLP] Error analyzing responses:', error);
    return fallbackAnalysis(responses);
  }
}

// ==========================================
// Análise de Múltiplas Perguntas
// ==========================================

export async function analyzeAllOpenQuestions(
  assessmentId: string,
  category?: string
): Promise<Record<string, NLPAnalysisResult>> {
  const openQuestions = await getOpenResponses(assessmentId, category);
  const results: Record<string, NLPAnalysisResult> = {};

  for (const q of openQuestions) {
    results[q.questionId] = await analyzeOpenResponses({
      assessmentId,
      questionId: q.questionId,
      responses: q.responses,
    });
  }

  return results;
}

// ==========================================
// Geração de Narrativa por Bloco
// ==========================================

const NARRATIVE_PROMPT = `Você é um especialista em saúde ocupacional e riscos psicossociais (NR-1).

Gere uma análise narrativa para o seguinte bloco de avaliação:

BLOCO: {blockName}
CATEGORIA: {blockCategory}
SCORE MÉDIO: {avgScore}/5.0
NÍVEL DE RISCO: {riskLevel}
TOTAL DE RESPOSTAS: {responseCount}

PERGUNTAS E SCORES:
{questionScores}

Escreva um parágrafo de 3-4 frases que:
1. Descreva a situação atual do bloco
2. Destaque os pontos de atenção
3. Sugira possíveis causas organizacionais (hipóteses)

Seja objetivo e profissional. Use linguagem acessível.
Responda APENAS com o texto da narrativa, sem formatação adicional.`;

export async function generateBlockNarrative(
  block: Partial<BlockAnalysis>
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return getDefaultNarrative(block);
  }

  try {
    const questionScores = block.questions
      ?.map((q) => `- ${q.questionText}: ${q.avgScore.toFixed(2)} (${q.riskLevel})`)
      .join('\n') || 'Sem dados de perguntas';

    const prompt = NARRATIVE_PROMPT
      .replace('{blockName}', block.blockName || 'Bloco')
      .replace('{blockCategory}', block.blockCategory || 'Categoria')
      .replace('{avgScore}', block.averageScore?.toFixed(2) || '0')
      .replace('{riskLevel}', translateRiskLevel(block.riskLevel))
      .replace('{responseCount}', String(block.responseCount || 0))
      .replace('{questionScores}', questionScores);

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
            content:
              'Você é um especialista em saúde ocupacional. Escreva narrativas profissionais e objetivas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return getDefaultNarrative(block);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || getDefaultNarrative(block);
  } catch (error) {
    console.error('[NLP] Error generating narrative:', error);
    return getDefaultNarrative(block);
  }
}

// ==========================================
// Geração de Hipóteses Organizacionais
// ==========================================

const HYPOTHESES_PROMPT = `Você é um especialista em psicologia organizacional e riscos psicossociais.

Com base nos seguintes dados de avaliação organizacional, gere hipóteses sobre possíveis causas dos problemas identificados:

DADOS:
{summaryData}

Gere de 3 a 5 hipóteses organizacionais que podem explicar os resultados.
Cada hipótese deve ser específica e acionável.

Responda APENAS com um JSON no formato:
{
  "hypotheses": [
    "Hipótese 1: descrição clara e específica",
    "Hipótese 2: descrição clara e específica"
  ]
}`;

export async function generateOrganizationalHypotheses(
  blocks: BlockAnalysis[]
): Promise<string[]> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return getDefaultHypotheses(blocks);
  }

  try {
    const summaryData = blocks
      .map(
        (b) =>
          `${b.blockName} (${translateRiskLevel(b.riskLevel)}): Score ${b.averageScore.toFixed(2)}/5.0`
      )
      .join('\n');

    const prompt = HYPOTHESES_PROMPT.replace('{summaryData}', summaryData);

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
            content: 'Você é um consultor organizacional. Responda apenas com JSON válido.',
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
      return getDefaultHypotheses(blocks);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return getDefaultHypotheses(blocks);
    }

    const parsed = JSON.parse(content);
    return parsed.hypotheses || getDefaultHypotheses(blocks);
  } catch (error) {
    console.error('[NLP] Error generating hypotheses:', error);
    return getDefaultHypotheses(blocks);
  }
}

// ==========================================
// Funções Auxiliares
// ==========================================

function translateRiskLevel(level?: string): string {
  switch (level) {
    case 'high':
      return 'Alto Risco';
    case 'medium':
      return 'Risco Médio';
    case 'low':
      return 'Baixo Risco';
    default:
      return 'Não avaliado';
  }
}

function fallbackAnalysis(responses: string[]): NLPAnalysisResult {
  // Análise básica sem IA
  const wordFrequency: Record<string, number> = {};

  for (const response of responses) {
    const words = response
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);

    for (const word of words) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  }

  // Pegar top 5 palavras
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const themes: NLPTheme[] = topWords.map(([word, count]) => ({
    theme: word.charAt(0).toUpperCase() + word.slice(1),
    count,
    percentage: Math.round((count / responses.length) * 100),
    sentiment: 'neutral' as Sentiment,
    examples: responses.filter((r) => r.toLowerCase().includes(word)).slice(0, 2),
  }));

  return {
    themes,
    totalResponses: responses.length,
    analyzedAt: new Date().toISOString(),
  };
}

function getDefaultNarrative(block: Partial<BlockAnalysis>): string {
  const level = block.riskLevel || 'medium';
  const name = block.blockName || 'Este bloco';

  if (level === 'high') {
    return `${name} apresenta indicadores preocupantes que requerem atenção imediata. Com score médio de ${block.averageScore?.toFixed(2) || 'N/A'}/5.0, há sinais de que os colaboradores enfrentam dificuldades significativas nesta área. Recomenda-se investigação aprofundada e implementação de medidas corretivas.`;
  }

  if (level === 'medium') {
    return `${name} apresenta resultados intermediários, com score de ${block.averageScore?.toFixed(2) || 'N/A'}/5.0. Embora não represente risco crítico, há espaço para melhorias. Sugere-se monitoramento contínuo e ações preventivas focadas nos pontos de menor pontuação.`;
  }

  return `${name} apresenta resultados satisfatórios, com score de ${block.averageScore?.toFixed(2) || 'N/A'}/5.0, indicando uma situação adequada nesta dimensão. Recomenda-se manter as práticas atuais e continuar o monitoramento periódico.`;
}

function getDefaultHypotheses(blocks: BlockAnalysis[]): string[] {
  const highRiskBlocks = blocks.filter((b) => b.riskLevel === 'high');
  const hypotheses: string[] = [];

  if (highRiskBlocks.some((b) => b.blockCategory === 'demands_and_pace')) {
    hypotheses.push(
      'A sobrecarga de trabalho pode estar relacionada a dimensionamento inadequado de equipes ou processos ineficientes.'
    );
  }

  if (highRiskBlocks.some((b) => b.blockCategory === 'leadership_recognition')) {
    hypotheses.push(
      'A percepção negativa sobre liderança pode indicar necessidade de desenvolvimento de gestores ou revisão de práticas de feedback.'
    );
  }

  if (highRiskBlocks.some((b) => b.blockCategory === 'relationships_communication')) {
    hypotheses.push(
      'Problemas de comunicação podem estar ligados a silos organizacionais ou falta de canais adequados de diálogo.'
    );
  }

  if (hypotheses.length === 0) {
    hypotheses.push(
      'Os indicadores gerais estão dentro de parâmetros aceitáveis, sugerindo ambiente organizacional equilibrado.',
      'Recomenda-se investigar oportunidades de melhoria contínua através de grupos focais ou entrevistas qualitativas.'
    );
  }

  return hypotheses;
}

// ==========================================
// Exportar Função de Geração de Insights
// ==========================================

export async function generateClimateInsights(params: {
  axes: { name: string; score: number }[];
  themes: NLPTheme[];
}): Promise<{ learnings: string[]; concerns: string[] }> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return {
      learnings: [
        'Manter práticas que estão funcionando bem',
        'Fortalecer comunicação entre equipes',
        'Valorizar feedback dos colaboradores',
      ],
      concerns: [
        'Monitorar indicadores que apresentam queda',
        'Investigar causas de insatisfação reportadas',
        'Acompanhar evolução ao longo do tempo',
      ],
    };
  }

  try {
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
            content:
              'Você é um especialista em clima organizacional. Responda apenas com JSON válido.',
          },
          {
            role: 'user',
            content: `Com base nos dados de pesquisa de clima:

EIXOS (score de 0-10):
${params.axes.map((a) => `- ${a.name}: ${a.score}`).join('\n')}

TEMAS DAS RESPOSTAS ABERTAS:
${params.themes.map((t) => `- ${t.theme} (${t.sentiment}): ${t.count} menções`).join('\n')}

Gere 3 aprendizados positivos e 3 pontos de atenção.

Responda com JSON:
{
  "learnings": ["aprendizado 1", "aprendizado 2", "aprendizado 3"],
  "concerns": ["preocupação 1", "preocupação 2", "preocupação 3"]
}`,
          },
        ],
        max_tokens: 512,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI request failed');
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    return JSON.parse(content);
  } catch {
    return {
      learnings: [
        'Identificar e replicar práticas de sucesso',
        'Valorizar pontos fortes da cultura',
        'Reconhecer esforços das equipes',
      ],
      concerns: [
        'Investigar áreas com menor satisfação',
        'Criar planos de ação para pontos críticos',
        'Estabelecer acompanhamento regular',
      ],
    };
  }
}
