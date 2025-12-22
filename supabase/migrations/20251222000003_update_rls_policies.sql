-- ============================================================================
-- Migration: 20251222000003_update_rls_policies.sql
-- Description: Update RLS policies to use new role names
-- ============================================================================

-- ============================================
-- Update user_profiles policies
-- ============================================

-- Drop old UPDATE policy if exists
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.user_profiles;

-- Create new UPDATE policy
CREATE POLICY "users_update_own_or_responsavel" ON public.user_profiles
  FOR UPDATE
  USING (
    id = auth.uid()
    OR is_super_admin()
    OR (
      organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'responsavel_empresa'
        LIMIT 1
      )
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR is_super_admin()
    OR (
      organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'responsavel_empresa'
        LIMIT 1
      )
    )
  );

-- Drop old DELETE policy if exists
DROP POLICY IF EXISTS "users_delete_admin_only" ON public.user_profiles;

-- Create new DELETE policy
CREATE POLICY "users_delete_responsavel_only" ON public.user_profiles
  FOR DELETE
  USING (
    is_super_admin()
    OR (
      organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'responsavel_empresa'
        LIMIT 1
      )
      AND id != auth.uid()
    )
  );

-- ============================================
-- Update organizations policies
-- ============================================

DROP POLICY IF EXISTS "admins can update org" ON public.organizations;

CREATE POLICY "responsavel_can_update_org" ON public.organizations
  FOR UPDATE
  USING (
    is_super_admin()
    OR id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  )
  WITH CHECK (
    is_super_admin()
    OR id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

-- ============================================
-- Update questionnaires policies
-- ============================================

DROP POLICY IF EXISTS "admins_managers can create questionnaires" ON public.questionnaires;

CREATE POLICY "responsavel_can_create_questionnaires" ON public.questionnaires
  FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

DROP POLICY IF EXISTS "admins_managers can update questionnaires" ON public.questionnaires;

CREATE POLICY "responsavel_can_update_questionnaires" ON public.questionnaires
  FOR UPDATE
  USING (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  )
  WITH CHECK (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

DROP POLICY IF EXISTS "admins can delete questionnaires" ON public.questionnaires;

CREATE POLICY "responsavel_can_delete_questionnaires" ON public.questionnaires
  FOR DELETE
  USING (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

-- ============================================
-- Update assessments policies
-- ============================================

DROP POLICY IF EXISTS "admins_managers can create assessments" ON public.assessments;

CREATE POLICY "responsavel_can_create_assessments" ON public.assessments
  FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

DROP POLICY IF EXISTS "admins_managers can update assessments" ON public.assessments;

CREATE POLICY "responsavel_can_update_assessments" ON public.assessments
  FOR UPDATE
  USING (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  )
  WITH CHECK (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

DROP POLICY IF EXISTS "admins can delete assessments" ON public.assessments;

CREATE POLICY "responsavel_can_delete_assessments" ON public.assessments
  FOR DELETE
  USING (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

-- ============================================
-- Update departments policies
-- ============================================

DROP POLICY IF EXISTS "admins can manage departments" ON public.departments;

CREATE POLICY "responsavel_can_manage_departments" ON public.departments
  FOR ALL
  USING (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  )
  WITH CHECK (
    is_super_admin()
    OR organization_id IN (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'responsavel_empresa'
    )
  );

SELECT 'RLS policies updated for new roles' AS status;
