/**
 * Event types and payloads for n8n webhook integration
 */

// ============================================
// Event Type Definitions
// ============================================

export type SollarEventType =
  // Diagnostic/Assessment events
  | "diagnostic.created"
  | "diagnostic.activated"
  | "diagnostic.response_received"
  | "diagnostic.completed"
  | "diagnostic.reminder"
  | "diagnostic.deactivated"
  // Participant events
  | "participants.imported"
  | "participants.email_requested"
  // Risk events
  | "risk.threshold.exceeded"
  | "risk.report.generated"
  // User events
  | "user.invited"
  | "user.joined"
  | "user.removed"
  // Billing events
  | "subscription.created"
  | "subscription.upgraded"
  | "subscription.downgraded"
  | "subscription.canceled"
  | "subscription.renewed"
  | "payment.succeeded"
  | "payment.failed"
  // Organization events
  | "organization.created"
  | "organization.updated";

// ============================================
// Base Event Payload
// ============================================

export interface SollarEventPayload<T = Record<string, unknown>> {
  event: SollarEventType;
  timestamp: string;
  organization_id: string;
  data: T;
  metadata?: {
    triggered_by?: string;
    source?: string;
    version?: string;
    environment?: "development" | "staging" | "production";
  };
}

// ============================================
// Diagnostic Event Payloads
// ============================================

export interface DiagnosticCreatedPayload {
  diagnostic_id: string;
  title: string;
  questionnaire_id: string;
  questionnaire_title: string;
  created_by: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DiagnosticActivatedPayload {
  diagnostic_id: string;
  title: string;
  public_url: string;
  target_departments: string[];
  target_participant_count: number;
  start_date: string;
  end_date: string;
  created_by: {
    name: string;
    email: string;
  };
}

export interface DiagnosticResponseReceivedPayload {
  diagnostic_id: string;
  diagnostic_title: string;
  response_count: number;
  total_expected: number;
  completion_rate: number;
  last_response_at: string;
  anonymous_id: string;
}

export interface DiagnosticCompletedPayload {
  diagnostic_id: string;
  title: string;
  total_responses: number;
  total_participants: number;
  completion_rate: number;
  duration_days: number;
  started_at: string;
  completed_at: string;
}

export interface DiagnosticReminderPayload {
  diagnostic_id: string;
  title: string;
  pending_count: number;
  days_remaining: number;
  end_date: string;
  public_url: string;
}

// ============================================
// Risk Event Payloads
// ============================================

export interface RiskThresholdExceededPayload {
  diagnostic_id: string;
  diagnostic_title: string;
  category: string;
  category_name: string;
  current_score: number;
  threshold: number;
  risk_level: "medium" | "high" | "critical";
  affected_questions: number;
  total_responses: number;
  recommendation: string;
}

export interface RiskReportGeneratedPayload {
  diagnostic_id: string;
  diagnostic_title: string;
  report_url: string;
  report_type: "pdf" | "csv" | "xlsx";
  summary: {
    total_participants: number;
    completion_rate: number;
    high_risk_categories: string[];
    overall_risk_level: "low" | "medium" | "high";
  };
  generated_by: {
    id: string;
    name: string;
    email: string;
  };
}

// ============================================
// Participant Event Payloads
// ============================================

export interface ParticipantsImportedPayload {
  assessment_id: string;
  assessment_title: string;
  organization_id: string;
  organization_name?: string;
  participants: Array<{
    id: string;
    email: string;
    name: string;
    department?: string;
    role?: string;
  }>;
  total_count: number;
  public_url: string;
  imported_by: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ParticipantsEmailRequestedPayload {
  assessment_id: string;
  assessment_title: string;
  organization_id: string;
  participant_ids: string[];
  public_url: string;
  requested_by: {
    id: string;
    name: string;
    email: string;
  };
}

// ============================================
// User Event Payloads
// ============================================

export interface UserInvitedPayload {
  email: string;
  organization_name: string;
  organization_id: string;
  role: "admin" | "member";
  invited_by: {
    id: string;
    name: string;
    email: string;
  };
  invite_url: string;
}

export interface UserJoinedPayload {
  user_id: string;
  user_name: string;
  user_email: string;
  organization_name: string;
  role: "admin" | "member";
  joined_at: string;
}

// ============================================
// Billing Event Payloads
// ============================================

export interface SubscriptionCreatedPayload {
  subscription_id: string;
  plan: "free" | "pro" | "enterprise";
  billing_interval: "monthly" | "yearly";
  amount_cents: number;
  currency: string;
  customer_email: string;
  trial_end?: string;
}

export interface SubscriptionChangedPayload {
  subscription_id: string;
  old_plan: "free" | "pro" | "enterprise";
  new_plan: "free" | "pro" | "enterprise";
  effective_date: string;
  reason?: string;
}

export interface SubscriptionCanceledPayload {
  subscription_id: string;
  plan: "free" | "pro" | "enterprise";
  canceled_at: string;
  effective_end_date: string;
  reason?: string;
}

export interface PaymentSucceededPayload {
  invoice_id: string;
  amount_cents: number;
  currency: string;
  plan: "pro" | "enterprise";
  invoice_url?: string;
  receipt_url?: string;
}

export interface PaymentFailedPayload {
  invoice_id: string;
  amount_cents: number;
  currency: string;
  plan: "pro" | "enterprise";
  failure_reason: string;
  next_retry_at?: string;
}

// ============================================
// Webhook Event Record (Database)
// ============================================

export interface WebhookEventRecord {
  id: string;
  organization_id: string | null;
  event_type: SollarEventType;
  payload: SollarEventPayload;
  status: "pending" | "sent" | "failed" | "delivered";
  attempts: number;
  last_attempt_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Dispatch Options
// ============================================

export interface DispatchOptions<T = Record<string, unknown>> {
  organizationId: string;
  eventType: SollarEventType;
  data: T;
  metadata?: {
    triggered_by?: string;
    source?: string;
  };
}

export interface DispatchResult {
  success: boolean;
  eventId?: string;
  error?: string;
}
