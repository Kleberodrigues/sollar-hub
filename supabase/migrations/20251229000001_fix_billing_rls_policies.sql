-- ============================================================================
-- Migration: 20251229000001_fix_billing_rls_policies.sql
-- Description: Fix billing RLS policies to use user_profiles (not organization_members)
--              and use correct role name (responsavel_empresa instead of admin)
-- Author: Claude
-- Date: 2025-12-29
-- ============================================================================

-- ============================================
-- Fix billing_customers RLS Policies
-- ============================================

-- Drop incorrect policy
DROP POLICY IF EXISTS "org_admins_select_billing_customers" ON billing_customers;

-- Create corrected policy using user_profiles
CREATE POLICY "org_responsavel_select_billing_customers"
    ON billing_customers FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'responsavel_empresa'
        )
        OR (
            SELECT is_super_admin()
        )
    );

-- ============================================
-- Fix subscriptions RLS Policies
-- ============================================

-- Drop incorrect policy
DROP POLICY IF EXISTS "org_members_select_subscriptions" ON subscriptions;

-- Create corrected policy - all org members can view (to check features)
CREATE POLICY "org_members_select_subscriptions"
    ON subscriptions FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE id = auth.uid()
        )
        OR (
            SELECT is_super_admin()
        )
    );

-- ============================================
-- Fix payment_history RLS Policies
-- ============================================

-- Drop incorrect policy
DROP POLICY IF EXISTS "org_admins_select_payment_history" ON payment_history;

-- Create corrected policy using user_profiles
CREATE POLICY "org_responsavel_select_payment_history"
    ON payment_history FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'responsavel_empresa'
        )
        OR (
            SELECT is_super_admin()
        )
    );

-- ============================================
-- Comments
-- ============================================
COMMENT ON POLICY "org_responsavel_select_billing_customers" ON billing_customers IS
    'Only responsavel_empresa and super_admin can view billing customer info';

COMMENT ON POLICY "org_members_select_subscriptions" ON subscriptions IS
    'All organization members can view subscription (to check feature access)';

COMMENT ON POLICY "org_responsavel_select_payment_history" ON payment_history IS
    'Only responsavel_empresa and super_admin can view payment history';

SELECT 'Billing RLS policies fixed for user_profiles table' AS status;

-- ============================================
-- DOWN Migration (for reference)
-- ============================================
-- DROP POLICY IF EXISTS "org_responsavel_select_payment_history" ON payment_history;
-- DROP POLICY IF EXISTS "org_members_select_subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "org_responsavel_select_billing_customers" ON billing_customers;
