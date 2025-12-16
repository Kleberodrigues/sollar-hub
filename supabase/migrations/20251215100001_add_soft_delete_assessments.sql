-- ============================================================================
-- Migration: Add soft delete to assessments table
-- Created: 2025-12-15
-- Purpose: Implement soft delete pattern for assessments to preserve data integrity
-- ============================================================================

-- Add deleted_at column for soft deletes
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add deleted_by column to track who deleted
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- Create index for efficient soft delete filtering
CREATE INDEX IF NOT EXISTS assessments_deleted_at_idx
  ON public.assessments(deleted_at) WHERE deleted_at IS NULL;

-- Create composite index for organization queries excluding deleted
CREATE INDEX IF NOT EXISTS assessments_org_active_idx
  ON public.assessments(organization_id, created_at DESC) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON COLUMN public.assessments.deleted_at IS
  'Soft delete timestamp - NULL means active, non-NULL means deleted';

COMMENT ON COLUMN public.assessments.deleted_by IS
  'User who soft-deleted this assessment';

-- ============================================================================
-- Update RLS policies to exclude soft-deleted records
-- ============================================================================

-- Drop existing select policies that need updating
DROP POLICY IF EXISTS "Users can view assessments in their org" ON public.assessments;
DROP POLICY IF EXISTS "Public can view active assessments" ON public.assessments;

-- Recreate policies excluding soft-deleted records
CREATE POLICY "Users can view active assessments in their org"
  ON public.assessments FOR SELECT
  USING (
    deleted_at IS NULL
    AND organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Allow public access to active assessments for response submission
CREATE POLICY "Public can view active non-deleted assessments"
  ON public.assessments FOR SELECT
  USING (
    deleted_at IS NULL
    AND status = 'active'
    AND start_date <= NOW()
    AND end_date >= NOW()
  );

-- Admins can view ALL assessments including deleted (for recovery)
CREATE POLICY "Admins can view all assessments including deleted"
  ON public.assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND organization_id = assessments.organization_id
      AND role = 'admin'
    )
  );

-- ============================================================================
-- Function to soft delete an assessment
-- ============================================================================

CREATE OR REPLACE FUNCTION public.soft_delete_assessment(
  p_assessment_id UUID,
  p_deleted_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_org_id UUID;
  v_user_org UUID;
  v_user_role TEXT;
BEGIN
  -- Get assessment's organization
  SELECT organization_id INTO v_org_id
  FROM public.assessments
  WHERE id = p_assessment_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;

  -- Get user's organization and role
  SELECT organization_id, role INTO v_user_org, v_user_role
  FROM public.user_profiles
  WHERE id = COALESCE(p_deleted_by, auth.uid());

  -- Verify user belongs to same org and is admin/manager
  IF v_user_org != v_org_id THEN
    RAISE EXCEPTION 'Access denied - wrong organization';
  END IF;

  IF v_user_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Access denied - requires admin or manager role';
  END IF;

  -- Perform soft delete
  UPDATE public.assessments
  SET
    deleted_at = NOW(),
    deleted_by = COALESCE(p_deleted_by, auth.uid()),
    updated_at = NOW()
  WHERE id = p_assessment_id
  AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function to restore a soft-deleted assessment (admin only)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.restore_assessment(
  p_assessment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_org_id UUID;
  v_user_org UUID;
  v_user_role TEXT;
BEGIN
  -- Get assessment's organization
  SELECT organization_id INTO v_org_id
  FROM public.assessments
  WHERE id = p_assessment_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;

  -- Get user's organization and role
  SELECT organization_id, role INTO v_user_org, v_user_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  -- Verify user belongs to same org and is admin
  IF v_user_org != v_org_id THEN
    RAISE EXCEPTION 'Access denied - wrong organization';
  END IF;

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied - requires admin role';
  END IF;

  -- Restore assessment
  UPDATE public.assessments
  SET
    deleted_at = NULL,
    deleted_by = NULL,
    updated_at = NOW()
  WHERE id = p_assessment_id
  AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.soft_delete_assessment TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_assessment TO authenticated;

-- ============================================================================
-- DOWN Migration (for reference)
-- ============================================================================
-- ALTER TABLE public.assessments DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE public.assessments DROP COLUMN IF EXISTS deleted_by;
-- DROP FUNCTION IF EXISTS public.soft_delete_assessment;
-- DROP FUNCTION IF EXISTS public.restore_assessment;
