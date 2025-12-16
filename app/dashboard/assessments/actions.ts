'use server';

/**
 * Server Actions for Assessment Operations
 * Includes event dispatching for n8n integration
 */

import { dispatchEvent } from '@/lib/events/dispatcher';
import { createClient } from '@/lib/supabase/server';

interface DispatchActivatedEventParams {
  organizationId: string;
  assessmentId: string;
  title: string;
  departmentIds: string[];
  allOrganization: boolean;
  startDate: string;
  endDate: string | null;
}

/**
 * Dispatch diagnostic.activated event to n8n
 * Called after assessment is created and activated
 */
export async function dispatchAssessmentActivated({
  organizationId,
  assessmentId,
  title,
  departmentIds,
  allOrganization,
  startDate,
  endDate,
}: DispatchActivatedEventParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const result = await dispatchEvent({
      organizationId,
      eventType: 'diagnostic.activated',
      data: {
        diagnostic_id: assessmentId,
        title,
        public_url: `${appUrl}/assess/${assessmentId}`,
        target_departments: departmentIds,
        all_organization: allOrganization,
        start_date: startDate,
        end_date: endDate,
      },
      metadata: {
        triggered_by: 'assessment-wizard',
      },
    });

    return result;
  } catch (error) {
    console.error('[AssessmentActions] Failed to dispatch activation event:', error);
    return { success: false, error: 'Failed to dispatch event' };
  }
}

interface DispatchCompletedEventParams {
  organizationId: string;
  assessmentId: string;
  title: string;
  totalResponses: number;
  completionRate: number;
  startDate: string;
  endDate: string;
}

/**
 * Dispatch diagnostic.completed event to n8n
 * Called when assessment status changes to completed
 */
export async function dispatchAssessmentCompleted({
  organizationId,
  assessmentId,
  title,
  totalResponses,
  completionRate,
  startDate,
  endDate,
}: DispatchCompletedEventParams) {
  try {
    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const result = await dispatchEvent({
      organizationId,
      eventType: 'diagnostic.completed',
      data: {
        diagnostic_id: assessmentId,
        title,
        total_responses: totalResponses,
        completion_rate: completionRate,
        duration_days: durationDays,
        started_at: startDate,
        completed_at: endDate,
      },
      metadata: {
        triggered_by: 'assessment-completion',
      },
    });

    return result;
  } catch (error) {
    console.error('[AssessmentActions] Failed to dispatch completion event:', error);
    return { success: false, error: 'Failed to dispatch event' };
  }
}

interface DispatchResponseReceivedParams {
  assessmentId: string;
  anonymousId: string;
}

/**
 * Dispatch diagnostic.response_received event to n8n
 * Called after a participant submits their response
 * Fetches assessment data from database to get organization context
 */
export async function dispatchResponseReceived({
  assessmentId,
  anonymousId,
}: DispatchResponseReceivedParams) {
  try {
    const supabase = await createClient();

    // Fetch assessment details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment, error: assessmentError } = await (supabase as any)
      .from('assessments')
      .select('organization_id, title')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error('[AssessmentActions] Failed to fetch assessment:', assessmentError);
      return { success: false, error: 'Assessment not found' };
    }

    // Count total responses for this assessment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: responseCount, error: countError } = await (supabase as any)
      .from('responses')
      .select('anonymous_id', { count: 'exact', head: true })
      .eq('assessment_id', assessmentId);

    if (countError) {
      console.error('[AssessmentActions] Failed to count responses:', countError);
    }

    // Count unique respondents (distinct anonymous_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: uniqueRespondents } = await (supabase as any)
      .from('responses')
      .select('anonymous_id')
      .eq('assessment_id', assessmentId);

    const uniqueCount = uniqueRespondents
      ? new Set(uniqueRespondents.map((r: { anonymous_id: string }) => r.anonymous_id)).size
      : 0;

    const result = await dispatchEvent({
      organizationId: assessment.organization_id,
      eventType: 'diagnostic.response_received',
      data: {
        diagnostic_id: assessmentId,
        diagnostic_title: assessment.title,
        anonymous_id: anonymousId,
        response_count: uniqueCount,
        total_answers: responseCount || 0,
      },
      metadata: {
        triggered_by: 'public-response-form',
      },
    });

    // Note: Risk threshold checking should be called separately
    // after sufficient responses to have statistically relevant data
    // Use checkAndAlertRiskThresholds from analytics/actions.ts

    return result;
  } catch (error) {
    console.error('[AssessmentActions] Failed to dispatch response event:', error);
    return { success: false, error: 'Failed to dispatch event' };
  }
}

interface DispatchRiskThresholdExceededParams {
  organizationId: string;
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  categoryName: string;
  currentScore: number;
  threshold: number;
  riskLevel: 'high' | 'critical';
}

/**
 * Dispatch risk.threshold.exceeded event to n8n
 * Called when a risk category score exceeds the defined threshold
 */
export async function dispatchRiskThresholdExceeded({
  organizationId,
  assessmentId,
  assessmentTitle,
  category,
  categoryName,
  currentScore,
  threshold,
  riskLevel,
}: DispatchRiskThresholdExceededParams) {
  try {
    const result = await dispatchEvent({
      organizationId,
      eventType: 'risk.threshold.exceeded',
      data: {
        diagnostic_id: assessmentId,
        diagnostic_title: assessmentTitle,
        category,
        category_name: categoryName,
        current_score: currentScore,
        threshold,
        risk_level: riskLevel,
      },
      metadata: {
        triggered_by: 'analytics-calculation',
      },
    });

    return result;
  } catch (error) {
    console.error('[AssessmentActions] Failed to dispatch risk threshold event:', error);
    return { success: false, error: 'Failed to dispatch event' };
  }
}

// ============================================================================
// Soft Delete Operations
// ============================================================================

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Soft delete an assessment
 * Marks the assessment as deleted without removing data
 * Only admins and managers can delete assessments
 */
export async function softDeleteAssessment(assessmentId: string): Promise<DeleteResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Nao autorizado' };
    }

    // Get user's profile and role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { success: false, error: 'Perfil nao encontrado' };
    }

    // Check role
    if (!['admin', 'manager'].includes(profile.role)) {
      return { success: false, error: 'Apenas admins e managers podem excluir assessments' };
    }

    // Call the soft delete function from the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('soft_delete_assessment', {
      p_assessment_id: assessmentId,
      p_deleted_by: user.id,
    });

    if (error) {
      console.error('[AssessmentActions] Soft delete failed:', error);
      return { success: false, error: error.message || 'Falha ao excluir assessment' };
    }

    if (!data) {
      return { success: false, error: 'Assessment nao encontrado ou ja excluido' };
    }

    return { success: true };
  } catch (error) {
    console.error('[AssessmentActions] Soft delete error:', error);
    return { success: false, error: 'Erro interno ao excluir assessment' };
  }
}

/**
 * Restore a soft-deleted assessment
 * Only admins can restore deleted assessments
 */
export async function restoreAssessment(assessmentId: string): Promise<DeleteResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Nao autorizado' };
    }

    // Get user's profile and role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { success: false, error: 'Perfil nao encontrado' };
    }

    // Check role - only admin can restore
    if (profile.role !== 'admin') {
      return { success: false, error: 'Apenas admins podem restaurar assessments excluidos' };
    }

    // Call the restore function from the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('restore_assessment', {
      p_assessment_id: assessmentId,
    });

    if (error) {
      console.error('[AssessmentActions] Restore failed:', error);
      return { success: false, error: error.message || 'Falha ao restaurar assessment' };
    }

    if (!data) {
      return { success: false, error: 'Assessment nao encontrado ou nao esta excluido' };
    }

    return { success: true };
  } catch (error) {
    console.error('[AssessmentActions] Restore error:', error);
    return { success: false, error: 'Erro interno ao restaurar assessment' };
  }
}

/**
 * Get deleted assessments for the current organization
 * Only admins can view deleted assessments
 */
export async function getDeletedAssessments() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { assessments: [], error: 'Nao autorizado' };
    }

    // Get user's profile and role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { assessments: [], error: 'Perfil nao encontrado' };
    }

    // Check role - only admin can view deleted
    if (profile.role !== 'admin') {
      return { assessments: [], error: 'Apenas admins podem ver assessments excluidos' };
    }

    // Fetch deleted assessments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('assessments')
      .select(`
        id,
        title,
        status,
        deleted_at,
        deleted_by,
        created_at,
        questionnaires (title)
      `)
      .eq('organization_id', profile.organization_id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error('[AssessmentActions] Failed to fetch deleted assessments:', error);
      return { assessments: [], error: error.message };
    }

    return { assessments: data || [] };
  } catch (error) {
    console.error('[AssessmentActions] Error fetching deleted assessments:', error);
    return { assessments: [], error: 'Erro interno' };
  }
}
