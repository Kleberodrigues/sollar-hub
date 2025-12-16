-- ============================================================================
-- Migration 006: Create questions table
-- Created: 2024-12-02
-- Purpose: Store individual questions within questionnaires
-- ============================================================================

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'likert_scale', 'text', 'yes_no')),
  category TEXT NOT NULL CHECK (category IN ('demands', 'control', 'support', 'relationships', 'role', 'change')),
  order_number INTEGER NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique order within questionnaire
  UNIQUE(questionnaire_id, order_number)
);

-- Add updated_at trigger
CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS questions_questionnaire_id_idx
  ON public.questions(questionnaire_id);

CREATE INDEX IF NOT EXISTS questions_category_idx
  ON public.questions(category);

CREATE INDEX IF NOT EXISTS questions_order_number_idx
  ON public.questions(questionnaire_id, order_number);

-- Add table and column comments
COMMENT ON TABLE public.questions IS
  'Individual questions within questionnaires';

COMMENT ON COLUMN public.questions.id IS
  'Unique question identifier (UUID)';

COMMENT ON COLUMN public.questions.questionnaire_id IS
  'Questionnaire this question belongs to';

COMMENT ON COLUMN public.questions.text IS
  'Question text displayed to respondent';

COMMENT ON COLUMN public.questions.type IS
  'Question type: multiple_choice, likert_scale (1-5), text (open), yes_no';

COMMENT ON COLUMN public.questions.category IS
  'NR-1 psychosocial category: demands, control, support, relationships, role, change';

COMMENT ON COLUMN public.questions.order_number IS
  'Display order within questionnaire (1, 2, 3...)';

COMMENT ON COLUMN public.questions.required IS
  'Whether question must be answered';

COMMENT ON COLUMN public.questions.options IS
  'JSON array of options for multiple_choice questions (e.g., ["Option A", "Option B"])';

COMMENT ON COLUMN public.questions.created_at IS
  'Timestamp when question was created';

COMMENT ON COLUMN public.questions.updated_at IS
  'Timestamp when question was last updated (auto-updated via trigger)';
