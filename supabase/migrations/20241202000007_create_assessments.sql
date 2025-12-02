-- ============================================================================
-- Migration 007: Create assessments table
-- Created: 2024-12-02
-- Purpose: Store assessment instances (diagnostics) based on questionnaires
-- Note: Called "diagnostics" in original ROADMAP, implemented as "assessments"
-- ============================================================================

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure end_date is after start_date
  CHECK (end_date > start_date)
);

-- Add updated_at trigger
CREATE TRIGGER assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS assessments_organization_id_idx
  ON public.assessments(organization_id);

CREATE INDEX IF NOT EXISTS assessments_questionnaire_id_idx
  ON public.assessments(questionnaire_id);

CREATE INDEX IF NOT EXISTS assessments_department_id_idx
  ON public.assessments(department_id);

CREATE INDEX IF NOT EXISTS assessments_status_idx
  ON public.assessments(status);

CREATE INDEX IF NOT EXISTS assessments_date_range_idx
  ON public.assessments(start_date, end_date);

CREATE INDEX IF NOT EXISTS assessments_created_at_idx
  ON public.assessments(created_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.assessments IS
  'Assessment instances (diagnostics) for specific departments and time periods';

COMMENT ON COLUMN public.assessments.id IS
  'Unique assessment identifier (UUID)';

COMMENT ON COLUMN public.assessments.questionnaire_id IS
  'Questionnaire template used for this assessment';

COMMENT ON COLUMN public.assessments.department_id IS
  'Optional department scope (NULL = organization-wide)';

COMMENT ON COLUMN public.assessments.organization_id IS
  'Organization this assessment belongs to (multi-tenant key)';

COMMENT ON COLUMN public.assessments.title IS
  'Assessment title (e.g., "NR-1 Eng Team Q4 2024")';

COMMENT ON COLUMN public.assessments.description IS
  'Optional description or instructions for participants';

COMMENT ON COLUMN public.assessments.status IS
  'Assessment status: active (collecting responses), completed (analysis phase), cancelled';

COMMENT ON COLUMN public.assessments.start_date IS
  'Assessment start date (when participants can begin responding)';

COMMENT ON COLUMN public.assessments.end_date IS
  'Assessment end date (last day to respond)';

COMMENT ON COLUMN public.assessments.anonymous IS
  'Whether responses are anonymous (true) or linked to users (false)';

COMMENT ON COLUMN public.assessments.created_by IS
  'User who created this assessment';

COMMENT ON COLUMN public.assessments.created_at IS
  'Timestamp when assessment was created';

COMMENT ON COLUMN public.assessments.updated_at IS
  'Timestamp when assessment was last updated (auto-updated via trigger)';
