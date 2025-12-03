export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer'
export type QuestionnaireStatus = 'draft' | 'published' | 'archived'
export type QuestionType = 'multiple_choice' | 'likert_scale' | 'text' | 'yes_no'
export type RiskCategory = 'demands' | 'control' | 'support' | 'relationships' | 'role' | 'change'
export type AssessmentStatus = 'active' | 'completed' | 'cancelled'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

// Database Tables
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          industry: string | null
          size: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          size?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          size?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          organization_id: string
          parent_id: string | null
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          parent_id?: string | null
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          parent_id?: string | null
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          organization_id: string | null
          full_name: string
          role: UserRole
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          full_name: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      department_members: {
        Row: {
          id: string
          department_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          department_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          user_id?: string
          created_at?: string
        }
      }
      questionnaires: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          status: QuestionnaireStatus
          version: number
          template_based_on: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          status?: QuestionnaireStatus
          version?: number
          template_based_on?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string | null
          status?: QuestionnaireStatus
          version?: number
          template_based_on?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          questionnaire_id: string
          text: string
          type: QuestionType
          category: RiskCategory
          order_number: number
          required: boolean
          options: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          text: string
          type: QuestionType
          category: RiskCategory
          order_number: number
          required?: boolean
          options?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          questionnaire_id?: string
          text?: string
          type?: QuestionType
          category?: RiskCategory
          order_number?: number
          required?: boolean
          options?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          questionnaire_id: string
          department_id: string | null
          organization_id: string
          title: string
          description: string | null
          status: AssessmentStatus
          start_date: string
          end_date: string
          anonymous: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          questionnaire_id: string
          department_id?: string | null
          organization_id: string
          title: string
          description?: string | null
          status?: AssessmentStatus
          start_date: string
          end_date: string
          anonymous?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          questionnaire_id?: string
          department_id?: string | null
          organization_id?: string
          title?: string
          description?: string | null
          status?: AssessmentStatus
          start_date?: string
          end_date?: string
          anonymous?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          assessment_id: string
          question_id: string
          anonymous_id: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_id: string
          anonymous_id: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_id?: string
          anonymous_id?: string
          value?: string
          created_at?: string
        }
      }
      risk_scores: {
        Row: {
          id: string
          assessment_id: string
          category: RiskCategory
          score: number
          level: RiskLevel
          respondent_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          category: RiskCategory
          score: number
          level: RiskLevel
          respondent_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          category?: RiskCategory
          score?: number
          level?: RiskLevel
          respondent_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      questionnaire_status: QuestionnaireStatus
      question_type: QuestionType
      risk_category: RiskCategory
      assessment_status: AssessmentStatus
      risk_level: RiskLevel
    }
  }
}
