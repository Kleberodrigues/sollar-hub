-- ============================================================================
-- Migration 011: RLS Policies for organizations table
-- Created: 2024-12-02
-- Purpose: Multi-tenant isolation - users can only access their own organization
-- Security: Prevents cross-organization data access (tested 100%)
-- ============================================================================

-- SELECT: Users can view their own organization
CREATE POLICY "orgs_select_own" ON public.organizations
  FOR SELECT
  USING (
    id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

COMMENT ON POLICY "orgs_select_own" ON public.organizations IS
  'Users can view only their own organization';

-- INSERT: Authenticated users can create organizations
CREATE POLICY "orgs_insert_authenticated" ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON POLICY "orgs_insert_authenticated" ON public.organizations IS
  'Authenticated users can create new organizations';

-- UPDATE: Only admins can update their own organization
CREATE POLICY "orgs_update_own_admin" ON public.organizations
  FOR UPDATE
  USING (
    id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      LIMIT 1
    )
  )
  WITH CHECK (
    id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      LIMIT 1
    )
  );

COMMENT ON POLICY "orgs_update_own_admin" ON public.organizations IS
  'Only admins can update their own organization (cross-org blocked)';

-- DELETE: Only admins can delete their own organization
CREATE POLICY "orgs_delete_own_admin" ON public.organizations
  FOR DELETE
  USING (
    id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      LIMIT 1
    )
  );

COMMENT ON POLICY "orgs_delete_own_admin" ON public.organizations IS
  'Only admins can delete their own organization';
