-- ============================================================================
-- Migration: Seed Pulse Monthly Questionnaire
-- Created: 2025-01-05
-- Purpose: Insert quick monthly pulse survey (5 questions, 1 minute)
-- ============================================================================

-- Insert Pulse questionnaire
-- ============================================================================

INSERT INTO questionnaires (
  id,
  organization_id,
  title,
  description,
  questionnaire_type,
  introduction_text,
  lgpd_consent_text,
  status,
  created_at
) VALUES (
  'b2222222-2222-2222-2222-222222222222'::uuid,
  (SELECT id FROM organizations LIMIT 1), -- Will be cloned per organization
  'Pulso Geral Mensal',
  'Pesquisa rápida (1 minuto) para entender como você está se sentindo no trabalho neste mês.',
  'pulse_monthly',
  E'# Olá!\n\nParticipe da nossa pesquisa rápida (1 minuto) para entender como você está se sentindo no trabalho neste mês.\n\nAs respostas são **anônimas** e analisadas de forma **agrupada**.\n\nObrigado(a) por compartilhar como você está! 💙',
  E'## Termo de Consentimento\n\nAo prosseguir, você declara estar ciente de que suas respostas são **completamente anônimas** e serão utilizadas **exclusivamente** para melhorias no ambiente de trabalho.\n\nAo clicar em "Aceito", você consente com estes termos.',
  'published',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- P1: Como você está se sentindo no trabalho esse mês?
-- ============================================================================

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
  'b2222222-2222-2222-2222-222222222222'::uuid,
  'Como você está se sentindo no trabalho esse mês?',
  'multiple_choice',
  'anchors',
  1,
  true,
  false, -- Not inverted: "Muito bem" = best option
  false,
  '["Muito bem", "Bem", "Mais ou menos", "Mal", "Muito mal"]'::jsonb
);

-- P2: Satisfação geral (0-10)
-- ============================================================================

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
  'b2222222-2222-2222-2222-222222222222'::uuid,
  'De 0 a 10, quão satisfeito(a) você está hoje com seu trabalho nesta empresa?',
  'likert_scale',
  'anchors',
  2,
  true,
  0,
  10,
  false, -- Not inverted: 10 = high satisfaction
  false,
  '{"0": "Totalmente insatisfeito(a)", "5": "Neutro", "10": "Totalmente satisfeito(a)"}'::jsonb
);

-- P3: Carga de trabalho sustentável
-- ============================================================================

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
  'b2222222-2222-2222-2222-222222222222'::uuid,
  'Neste mês, sinto que minha carga de trabalho está sustentável (consigo dar conta sem me sentir sobrecarregado/a).',
  'likert_scale',
  'demands_and_pace',
  3,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  false, -- NOT inverted: higher = better (more sustainable)
  false
);

-- P4: Comunicação com liderança
-- ============================================================================

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
  'b2222222-2222-2222-2222-222222222222'::uuid,
  'Neste mês, sinto que posso falar abertamente com minha liderança.',
  'likert_scale',
  'leadership_recognition',
  4,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  false, -- NOT inverted: higher = better (more openness)
  false
);

-- P5: Ambiente respeitoso
-- ============================================================================

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
  'b2222222-2222-2222-2222-222222222222'::uuid,
  'Neste mês, sinto que o ambiente de trabalho está, em geral, respeitoso e colaborativo.',
  'likert_scale',
  'relationships_communication',
  5,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  false, -- NOT inverted: higher = better (more respectful)
  false
);

-- Add indexes for faster pulse survey queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS questionnaires_pulse_idx
  ON questionnaires(questionnaire_type) WHERE questionnaire_type = 'pulse_monthly';

-- Add comment
COMMENT ON TABLE questionnaires IS
  'Questionnaire templates: nr1_full (30Q, 8 blocks), pulse_monthly (5Q, 1min), custom';
