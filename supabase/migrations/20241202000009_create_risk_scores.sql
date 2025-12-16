-- ============================================================================
-- Migration 009: Create risk_scores table
-- Created: 2024-12-02
-- Purpose: Store calculated psychosocial risk scores per assessment/category
-- ============================================================================

-- Create risk_scores table
CREATE TABLE IF NOT EXISTS public.risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('demands', 'control', 'support', 'relationships', 'role', 'change')),
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  level TEXT NOT NULL CHECK (level IN ('low', 'medium', 'high', 'critical')),
  respondent_count INTEGER NOT NULL CHECK (respondent_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one score per assessment/category combination
  UNIQUE(assessment_id, category)
);

-- Add updated_at trigger
CREATE TRIGGER risk_scores_updated_at
  BEFORE UPDATE ON public.risk_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS risk_scores_assessment_id_idx
  ON public.risk_scores(assessment_id);

CREATE INDEX IF NOT EXISTS risk_scores_category_idx
  ON public.risk_scores(category);

CREATE INDEX IF NOT EXISTS risk_scores_level_idx
  ON public.risk_scores(level);

CREATE INDEX IF NOT EXISTS risk_scores_score_idx
  ON public.risk_scores(score DESC);

-- Add table and column comments
COMMENT ON TABLE public.risk_scores IS
  'Calculated psychosocial risk scores per assessment and category';

COMMENT ON COLUMN public.risk_scores.id IS
  'Unique risk score record identifier (UUID)';

COMMENT ON COLUMN public.risk_scores.assessment_id IS
  'Assessment this risk score belongs to';

COMMENT ON COLUMN public.risk_scores.category IS
  'NR-1 psychosocial category: demands, control, support, relationships, role, change';

COMMENT ON COLUMN public.risk_scores.score IS
  'Calculated risk score (0-100, higher = more risk)';

COMMENT ON COLUMN public.risk_scores.level IS
  'Risk level: low (0-25), medium (26-50), high (51-75), critical (76-100)';

COMMENT ON COLUMN public.risk_scores.respondent_count IS
  'Number of respondents included in this score calculation';

COMMENT ON COLUMN public.risk_scores.created_at IS
  'Timestamp when risk score was first calculated';

COMMENT ON COLUMN public.risk_scores.updated_at IS
  'Timestamp when risk score was last recalculated (auto-updated via trigger)';
