-- Migration: Update Pesquisa de Clima questions
-- Changes from 5 questions to 10 questions as specified

-- Pulse/Clima Questionnaire ID
-- b2222222-2222-2222-2222-222222222222

-- First, delete existing questions for the pulse questionnaire
DELETE FROM questions WHERE questionnaire_id = 'b2222222-2222-2222-2222-222222222222';

-- Insert new 10 questions for Pesquisa de Clima

-- Question 1: Como você está se sentindo no trabalho este mês?
-- Type: multiple_choice (single choice)
-- Options: Muito bem / Bem / Mais ou menos / Mal / Muito mal
-- Scoring: Muito mal=1, Mal=2, Mais ou menos=3, Bem=4, Muito bem=5
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0001-4000-8000-000000000001',
  'b2222222-2222-2222-2222-222222222222',
  'Como você está se sentindo no trabalho este mês?',
  'multiple_choice',
  'bem_estar',
  1,
  true,
  '["Muito mal", "Mal", "Mais ou menos", "Bem", "Muito bem"]',
  '{"1": "Muito mal", "2": "Mal", "3": "Mais ou menos", "4": "Bem", "5": "Muito bem"}',
  1,
  5,
  false
);

-- Question 2: Neste mês, consegui dar conta do meu trabalho sem me sentir sobrecarregado(a).
-- Type: likert_scale (frequency)
-- Options: Nunca / Raramente / Às vezes / Quase sempre / Sempre
-- Scoring: Nunca=1, Raramente=2, Às vezes=3, Quase sempre=4, Sempre=5
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0002-4000-8000-000000000002',
  'b2222222-2222-2222-2222-222222222222',
  'Neste mês, consegui dar conta do meu trabalho sem me sentir sobrecarregado(a).',
  'likert_scale',
  'carga_trabalho',
  2,
  true,
  '["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"]',
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Quase sempre", "5": "Sempre"}',
  1,
  5,
  false
);

-- Question 3: Neste mês, consegui concluir minhas principais tarefas dentro do meu horário normal de trabalho.
-- Type: likert_scale (frequency)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0003-4000-8000-000000000003',
  'b2222222-2222-2222-2222-222222222222',
  'Neste mês, consegui concluir minhas principais tarefas dentro do meu horário normal de trabalho.',
  'likert_scale',
  'carga_trabalho',
  3,
  true,
  '["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"]',
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Quase sempre", "5": "Sempre"}',
  1,
  5,
  false
);

-- Question 4: Neste mês, senti que minha liderança me apoiou quando precisei.
-- Type: likert_scale (frequency)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0004-4000-8000-000000000004',
  'b2222222-2222-2222-2222-222222222222',
  'Neste mês, senti que minha liderança me apoiou quando precisei.',
  'likert_scale',
  'lideranca',
  4,
  true,
  '["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"]',
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Quase sempre", "5": "Sempre"}',
  1,
  5,
  false
);

-- Question 5: Neste mês, recebi orientações claras sobre prioridades e expectativas do meu trabalho.
-- Type: likert_scale (frequency)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0005-4000-8000-000000000005',
  'b2222222-2222-2222-2222-222222222222',
  'Neste mês, recebi orientações claras sobre prioridades e expectativas do meu trabalho.',
  'likert_scale',
  'lideranca',
  5,
  true,
  '["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"]',
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Quase sempre", "5": "Sempre"}',
  1,
  5,
  false
);

-- Question 6: Neste mês, senti que pude falar abertamente com minha liderança.
-- Type: likert_scale (frequency)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0006-4000-8000-000000000006',
  'b2222222-2222-2222-2222-222222222222',
  'Neste mês, senti que pude falar abertamente com minha liderança.',
  'likert_scale',
  'lideranca',
  6,
  true,
  '["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"]',
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Quase sempre", "5": "Sempre"}',
  1,
  5,
  false
);

-- Question 7: Neste mês, percebi um ambiente respeitoso e colaborativo no dia a dia.
-- Type: likert_scale (frequency)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0007-4000-8000-000000000007',
  'b2222222-2222-2222-2222-222222222222',
  'Neste mês, percebi um ambiente respeitoso e colaborativo no dia a dia.',
  'likert_scale',
  'clima',
  7,
  true,
  '["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"]',
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Quase sempre", "5": "Sempre"}',
  1,
  5,
  false
);

-- Question 8: Neste mês, senti segurança para trazer dúvidas, problemas ou erros sem medo de consequências injustas.
-- Type: likert_scale (frequency)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  options, scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0008-4000-8000-000000000008',
  'b2222222-2222-2222-2222-222222222222',
  'Neste mês, senti segurança para trazer dúvidas, problemas ou erros sem medo de consequências injustas.',
  'likert_scale',
  'clima',
  8,
  true,
  '["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"]',
  '{"1": "Nunca", "2": "Raramente", "3": "Às vezes", "4": "Quase sempre", "5": "Sempre"}',
  1,
  5,
  false
);

-- Question 9: De 0 a 10, quão satisfeito(a) você está hoje com seu trabalho nesta empresa?
-- Type: likert_scale (NPS style 0-10)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  scale_labels, min_value, max_value, risk_inverted
) VALUES (
  'c1111111-0009-4000-8000-000000000009',
  'b2222222-2222-2222-2222-222222222222',
  'De 0 a 10, quão satisfeito(a) você está hoje com seu trabalho nesta empresa?',
  'likert_scale',
  'satisfacao',
  9,
  true,
  '{"0": "Totalmente insatisfeito(a)", "10": "Totalmente satisfeito(a)"}',
  0,
  10,
  false
);

-- Question 10: (Opcional) Se quiser, explique o motivo da sua nota
-- Type: text (open, optional)
INSERT INTO questions (
  id, questionnaire_id, text, type, category, order_number, required,
  is_strategic_open
) VALUES (
  'c1111111-0010-4000-8000-000000000010',
  'b2222222-2222-2222-2222-222222222222',
  'Se quiser, explique o motivo da sua nota.',
  'text',
  'satisfacao',
  10,
  false,
  true
);

-- Update questionnaire metadata
UPDATE questionnaires
SET
  description = 'Pesquisa mensal de clima organizacional com 10 perguntas sobre bem-estar, carga de trabalho, liderança, clima e satisfação.',
  updated_at = NOW()
WHERE id = 'b2222222-2222-2222-2222-222222222222';
