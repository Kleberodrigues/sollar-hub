export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          anonymous: boolean | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          description: string | null
          end_date: string
          id: string
          organization_id: string
          questionnaire_id: string
          start_date: string
          status: Database["public"]["Enums"]["assessment_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          anonymous?: boolean | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          end_date: string
          id?: string
          organization_id: string
          questionnaire_id: string
          start_date: string
          status?: Database["public"]["Enums"]["assessment_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          anonymous?: boolean | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string
          id?: string
          organization_id?: string
          questionnaire_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assessment_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_participants: {
        Row: {
          id: string
          assessment_id: string
          organization_id: string
          email: string
          name: string
          department: string | null
          role: string | null
          status: Database["public"]["Enums"]["participant_status"]
          sent_at: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          organization_id: string
          email: string
          name: string
          department?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["participant_status"]
          sent_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          organization_id?: string
          email?: string
          name?: string
          department?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["participant_status"]
          sent_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_participants_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_participants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          organization_id: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          organization_id: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          organization_id?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number
          risk_weight: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number
          risk_weight?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
          risk_weight?: number
          updated_at?: string
        }
        Relationships: []
      }
      department_members: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_questions: {
        Row: {
          created_at: string
          custom_options: Json | null
          custom_question_text: string | null
          custom_question_type: string | null
          diagnostic_id: string
          id: string
          is_required: boolean
          order_index: number
          question_template_id: string | null
          weight: number
        }
        Insert: {
          created_at?: string
          custom_options?: Json | null
          custom_question_text?: string | null
          custom_question_type?: string | null
          diagnostic_id: string
          id?: string
          is_required?: boolean
          order_index?: number
          question_template_id?: string | null
          weight?: number
        }
        Update: {
          created_at?: string
          custom_options?: Json | null
          custom_question_text?: string | null
          custom_question_type?: string | null
          diagnostic_id?: string
          id?: string
          is_required?: boolean
          order_index?: number
          question_template_id?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_questions_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_questions_question_template_id_fkey"
            columns: ["question_template_id"]
            isOneToOne: false
            referencedRelation: "questions_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          completed_at: string | null
          completion_rate: number | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_anonymous: boolean
          organization_id: string
          reminder_frequency: string | null
          risk_level: string | null
          risk_score: number | null
          settings: Json | null
          start_date: string | null
          status: string
          target_departments: string[] | null
          title: string
          total_invited: number
          total_responses: number
          type: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_rate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_anonymous?: boolean
          organization_id: string
          reminder_frequency?: string | null
          risk_level?: string | null
          risk_score?: number | null
          settings?: Json | null
          start_date?: string | null
          status?: string
          target_departments?: string[] | null
          title: string
          total_invited?: number
          total_responses?: number
          type: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_rate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_anonymous?: boolean
          organization_id?: string
          reminder_frequency?: string | null
          risk_level?: string | null
          risk_score?: number | null
          settings?: Json | null
          start_date?: string | null
          status?: string
          target_departments?: string[] | null
          title?: string
          total_invited?: number
          total_responses?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          size: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          size?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          failure_message: string | null
          id: string
          invoice_pdf_url: string | null
          organization_id: string
          receipt_url: string | null
          status: string
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          failure_message?: string | null
          id?: string
          invoice_pdf_url?: string | null
          organization_id: string
          receipt_url?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          failure_message?: string | null
          id?: string
          invoice_pdf_url?: string | null
          organization_id?: string
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          introduction_text: string | null
          is_active: boolean
          is_locked: boolean | null
          lgpd_consent_text: string | null
          organization_id: string
          questionnaire_type: string | null
          status: Database["public"]["Enums"]["questionnaire_status"] | null
          template_based_on: string | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          introduction_text?: string | null
          is_active?: boolean
          is_locked?: boolean | null
          lgpd_consent_text?: string | null
          organization_id: string
          questionnaire_type?: string | null
          status?: Database["public"]["Enums"]["questionnaire_status"] | null
          template_based_on?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          introduction_text?: string | null
          is_active?: boolean
          is_locked?: boolean | null
          lgpd_consent_text?: string | null
          organization_id?: string
          questionnaire_type?: string | null
          status?: Database["public"]["Enums"]["questionnaire_status"] | null
          template_based_on?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaires_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaires_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          allow_skip: boolean | null
          category: Database["public"]["Enums"]["risk_category"] | null
          created_at: string | null
          id: string
          is_required: boolean
          is_strategic_open: boolean | null
          max_value: number | null
          min_value: number | null
          options: Json | null
          order_index: number
          question_text: string | null
          question_type: Database["public"]["Enums"]["question_type"] | null
          questionnaire_id: string
          required: boolean | null
          risk_inverted: boolean | null
          scale_labels: Json | null
          text: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          allow_skip?: boolean | null
          category?: Database["public"]["Enums"]["risk_category"] | null
          created_at?: string | null
          id?: string
          is_required?: boolean
          is_strategic_open?: boolean | null
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          order_index?: number
          question_text?: string | null
          question_type?: Database["public"]["Enums"]["question_type"] | null
          questionnaire_id: string
          required?: boolean | null
          risk_inverted?: boolean | null
          scale_labels?: Json | null
          text?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_skip?: boolean | null
          category?: Database["public"]["Enums"]["risk_category"] | null
          created_at?: string | null
          id?: string
          is_required?: boolean
          is_strategic_open?: boolean | null
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          order_index?: number
          question_text?: string | null
          question_type?: Database["public"]["Enums"]["question_type"] | null
          questionnaire_id?: string
          required?: boolean | null
          risk_inverted?: boolean | null
          scale_labels?: Json | null
          text?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_templates: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_nr1_standard: boolean
          is_required: boolean
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          tags: string[] | null
          updated_at: string
          weight: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_nr1_standard?: boolean
          is_required?: boolean
          options?: Json | null
          order_index?: number
          question_text: string
          question_type: string
          tags?: string[] | null
          updated_at?: string
          weight?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_nr1_standard?: boolean
          is_required?: boolean
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          tags?: string[] | null
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          anonymous_id: string
          assessment_id: string
          created_at: string | null
          id: string
          question_id: string
          response_text: string | null
          updated_at: string | null
          user_id: string | null
          value: string | null
        }
        Insert: {
          anonymous_id: string
          assessment_id: string
          created_at?: string | null
          id?: string
          question_id: string
          response_text?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: string | null
        }
        Update: {
          anonymous_id?: string
          assessment_id?: string
          created_at?: string | null
          id?: string
          question_id?: string
          response_text?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_scores: {
        Row: {
          assessment_id: string
          category: Database["public"]["Enums"]["risk_category"]
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["risk_level"]
          respondent_count: number
          score: number
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          category: Database["public"]["Enums"]["risk_category"]
          created_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["risk_level"]
          respondent_count: number
          score: number
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          category?: Database["public"]["Enums"]["risk_category"]
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["risk_level"]
          respondent_count?: number
          score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number
          created_at: string
          delivered_at: string | null
          error_message: string | null
          event_type: string
          id: string
          last_attempt_at: string | null
          organization_id: string | null
          payload: Json
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          last_attempt_at?: string | null
          organization_id?: string | null
          payload?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          organization_id?: string | null
          payload?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_diagnostic_risk_score: {
        Args: { diagnostic_uuid: string }
        Returns: number
      }
      can_insert_response: {
        Args: { _assessment_id: string; _question_id: string }
        Returns: boolean
      }
      can_user_manage: { Args: never; Returns: boolean }
      current_organization_id: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      generate_slug: { Args: { name: string }; Returns: string }
      get_company_by_slug: {
        Args: { company_slug: string }
        Returns: {
          description: string
          id: string
          name: string
          slug: string
        }[]
      }
      get_organization_plan: {
        Args: { org_id: string }
        Returns: Database["public"]["Enums"]["plan_type"]
      }
      get_user_department_ids: { Args: never; Returns: string[] }
      get_user_organization_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
      is_user_admin: { Args: never; Returns: boolean }
      org_has_feature: {
        Args: { feature: string; org_id: string }
        Returns: boolean
      }
      update_completion_rate: {
        Args: { diagnostic_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      assessment_status: "active" | "completed" | "cancelled"
      plan_type: "base" | "intermediario" | "avancado"
      question_type:
        | "multiple_choice"
        | "likert_scale"
        | "text"
        | "yes_no"
        | "textarea"
        | "single_choice"
        | "likert_5"
        | "likert_7"
        | "number"
        | "date"
      questionnaire_status: "draft" | "published" | "archived"
      risk_category:
        | "demands_and_pace"
        | "autonomy_clarity_change"
        | "leadership_recognition"
        | "relationships_communication"
        | "work_life_health"
        | "violence_harassment"
        | "anchors"
        | "suggestions"
      risk_level: "low" | "medium" | "high" | "critical"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
      user_role: "admin" | "manager" | "member" | "viewer"
      participant_status: "pending" | "sent" | "responded" | "bounced" | "opted_out"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      assessment_status: ["active", "completed", "cancelled"],
      plan_type: ["base", "intermediario", "avancado"],
      question_type: [
        "multiple_choice",
        "likert_scale",
        "text",
        "yes_no",
        "textarea",
        "single_choice",
        "likert_5",
        "likert_7",
        "number",
        "date",
      ],
      questionnaire_status: ["draft", "published", "archived"],
      risk_category: [
        "demands_and_pace",
        "autonomy_clarity_change",
        "leadership_recognition",
        "relationships_communication",
        "work_life_health",
        "violence_harassment",
        "anchors",
        "suggestions",
      ],
      risk_level: ["low", "medium", "high", "critical"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "unpaid",
        "incomplete",
        "incomplete_expired",
      ],
      user_role: ["admin", "manager", "member", "viewer"],
    },
  },
} as const
