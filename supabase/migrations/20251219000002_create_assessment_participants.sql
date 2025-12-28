-- Migration: Create assessment_participants table
-- Purpose: Store imported participants for automated email dispatch via n8n

-- Create the assessment_participants table
CREATE TABLE IF NOT EXISTS assessment_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  role VARCHAR(255), -- cargo/position
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'bounced', 'opted_out')),
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id, email)
);

-- Create indexes for common queries
CREATE INDEX idx_assessment_participants_assessment ON assessment_participants(assessment_id);
CREATE INDEX idx_assessment_participants_org ON assessment_participants(organization_id);
CREATE INDEX idx_assessment_participants_status ON assessment_participants(status);
CREATE INDEX idx_assessment_participants_email ON assessment_participants(email);

-- Enable RLS
ALTER TABLE assessment_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view participants in their organization
CREATE POLICY "Users can view participants in their organization"
  ON assessment_participants
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Admins and managers can insert participants
CREATE POLICY "Admins and managers can insert participants"
  ON assessment_participants
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsavel_empresa')
    )
  );

-- Admins and managers can update participants
CREATE POLICY "Admins and managers can update participants"
  ON assessment_participants
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsavel_empresa')
    )
  );

-- Admins can delete participants
CREATE POLICY "Admins can delete participants"
  ON assessment_participants
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_assessment_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assessment_participants_updated_at
  BEFORE UPDATE ON assessment_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_participants_updated_at();

-- Add comment
COMMENT ON TABLE assessment_participants IS 'Stores imported participants for assessments, used for automated email dispatch via n8n';
