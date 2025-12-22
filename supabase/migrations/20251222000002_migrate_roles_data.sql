-- ============================================================================
-- Migration: 20251222000002_migrate_roles_data.sql
-- Description: Migrate existing user roles to new structure
-- ============================================================================
--
-- Role Mapping:
--   admin (is_super_admin=true)  -> admin
--   admin (is_super_admin=false) -> responsavel_empresa
--   manager                      -> responsavel_empresa
--   member                       -> membro
--   viewer                       -> membro
-- ============================================================================

-- ============================================
-- Step 1: Migrate existing data
-- ============================================

-- First, update super admins to ensure they have admin role
UPDATE user_profiles
SET role = 'admin'
WHERE is_super_admin = true;

-- Convert non-super admin 'admin' and 'manager' to 'responsavel_empresa'
UPDATE user_profiles
SET role = 'responsavel_empresa'
WHERE role IN ('admin', 'manager')
AND (is_super_admin IS NULL OR is_super_admin = false);

-- Convert 'member' to 'membro'
UPDATE user_profiles
SET role = 'membro'
WHERE role = 'member';

-- Convert 'viewer' to 'membro'
UPDATE user_profiles
SET role = 'membro'
WHERE role = 'viewer';

-- ============================================
-- Step 2: Configure super admins by email
-- ============================================

-- Set Julia and Laura as super admins
UPDATE user_profiles
SET is_super_admin = true, role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('juliakalil@sollartreinamentos.com.br', 'lauracpn21@gmail.com')
);

-- ============================================
-- Step 3: Update column comment
-- ============================================

COMMENT ON COLUMN public.user_profiles.role IS
  'User role: admin (super admin only), responsavel_empresa (company admin), membro (limited access)';

-- ============================================
-- Step 4: Create helper function
-- ============================================

CREATE OR REPLACE FUNCTION can_manage_organization()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND (role = 'responsavel_empresa' OR is_super_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
  role_count RECORD;
BEGIN
  FOR role_count IN
    SELECT role, COUNT(*) as cnt
    FROM user_profiles
    GROUP BY role
  LOOP
    RAISE NOTICE 'Role %: % users', role_count.role, role_count.cnt;
  END LOOP;
  RAISE NOTICE 'Super admins: %', (SELECT COUNT(*) FROM user_profiles WHERE is_super_admin = true);
END $$;

SELECT 'Role data migration completed' AS status;
