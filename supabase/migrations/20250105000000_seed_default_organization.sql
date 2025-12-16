-- ============================================================================
-- Migration: Seed Default Organization for Template Questionnaire
-- Created: 2025-01-05
-- Purpose: Create a default organization to hold template questionnaires
-- ============================================================================

INSERT INTO organizations (
  id,
  name,
  domain,
  business_sector,
  company_size,
  country,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Template Organization',
  'template.sollar.internal',
  'Template',
  '1-10',
  'BR',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
