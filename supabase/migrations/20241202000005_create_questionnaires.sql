-- ============================================================================
-- Migration 005: Create questionnaires table
-- Created: 2024-12-02
-- Purpose: Store questionnaire templates (e.g., NR-1, Pulse Surveys)
-- ============================================================================

-- Create questionnaires table
CREATE TABLE IF NOT EXISTS public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  template_based_on UUID REFERENCES public.questionnaires(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER questionnaires_updated_at
  BEFORE UPDATE ON public.questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS questionnaires_organization_id_idx
  ON public.questionnaires(organization_id);

CREATE INDEX IF NOT EXISTS questionnaires_status_idx
  ON public.questionnaires(status);

CREATE INDEX IF NOT EXISTS questionnaires_created_by_idx
  ON public.questionnaires(created_by);

CREATE INDEX IF NOT EXISTS questionnaires_created_at_idx
  ON public.questionnaires(created_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.questionnaires IS
  'Questionnaire templates (e.g., NR-1 Psychosocial, Pulse Surveys, Custom)';

COMMENT ON COLUMN public.questionnaires.id IS
  'Unique questionnaire identifier (UUID)';

COMMENT ON COLUMN public.questionnaires.organization_id IS
  'Organization this questionnaire belongs to (multi-tenant key)';

COMMENT ON COLUMN public.questionnaires.title IS
  'Questionnaire title (e.g., "NR-1 Avaliação Psicossocial 2024")';

COMMENT ON COLUMN public.questionnaires.description IS
  'Optional description explaining the questionnaire purpose';

COMMENT ON COLUMN public.questionnaires.status IS
  'Questionnaire status: draft (editable), published (in use), archived (historical)';

COMMENT ON COLUMN public.questionnaires.version IS
  'Version number for tracking questionnaire iterations';

COMMENT ON COLUMN public.questionnaires.template_based_on IS
  'Optional reference to another questionnaire this was cloned from';

COMMENT ON COLUMN public.questionnaires.created_by IS
  'User who created this questionnaire';

COMMENT ON COLUMN public.questionnaires.created_at IS
  'Timestamp when questionnaire was created';

COMMENT ON COLUMN public.questionnaires.updated_at IS
  'Timestamp when questionnaire was last updated (auto-updated via trigger)';
