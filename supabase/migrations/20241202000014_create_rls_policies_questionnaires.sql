-- ============================================================================
-- Migration 014: RLS Policies for questionnaires & questions tables
-- Created: 2024-12-02
-- Purpose: Org-scoped access for questionnaires and their questions
-- ============================================================================

-- ============================================================================
-- QUESTIONNAIRES TABLE POLICIES
-- ============================================================================

-- SELECT: Users can view questionnaires from their organization
CREATE POLICY "questionnaires_select_own_org" ON public.questionnaires
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

COMMENT ON POLICY "questionnaires_select_own_org" ON public.questionnaires IS
  'Users can view questionnaires from their own organization only';

-- INSERT: Admins and managers can create questionnaires
CREATE POLICY "questionnaires_insert_admin_manager" ON public.questionnaires
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

COMMENT ON POLICY "questionnaires_insert_admin_manager" ON public.questionnaires IS
  'Admins and managers can create questionnaires in their organization';

-- UPDATE: Admins and managers can update questionnaires they created or in their org
CREATE POLICY "questionnaires_update_admin_manager" ON public.questionnaires
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

COMMENT ON POLICY "questionnaires_update_admin_manager" ON public.questionnaires IS
  'Admins and managers can update questionnaires in their organization';

-- DELETE: Only admins can delete questionnaires
CREATE POLICY "questionnaires_delete_admin_only" ON public.questionnaires
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

COMMENT ON POLICY "questionnaires_delete_admin_only" ON public.questionnaires IS
  'Only admins can delete questionnaires in their organization';

-- ============================================================================
-- QUESTIONS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can view questions from questionnaires in their organization
CREATE POLICY "questions_select_own_org" ON public.questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.questionnaires q
      WHERE q.id = questions.questionnaire_id
      AND q.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "questions_select_own_org" ON public.questions IS
  'Users can view questions from questionnaires in their organization';

-- INSERT: Admins and managers can add questions to questionnaires
CREATE POLICY "questions_insert_admin_manager" ON public.questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.questionnaires q
      WHERE q.id = questions.questionnaire_id
      AND q.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "questions_insert_admin_manager" ON public.questions IS
  'Admins and managers can add questions to questionnaires in their organization';

-- UPDATE: Admins and managers can update questions
CREATE POLICY "questions_update_admin_manager" ON public.questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.questionnaires q
      WHERE q.id = questions.questionnaire_id
      AND q.organization_id = (
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
      FROM public.questionnaires q
      WHERE q.id = questions.questionnaire_id
      AND q.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "questions_update_admin_manager" ON public.questions IS
  'Admins and managers can update questions in their organization questionnaires';

-- DELETE: Admins and managers can delete questions
CREATE POLICY "questions_delete_admin_manager" ON public.questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.questionnaires q
      WHERE q.id = questions.questionnaire_id
      AND q.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "questions_delete_admin_manager" ON public.questions IS
  'Admins and managers can delete questions from their organization questionnaires';
