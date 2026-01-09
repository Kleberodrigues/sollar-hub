-- ============================================================================
-- Migration: 20260109000001_create_user_profile_trigger.sql
-- Description: Create trigger to auto-create user_profiles on auth.users insert
-- ============================================================================

-- ============================================
-- Step 1: Create function to handle new user creation
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'membro'  -- Default role, will be updated by webhook/registration
  )
  ON CONFLICT (id) DO NOTHING;  -- In case profile already exists
  RETURN NEW;
END;
$$;

-- ============================================
-- Step 2: Create trigger on auth.users
-- ============================================

-- Drop existing trigger if exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Step 3: Backfill missing profiles for existing users
-- ============================================

INSERT INTO public.user_profiles (id, full_name, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'membro'
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_profiles
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.id
  WHERE up.id IS NULL;

  RAISE NOTICE 'Missing profiles after backfill: %', missing_profiles;
END $$;

SELECT 'User profile trigger created and existing users backfilled' AS status;
