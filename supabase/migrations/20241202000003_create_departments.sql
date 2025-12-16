-- ============================================================================
-- Migration 003: Create departments table
-- Created: 2024-12-02
-- Purpose: Store organizational departments with hierarchical structure
-- ============================================================================

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS departments_organization_id_idx
  ON public.departments(organization_id);

CREATE INDEX IF NOT EXISTS departments_parent_id_idx
  ON public.departments(parent_id);

CREATE INDEX IF NOT EXISTS departments_created_at_idx
  ON public.departments(created_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.departments IS
  'Organizational departments with optional hierarchy (parent-child relationships)';

COMMENT ON COLUMN public.departments.id IS
  'Unique department identifier (UUID)';

COMMENT ON COLUMN public.departments.organization_id IS
  'Organization this department belongs to (multi-tenant key)';

COMMENT ON COLUMN public.departments.parent_id IS
  'Parent department ID for hierarchical structure (NULL for root departments)';

COMMENT ON COLUMN public.departments.name IS
  'Department name (e.g., Engineering, Sales, HR)';

COMMENT ON COLUMN public.departments.description IS
  'Optional description of department purpose and responsibilities';

COMMENT ON COLUMN public.departments.created_at IS
  'Timestamp when department was created';

COMMENT ON COLUMN public.departments.updated_at IS
  'Timestamp when department was last updated (auto-updated via trigger)';
