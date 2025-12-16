-- ============================================================================
-- Migration 004: Create department_members table
-- Created: 2024-12-02
-- Purpose: Link users to departments (many-to-many relationship)
-- ============================================================================

-- Create department_members table
CREATE TABLE IF NOT EXISTS public.department_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique user-department combination
  UNIQUE(department_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS department_members_department_id_idx
  ON public.department_members(department_id);

CREATE INDEX IF NOT EXISTS department_members_user_id_idx
  ON public.department_members(user_id);

CREATE INDEX IF NOT EXISTS department_members_created_at_idx
  ON public.department_members(created_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.department_members IS
  'Junction table linking users to departments (many-to-many)';

COMMENT ON COLUMN public.department_members.id IS
  'Unique member record identifier (UUID)';

COMMENT ON COLUMN public.department_members.department_id IS
  'Department this membership belongs to';

COMMENT ON COLUMN public.department_members.user_id IS
  'User that is a member of the department';

COMMENT ON COLUMN public.department_members.created_at IS
  'Timestamp when user joined the department';
