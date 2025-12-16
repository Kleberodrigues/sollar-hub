-- ============================================================================
-- Migration 015: RLS Policies for assessments & risk_scores tables
-- Created: 2024-12-02
-- Purpose: Org-scoped access for assessments and risk scores
-- ============================================================================

-- ============================================================================
-- ASSESSMENTS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can view assessments from their organization
CREATE POLICY "assessments_select_own_org" ON public.assessments
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

COMMENT ON POLICY "assessments_select_own_org" ON public.assessments IS
  'Users can view assessments from their own organization only';

-- INSERT: Admins and managers can create assessments
CREATE POLICY "assessments_insert_admin_manager" ON public.assessments
  FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      LIMIT 1
    )
  );

COMMENT ON POLICY "assessments_insert_admin_manager" ON public.assessments IS
  'Admins and managers can create assessments in their organization';

-- UPDATE: Admins and managers can update assessments
CREATE POLICY "assessments_update_admin_manager" ON public.assessments
  FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      LIMIT 1
    )
  )
  WITH CHECK (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      LIMIT 1
    )
  );

COMMENT ON POLICY "assessments_update_admin_manager" ON public.assessments IS
  'Admins and managers can update assessments in their organization';

-- DELETE: Only admins can delete assessments
CREATE POLICY "assessments_delete_admin_only" ON public.assessments
  FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      LIMIT 1
    )
  );

COMMENT ON POLICY "assessments_delete_admin_only" ON public.assessments IS
  'Only admins can delete assessments in their organization';

-- ============================================================================
-- RISK_SCORES TABLE POLICIES
-- ============================================================================

-- SELECT: Users can view risk scores from assessments in their organization
CREATE POLICY "risk_scores_select_own_org" ON public.risk_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessments a
      WHERE a.id = risk_scores.assessment_id
      AND a.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "risk_scores_select_own_org" ON public.risk_scores IS
  'Users can view risk scores from assessments in their organization';

-- INSERT: Admins and managers can create risk scores (or automated system)
CREATE POLICY "risk_scores_insert_admin_manager" ON public.risk_scores
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessments a
      WHERE a.id = risk_scores.assessment_id
      AND a.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "risk_scores_insert_admin_manager" ON public.risk_scores IS
  'Admins and managers can create risk scores for assessments in their organization';

-- UPDATE: Admins and managers can update risk scores
CREATE POLICY "risk_scores_update_admin_manager" ON public.risk_scores
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessments a
      WHERE a.id = risk_scores.assessment_id
      AND a.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessments a
      WHERE a.id = risk_scores.assessment_id
      AND a.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "risk_scores_update_admin_manager" ON public.risk_scores IS
  'Admins and managers can update risk scores for their organization assessments';

-- DELETE: Only admins can delete risk scores
CREATE POLICY "risk_scores_delete_admin_only" ON public.risk_scores
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessments a
      WHERE a.id = risk_scores.assessment_id
      AND a.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "risk_scores_delete_admin_only" ON public.risk_scores IS
  'Only admins can delete risk scores from their organization assessments';
