import type { Database } from './database.types'

// Table Types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Department = Database['public']['Tables']['departments']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type DepartmentMember = Database['public']['Tables']['department_members']['Row']
export type Questionnaire = Database['public']['Tables']['questionnaires']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type Response = Database['public']['Tables']['responses']['Row']
export type RiskScore = Database['public']['Tables']['risk_scores']['Row']

// Insert Types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type DepartmentInsert = Database['public']['Tables']['departments']['Insert']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type QuestionnaireInsert = Database['public']['Tables']['questionnaires']['Insert']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type AssessmentInsert = Database['public']['Tables']['assessments']['Insert']
export type ResponseInsert = Database['public']['Tables']['responses']['Insert']
export type RiskScoreInsert = Database['public']['Tables']['risk_scores']['Insert']

// Update Types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type DepartmentUpdate = Database['public']['Tables']['departments']['Update']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type QuestionnaireUpdate = Database['public']['Tables']['questionnaires']['Update']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']
export type AssessmentUpdate = Database['public']['Tables']['assessments']['Update']
export type ResponseUpdate = Database['public']['Tables']['responses']['Update']
export type RiskScoreUpdate = Database['public']['Tables']['risk_scores']['Update']

// Enum Types
export type AppRole = Database['public']['Enums']['app_role']
export type UserRole = 'admin' | 'responsavel_empresa' | 'membro' // admin=super admin only, responsavel_empresa=company admin, membro=limited access
export type QuestionnaireStatus = Database['public']['Enums']['questionnaire_status']
export type QuestionnaireType = 'nr1_full' | 'pulse_monthly' | 'custom' // Not in DB, defined locally
export type QuestionType = Database['public']['Enums']['question_type']
export type RiskCategory = Database['public']['Enums']['risk_category']
export type AssessmentStatus = Database['public']['Enums']['assessment_status']
export type RiskLevel = Database['public']['Enums']['risk_level']
export type PlanType = Database['public']['Enums']['plan_type']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']

// Extended Types with Relations
export type QuestionnaireWithQuestions = Questionnaire & {
  questions: Question[]
}

export type AssessmentWithDetails = Assessment & {
  questionnaire: Questionnaire
  department?: Department
  risk_scores: RiskScore[]
  response_count?: number
}

export type DepartmentWithMembers = Department & {
  members: (DepartmentMember & {
    user: UserProfile
  })[]
  subdepartments?: Department[]
}

// Risk Level Thresholds
export const RISK_THRESHOLDS = {
  low: { min: 0, max: 40, color: '#517A06', label: 'Baixo' },
  medium: { min: 41, max: 70, color: '#C9A227', label: 'Médio' },
  high: { min: 71, max: 100, color: '#B14A2B', label: 'Alto' },
  critical: { min: 90, max: 100, color: '#9A3F24', label: 'Crítico' }
} as const

// Category Labels (PT-BR) - Sollar Model
export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  demands_and_pace: 'Demandas e Ritmo de Trabalho',
  autonomy_clarity_change: 'Autonomia, Clareza e Mudanças',
  leadership_recognition: 'Liderança e Reconhecimento',
  relationships_communication: 'Relações, Clima e Comunicação',
  work_life_health: 'Equilíbrio Trabalho–Vida e Saúde',
  violence_harassment: 'Violência, Assédio e Medo de Repressão',
  anchors: 'Âncoras (Satisfação, Saúde, Permanência)',
  suggestions: 'Sugestões'
}

// Ordered list of NR-1 risk assessment categories (6 main blocks)
export const RISK_CATEGORIES: RiskCategory[] = [
  'demands_and_pace',
  'autonomy_clarity_change',
  'leadership_recognition',
  'relationships_communication',
  'work_life_health',
  'violence_harassment',
]

// All categories including anchors and suggestions
export const ALL_CATEGORIES: RiskCategory[] = [
  ...RISK_CATEGORIES,
  'anchors',
  'suggestions',
]

// Questionnaire Type Labels (PT-BR)
export const QUESTIONNAIRE_TYPE_LABELS: Record<QuestionnaireType, string> = {
  nr1_full: 'NR-1 Completo',
  pulse_monthly: 'Pesquisa de Clima',
  custom: 'Personalizado'
}

// Question Type Labels (PT-BR)
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Múltipla Escolha',
  likert_scale: 'Escala Likert',
  text: 'Texto',
  yes_no: 'Sim/Não',
  textarea: 'Texto Longo',
  single_choice: 'Escolha Única',
  likert_5: 'Likert 5 Pontos',
  likert_7: 'Likert 7 Pontos',
  number: 'Número',
  date: 'Data'
}

// User Role Labels (PT-BR)
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Super Admin',
  responsavel_empresa: 'Responsável',
  membro: 'Membro'
}

// User Role Descriptions (PT-BR)
export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso total à plataforma (apenas proprietários)',
  responsavel_empresa: 'Acesso completo à empresa, pode convidar membros',
  membro: 'Acesso limitado (ver relatórios e dashboards)'
}

// Helper function to calculate risk level from score
export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical.min) return 'critical'
  if (score >= RISK_THRESHOLDS.high.min) return 'high'
  if (score >= RISK_THRESHOLDS.medium.min) return 'medium'
  return 'low'
}

// Simplified Question interface for components that don't need full Question type
export interface QuestionSummary {
  id: string;
  text: string;
  type: QuestionType | string;
  category: RiskCategory | string;
  order_index: number;
  is_required?: boolean;
  options?: string[] | null;
  scale_labels?: Record<string, string> | null;
}

// Helper function to get risk badge variant
export function getRiskBadgeVariant(level: RiskLevel): 'risk-low' | 'risk-medium' | 'risk-high' {
  switch (level) {
    case 'low':
      return 'risk-low'
    case 'medium':
      return 'risk-medium'
    case 'high':
    case 'critical':
      return 'risk-high'
  }
}
