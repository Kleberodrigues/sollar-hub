-- ============================================================================
-- Migration: 20251211000002_fix_org_visibility.sql
-- Description: Corrigir vazamento de nomes de organizações para usuários autenticados
-- Author: Claude Code
-- Date: 2025-12-11
-- ============================================================================

-- ============================================================================
-- PROBLEMA:
-- A política "organizations_select_via_active_assessment" estava configurada
-- para "anon, authenticated", permitindo que usuários logados vissem TODAS
-- as organizações com assessments ativos (não apenas a sua própria).
--
-- SOLUÇÃO:
-- Restringir a política apenas para "anon" (usuários não autenticados).
-- Usuários autenticados já têm a política ORGS_SELECT_OWN que permite
-- ver apenas sua própria organização.
-- ============================================================================

-- Remover política com problema
DROP POLICY IF EXISTS "organizations_select_via_active_assessment" ON public.organizations;

-- Recriar política APENAS para usuários anônimos
CREATE POLICY "organizations_select_via_active_assessment" ON public.organizations
  FOR SELECT
  TO anon  -- APENAS usuários não autenticados (respondendo assessments públicos)
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.organization_id = organizations.id
      AND a.status = 'active'
    )
  );

COMMENT ON POLICY "organizations_select_via_active_assessment" ON public.organizations IS
  'Usuários anônimos podem ver nome da organização ao responder assessment público';

-- ============================================================================
-- CORREÇÃO ADICIONAL: Aplicar mesma lógica para outras políticas públicas
-- ============================================================================

-- Assessments: Manter para anon apenas
DROP POLICY IF EXISTS "assessments_select_public_active" ON public.assessments;

CREATE POLICY "assessments_select_public_active" ON public.assessments
  FOR SELECT
  TO anon  -- APENAS usuários não autenticados
  USING (status = 'active');

COMMENT ON POLICY "assessments_select_public_active" ON public.assessments IS
  'Usuários anônimos podem ver assessments ativos para responder';

-- Questionnaires: Manter para anon apenas
DROP POLICY IF EXISTS "questionnaires_select_via_active_assessment" ON public.questionnaires;

CREATE POLICY "questionnaires_select_via_active_assessment" ON public.questionnaires
  FOR SELECT
  TO anon  -- APENAS usuários não autenticados
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.questionnaire_id = questionnaires.id
      AND a.status = 'active'
    )
  );

COMMENT ON POLICY "questionnaires_select_via_active_assessment" ON public.questionnaires IS
  'Usuários anônimos podem ver questionários vinculados a assessments ativos';

-- Questions: Manter para anon apenas
DROP POLICY IF EXISTS "questions_select_via_active_assessment" ON public.questions;

CREATE POLICY "questions_select_via_active_assessment" ON public.questions
  FOR SELECT
  TO anon  -- APENAS usuários não autenticados
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.questionnaire_id = questions.questionnaire_id
      AND a.status = 'active'
    )
  );

COMMENT ON POLICY "questions_select_via_active_assessment" ON public.questions IS
  'Usuários anônimos podem ver perguntas de assessments ativos';

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Usuários anônimos em /assess/[id]: Veem assessment, questionário, perguntas
-- - Usuários logados no dashboard: Veem APENAS dados da sua própria org
-- - Testes de isolamento: Devem passar 100%
-- ============================================================================
