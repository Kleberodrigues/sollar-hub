'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ActionPlanStatus = 'pending' | 'in_progress' | 'delayed' | 'completed';

export type RiskBlock =
  | 'demands_and_pace'
  | 'autonomy_clarity_change'
  | 'leadership_recognition'
  | 'relationships_communication'
  | 'work_life_health'
  | 'violence_harassment';

export interface ActionPlan {
  id: string;
  organization_id: string;
  assessment_id: string | null;
  title: string;
  description: string | null;
  responsible: string | null;
  deadline: string | null;
  status: ActionPlanStatus;
  risk_block: RiskBlock | null;
  comments: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanInput {
  title: string;
  description?: string;
  responsible?: string;
  deadline?: string;
  status?: ActionPlanStatus;
  risk_block?: RiskBlock;
  comments?: string;
  assessment_id?: string;
}

export const RISK_BLOCK_LABELS: Record<RiskBlock, string> = {
  demands_and_pace: 'Demanda e Ritmo',
  autonomy_clarity_change: 'Autonomia e Clareza',
  leadership_recognition: 'Liderança e Reconhecimento',
  relationships_communication: 'Relações e Comunicação',
  work_life_health: 'Equilíbrio e Saúde',
  violence_harassment: 'Violência e Assédio',
};

export const STATUS_LABELS: Record<ActionPlanStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  delayed: 'Atrasada',
  completed: 'Concluída',
};

export async function getActionPlans(assessmentId?: string): Promise<ActionPlan[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get user's organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single() as any);

  if (!profile?.organization_id) {
    redirect('/onboarding');
  }

  let query = supabase
    .from('action_plans')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (assessmentId) {
    query = query.eq('assessment_id', assessmentId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (query as any);

  if (error) {
    console.error('[ActionPlans] Error fetching:', error);
    return [];
  }

  return data || [];
}

export async function createActionPlan(input: ActionPlanInput): Promise<{ success: boolean; error?: string; data?: ActionPlan }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Não autenticado' };
  }

  // Get user's organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single() as any);

  if (!profile?.organization_id) {
    return { success: false, error: 'Organização não encontrada' };
  }

  if (!['admin', 'manager'].includes(profile.role)) {
    return { success: false, error: 'Sem permissão para criar ações' };
  }

  const insertData = {
    organization_id: profile.organization_id,
    title: input.title,
    description: input.description || null,
    responsible: input.responsible || null,
    deadline: input.deadline || null,
    status: input.status || 'pending',
    risk_block: input.risk_block || null,
    comments: input.comments || null,
    assessment_id: input.assessment_id || null,
    created_by: user.id,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('action_plans')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[ActionPlans] Error creating:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/action-plan');
  return { success: true, data };
}

export async function updateActionPlan(
  id: string,
  input: Partial<ActionPlanInput>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Não autenticado' };
  }

  const updateData = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('action_plans')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('[ActionPlans] Error updating:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/action-plan');
  return { success: true };
}

export async function deleteActionPlan(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Não autenticado' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('action_plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[ActionPlans] Error deleting:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/action-plan');
  return { success: true };
}
