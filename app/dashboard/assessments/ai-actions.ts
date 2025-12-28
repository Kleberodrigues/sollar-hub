"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PLANS, type PlanType } from "@/lib/stripe/config";

// ============================================
// Types
// ============================================

export type AIGenerationType = "analysis" | "action_plan";

export interface ActionItem {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  timeline: string;
  responsible: string;
  expectedImpact: string;
}

export interface AIAnalysis {
  overallRisk: "low" | "medium" | "high" | "critical";
  riskScore: number;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  categoryBreakdown: {
    category: string;
    score: number;
    status: "healthy" | "attention" | "critical";
    insight: string;
  }[];
}

export interface AIGeneration {
  id: string;
  assessment_id: string;
  type: AIGenerationType;
  title: string;
  content: AIAnalysis | ActionItem[];
  summary: string | null;
  is_edited: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AIUsage {
  analyses_count: number;
  action_plans_count: number;
  analyses_limit: number;
  action_plans_limit: number;
  period_start: string;
  period_end: string;
}

// ============================================
// Helper Functions
// ============================================

async function getUserContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado", user: null, profile: null, supabase };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("*, organizations(subscription_plan)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Perfil não encontrado", user, profile: null, supabase };
  }

  return { error: null, user, profile, supabase };
}

// ============================================
// Get AI Usage for Organization
// ============================================

export async function getAIUsage(): Promise<{
  usage: AIUsage | null;
  error?: string;
}> {
  const { error, profile, supabase } = await getUserContext();
  if (error || !profile) return { usage: null, error: error || "Erro ao buscar perfil" };

  const currentPlan = (profile.organizations?.subscription_plan as PlanType) || "free";
  const planLimits = PLANS[currentPlan].limits;

  // Get current period dates
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get or create usage record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: usage } = await (supabase as any)
    .from("ai_usage")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .gte("period_start", periodStart.toISOString().split("T")[0])
    .single();

  // If no record exists, return zeros
  if (!usage) {
    usage = {
      analyses_count: 0,
      action_plans_count: 0,
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
    };
  }

  return {
    usage: {
      analyses_count: usage.analyses_count || 0,
      action_plans_count: usage.action_plans_count || 0,
      analyses_limit: planLimits.aiAnalysesPerMonth,
      action_plans_limit: planLimits.aiActionPlansPerMonth,
      period_start: usage.period_start,
      period_end: usage.period_end,
    },
  };
}

// ============================================
// Check if can generate AI content
// ============================================

export async function canGenerateAI(type: AIGenerationType): Promise<{
  canGenerate: boolean;
  remaining: number;
  limit: number;
  error?: string;
}> {
  const { usage, error } = await getAIUsage();
  if (error || !usage) {
    return { canGenerate: false, remaining: 0, limit: 0, error };
  }

  const count = type === "analysis" ? usage.analyses_count : usage.action_plans_count;
  const limit = type === "analysis" ? usage.analyses_limit : usage.action_plans_limit;
  const remaining = Math.max(0, limit - count);
  const canGenerate = limit === Infinity || count < limit;

  return { canGenerate, remaining, limit };
}

// ============================================
// Get AI Generations for Assessment
// ============================================

export async function getAIGenerations(assessmentId: string): Promise<{
  generations: AIGeneration[];
  error?: string;
}> {
  const { error, profile, supabase } = await getUserContext();
  if (error || !profile) return { generations: [], error: error || "Erro" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error: fetchError } = await (supabase as any)
    .from("ai_generations")
    .select("*")
    .eq("assessment_id", assessmentId)
    .eq("organization_id", profile.organization_id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("[getAIGenerations] Error:", fetchError);
    return { generations: [], error: fetchError.message };
  }

  return { generations: data || [] };
}

// ============================================
// Generate AI Analysis
// ============================================

export async function generateAIAnalysis(assessmentId: string): Promise<{
  success: boolean;
  generation?: AIGeneration;
  error?: string;
}> {
  const { error, user, profile, supabase } = await getUserContext();
  if (error || !user || !profile) {
    return { success: false, error: error || "Erro de autenticação" };
  }

  // Check if can generate
  const { canGenerate, remaining } = await canGenerateAI("analysis");
  if (!canGenerate) {
    return {
      success: false,
      error: `Você atingiu o limite de análises IA deste mês. Restante: ${remaining}. Faça upgrade do seu plano para mais análises.`,
    };
  }

  // Get assessment data for analysis
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment } = await (supabase as any)
    .from("assessments")
    .select(`
      *,
      responses (
        id,
        answers
      )
    `)
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!assessment) {
    return { success: false, error: "Assessment não encontrado" };
  }

  // Simulate AI analysis (in production, call OpenAI/Claude API)
  await new Promise(resolve => setTimeout(resolve, 2000));

  const responseCount = assessment.responses?.length || 0;
  const analysisContent: AIAnalysis = generateMockAnalysis(responseCount);

  // Save to database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: generation, error: insertError } = await (supabase as any)
    .from("ai_generations")
    .insert({
      organization_id: profile.organization_id,
      assessment_id: assessmentId,
      user_id: user.id,
      type: "analysis",
      title: `Análise IA - ${new Date().toLocaleDateString("pt-BR")}`,
      content: analysisContent,
      summary: analysisContent.summary,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[generateAIAnalysis] Insert error:", insertError);
    return { success: false, error: insertError.message };
  }

  // Increment usage counter
  await incrementUsage(profile.organization_id, "analysis", supabase);

  revalidatePath(`/dashboard/assessments/${assessmentId}`);
  return { success: true, generation };
}

// ============================================
// Generate AI Action Plan
// ============================================

export async function generateAIActionPlan(
  assessmentId: string,
  highRiskCategories: { category: string; score: number }[]
): Promise<{
  success: boolean;
  generation?: AIGeneration;
  error?: string;
}> {
  const { error, user, profile, supabase } = await getUserContext();
  if (error || !user || !profile) {
    return { success: false, error: error || "Erro de autenticação" };
  }

  // Check if can generate
  const { canGenerate, remaining } = await canGenerateAI("action_plan");
  if (!canGenerate) {
    return {
      success: false,
      error: `Você atingiu o limite de planos de ação IA deste mês. Restante: ${remaining}. Faça upgrade do seu plano para mais planos.`,
    };
  }

  // Simulate AI generation (in production, call OpenAI/Claude API)
  await new Promise(resolve => setTimeout(resolve, 2000));

  const actions = generateMockActionPlan(highRiskCategories);

  // Save to database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: generation, error: insertError } = await (supabase as any)
    .from("ai_generations")
    .insert({
      organization_id: profile.organization_id,
      assessment_id: assessmentId,
      user_id: user.id,
      type: "action_plan",
      title: `Plano de Ação IA - ${new Date().toLocaleDateString("pt-BR")}`,
      content: actions,
      summary: `${actions.length} ações recomendadas`,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[generateAIActionPlan] Insert error:", insertError);
    return { success: false, error: insertError.message };
  }

  // Increment usage counter
  await incrementUsage(profile.organization_id, "action_plan", supabase);

  revalidatePath(`/dashboard/assessments/${assessmentId}`);
  return { success: true, generation };
}

// ============================================
// Update AI Generation (Edit)
// ============================================

export async function updateAIGeneration(
  generationId: string,
  content: AIAnalysis | ActionItem[],
  title?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const { error, user, profile, supabase } = await getUserContext();
  if (error || !user || !profile) {
    return { success: false, error: error || "Erro de autenticação" };
  }

  // Check role
  if (!["admin", "manager", "Responsável", "responsavel", "responsavel_empresa"].includes(profile.role)) {
    return { success: false, error: "Sem permissão para editar" };
  }

  // Get current version first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentGen } = await (supabase as any)
    .from("ai_generations")
    .select("version")
    .eq("id", generationId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("ai_generations")
    .update({
      content,
      title: title || undefined,
      is_edited: true,
      edited_at: new Date().toISOString(),
      edited_by: user.id,
      version: (currentGen?.version || 0) + 1,
    })
    .eq("id", generationId)
    .eq("organization_id", profile.organization_id);

  if (updateError) {
    console.error("[updateAIGeneration] Error:", updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

// ============================================
// Delete AI Generation
// ============================================

export async function deleteAIGeneration(generationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const { error, profile, supabase } = await getUserContext();
  if (error || !profile) {
    return { success: false, error: error || "Erro" };
  }

  // Soft delete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteError } = await (supabase as any)
    .from("ai_generations")
    .update({ status: "archived" })
    .eq("id", generationId)
    .eq("organization_id", profile.organization_id);

  if (deleteError) {
    console.error("[deleteAIGeneration] Error:", deleteError);
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}

// ============================================
// Helper: Increment Usage
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function incrementUsage(organizationId: string, type: AIGenerationType, supabase: any) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  // Try to get existing record
  const { data: existing } = await supabase
    .from("ai_usage")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("period_start", periodStart)
    .single();

  if (existing) {
    // Update existing
    const updates = type === "analysis"
      ? { analyses_count: existing.analyses_count + 1, total_generations: existing.total_generations + 1 }
      : { action_plans_count: existing.action_plans_count + 1, total_generations: existing.total_generations + 1 };

    await supabase
      .from("ai_usage")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    // Create new record
    await supabase
      .from("ai_usage")
      .insert({
        organization_id: organizationId,
        period_start: periodStart,
        period_end: periodEnd,
        analyses_count: type === "analysis" ? 1 : 0,
        action_plans_count: type === "action_plan" ? 1 : 0,
        total_generations: 1,
      });
  }
}

// ============================================
// Mock Data Generators (Replace with real AI)
// ============================================

function generateMockAnalysis(responseCount: number): AIAnalysis {
  const riskScore = Math.random() * 5;
  const overallRisk = riskScore < 2 ? "low" : riskScore < 3 ? "medium" : riskScore < 4 ? "high" : "critical";

  return {
    overallRisk,
    riskScore: Math.round(riskScore * 10) / 10,
    summary: `Baseado nas ${responseCount} respostas coletadas, identificamos um nível de risco ${
      overallRisk === "low" ? "baixo" : overallRisk === "medium" ? "moderado" : overallRisk === "high" ? "elevado" : "crítico"
    } para riscos psicossociais. As principais áreas de atenção são Demandas de Trabalho e Equilíbrio Vida-Trabalho.`,
    keyFindings: [
      "Sobrecarga de trabalho identificada em 35% dos respondentes",
      "Falta de clareza nas funções mencionada frequentemente",
      "Boa percepção de apoio entre colegas",
      "Necessidade de melhor comunicação com liderança",
    ],
    recommendations: [
      "Implementar programa de gestão de tempo",
      "Revisar descrições de cargos e responsabilidades",
      "Fortalecer canais de comunicação vertical",
      "Criar política de desconexão digital",
    ],
    categoryBreakdown: [
      { category: "Demandas de Trabalho", score: 3.5, status: "attention", insight: "Carga de trabalho acima do ideal" },
      { category: "Autonomia", score: 2.8, status: "healthy", insight: "Nível adequado de controle sobre tarefas" },
      { category: "Liderança", score: 3.2, status: "attention", insight: "Comunicação pode ser melhorada" },
      { category: "Relações", score: 2.2, status: "healthy", insight: "Bom clima entre colegas" },
      { category: "Equilíbrio", score: 3.8, status: "critical", insight: "Dificuldade de separar trabalho e vida pessoal" },
      { category: "Segurança", score: 1.8, status: "healthy", insight: "Ambiente percebido como seguro" },
    ],
  };
}

function generateMockActionPlan(highRiskCategories: { category: string; score: number }[]): ActionItem[] {
  const actionTemplates: Record<string, ActionItem[]> = {
    demands_and_pace: [
      {
        id: crypto.randomUUID(),
        priority: "high",
        category: "Demandas e Ritmo",
        title: "Revisão da distribuição de tarefas",
        description: "Realizar análise da carga de trabalho por colaborador e redistribuir demandas de forma equilibrada.",
        timeline: "2-4 semanas",
        responsible: "Gestores de Área",
        expectedImpact: "Redução de 30% nas queixas de sobrecarga",
      },
      {
        id: crypto.randomUUID(),
        priority: "medium",
        category: "Demandas e Ritmo",
        title: "Implementar pausas programadas",
        description: "Estabelecer política de pausas regulares durante a jornada de trabalho.",
        timeline: "1-2 semanas",
        responsible: "RH",
        expectedImpact: "Aumento de 20% na produtividade",
      },
    ],
    autonomy_clarity_change: [
      {
        id: crypto.randomUUID(),
        priority: "high",
        category: "Autonomia e Clareza",
        title: "Definir papéis e responsabilidades",
        description: "Documentar e comunicar claramente as responsabilidades de cada função.",
        timeline: "3-4 semanas",
        responsible: "Gestão + RH",
        expectedImpact: "Redução de 40% em conflitos de papel",
      },
    ],
    leadership_recognition: [
      {
        id: crypto.randomUUID(),
        priority: "high",
        category: "Liderança",
        title: "Programa de feedback contínuo",
        description: "Implementar ciclos regulares de feedback entre líderes e equipes.",
        timeline: "4-6 semanas",
        responsible: "Liderança",
        expectedImpact: "Aumento de 25% no engajamento",
      },
    ],
    relationships_communication: [
      {
        id: crypto.randomUUID(),
        priority: "medium",
        category: "Relações",
        title: "Workshops de comunicação",
        description: "Realizar treinamentos sobre comunicação não-violenta e resolução de conflitos.",
        timeline: "4-8 semanas",
        responsible: "RH + Consultoria",
        expectedImpact: "Melhoria de 35% no clima organizacional",
      },
    ],
    work_life_health: [
      {
        id: crypto.randomUUID(),
        priority: "high",
        category: "Equilíbrio",
        title: "Política de desconexão",
        description: "Implementar política que limite comunicações fora do horário de trabalho.",
        timeline: "2-3 semanas",
        responsible: "Diretoria + RH",
        expectedImpact: "Redução de 50% em burnout",
      },
    ],
    violence_harassment: [
      {
        id: crypto.randomUUID(),
        priority: "high",
        category: "Violência e Assédio",
        title: "Canal de denúncias confidencial",
        description: "Implementar ou fortalecer canal seguro para relatos de assédio.",
        timeline: "1-2 semanas",
        responsible: "Compliance + RH",
        expectedImpact: "100% de cobertura em casos reportados",
      },
    ],
  };

  const actions: ActionItem[] = [];
  highRiskCategories.forEach(({ category }) => {
    const categoryActions = actionTemplates[category] || [];
    actions.push(...categoryActions);
  });

  return actions.length > 0 ? actions : [
    {
      id: crypto.randomUUID(),
      priority: "low",
      category: "Geral",
      title: "Manter monitoramento contínuo",
      description: "Continuar acompanhando indicadores e realizando pesquisas periódicas.",
      timeline: "Contínuo",
      responsible: "RH",
      expectedImpact: "Manutenção dos níveis atuais",
    },
  ];
}
