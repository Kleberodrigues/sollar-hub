-- ============================================================================
-- Migration 002: Create user_profiles table
-- Created: 2024-12-02
-- Purpose: Store user profile information linked to Supabase Auth
-- ============================================================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_organization_id_idx
  ON public.user_profiles(organization_id);

CREATE INDEX IF NOT EXISTS user_profiles_role_idx
  ON public.user_profiles(role);

CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx
  ON public.user_profiles(created_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.user_profiles IS
  'User profiles linked to Supabase Auth (extends auth.users)';

COMMENT ON COLUMN public.user_profiles.id IS
  'User ID (FK to auth.users - cascade delete on auth user deletion)';

COMMENT ON COLUMN public.user_profiles.organization_id IS
  'Organization this user belongs to (multi-tenant key)';

COMMENT ON COLUMN public.user_profiles.full_name IS
  'User full name for display';

COMMENT ON COLUMN public.user_profiles.role IS
  'User role: admin (full access), manager (manage assessments), member (view own data), viewer (read-only)';

COMMENT ON COLUMN public.user_profiles.avatar_url IS
  'URL to user avatar image';

COMMENT ON COLUMN public.user_profiles.created_at IS
  'Timestamp when user profile was created';

COMMENT ON COLUMN public.user_profiles.updated_at IS
  'Timestamp when user profile was last updated (auto-updated via trigger)';
