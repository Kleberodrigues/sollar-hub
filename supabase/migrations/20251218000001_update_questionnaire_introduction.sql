-- ============================================================================
-- Migration: Update questionnaire introduction text
-- Created: 2025-12-18
-- Purpose: Update introduction text to add "completamente" and remove emoji
-- ============================================================================

-- Step 1: Temporarily unlock the questionnaire
UPDATE questionnaires
SET is_locked = false
WHERE id = 'a1111111-1111-1111-1111-111111111111'::uuid;

-- Step 2: Update the introduction text
UPDATE questionnaires
SET introduction_text = E'# Bem-vindo e bem vinda!\n\nEste questionário tem como objetivo mapear os principais fatores de risco psicossocial relacionados ao trabalho na nossa empresa, como carga de trabalho, liderança, clima, saúde mental e segurança psicológica.\n\nAs respostas são **completamente anônimas** e serão analisadas de forma **agrupada**, nunca individual.\n\nNão existem respostas certas ou erradas. O mais importante é que você responda com sinceridade, pensando na sua realidade *hoje*.\n\nO tempo médio de resposta é de *10 a 15 minutos*.\n\nObrigado(a) por contribuir para a construção de um ambiente de trabalho mais saudável e humano.'
WHERE id = 'a1111111-1111-1111-1111-111111111111'::uuid;

-- Step 3: Re-lock the questionnaire
UPDATE questionnaires
SET is_locked = true
WHERE id = 'a1111111-1111-1111-1111-111111111111'::uuid;
