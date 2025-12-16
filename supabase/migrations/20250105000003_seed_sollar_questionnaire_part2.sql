-- ============================================================================
-- Migration: Seed Sollar Psychosocial Risk Questionnaire (Part 2: Blocks 5-8)
-- Created: 2025-01-05
-- Purpose: Insert Sollar questionnaire blocks 5-8 (Health, Violence, Anchors, Suggestions)
-- ============================================================================

-- BLOCO 5: Equilíbrio Trabalho–Vida e Saúde
-- ============================================================================

-- Q5.1
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  scale_labels,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'O trabalho tem atrapalhado meu descanso, sono ou vida pessoal (por exemplo, fazer tarefas fora do horário, responder mensagens à noite ou pensar em trabalho o tempo todo).',
  'likert_scale',
  'work_life_health',
  17,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q5.2
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  scale_labels,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Fico preocupado(a) com o trabalho mesmo fora do horário, pensando em problemas ou pendências.',
  'likert_scale',
  'work_life_health',
  18,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q5.3
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  scale_labels,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Nos últimos 30 dias, me senti esgotado(a) ou sem energia por causa do trabalho.',
  'likert_scale',
  'work_life_health',
  19,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q5.A (Strategic Open Question)
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'O trabalho tem impactado sua saúde física ou mental? Se sim, de que forma?',
  'text',
  'work_life_health',
  20,
  false,
  false,
  true
);

-- BLOCO 6: Violência, Assédio e Medo de Repressão
-- ============================================================================
-- Note: These questions allow "Prefiro não responder" option (allow_skip = true)

-- Q6.1
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  scale_labels,
  allow_skip,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Já fui tratado(a) de maneira humilhante, agressiva ou desrespeitosa no trabalho.',
  'likert_scale',
  'violence_harassment',
  21,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true, -- Allow "Prefiro não responder"
  true,
  false
);

-- Q6.2
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  scale_labels,
  allow_skip,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Já presenciei situações de assédio moral ou sexual na empresa.',
  'likert_scale',
  'violence_harassment',
  22,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true, -- Allow "Prefiro não responder"
  true,
  false
);

-- Q6.3
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  scale_labels,
  allow_skip,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Tenho medo de sofrer represália se eu fizer uma reclamação, denúncia ou der uma opinião sincera.',
  'likert_scale',
  'violence_harassment',
  23,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true, -- Allow "Prefiro não responder"
  true,
  false
);

-- Q6.A (Strategic Open Question - OPTIONAL)
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Se quiser, conte (sem citar nomes) alguma situação que você considera grave ou desrespeitosa no trabalho.',
  'text',
  'violence_harassment',
  24,
  false, -- Completely optional
  false,
  true
);

-- BLOCO 7: Âncoras (Satisfação, Saúde, Permanência)
-- ============================================================================
-- Note: These questions use different scales and logic

-- Q7.1 - Satisfaction (0-10 scale, NOT inverted)
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  min_value,
  max_value,
  risk_inverted,
  is_strategic_open,
  options
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'De 0 a 10, quão satisfeito(a) você está hoje com seu trabalho nesta empresa?',
  'likert_scale',
  'anchors',
  25,
  true,
  0,
  10,
  false, -- NOT inverted: 10 = high satisfaction (GOOD)
  false,
  '{"0": "Totalmente insatisfeito(a)", "5": "Neutro", "10": "Totalmente satisfeito(a)"}'::jsonb
);

-- Q7.2 - Retention Intent (Yes/No/Don't know)
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  risk_inverted,
  is_strategic_open,
  options
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Você se imagina trabalhando nesta empresa daqui a 1 ano?',
  'multiple_choice',
  'anchors',
  26,
  true,
  false,
  false,
  '["Sim", "Não", "Não sei"]'::jsonb
);

-- Q7.3 - Health Status (5-point scale, NOT inverted)
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  risk_inverted,
  is_strategic_open,
  options
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Como você avalia sua saúde física e mental hoje?',
  'multiple_choice',
  'anchors',
  27,
  true,
  false, -- NOT inverted: better health = better score
  false,
  '["Muito boa", "Boa", "Regular", "Ruim", "Muito ruim"]'::jsonb
);

-- BLOCO 8: Sugestões Diretas
-- ============================================================================

-- Q8.1
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Na sua opinião, quais são as 3 coisas que mais te ajudam a trabalhar bem aqui? (Escreva em frases curtas)',
  'text',
  'suggestions',
  28,
  false,
  false,
  true
);

-- Q8.2
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'E quais são as 3 coisas que mais atrapalham o seu bem-estar no trabalho hoje?',
  'text',
  'suggestions',
  29,
  false,
  false,
  true
);

-- Q8.3
INSERT INTO questions (
  questionnaire_id,
  text,
  type,
  category,
  order_number,
  required,
  risk_inverted,
  is_strategic_open
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Se você pudesse sugerir uma ação prática que a empresa poderia tomar para melhorar a saúde mental, o clima ou a forma de trabalhar, qual seria?',
  'text',
  'suggestions',
  30,
  false,
  false,
  true
);

-- Add table comment
COMMENT ON TABLE questionnaires IS
  'Questionnaire templates including Sollar Psychosocial Risk Questionnaire (30 questions, 8 blocks)';
