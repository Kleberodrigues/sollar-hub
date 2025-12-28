-- ============================================================================
-- Migration: 20251228000001_fix_assessment_rls_policies.sql
-- Description: Fix RLS policies for assessments table - drop old policies
--              that only allow admin/manager and use the responsavel_empresa ones
-- ============================================================================

-- Drop the OLD policies that use admin/manager roles (from migration 20241202000015)
DROP POLICY IF EXISTS "assessments_insert_admin_manager" ON public.assessments;
DROP POLICY IF EXISTS "assessments_update_admin_manager" ON public.assessments;
DROP POLICY IF EXISTS "assessments_delete_admin_only" ON public.assessments;

-- Ensure the new policies exist (from migration 20251222000003)
-- These use responsavel_empresa role

-- If they don't exist, create them
DO $$
BEGIN
  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'assessments'
    AND policyname = 'responsavel_can_create_assessments'
  ) THEN
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
  END IF;

  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'assessments'
    AND policyname = 'responsavel_can_update_assessments'
  ) THEN
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
  END IF;

  -- DELETE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'assessments'
    AND policyname = 'responsavel_can_delete_assessments'
  ) THEN
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
  END IF;
END $$;

-- Also fix risk_scores policies that use admin/manager
DROP POLICY IF EXISTS "risk_scores_insert_admin_manager" ON public.risk_scores;
DROP POLICY IF EXISTS "risk_scores_update_admin_manager" ON public.risk_scores;
DROP POLICY IF EXISTS "risk_scores_delete_admin_only" ON public.risk_scores;

-- Create new risk_scores policies for responsavel_empresa
DO $$
BEGIN
  -- INSERT policy for risk_scores
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'risk_scores'
    AND policyname = 'responsavel_can_create_risk_scores'
  ) THEN
    CREATE POLICY "responsavel_can_create_risk_scores" ON public.risk_scores
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
            AND role = 'responsavel_empresa'
            LIMIT 1
          )
        )
        OR is_super_admin()
      );
  END IF;

  -- UPDATE policy for risk_scores
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'risk_scores'
    AND policyname = 'responsavel_can_update_risk_scores'
  ) THEN
    CREATE POLICY "responsavel_can_update_risk_scores" ON public.risk_scores
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
            AND role = 'responsavel_empresa'
            LIMIT 1
          )
        )
        OR is_super_admin()
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
            AND role = 'responsavel_empresa'
            LIMIT 1
          )
        )
        OR is_super_admin()
      );
  END IF;

  -- DELETE policy for risk_scores
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'risk_scores'
    AND policyname = 'responsavel_can_delete_risk_scores'
  ) THEN
    CREATE POLICY "responsavel_can_delete_risk_scores" ON public.risk_scores
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
            AND role = 'responsavel_empresa'
            LIMIT 1
          )
        )
        OR is_super_admin()
      );
  END IF;
END $$;

SELECT 'Assessment and risk_scores RLS policies fixed' AS status;
