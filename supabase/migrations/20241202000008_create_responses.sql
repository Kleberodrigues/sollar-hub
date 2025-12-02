-- ============================================================================
-- Migration 008: Create responses table
-- Created: 2024-12-02
-- Purpose: Store individual question responses (anonymous by default)
-- ============================================================================

-- Create responses table
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  anonymous_id UUID NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate responses for same question by same participant
  UNIQUE(assessment_id, question_id, anonymous_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS responses_assessment_id_idx
  ON public.responses(assessment_id);

CREATE INDEX IF NOT EXISTS responses_question_id_idx
  ON public.responses(question_id);

CREATE INDEX IF NOT EXISTS responses_anonymous_id_idx
  ON public.responses(anonymous_id);

CREATE INDEX IF NOT EXISTS responses_created_at_idx
  ON public.responses(created_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.responses IS
  'Individual question responses (anonymous - no user_id tracking)';

COMMENT ON COLUMN public.responses.id IS
  'Unique response identifier (UUID)';

COMMENT ON COLUMN public.responses.assessment_id IS
  'Assessment this response belongs to';

COMMENT ON COLUMN public.responses.question_id IS
  'Question being answered';

COMMENT ON COLUMN public.responses.anonymous_id IS
  'Random UUID to group responses by participant WITHOUT revealing identity';

COMMENT ON COLUMN public.responses.value IS
  'Response value (e.g., "5" for likert, "Option A" for multiple choice, free text)';

COMMENT ON COLUMN public.responses.created_at IS
  'Timestamp when response was submitted (immutable - no updates allowed)';
