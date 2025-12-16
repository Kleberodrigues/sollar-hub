-- ========================================
-- FIX FINAL ABRANGENTE - CORRIGE TUDO
-- ========================================
-- Este script corrige TODOS os problemas identificados:
-- 1. Scale labels faltantes (qualquer tipo de pergunta)
-- 2. Allow_skip no Bloco 6 (TODAS as perguntas)
-- 3. Validação completa pós-fix
-- ========================================

-- ========================================
-- 1. ADICIONAR SCALE_LABELS - SOLLAR
-- ========================================

-- Para TODAS as perguntas likert_scale do Sollar SEM scale_labels (escala 1-5)
UPDATE questions
SET scale_labels = '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND type = 'likert_scale'
  AND scale_labels IS NULL
  AND (min_value IS NULL OR min_value = 1)
  AND (max_value IS NULL OR max_value = 5);

-- Para perguntas likert_scale com escala 0-10 (âncoras)
UPDATE questions
SET scale_labels = '{"0": "Totalmente insatisfeito(a)", "5": "Neutro", "10": "Totalmente satisfeito(a)"}'::jsonb
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND type = 'likert_scale'
  AND scale_labels IS NULL
  AND min_value = 0
  AND max_value = 10;

-- ========================================
-- 2. ADICIONAR SCALE_LABELS - PULSE
-- ========================================

-- Para TODAS as perguntas likert_scale do Pulse SEM scale_labels
UPDATE questions
SET scale_labels = '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb
WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222'
  AND type = 'likert_scale'
  AND scale_labels IS NULL;

-- ========================================
-- 3. CORRIGIR TIPO DE PERGUNTAS (SE NECESSÁRIO)
-- ========================================

-- Se alguma pergunta do Pulse foi criada com tipo errado, corrigir:
-- (Todas as perguntas do Pulse devem ser likert_scale)
UPDATE questions
SET type = 'likert_scale'
WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222'
  AND type != 'likert_scale';

-- Adicionar scale_labels para as que foram corrigidas
UPDATE questions
SET scale_labels = '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb
WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222'
  AND type = 'likert_scale'
  AND scale_labels IS NULL;

-- ========================================
-- 4. CORRIGIR ALLOW_SKIP NO BLOCO 6
-- ========================================

-- TODAS as perguntas do Bloco 6 devem ter allow_skip=true
UPDATE questions
SET allow_skip = true
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'violence_harassment';

-- ========================================
-- 5. VALIDAÇÃO COMPLETA PÓS-FIX
-- ========================================

-- Resumo Sollar
SELECT
  '=== SOLLAR - RESUMO FINAL ===' as resultado,
  '' as total_perguntas,
  '' as likert_scale,
  '' as text,
  '' as likert_com_labels,
  '' as bloco6_allow_skip
UNION ALL
SELECT
  '',
  COUNT(*)::text as total_perguntas,
  COUNT(*) FILTER (WHERE type = 'likert_scale')::text as likert_scale,
  COUNT(*) FILTER (WHERE type = 'text')::text as text,
  COUNT(*) FILTER (WHERE type = 'likert_scale' AND scale_labels IS NOT NULL)::text as likert_com_labels,
  COUNT(*) FILTER (WHERE category = 'violence_harassment' AND allow_skip = true)::text as bloco6_allow_skip
FROM questions
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111';

-- Resumo Pulse
SELECT
  '=== PULSE - RESUMO FINAL ===' as resultado,
  '' as total_perguntas,
  '' as likert_scale,
  '' as com_scale_labels
UNION ALL
SELECT
  '',
  COUNT(*)::text as total_perguntas,
  COUNT(*) FILTER (WHERE type = 'likert_scale')::text as likert_scale,
  COUNT(*) FILTER (WHERE scale_labels IS NOT NULL)::text as com_scale_labels
FROM questions
WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222';

-- Verificação de Problemas Remanescentes
SELECT
  '=== VERIFICAÇÃO DE PROBLEMAS ===' as resultado,
  '' as problema,
  '' as quantidade
UNION ALL
SELECT
  '',
  'Perguntas Likert SEM scale_labels' as problema,
  COUNT(*)::text as quantidade
FROM questions
WHERE questionnaire_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
)
  AND type = 'likert_scale'
  AND scale_labels IS NULL

UNION ALL

SELECT
  '',
  'Bloco 6 SEM allow_skip' as problema,
  COUNT(*)::text as quantidade
FROM questions
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'violence_harassment'
  AND (allow_skip = false OR allow_skip IS NULL);

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Sollar:
--   total_perguntas: 30
--   likert_scale: 27
--   text: 3
--   likert_com_labels: 27
--   bloco6_allow_skip: 4
--
-- Pulse:
--   total_perguntas: 5
--   likert_scale: 5
--   com_scale_labels: 5
--
-- Problemas:
--   Perguntas Likert SEM scale_labels: 0
--   Bloco 6 SEM allow_skip: 0
-- ========================================
