-- ========================================
-- FIX ULTRA ABRANGENTE - SEM CONDIÇÕES
-- ========================================
-- Adiciona scale_labels para TODAS as perguntas likert_scale
-- SEM CONDIÇÕES de min_value ou max_value
-- ========================================

-- ========================================
-- 1. ADICIONAR SCALE_LABELS PARA TODAS AS LIKERT (SEM CONDIÇÕES)
-- ========================================

-- SOLLAR: Adicionar scale_labels padrão 1-5 para TODAS sem labels
UPDATE questions
SET scale_labels = '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND type = 'likert_scale'
  AND scale_labels IS NULL;

-- PULSE: Adicionar scale_labels padrão 1-5 para TODAS sem labels
UPDATE questions
SET scale_labels = '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb
WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222'
  AND type = 'likert_scale'
  AND scale_labels IS NULL;

-- ========================================
-- 2. CORRIGIR PERGUNTAS ÂNCORAS (0-10) - SOBRESCREVER
-- ========================================

-- Sobrescrever scale_labels para perguntas que usam escala 0-10
UPDATE questions
SET scale_labels = '{"0": "Totalmente insatisfeito(a)", "1": "1", "2": "2", "3": "3", "4": "4", "5": "Neutro", "6": "6", "7": "7", "8": "8", "9": "9", "10": "Totalmente satisfeito(a)"}'::jsonb
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND type = 'likert_scale'
  AND min_value = 0
  AND max_value = 10;

-- ========================================
-- 3. VALIDAÇÃO FINAL DETALHADA
-- ========================================

-- Total de perguntas Likert
SELECT
  '=== TOTAL LIKERT ===' as validacao,
  '' as questionario,
  '' as total_likert,
  '' as com_labels,
  '' as sem_labels
UNION ALL
SELECT
  '',
  q.title,
  COUNT(*)::text as total_likert,
  COUNT(*) FILTER (WHERE qs.scale_labels IS NOT NULL)::text as com_labels,
  COUNT(*) FILTER (WHERE qs.scale_labels IS NULL)::text as sem_labels
FROM questions qs
JOIN questionnaires q ON q.id = qs.questionnaire_id
WHERE q.id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
)
  AND qs.type = 'likert_scale'
GROUP BY q.title;

-- Lista de perguntas que AINDA não têm scale_labels
SELECT
  order_index,
  category,
  LEFT(text, 60) as question_preview
FROM questions
WHERE questionnaire_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
)
  AND type = 'likert_scale'
  AND scale_labels IS NULL
ORDER BY order_index
LIMIT 10;

-- Resumo final
SELECT
  '=== RESUMO FINAL ===' as validacao,
  '' as total_questionarios,
  '' as total_perguntas,
  '' as total_likert,
  '' as likert_com_labels,
  '' as likert_sem_labels
UNION ALL
SELECT
  '',
  COUNT(DISTINCT questionnaire_id)::text,
  COUNT(*)::text,
  COUNT(*) FILTER (WHERE type = 'likert_scale')::text,
  COUNT(*) FILTER (WHERE type = 'likert_scale' AND scale_labels IS NOT NULL)::text,
  COUNT(*) FILTER (WHERE type = 'likert_scale' AND scale_labels IS NULL)::text
FROM questions
WHERE questionnaire_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
);

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Total Likert:
--   Sollar: 27 Likert (27 com labels, 0 sem labels)
--   Pulse: 5 Likert (5 com labels, 0 sem labels)
--
-- Perguntas sem labels: 0
--
-- Resumo Final:
--   total_questionarios: 2
--   total_perguntas: 35
--   total_likert: 32
--   likert_com_labels: 32
--   likert_sem_labels: 0
-- ========================================
