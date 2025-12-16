-- ============================================================================
-- Migration: Update Schema for Sollar Questionnaire Model (FIXED)
-- Created: 2025-01-05
-- Purpose: Adapt database schema to support Sollar psychosocial risk model
-- ============================================================================

-- Step 1: Update risk_category enum to 8 Sollar blocks
-- ============================================================================

-- Create new enum type with Sollar categories
CREATE TYPE risk_category_new AS ENUM (
  'demands_and_pace',           -- Bloco 1: Demandas e Ritmo de Trabalho
  'autonomy_clarity_change',    -- Bloco 2: Autonomia, Clareza e Mudanças
  'leadership_recognition',     -- Bloco 3: Liderança e Reconhecimento
  'relationships_communication',-- Bloco 4: Relações, Clima e Comunicação
  'work_life_health',           -- Bloco 5: Equilíbrio Trabalho–Vida e Saúde
  'violence_harassment',        -- Bloco 6: Violência, Assédio e Medo de Repressão
  'anchors',                    -- Bloco 7: Âncoras (Satisfação, Saúde, Permanência)
  'suggestions'                 -- Bloco 8: Sugestões (abertas)
);

-- FIX: Remove DEFAULT constraints before altering column type
ALTER TABLE questions ALTER COLUMN category DROP DEFAULT;
ALTER TABLE risk_scores ALTER COLUMN category DROP DEFAULT;

-- Update questions table to use new enum
ALTER TABLE questions
  ALTER COLUMN category TYPE risk_category_new
  USING (
    CASE category::text
      WHEN 'demands' THEN 'demands_and_pace'::risk_category_new
      WHEN 'control' THEN 'autonomy_clarity_change'::risk_category_new
      WHEN 'support' THEN 'leadership_recognition'::risk_category_new
      WHEN 'relationships' THEN 'relationships_communication'::risk_category_new
      WHEN 'role' THEN 'work_life_health'::risk_category_new
      WHEN 'change' THEN 'work_life_health'::risk_category_new
      ELSE 'suggestions'::risk_category_new
    END
  );

-- Update risk_scores table to use new enum
ALTER TABLE risk_scores
  ALTER COLUMN category TYPE risk_category_new
  USING (
    CASE category::text
      WHEN 'demands' THEN 'demands_and_pace'::risk_category_new
      WHEN 'control' THEN 'autonomy_clarity_change'::risk_category_new
      WHEN 'support' THEN 'leadership_recognition'::risk_category_new
      WHEN 'relationships' THEN 'relationships_communication'::risk_category_new
      WHEN 'role' THEN 'work_life_health'::risk_category_new
      WHEN 'change' THEN 'work_life_health'::risk_category_new
      ELSE 'work_life_health'::risk_category_new
    END
  );

-- Drop old enum type
DROP TYPE risk_category;

-- Rename new enum to original name
ALTER TYPE risk_category_new RENAME TO risk_category;

-- Step 2: Add new columns to questionnaires table
-- ============================================================================

ALTER TABLE questionnaires ADD COLUMN IF NOT EXISTS introduction_text TEXT;
ALTER TABLE questionnaires ADD COLUMN IF NOT EXISTS lgpd_consent_text TEXT;
ALTER TABLE questionnaires ADD COLUMN IF NOT EXISTS questionnaire_type TEXT
  CHECK (questionnaire_type IN ('nr1_full', 'pulse_monthly', 'custom'));

-- Set default type for existing questionnaires
UPDATE questionnaires SET questionnaire_type = 'custom' WHERE questionnaire_type IS NULL;

-- Step 3: Add new columns to questions table
-- ============================================================================

ALTER TABLE questions ADD COLUMN IF NOT EXISTS scale_labels JSONB;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS allow_skip BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS risk_inverted BOOLEAN DEFAULT true;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_strategic_open BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS min_value INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS max_value INTEGER;

-- Step 4: Add comments to new columns
-- ============================================================================

COMMENT ON COLUMN questionnaires.introduction_text IS
  'Welcome text shown at the beginning of the questionnaire (supports Markdown)';

COMMENT ON COLUMN questionnaires.lgpd_consent_text IS
  'LGPD consent text that respondents must accept before starting';

COMMENT ON COLUMN questionnaires.questionnaire_type IS
  'Type of questionnaire: nr1_full (complete NR-1), pulse_monthly (quick survey), custom';

COMMENT ON COLUMN questions.scale_labels IS
  'JSON object with custom labels for scale values, e.g., {"1": "Nunca", "2": "Raramente", "5": "Sempre"}';

COMMENT ON COLUMN questions.allow_skip IS
  'Whether question allows "Prefiro não responder" option (important for sensitive topics like harassment)';

COMMENT ON COLUMN questions.risk_inverted IS
  'Risk calculation logic: true = higher score means higher risk (Sollar default), false = higher score means lower risk';

COMMENT ON COLUMN questions.is_strategic_open IS
  'Mark strategic open-ended questions (e.g., "What would you change?") vs regular text responses';

COMMENT ON COLUMN questions.min_value IS
  'Minimum value for numeric scales (e.g., 0 for 0-10 satisfaction scale)';

COMMENT ON COLUMN questions.max_value IS
  'Maximum value for numeric scales (e.g., 10 for 0-10 satisfaction scale)';

-- Step 5: Update indexes for new columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS questionnaires_type_idx
  ON questionnaires(questionnaire_type);

CREATE INDEX IF NOT EXISTS questions_is_strategic_open_idx
  ON questions(is_strategic_open) WHERE is_strategic_open = true;

CREATE INDEX IF NOT EXISTS questions_allow_skip_idx
  ON questions(allow_skip) WHERE allow_skip = true;
