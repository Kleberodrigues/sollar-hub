-- Migration: Create action_plans table
-- Date: 2025-12-24

-- Create action_plans table
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  responsible TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  risk_block TEXT,
  comments TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints separately
ALTER TABLE action_plans ADD CONSTRAINT action_plans_status_check
  CHECK (status IN ('pending', 'in_progress', 'delayed', 'completed'));

ALTER TABLE action_plans ADD CONSTRAINT action_plans_risk_block_check
  CHECK (risk_block IS NULL OR risk_block IN (
    'demands_and_pace',
    'autonomy_clarity_change',
    'leadership_recognition',
    'relationships_communication',
    'work_life_health',
    'violence_harassment'
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_action_plans_organization ON action_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_assessment ON action_plans(assessment_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);
CREATE INDEX IF NOT EXISTS idx_action_plans_risk_block ON action_plans(risk_block);

-- Enable RLS
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Select for org members
CREATE POLICY "action_plans_select_org_members"
  ON action_plans FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy: Insert for admin/manager
CREATE POLICY "action_plans_insert_admin_manager"
  ON action_plans FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'responsavel_empresa')
    )
  );

-- RLS Policy: Update for admin/manager
CREATE POLICY "action_plans_update_admin_manager"
  ON action_plans FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'responsavel_empresa')
    )
  );

-- RLS Policy: Delete for admin only
CREATE POLICY "action_plans_delete_admin"
  ON action_plans FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsavel_empresa')
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_action_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_action_plans_updated_at ON action_plans;

CREATE TRIGGER trigger_action_plans_updated_at
  BEFORE UPDATE ON action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_action_plans_updated_at();

-- Grant permissions
GRANT ALL ON action_plans TO authenticated;
GRANT ALL ON action_plans TO service_role;
