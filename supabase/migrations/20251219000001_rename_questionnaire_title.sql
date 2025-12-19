-- Migration: Rename questionnaire title
-- From: "Questionário Sollar de Riscos Psicossociais"
-- To: "Diagnóstico de Riscos Psicossociais"

UPDATE questionnaires
SET title = 'Diagnóstico de Riscos Psicossociais'
WHERE title = 'Questionário Sollar de Riscos Psicossociais';
