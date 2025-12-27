-- Migration: Rename Pulse questionnaire title
-- From: "Pulso Geral Mensal"
-- To: "Pesquisa de Clima"
-- Note: Questionnaire is protected by trigger, need to unlock temporarily

-- Step 1: Temporarily unlock the questionnaire
UPDATE questionnaires
SET is_locked = false
WHERE id = 'b2222222-2222-2222-2222-222222222222'::uuid;

-- Step 2: Update the title
UPDATE questionnaires
SET title = 'Pesquisa de Clima'
WHERE id = 'b2222222-2222-2222-2222-222222222222'::uuid;

-- Step 3: Re-lock the questionnaire
UPDATE questionnaires
SET is_locked = true
WHERE id = 'b2222222-2222-2222-2222-222222222222'::uuid;
