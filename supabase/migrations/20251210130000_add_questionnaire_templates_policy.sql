-- Migration: Adicionar política RLS para templates globais de questionários
-- Descrição: Permite que todos os usuários vejam os questionários padrão NR-1/NR-17
-- Data: 2024-12-10

-- Política para permitir acesso aos templates globais (Sollar Psicossocial e Pulse Mensal)
CREATE POLICY "questionnaires_select_templates" ON public.questionnaires
  FOR SELECT
  USING (
    id IN (
      'a1111111-1111-1111-1111-111111111111'::uuid,
      'b2222222-2222-2222-2222-222222222222'::uuid
    )
  );

-- Também precisamos permitir acesso às perguntas desses templates
CREATE POLICY "questions_select_templates" ON public.questions
  FOR SELECT
  USING (
    questionnaire_id IN (
      'a1111111-1111-1111-1111-111111111111'::uuid,
      'b2222222-2222-2222-2222-222222222222'::uuid
    )
  );
