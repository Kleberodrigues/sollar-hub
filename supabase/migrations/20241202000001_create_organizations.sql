-- ============================================================================
-- Migration 001: Create organizations table
-- Created: 2024-12-02
-- Purpose: Store organization/company information for multi-tenant architecture
-- ============================================================================

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to organizations
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS organizations_created_at_idx
  ON public.organizations(created_at DESC);

-- Add table and column comments for documentation
COMMENT ON TABLE public.organizations IS
  'Organizations/companies using the platform (multi-tenant root entity)';

COMMENT ON COLUMN public.organizations.id IS
  'Unique organization identifier (UUID)';

COMMENT ON COLUMN public.organizations.name IS
  'Company/organization name';

COMMENT ON COLUMN public.organizations.industry IS
  'Industry sector (e.g., Technology, Healthcare, Manufacturing)';

COMMENT ON COLUMN public.organizations.size IS
  'Company size (e.g., 1-10, 11-50, 51-200, 201-500, 501+)';

COMMENT ON COLUMN public.organizations.created_at IS
  'Timestamp when organization was created';

COMMENT ON COLUMN public.organizations.updated_at IS
  'Timestamp when organization was last updated (auto-updated via trigger)';
