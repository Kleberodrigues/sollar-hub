// Types and constants for Action Plans
// Separated from actions.ts because "use server" files can only export async functions

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
