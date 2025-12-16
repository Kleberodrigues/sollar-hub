-- ============================================================================
-- Migration: Fix responses table schema
-- Created: 2024-12-12
-- Purpose: Align responses table with application code expectations
-- ============================================================================
--
-- Current schema (from migration 008):
--   value TEXT NOT NULL
--
-- Required by application:
--   response_text TEXT NOT NULL (stores the actual response as text)
--   value INTEGER (stores numeric value for likert scales, nullable)
-- ============================================================================

-- Step 1: Add response_text column (will store the text response)
ALTER TABLE public.responses
  ADD COLUMN IF NOT EXISTS response_text TEXT;

-- Step 2: Migrate existing data - copy value to response_text
UPDATE public.responses
SET response_text = value
WHERE response_text IS NULL;

-- Step 3: Make response_text NOT NULL with default empty string
ALTER TABLE public.responses
  ALTER COLUMN response_text SET DEFAULT '';

-- For existing rows, set empty string if still null
UPDATE public.responses
SET response_text = ''
WHERE response_text IS NULL;

ALTER TABLE public.responses
  ALTER COLUMN response_text SET NOT NULL;

-- Step 4: Rename old 'value' column to 'value_old' temporarily
ALTER TABLE public.responses
  RENAME COLUMN value TO value_old;

-- Step 5: Add new 'value' column as INTEGER (nullable for non-numeric responses)
ALTER TABLE public.responses
  ADD COLUMN value INTEGER;

-- Step 6: Migrate numeric values from value_old to new value column
UPDATE public.responses
SET value = CASE
  WHEN value_old ~ '^[0-9]+$' THEN value_old::INTEGER
  ELSE NULL
END;

-- Step 7: Drop the old column
ALTER TABLE public.responses
  DROP COLUMN value_old;

-- Add comments
COMMENT ON COLUMN public.responses.response_text IS
  'Text representation of the response (always populated)';

COMMENT ON COLUMN public.responses.value IS
  'Numeric value for likert scales and ratings (NULL for text/choice responses)';

-- ============================================================================
-- Verification query (run after migration to verify):
-- SELECT id, response_text, value FROM responses LIMIT 10;
-- ============================================================================
