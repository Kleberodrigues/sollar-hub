-- ========================================
-- FIX DEFINITIVO - BLOCO 7 (ÂNCORAS)
-- ========================================
-- Adiciona scale_labels para as 2 perguntas do Bloco 7 sem labels
-- ========================================

-- DIAGNÓSTICO IDENTIFICOU:
-- Bloco 7 (anchors): 3 perguntas total
--   - 1 Likert COM scale_labels
--   - 2 perguntas SEM scale_labels (precisam de fix)

-- ========================================
-- 1. ADICIONAR SCALE_LABELS PARA BLOCO 7
-- ========================================

-- Adicionar scale_labels para TODAS as perguntas do Bloco 7 sem labels
-- (Âncoras geralmente usam escala 0-10)
UPDATE questions
SET scale_labels = '{"0": "Totalmente insatisfeito(a)", "1": "1", "2": "2", "3": "3", "4": "4", "5": "Neutro", "6": "6", "7": "7", "8": "8", "9": "9", "10": "Totalmente satisfeito(a)"}'::jsonb,
    min_value = 0,
    max_value = 10
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'anchors'
  AND scale_labels IS NULL;

-- ========================================
-- 2. VALIDAÇÃO PÓS-FIX
-- ========================================

-- Verificar Bloco 7
SELECT
  'BLOCO 7 - PÓS-FIX' as validacao,
  COUNT(*) as total_perguntas,
  COUNT(*) FILTER (WHERE type = 'likert_scale') as likert,
  COUNT(*) FILTER (WHERE type = 'text') as text,
  COUNT(*) FILTER (WHERE scale_labels IS NOT NULL) as com_labels,
  COUNT(*) FILTER (WHERE scale_labels IS NULL) as sem_labels
FROM questions
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'anchors';

-- Resumo geral Likert
SELECT
  'RESUMO GERAL LIKERT' as validacao,
  COUNT(*) as total_likert,
  COUNT(*) FILTER (WHERE scale_labels IS NOT NULL) as com_labels,
  COUNT(*) FILTER (WHERE scale_labels IS NULL) as sem_labels
FROM questions
WHERE questionnaire_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
)
  AND type = 'likert_scale';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Bloco 7:
--   total_perguntas: 3
--   likert: 3 (OU pode ser que as 2 sejam text, veremos)
--   com_labels: 3 (ou 1, se as 2 forem text)
--   sem_labels: 0
--
-- Resumo Geral Likert:
--   total_likert: 24 (19 Sollar + 5 Pulse)
--   com_labels: 24
--   sem_labels: 0
-- ========================================
