-- ========================================
-- FIX ADICIONAL: Bloco 6 e Validação Completa
-- ========================================

-- IMPORTANTE: Execute diagnostic-detailed.sql ANTES
-- para entender a estrutura atual do banco

-- ========================================
-- 1. CORRIGIR ALLOW_SKIP NO BLOCO 6
-- ========================================

-- O Bloco 6 deve ter TODAS as perguntas com allow_skip=true
-- (tanto likert_scale quanto text, se houver)
UPDATE questions
SET allow_skip = true
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'violence_harassment';

-- ========================================
-- 2. VALIDAÇÃO COMPLETA PÓS-FIX
-- ========================================

-- Contagem por tipo de questão
SELECT
  'POR TIPO' as validacao,
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE scale_labels IS NOT NULL) as com_scale_labels,
  COUNT(*) FILTER (WHERE scale_labels IS NULL) as sem_scale_labels
FROM questions
WHERE questionnaire_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222'
)
GROUP BY type;

-- Bloco 6 específico
SELECT
  'BLOCO 6' as validacao,
  COUNT(*) as total_perguntas,
  COUNT(*) FILTER (WHERE allow_skip = true) as com_allow_skip,
  COUNT(*) FILTER (WHERE allow_skip = false OR allow_skip IS NULL) as sem_allow_skip
FROM questions
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111'
  AND category = 'violence_harassment';

-- Resumo geral Sollar
SELECT
  'SOLLAR - RESUMO' as validacao,
  COUNT(*) as total_perguntas,
  COUNT(*) FILTER (WHERE type = 'likert_scale') as likert_scale,
  COUNT(*) FILTER (WHERE type = 'text') as text,
  COUNT(*) FILTER (WHERE type = 'likert_scale' AND scale_labels IS NOT NULL) as likert_com_labels,
  COUNT(*) FILTER (WHERE category = 'violence_harassment' AND allow_skip = true) as bloco6_allow_skip
FROM questions
WHERE questionnaire_id = 'a1111111-1111-1111-1111-111111111111';

-- Resumo geral Pulse
SELECT
  'PULSE - RESUMO' as validacao,
  COUNT(*) as total_perguntas,
  COUNT(*) FILTER (WHERE type = 'likert_scale') as likert_scale,
  COUNT(*) FILTER (WHERE scale_labels IS NOT NULL) as com_scale_labels
FROM questions
WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222';

-- ========================================
-- 3. EXPECTATIVAS CORRETAS
-- ========================================

-- Sollar:
--   - Total: 30 perguntas
--   - Likert: 27 (Blocos 1-7, algumas do 8)
--   - Text: 3 (Bloco 8 - Sugestões abertas)
--   - Bloco 6: TODAS as perguntas com allow_skip=true

-- Pulse:
--   - Total: 5 perguntas
--   - Likert: 5
--   - Todas com scale_labels

-- ========================================
-- FIM DA VALIDAÇÃO
-- ========================================
