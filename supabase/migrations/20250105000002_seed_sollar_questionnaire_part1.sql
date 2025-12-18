-- ============================================================================
-- Migration: Seed Sollar Psychosocial Risk Questionnaire (Part 1: Blocks 1-4)
-- Created: 2025-01-05
-- Purpose: Insert complete Sollar questionnaire template
-- ============================================================================

-- This migration inserts the "Questionário Sollar de Riscos Psicossociais"
-- Part 1 includes Blocks 1-4 (Demands, Autonomy, Leadership, Relationships)

-- Insert main questionnaire
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
  'a1111111-1111-1111-1111-111111111111'::uuid,
  (SELECT id FROM organizations LIMIT 1), -- Will be cloned per organization
  'Questionário Sollar de Riscos Psicossociais',
  'Questionário completo para mapeamento de fatores de risco psicossocial relacionados ao trabalho, baseado em NR-1 e boas práticas internacionais.',
  'nr1_full',
  E'# Bem-vindo e bem vinda!\n\nEste questionário tem como objetivo mapear os principais fatores de risco psicossocial relacionados ao trabalho na nossa empresa, como carga de trabalho, liderança, clima, saúde mental e segurança psicológica.\n\nAs respostas são **completamente anônimas** e serão analisadas de forma **agrupada**, nunca individual.\n\nNão existem respostas certas ou erradas. O mais importante é que você responda com sinceridade, pensando na sua realidade *hoje*.\n\nO tempo médio de resposta é de *10 a 15 minutos*.\n\nObrigado(a) por contribuir para a construção de um ambiente de trabalho mais saudável e humano.',
  E'## Termo de Consentimento (LGPD)\n\nAo prosseguir, você declara estar ciente de que:\n\n- Suas respostas são **completamente anônimas**\n- Os dados serão analisados de forma **agrupada e estatística**\n- As informações serão utilizadas **exclusivamente** para melhorias no ambiente de trabalho\n- Você pode **interromper** sua participação a qualquer momento\n- Os dados serão armazenados de forma **segura** conforme LGPD (Lei 13.709/2018)\n\nAo clicar em "Aceito", você consente com estes termos.',
  'published',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- BLOCO 1: Demandas e Ritmo de Trabalho
-- ============================================================================

-- Q1.1
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
  'Sinto que tenho mais tarefas do que consigo fazer dentro do meu horário de trabalho.',
  'likert_scale',
  'demands_and_pace',
  1,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q1.2
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
  'Preciso trabalhar em um ritmo acelerado para dar conta de tudo.',
  'likert_scale',
  'demands_and_pace',
  2,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q1.3
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
  'Meu trabalho costuma ser muito repetitivo ou parado, com pouca variação e pouco desafio.',
  'likert_scale',
  'demands_and_pace',
  3,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q1.A (Strategic Open Question)
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
  'Se você pudesse mudar uma coisa na sua carga de trabalho, no ritmo ou na variação das tarefas, o que seria?',
  'text',
  'demands_and_pace',
  4,
  false,
  false,
  true
);

-- BLOCO 2: Autonomia, Clareza e Mudanças
-- ============================================================================

-- Q2.1
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
  'Sinto que tenho pouca liberdade para decidir a melhor forma de realizar minhas tarefas.',
  'likert_scale',
  'autonomy_clarity_change',
  5,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q2.2
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
  'Muitas vezes não fica claro o que é prioridade entre as minhas tarefas.',
  'likert_scale',
  'autonomy_clarity_change',
  6,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q2.3
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
  'Mudanças importantes no trabalho (metas, processos, chefia, forma de trabalhar) costumam acontecer sem explicação clara ou preparo.',
  'likert_scale',
  'autonomy_clarity_change',
  7,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q2.A (Strategic Open Question)
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
  'O que mais atrapalha a sua organização do dia a dia no trabalho?',
  'text',
  'autonomy_clarity_change',
  8,
  false,
  false,
  true
);

-- BLOCO 3: Liderança e Reconhecimento
-- ============================================================================

-- Q3.1
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
  'Já me senti desrespeitado(a) ou maltratado(a) pela minha liderança.',
  'likert_scale',
  'leadership_recognition',
  9,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q3.2
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
  'Sinto que meu trabalho não é reconhecido pela liderança, mesmo quando me esforço.',
  'likert_scale',
  'leadership_recognition',
  10,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q3.3
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
  'Evito dar minha opinião ou trazer problemas para a liderança por medo da reação.',
  'likert_scale',
  'leadership_recognition',
  11,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q3.A (Strategic Open Question)
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
  'Se você pudesse pedir uma mudança para a sua liderança direta, qual seria?',
  'text',
  'leadership_recognition',
  12,
  false,
  false,
  true
);

-- BLOCO 4: Relações, Clima, Justiça e Comunicação
-- ============================================================================

-- Q4.1
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
  'Tenho dificuldade para conseguir ajuda ou as informações de que preciso com colegas ou outras áreas.',
  'likert_scale',
  'relationships_communication',
  13,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q4.2
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
  'Já presenciei ou vivi situações de falta de respeito entre pessoas da equipe.',
  'likert_scale',
  'relationships_communication',
  14,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q4.3
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
  'Percebo situações de injustiça ou favoritismo (para promoção, aumento, oportunidades, escala, folgas, etc.).',
  'likert_scale',
  'relationships_communication',
  15,
  true,
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Frequentemente", "5": "Sempre"}'::jsonb,
  true,
  false
);

-- Q4.A (Strategic Open Question)
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
  'Você percebe algum tipo de injustiça, favoritismo ou dificuldade de comunicação no trabalho? Se sim, qual?',
  'text',
  'relationships_communication',
  16,
  false,
  false,
  true
);
