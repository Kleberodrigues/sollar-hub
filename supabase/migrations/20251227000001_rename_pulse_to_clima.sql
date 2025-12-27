-- Migration: Rename Pulse questionnaire title
-- From: "Pulso Geral Mensal"
-- To: "Pesquisa de Clima"

UPDATE questionnaires
SET title = 'Pesquisa de Clima'
WHERE title = 'Pulso Geral Mensal';

-- Also update by ID in case title was already partially changed
UPDATE questionnaires
SET title = 'Pesquisa de Clima'
WHERE id = 'b2222222-2222-2222-2222-222222222222'::uuid
  AND title != 'Pesquisa de Clima';
