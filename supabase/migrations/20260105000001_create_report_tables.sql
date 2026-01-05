-- Migration: Create tables for report generation system
-- 20260105000001_create_report_tables.sql

-- Create report_type enum
DO $$ BEGIN
  CREATE TYPE report_type AS ENUM (
    'riscos_psicossociais',
    'clima_mensal',
    'plano_acao',
    'executivo_lideranca',
    'correlacao'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Report metadata
  report_type report_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  period_start DATE,
  period_end DATE,

  -- Content storage
  content JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  pdf_url TEXT,

  -- Generation metadata
  status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'archived')),
  ai_model VARCHAR(50),
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  error_message TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES generated_reports(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create report_nlp_analyses table for caching NLP results
CREATE TABLE IF NOT EXISTS report_nlp_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,

  -- Analysis data
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('themes', 'sentiment', 'keywords', 'summary')),
  content JSONB NOT NULL,
  response_count INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Unique constraint for caching
  UNIQUE(assessment_id, question_id, analysis_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_generated_reports_org ON generated_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_assessment ON generated_reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_generated_reports_status ON generated_reports(status);
CREATE INDEX IF NOT EXISTS idx_generated_reports_created ON generated_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reports_org_type ON generated_reports(organization_id, report_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_nlp_assessment ON report_nlp_analyses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_report_nlp_question ON report_nlp_analyses(question_id);
CREATE INDEX IF NOT EXISTS idx_report_nlp_expires ON report_nlp_analyses(expires_at);

-- Enable RLS
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_nlp_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_reports
CREATE POLICY "Users can view reports of their organization"
  ON generated_reports
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Admins can create reports for their organization"
  ON generated_reports
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsavel_empresa')
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Admins can update their organization reports"
  ON generated_reports
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsavel_empresa')
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Admins can delete their organization reports"
  ON generated_reports
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsavel_empresa')
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- RLS Policies for report_nlp_analyses
CREATE POLICY "Users can view NLP analyses of their assessments"
  ON report_nlp_analyses
  FOR SELECT
  USING (
    assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN user_profiles up ON up.organization_id = a.organization_id
      WHERE up.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "System can manage NLP analyses"
  ON report_nlp_analyses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsavel_empresa')
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_generated_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_generated_reports_updated_at ON generated_reports;
CREATE TRIGGER update_generated_reports_updated_at
  BEFORE UPDATE ON generated_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_reports_updated_at();
