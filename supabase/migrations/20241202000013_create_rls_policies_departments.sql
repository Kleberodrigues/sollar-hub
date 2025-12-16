-- ============================================================================
-- Migration 013: RLS Policies for departments & department_members tables
-- Created: 2024-12-02
-- Purpose: Org-scoped access for departments and their members
-- ============================================================================

-- ============================================================================
-- DEPARTMENTS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can view departments from their organization
CREATE POLICY "departments_select_own_org" ON public.departments
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

COMMENT ON POLICY "departments_select_own_org" ON public.departments IS
  'Users can view departments from their own organization only';

-- INSERT: Admins and managers can create departments in their organization
CREATE POLICY "departments_insert_admin_manager" ON public.departments
  FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      LIMIT 1
    )
  );

COMMENT ON POLICY "departments_insert_admin_manager" ON public.departments IS
  'Admins and managers can create departments in their organization';

-- UPDATE: Admins and managers can update departments in their organization
CREATE POLICY "departments_update_admin_manager" ON public.departments
  FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      LIMIT 1
    )
  )
  WITH CHECK (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      LIMIT 1
    )
  );

COMMENT ON POLICY "departments_update_admin_manager" ON public.departments IS
  'Admins and managers can update departments in their organization';

-- DELETE: Only admins can delete departments
CREATE POLICY "departments_delete_admin_only" ON public.departments
  FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      LIMIT 1
    )
  );

COMMENT ON POLICY "departments_delete_admin_only" ON public.departments IS
  'Only admins can delete departments in their organization';

-- ============================================================================
-- DEPARTMENT_MEMBERS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can view department memberships from their organization
CREATE POLICY "dept_members_select_own_org" ON public.department_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.departments d
      WHERE d.id = department_members.department_id
      AND d.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "dept_members_select_own_org" ON public.department_members IS
  'Users can view department memberships from their organization only';

-- INSERT: Admins and managers can add members to departments
CREATE POLICY "dept_members_insert_admin_manager" ON public.department_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.departments d
      WHERE d.id = department_members.department_id
      AND d.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "dept_members_insert_admin_manager" ON public.department_members IS
  'Admins and managers can add members to departments in their organization';

-- DELETE: Admins and managers can remove members from departments
CREATE POLICY "dept_members_delete_admin_manager" ON public.department_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.departments d
      WHERE d.id = department_members.department_id
      AND d.organization_id = (
        SELECT organization_id
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
        LIMIT 1
      )
    )
  );

COMMENT ON POLICY "dept_members_delete_admin_manager" ON public.department_members IS
  'Admins and managers can remove members from departments in their organization';
