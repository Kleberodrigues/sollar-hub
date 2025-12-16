-- ========================================
-- FIX: Adicionar scale_labels faltantes
-- ========================================
-- Problema: Algumas perguntas likert_scale não têm scale_labels
-- Solução: Adicionar scale_labels padrão para todas as perguntas likert_scale
-- ========================================

-- IMPORTANTE: Execute o diagnostic-missing-fields.sql ANTES
-- para confirmar quais perguntas precisam de correção

-- ========================================
-- 1. ADICIONAR SCALE_LABELS PARA QUESTIONÁRIO SOLLAR
-- ========================================

-- Para perguntas likert_scale SEM scale_labels (escala 1-5 padrão)
UPDATE questions
SET scale_labels = '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND type = 'likert_scale'
  AND scale_labels IS NULL
  AND (min_value IS NULL OR min_value = 1)
  AND (max_value IS NULL OR max_value = 5);

-- Para perguntas likert_scale com escala 0-10 (âncoras) SEM scale_labels
UPDATE questions
SET scale_labels = '{"0": "Totalmente insatisfeito(a)", "5": "Neutro", "10": "Totalmente satisfeito(a)"}'::jsonb
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND type = 'likert_scale'
  AND scale_labels IS NULL
  AND min_value = 0
  AND max_value = 10;

-- ========================================
-- 2. ADICIONAR SCALE_LABELS PARA PULSE MENSAL
-- ========================================

UPDATE questions
SET scale_labels = '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb
WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222'
  AND type = 'likert_scale'
  AND scale_labels IS NULL;

-- ========================================
-- 3. VERIFICAR SE BLOCO 6 TEM 4 PERGUNTAS COM ALLOW_SKIP
-- ========================================

-- Se houver menos de 4, adicionar allow_skip=true para todas do Bloco 6
UPDATE questions
SET allow_skip = true
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'violence_harassment'
  AND type = 'likert_scale';

-- ========================================
-- 4. VALIDAÇÃO PÓS-FIX
-- ========================================

-- Verificar se todas as perguntas likert_scale agora têm scale_labels
SELECT
  'Validação Pós-Fix' as check_type,
  COUNT(*) FILTER (WHERE type = 'likert_scale' AND scale_labels IS NULL) as likert_without_labels,
  COUNT(*) FILTER (WHERE type = 'likert_scale' AND scale_labels IS NOT NULL) as likert_with_labels,
  COUNT(*) FILTER (WHERE category = 'violence_harassment' AND allow_skip = true) as violence_with_skip
FROM questions
WHERE questionnaire_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
);

-- Resultado Esperado:
-- likert_without_labels: 0
-- likert_with_labels: 32 (27 Sollar + 5 Pulse)
-- violence_with_skip: 4

-- ========================================
-- FIM DA CORREÇÃO
-- ========================================
