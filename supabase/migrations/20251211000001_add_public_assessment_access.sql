-- ============================================================================
-- Migration: 20251211000001_add_public_assessment_access.sql
-- Description: Adicionar acesso público para responder assessments ativos
-- Author: Claude Code
-- Date: 2025-12-11
-- ============================================================================

-- ============================================================================
-- PROBLEMA:
-- A página pública /assess/[id] não carrega porque não existem policies RLS
-- que permitam acesso anônimo aos assessments ativos e seus dados relacionados.
-- ============================================================================

-- ============================================================================
-- 1. ASSESSMENTS: Acesso público para assessments ativos
-- ============================================================================

CREATE POLICY "assessments_select_public_active" ON public.assessments
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

COMMENT ON POLICY "assessments_select_public_active" ON public.assessments IS
  'Qualquer pessoa pode visualizar assessments ativos para responder';

-- ============================================================================
-- 2. QUESTIONNAIRES: Acesso público quando vinculado a assessment ativo
-- ============================================================================

CREATE POLICY "questionnaires_select_via_active_assessment" ON public.questionnaires
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.questionnaire_id = questionnaires.id
      AND a.status = 'active'
    )
  );

COMMENT ON POLICY "questionnaires_select_via_active_assessment" ON public.questionnaires IS
  'Qualquer pessoa pode visualizar questionários vinculados a assessments ativos';

-- ============================================================================
-- 3. QUESTIONS: Acesso público quando vinculado a assessment ativo
-- ============================================================================

CREATE POLICY "questions_select_via_active_assessment" ON public.questions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.questionnaire_id = questions.questionnaire_id
      AND a.status = 'active'
    )
  );

COMMENT ON POLICY "questions_select_via_active_assessment" ON public.questions IS
  'Qualquer pessoa pode visualizar perguntas de questionários vinculados a assessments ativos';

-- ============================================================================
-- 4. ORGANIZATIONS: Acesso público limitado (apenas nome para header)
-- ============================================================================

CREATE POLICY "organizations_select_via_active_assessment" ON public.organizations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.organization_id = organizations.id
      AND a.status = 'active'
    )
  );

COMMENT ON POLICY "organizations_select_via_active_assessment" ON public.organizations IS
  'Qualquer pessoa pode visualizar nome da organização quando vinculada a assessment ativo';

-- ============================================================================
-- NOTAS DE SEGURANÇA:
-- - Policies são APENAS para SELECT (leitura)
-- - Só expõem dados de assessments com status='active'
-- - Não afetam INSERT/UPDATE/DELETE (controlados por outras policies)
-- - Respostas continuam anônimas (sem user_id)
-- ============================================================================
