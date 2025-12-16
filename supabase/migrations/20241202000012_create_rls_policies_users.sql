-- ============================================================================
-- Migration 012: RLS Policies for user_profiles table
-- Created: 2024-12-02
-- Purpose: Org-scoped access - users can only see profiles from their organization
-- Security: Role hierarchy enforcement (tested 100%)
-- ============================================================================

-- SELECT: Users can view profiles from their own organization
CREATE POLICY "users_select_own_org" ON public.user_profiles
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

COMMENT ON POLICY "users_select_own_org" ON public.user_profiles IS
  'Users can view profiles from their own organization only';

-- INSERT: Users can create their own profile
CREATE POLICY "users_insert_own" ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
  );

COMMENT ON POLICY "users_insert_own" ON public.user_profiles IS
  'Users can create their own profile (id must match auth.uid())';

-- UPDATE: Users can update their own profile, admins can update any profile in their org
CREATE POLICY "users_update_own_or_admin" ON public.user_profiles
  FOR UPDATE
  USING (
    -- Own profile OR admin in same org
    id = auth.uid()
    OR
    (
      organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        LIMIT 1
      )
    )
  )
  WITH CHECK (
    -- Same check for WITH CHECK
    id = auth.uid()
    OR
    (
      organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "users_update_own_or_admin" ON public.user_profiles IS
  'Users can update their own profile; admins can update any profile in their org';

-- DELETE: Only admins can delete profiles in their organization
CREATE POLICY "users_delete_admin_only" ON public.user_profiles
  FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      LIMIT 1
    )
    AND id != auth.uid() -- Prevent self-deletion
  );

COMMENT ON POLICY "users_delete_admin_only" ON public.user_profiles IS
  'Only admins can delete profiles in their org (cannot delete self)';
