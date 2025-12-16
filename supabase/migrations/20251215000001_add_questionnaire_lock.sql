-- Migration: Add questionnaire lock protection
-- Purpose: Prevent editing/deleting of template questionnaires (NR-1 and Pulse Mensal)
-- Date: 2025-12-15

-- ============================================
-- 1. Add is_locked column to questionnaires
-- ============================================

ALTER TABLE public.questionnaires
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.questionnaires.is_locked IS 'When true, questionnaire cannot be edited or deleted (follows regulatory requirements like NR-1)';

-- ============================================
-- 2. Mark existing templates as locked
-- ============================================

UPDATE public.questionnaires
SET is_locked = true
WHERE id IN (
  'a1111111-1111-1111-1111-111111111111'::uuid,  -- NR-1 Riscos Psicossociais
  'b2222222-2222-2222-2222-222222222222'::uuid   -- Pulse Mensal
);

-- ============================================
-- 3. Trigger: Prevent UPDATE on locked questionnaires
-- ============================================

CREATE OR REPLACE FUNCTION prevent_locked_questionnaire_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updating is_locked itself (for admin purposes)
  IF OLD.is_locked = true AND NEW.is_locked = OLD.is_locked THEN
    -- Check if any other field changed
    IF OLD.title != NEW.title OR
       OLD.description IS DISTINCT FROM NEW.description OR
       OLD.status != NEW.status OR
       OLD.introduction_text IS DISTINCT FROM NEW.introduction_text OR
       OLD.lgpd_consent_text IS DISTINCT FROM NEW.lgpd_consent_text OR
       OLD.questionnaire_type IS DISTINCT FROM NEW.questionnaire_type THEN
      RAISE EXCEPTION 'Questionario protegido: nao pode ser modificado (segue portaria regulatoria)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questionnaire_lock_update ON public.questionnaires;
CREATE TRIGGER questionnaire_lock_update
BEFORE UPDATE ON public.questionnaires
FOR EACH ROW
EXECUTE FUNCTION prevent_locked_questionnaire_update();

-- ============================================
-- 4. Trigger: Prevent DELETE on locked questionnaires
-- ============================================

CREATE OR REPLACE FUNCTION prevent_locked_questionnaire_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION 'Questionario protegido: nao pode ser excluido (segue portaria regulatoria)';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questionnaire_lock_delete ON public.questionnaires;
CREATE TRIGGER questionnaire_lock_delete
BEFORE DELETE ON public.questionnaires
FOR EACH ROW
EXECUTE FUNCTION prevent_locked_questionnaire_delete();

-- ============================================
-- 5. Trigger: Prevent INSERT questions on locked questionnaires
-- ============================================

CREATE OR REPLACE FUNCTION prevent_locked_question_insert()
RETURNS TRIGGER AS $$
DECLARE
  questionnaire_locked BOOLEAN;
BEGIN
  SELECT is_locked INTO questionnaire_locked
  FROM public.questionnaires
  WHERE id = NEW.questionnaire_id;

  IF questionnaire_locked = true THEN
    RAISE EXCEPTION 'Questionario protegido: nao pode adicionar novas perguntas';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS question_lock_insert ON public.questions;
CREATE TRIGGER question_lock_insert
BEFORE INSERT ON public.questions
FOR EACH ROW
EXECUTE FUNCTION prevent_locked_question_insert();

-- ============================================
-- 6. Trigger: Prevent UPDATE questions on locked questionnaires
-- ============================================

CREATE OR REPLACE FUNCTION prevent_locked_question_update()
RETURNS TRIGGER AS $$
DECLARE
  questionnaire_locked BOOLEAN;
BEGIN
  SELECT is_locked INTO questionnaire_locked
  FROM public.questionnaires
  WHERE id = OLD.questionnaire_id;

  IF questionnaire_locked = true THEN
    RAISE EXCEPTION 'Pergunta pertence a questionario protegido: nao pode ser modificada';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS question_lock_update ON public.questions;
CREATE TRIGGER question_lock_update
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION prevent_locked_question_update();

-- ============================================
-- 7. Trigger: Prevent DELETE questions on locked questionnaires
-- ============================================

CREATE OR REPLACE FUNCTION prevent_locked_question_delete()
RETURNS TRIGGER AS $$
DECLARE
  questionnaire_locked BOOLEAN;
BEGIN
  SELECT is_locked INTO questionnaire_locked
  FROM public.questionnaires
  WHERE id = OLD.questionnaire_id;

  IF questionnaire_locked = true THEN
    RAISE EXCEPTION 'Pergunta pertence a questionario protegido: nao pode ser excluida';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS question_lock_delete ON public.questions;
CREATE TRIGGER question_lock_delete
BEFORE DELETE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION prevent_locked_question_delete();

-- ============================================
-- 8. Create index for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_questionnaires_is_locked
ON public.questionnaires(is_locked)
WHERE is_locked = true;
