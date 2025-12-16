-- ========================================
-- FIX BLOCO 7 - REMOVER SCALE_LABELS INCORRETOS
-- ========================================
-- Remove scale_labels de perguntas multiple_choice que foram
-- incorretamente modificadas pela migration 20250108000005
-- ========================================

-- CONTEXTO:
-- As perguntas Q7.2 e Q7.3 são do tipo 'multiple_choice' e usam 'options'
-- A migration anterior adicionou 'scale_labels' incorretamente
-- Isso criou ambiguidade: perguntas com dois sistemas de resposta

-- ========================================
-- 1. REMOVER SCALE_LABELS DE MULTIPLE_CHOICE
-- ========================================

UPDATE questions
SET
  scale_labels = NULL,
  min_value = NULL,
  max_value = NULL
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'anchors'
  AND type = 'multiple_choice';

-- ========================================
-- 2. VALIDAÇÃO PÓS-FIX
-- ========================================

-- Verificar estrutura do Bloco 7
SELECT
  'BLOCO 7 - ESTRUTURA CORRETA' as validacao,
  order_number,
  LEFT(text, 60) || '...' as question_preview,
  type,
  CASE
    WHEN scale_labels IS NOT NULL THEN 'scale_labels'
    WHEN options IS NOT NULL THEN 'options'
    ELSE 'NENHUM'
  END as response_system,
  CASE
    WHEN type = 'likert_scale' AND scale_labels IS NOT NULL THEN '✅ OK'
    WHEN type = 'multiple_choice' AND options IS NOT NULL THEN '✅ OK'
    ELSE '❌ ERRO'
  END as status
FROM questions
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'anchors'
ORDER BY order_number;

-- Resumo de validação
SELECT
  'RESUMO BLOCO 7' as validacao,
  COUNT(*) as total_perguntas,
  COUNT(*) FILTER (WHERE type = 'likert_scale') as likert_count,
  COUNT(*) FILTER (WHERE type = 'multiple_choice') as multiple_choice_count,
  COUNT(*) FILTER (WHERE scale_labels IS NOT NULL) as com_scale_labels,
  COUNT(*) FILTER (WHERE options IS NOT NULL) as com_options,
  COUNT(*) FILTER (WHERE
    (type = 'likert_scale' AND scale_labels IS NOT NULL) OR
    (type = 'multiple_choice' AND options IS NOT NULL)
  ) as correctly_configured
FROM questions
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'anchors';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Query 1 - Estrutura:
--   Q7.1 (order 25): likert_scale | scale_labels | ✅ OK
--   Q7.2 (order 26): multiple_choice | options | ✅ OK
--   Q7.3 (order 27): multiple_choice | options | ✅ OK
--
-- Query 2 - Resumo:
--   total_perguntas: 3
--   likert_count: 1
--   multiple_choice_count: 2
--   com_scale_labels: 1
--   com_options: 2
--   correctly_configured: 3
-- ========================================
