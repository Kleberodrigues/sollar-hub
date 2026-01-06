'use server';

/**
 * Base Report Actions
 *
 * Utilitários compartilhados para geração de relatórios
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type {
  ReportType,
  ReportStatus,
  AssessmentDataForReport,
  ReportContent,
} from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ==========================================
// Verificação de Encerramento do Assessment
// ==========================================

export interface AssessmentClosureCheck {
  isClosed: boolean;
  reason?: 'all_responses' | 'expired' | 'manual' | 'not_closed';
  message?: string;
  canGenerateReport: boolean;
}

export async function checkAssessmentClosed(
  assessmentId: string
): Promise<AssessmentClosureCheck> {
  const supabase = await createClient();

  // Buscar assessment com contagem de participantes e respostas
  const { data: assessment, error } = await (supabase
    .from('assessments')
    .select(`
      id,
      title,
      start_date,
      end_date,
      status,
      organization_id
    `)
    .eq('id', assessmentId)
    .single() as any);

  if (error || !assessment) {
    return {
      isClosed: false,
      reason: 'not_closed',
      message: 'Assessment não encontrado',
      canGenerateReport: false,
    };
  }

  // Buscar participantes importados
  const { count: participantCount } = await (supabase
    .from('assessment_participants')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId) as any);

  // Buscar respostas únicas
  const { data: responses } = await (supabase
    .from('responses')
    .select('anonymous_id')
    .eq('assessment_id', assessmentId) as any);

  const uniqueResponders = new Set(responses?.map((r: any) => r.anonymous_id) || []).size;
  const expectedParticipants = participantCount || 0;

  // Verificar se expirou
  const isExpired = new Date(assessment.end_date) < new Date();

  // Verificar se todos responderam (se há participantes definidos)
  const allResponded =
    expectedParticipants > 0 && uniqueResponders >= expectedParticipants;

  // Status manual
  const isManualClosed = assessment.status === 'completed';

  if (isManualClosed) {
    return {
      isClosed: true,
      reason: 'manual',
      message: 'Assessment encerrado manualmente',
      canGenerateReport: true,
    };
  }

  if (isExpired) {
    return {
      isClosed: true,
      reason: 'expired',
      message: 'Assessment encerrado por data limite',
      canGenerateReport: true,
    };
  }

  if (allResponded) {
    return {
      isClosed: true,
      reason: 'all_responses',
      message: 'Todos os participantes responderam',
      canGenerateReport: true,
    };
  }

  return {
    isClosed: false,
    reason: 'not_closed',
    message: `Aguardando respostas (${uniqueResponders}/${expectedParticipants || '?'})`,
    canGenerateReport: false,
  };
}

// ==========================================
// Buscar Dados do Assessment
// ==========================================

export async function getAssessmentData(
  assessmentId: string
): Promise<AssessmentDataForReport | null> {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar assessment
  const { data: assessment, error: assessmentError } = await (supabase
    .from('assessments')
    .select(
      `
      id,
      title,
      start_date,
      end_date,
      status,
      organization_id,
      questionnaire_id,
      questionnaires (
        id,
        title,
        type
      )
    `
    )
    .eq('id', assessmentId)
    .single() as any);

  if (assessmentError || !assessment) {
    console.error('[getAssessmentData] Error:', assessmentError);
    return null;
  }

  // Buscar organização
  const { data: org } = await (supabase
    .from('organizations')
    .select('name')
    .eq('id', assessment.organization_id)
    .single() as any);

  // Buscar contagem de respostas
  const { data: responses } = await (supabase
    .from('responses')
    .select('anonymous_id')
    .eq('assessment_id', assessmentId) as any);

  const uniqueResponders = new Set(responses?.map((r: any) => r.anonymous_id) || []).size;

  // Buscar participantes esperados
  const { count: participantCount } = await (supabase
    .from('assessment_participants')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId) as any);

  const expectedParticipants = participantCount || uniqueResponders;
  const responseRate =
    expectedParticipants > 0
      ? Math.round((uniqueResponders / expectedParticipants) * 100)
      : 100;

  // Verificar status de encerramento
  const closureCheck = await checkAssessmentClosed(assessmentId);

  // Determinar tipo do questionário
  const questionnaire = assessment.questionnaires as { type?: string } | null;
  const questionnaireType: 'nr1' | 'clima' =
    questionnaire?.type === 'clima' ? 'clima' : 'nr1';

  return {
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    organizationId: assessment.organization_id,
    organizationName: org?.name || 'Organização',
    questionnaireType,
    startDate: assessment.start_date,
    endDate: assessment.end_date,
    totalParticipants: uniqueResponders,
    totalResponses: responses?.length || 0,
    responseRate,
    isClosed: closureCheck.isClosed,
    closureReason: closureCheck.reason === 'not_closed' ? undefined : closureCheck.reason,
  };
}

// ==========================================
// Salvar Relatório
// ==========================================

export interface SaveReportParams {
  assessmentId: string;
  organizationId: string;
  reportType: ReportType;
  title: string;
  content: ReportContent;
  status: ReportStatus;
  aiModel?: string;
  tokensUsed?: number;
  generationTimeMs?: number;
  errorMessage?: string;
}

export async function saveReport(params: SaveReportParams): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await (supabase
    .from('generated_reports')
    .insert({
      assessment_id: params.assessmentId,
      organization_id: params.organizationId,
      created_by: user.id,
      report_type: params.reportType,
      title: params.title,
      content: params.content,
      status: params.status,
      ai_model: params.aiModel,
      tokens_used: params.tokensUsed,
      generation_time_ms: params.generationTimeMs,
      error_message: params.errorMessage,
    } as any)
    .select('id')
    .single() as any);

  if (error) {
    console.error('[saveReport] Error:', error);
    return null;
  }

  return data?.id || null;
}

// ==========================================
// Buscar Relatórios Anteriores
// ==========================================

export interface GeneratedReport {
  id: string;
  reportType: ReportType;
  title: string;
  status: ReportStatus;
  createdAt: string;
  aiModel?: string;
}

export async function getReportHistory(
  assessmentId: string
): Promise<GeneratedReport[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase
    .from('generated_reports')
    .select('id, report_type, title, status, created_at, ai_model')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false }) as any);

  if (error) {
    console.error('[getReportHistory] Error:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    reportType: r.report_type as ReportType,
    title: r.title,
    status: r.status as ReportStatus,
    createdAt: r.created_at,
    aiModel: r.ai_model,
  }));
}

// ==========================================
// Buscar Relatório por ID
// ==========================================

export async function getReportById(
  reportId: string
): Promise<{ content: ReportContent; metadata: GeneratedReport } | null> {
  const supabase = await createClient();

  const { data, error } = await (supabase
    .from('generated_reports')
    .select('*')
    .eq('id', reportId)
    .single() as any);

  if (error || !data) {
    console.error('[getReportById] Error:', error);
    return null;
  }

  return {
    content: data.content as ReportContent,
    metadata: {
      id: data.id,
      reportType: data.report_type as ReportType,
      title: data.title,
      status: data.status as ReportStatus,
      createdAt: data.created_at,
      aiModel: data.ai_model,
    },
  };
}

// ==========================================
// Buscar Respostas para Análise
// ==========================================

export interface ResponseData {
  id: string;
  anonymousId: string;
  questionId: string;
  questionText: string;
  questionCategory: string;
  questionType: string;
  value: string | null;
  responseText: string | null;
  riskInverted: boolean;
}

export async function getResponsesForAnalysis(
  assessmentId: string,
  category?: string
): Promise<ResponseData[]> {
  const supabase = await createClient();

  const query = supabase
    .from('responses')
    .select(
      `
      id,
      anonymous_id,
      question_id,
      value,
      response_text,
      questions (
        id,
        text,
        category,
        type,
        risk_inverted
      )
    `
    )
    .eq('assessment_id', assessmentId) as any;

  if (category) {
    query = query.eq('questions.category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getResponsesForAnalysis] Error:', error);
    return [];
  }

  return (data || [])
    .filter((r: any) => r.questions)
    .map((r: any) => {
      const question = r.questions as {
        id: string;
        text: string;
        category: string;
        type: string;
        risk_inverted: boolean;
      };

      return {
        id: r.id,
        anonymousId: r.anonymous_id,
        questionId: r.question_id,
        questionText: question.text,
        questionCategory: question.category,
        questionType: question.type,
        value: r.value,
        responseText: r.response_text,
        riskInverted: question.risk_inverted || false,
      };
    });
}

// ==========================================
// Buscar Respostas Abertas para NLP
// ==========================================

export async function getOpenResponses(
  assessmentId: string,
  category?: string
): Promise<{ questionId: string; questionText: string; responses: string[] }[]> {
  const supabase = await createClient();

  const query = supabase
    .from('responses')
    .select(
      `
      question_id,
      response_text,
      questions (
        id,
        text,
        category,
        type
      )
    `
    )
    .eq('assessment_id', assessmentId)
    .not('response_text', 'is', null);

  const { data, error } = await (query as any);

  if (error) {
    console.error('[getOpenResponses] Error:', error);
    return [];
  }

  // Agrupar por pergunta
  const grouped: Record<string, { questionText: string; responses: string[] }> = {};

  for (const r of (data || []) as any[]) {
    const question = r.questions as { id: string; text: string; category: string; type: string } | null;

    if (!question) continue;
    if (question.type !== 'open_text') continue;
    if (category && question.category !== category) continue;
    if (!r.response_text?.trim()) continue;

    if (!grouped[question.id]) {
      grouped[question.id] = {
        questionText: question.text,
        responses: [],
      };
    }

    grouped[question.id].responses.push(r.response_text.trim());
  }

  return Object.entries(grouped).map(([questionId, data]) => ({
    questionId,
    questionText: data.questionText,
    responses: data.responses,
  }));
}

// ==========================================
// Calcular Score de Risco por Categoria
// ==========================================

export interface CategoryRiskScore {
  category: string;
  categoryName: string;
  avgScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  responseCount: number;
  questionCount: number;
}

export async function calculateCategoryRiskScores(
  assessmentId: string
): Promise<CategoryRiskScore[]> {
  const responses = await getResponsesForAnalysis(assessmentId);

  // Agrupar por categoria
  const categoryData: Record<
    string,
    { scores: number[]; questions: Set<string> }
  > = {};

  for (const r of responses) {
    if (r.questionType !== 'likert_scale') continue;

    const score = parseFloat(r.value || '0');
    if (isNaN(score)) continue;

    // Ajustar score se invertido (maior score = menor risco)
    const adjustedScore = r.riskInverted ? 6 - score : score;

    if (!categoryData[r.questionCategory]) {
      categoryData[r.questionCategory] = { scores: [], questions: new Set() };
    }

    categoryData[r.questionCategory].scores.push(adjustedScore);
    categoryData[r.questionCategory].questions.add(r.questionId);
  }

  // Labels das categorias
  const categoryLabels: Record<string, string> = {
    demands_and_pace: 'Exigências e Ritmo de Trabalho',
    autonomy_clarity_change: 'Autonomia, Clareza e Mudanças',
    leadership_recognition: 'Liderança e Reconhecimento',
    relationships_communication: 'Relações e Comunicação',
    work_life_health: 'Equilíbrio Trabalho-Vida e Saúde',
    violence_harassment: 'Violência e Assédio',
    anchors: 'Âncoras (Indicadores de Efeito)',
  };

  return Object.entries(categoryData).map(([category, data]) => {
    const avgScore =
      data.scores.length > 0
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : 0;

    // Determinar nível de risco (score baixo = alto risco)
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
}

// ==========================================
// Verificar Permissões
// ==========================================

export async function checkReportPermissions(
  assessmentId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, reason: 'Usuário não autenticado' };
  }

  // Buscar perfil do usuário
  const { data: profile } = await (supabase
    .from('user_profiles')
    .select('organization_id, role, is_super_admin')
    .eq('id', user.id)
    .single() as any);

  if (!profile) {
    return { allowed: false, reason: 'Perfil não encontrado' };
  }

  // Super admin pode tudo
  if (profile.is_super_admin) {
    return { allowed: true };
  }

  // Buscar assessment
  const { data: assessment } = await (supabase
    .from('assessments')
    .select('organization_id')
    .eq('id', assessmentId)
    .single() as any);

  if (!assessment) {
    return { allowed: false, reason: 'Assessment não encontrado' };
  }

  // Verificar se é da mesma organização
  if (assessment.organization_id !== profile.organization_id) {
    return { allowed: false, reason: 'Sem acesso a este assessment' };
  }

  // Verificar se é admin
  if (!['admin', 'responsavel_empresa'].includes(profile.role)) {
    return { allowed: false, reason: 'Apenas administradores podem gerar relatórios' };
  }

  return { allowed: true };
}
