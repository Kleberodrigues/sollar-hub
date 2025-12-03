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
export type UserRole = Database['public']['Enums']['user_role']
export type QuestionnaireStatus = Database['public']['Enums']['questionnaire_status']
export type QuestionType = Database['public']['Enums']['question_type']
export type RiskCategory = Database['public']['Enums']['risk_category']
export type AssessmentStatus = Database['public']['Enums']['assessment_status']
export type RiskLevel = Database['public']['Enums']['risk_level']

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

// Category Labels (PT-BR)
export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  demands: 'Demandas',
  control: 'Controle',
  support: 'Suporte',
  relationships: 'Relacionamentos',
  role: 'Papel',
  change: 'Mudança'
}

// Question Type Labels (PT-BR)
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Múltipla Escolha',
  likert_scale: 'Escala Likert',
  text: 'Texto',
  yes_no: 'Sim/Não'
}

// Helper function to calculate risk level from score
export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical.min) return 'critical'
  if (score >= RISK_THRESHOLDS.high.min) return 'high'
  if (score >= RISK_THRESHOLDS.medium.min) return 'medium'
  return 'low'
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
