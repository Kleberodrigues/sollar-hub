-- ============================================================================
-- Migration: Create Notifications System
-- Created: 2025-12-18
-- Purpose: Sistema de notificações para progresso de pesquisas e ações
-- ============================================================================

-- 1. Criar enum para tipos de notificação
CREATE TYPE notification_type AS ENUM (
  'assessment_progress',    -- Pesquisa atingiu X% de respostas
  'assessment_deadline',    -- Faltam X dias para encerrar
  'assessment_completed',   -- Pesquisa encerrada
  'action_overdue',         -- Ação do plano atrasada
  'action_reminder',        -- Lembrete de ação
  'action_completed',       -- Ações concluídas
  'system'                  -- Notificações do sistema
);

-- 2. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- 3. Criar índices para performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- 4. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
-- Usuários podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias notificações (marcar como lida)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role pode inserir notificações
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 6. Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_organization_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, organization_id, type, title, message, data)
  VALUES (p_user_id, p_organization_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para notificar todos os usuários de uma organização
CREATE OR REPLACE FUNCTION notify_organization(
  p_organization_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_roles TEXT[] DEFAULT ARRAY['admin', 'manager']
) RETURNS INTEGER AS $$
DECLARE
  v_user RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_user IN
    SELECT id FROM user_profiles
    WHERE organization_id = p_organization_id
    AND role = ANY(p_roles)
  LOOP
    INSERT INTO notifications (user_id, organization_id, type, title, message, data)
    VALUES (v_user.id, p_organization_id, p_type, p_title, p_message, p_data);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para calcular e criar notificações de progresso de assessment
CREATE OR REPLACE FUNCTION check_assessment_progress() RETURNS TRIGGER AS $$
DECLARE
  v_assessment RECORD;
  v_total_expected INTEGER;
  v_total_responses INTEGER;
  v_progress_percent INTEGER;
  v_last_milestone INTEGER;
  v_milestones INTEGER[] := ARRAY[30, 50, 70, 90, 100];
  v_milestone INTEGER;
BEGIN
  -- Buscar informações do assessment
  SELECT a.*, q.title as questionnaire_title,
         (SELECT COUNT(*) FROM questions WHERE questionnaire_id = a.questionnaire_id) as question_count
  INTO v_assessment
  FROM assessments a
  JOIN questionnaires q ON q.id = a.questionnaire_id
  WHERE a.id = NEW.assessment_id;

  IF v_assessment IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calcular total de respostas únicas (por anonymous_id)
  SELECT COUNT(DISTINCT anonymous_id) INTO v_total_responses
  FROM responses
  WHERE assessment_id = NEW.assessment_id;

  -- Usar expected_responses se definido, senão usar um padrão
  v_total_expected := COALESCE(v_assessment.expected_responses, 100);

  -- Calcular porcentagem
  IF v_total_expected > 0 THEN
    v_progress_percent := (v_total_responses * 100) / v_total_expected;
  ELSE
    v_progress_percent := 0;
  END IF;

  -- Buscar último milestone notificado
  SELECT COALESCE((data->>'last_milestone')::INTEGER, 0) INTO v_last_milestone
  FROM notifications
  WHERE data->>'assessment_id' = NEW.assessment_id::TEXT
    AND type = 'assessment_progress'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Verificar se atingiu um novo milestone
  FOREACH v_milestone IN ARRAY v_milestones LOOP
    IF v_progress_percent >= v_milestone AND v_last_milestone < v_milestone THEN
      -- Criar notificação para a organização
      PERFORM notify_organization(
        v_assessment.organization_id,
        'assessment_progress',
        'Progresso da Pesquisa',
        format('A pesquisa "%s" atingiu %s%% de respostas (%s de %s participantes).',
               v_assessment.title, v_milestone, v_total_responses, v_total_expected),
        jsonb_build_object(
          'assessment_id', NEW.assessment_id,
          'assessment_title', v_assessment.title,
          'progress', v_progress_percent,
          'last_milestone', v_milestone,
          'responses', v_total_responses,
          'expected', v_total_expected
        )
      );
      EXIT; -- Só notifica um milestone por vez
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para verificar progresso quando nova resposta é inserida
DROP TRIGGER IF EXISTS check_assessment_progress_trigger ON responses;
CREATE TRIGGER check_assessment_progress_trigger
AFTER INSERT ON responses
FOR EACH ROW
EXECUTE FUNCTION check_assessment_progress();

-- 10. Função para verificar deadlines de assessments (rodar via cron)
CREATE OR REPLACE FUNCTION check_assessment_deadlines() RETURNS INTEGER AS $$
DECLARE
  v_assessment RECORD;
  v_days_remaining INTEGER;
  v_count INTEGER := 0;
  v_already_notified BOOLEAN;
BEGIN
  FOR v_assessment IN
    SELECT a.*, o.name as org_name
    FROM assessments a
    JOIN organizations o ON o.id = a.organization_id
    WHERE a.status = 'active'
      AND a.end_date IS NOT NULL
      AND a.end_date >= CURRENT_DATE
  LOOP
    v_days_remaining := v_assessment.end_date - CURRENT_DATE;

    -- Notificar em 7, 3, 1 dias
    IF v_days_remaining IN (7, 3, 1) THEN
      -- Verificar se já notificou hoje
      SELECT EXISTS(
        SELECT 1 FROM notifications
        WHERE data->>'assessment_id' = v_assessment.id::TEXT
          AND type = 'assessment_deadline'
          AND created_at::DATE = CURRENT_DATE
      ) INTO v_already_notified;

      IF NOT v_already_notified THEN
        PERFORM notify_organization(
          v_assessment.organization_id,
          'assessment_deadline',
          'Prazo da Pesquisa',
          format('Faltam %s %s para encerrar a pesquisa "%s".',
                 v_days_remaining,
                 CASE WHEN v_days_remaining = 1 THEN 'dia' ELSE 'dias' END,
                 v_assessment.title),
          jsonb_build_object(
            'assessment_id', v_assessment.id,
            'assessment_title', v_assessment.title,
            'days_remaining', v_days_remaining,
            'end_date', v_assessment.end_date
          )
        );
        v_count := v_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Adicionar coluna expected_responses na tabela assessments se não existir
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS expected_responses INTEGER DEFAULT 100;

COMMENT ON COLUMN assessments.expected_responses IS 'Número esperado de participantes para calcular progresso';

-- 12. Comentários nas tabelas
COMMENT ON TABLE notifications IS 'Sistema de notificações para usuários';
COMMENT ON COLUMN notifications.type IS 'Tipo da notificação: assessment_progress, assessment_deadline, action_overdue, etc.';
COMMENT ON COLUMN notifications.data IS 'Dados adicionais em JSON (assessment_id, progress, etc.)';
