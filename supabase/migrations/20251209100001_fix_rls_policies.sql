-- Migration: 20251209100001_fix_rls_policies.sql
-- Description: Fix RLS policies that reference non-existent organization_members table
-- The correct table is user_profiles which has organization_id
-- Author: Claude
-- Date: 2025-12-09

-- ============================================
-- FIX: webhook_events RLS policies
-- ============================================

-- Drop old policy that references organization_members
DROP POLICY IF EXISTS "org_admins_select_webhook_events" ON webhook_events;

-- Create corrected policy using user_profiles
CREATE POLICY "org_admins_select_webhook_events"
    ON webhook_events FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- FIX: billing_customers RLS policies
-- ============================================

-- Drop old policy
DROP POLICY IF EXISTS "org_admins_select_billing_customers" ON billing_customers;

-- Create corrected policy
CREATE POLICY "org_admins_select_billing_customers"
    ON billing_customers FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- FIX: subscriptions RLS policies
-- ============================================

-- Drop old policy
DROP POLICY IF EXISTS "org_members_select_subscriptions" ON subscriptions;

-- Create corrected policy (all org members can view subscription)
CREATE POLICY "org_members_select_subscriptions"
    ON subscriptions FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE id = auth.uid()
        )
    );

-- ============================================
-- FIX: payment_history RLS policies
-- ============================================

-- Drop old policy
DROP POLICY IF EXISTS "org_admins_select_payment_history" ON payment_history;

-- Create corrected policy
CREATE POLICY "org_admins_select_payment_history"
    ON payment_history FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- Verification comment
-- ============================================
COMMENT ON POLICY "org_admins_select_webhook_events" ON webhook_events
    IS 'Fixed: Uses user_profiles instead of non-existent organization_members';
COMMENT ON POLICY "org_admins_select_billing_customers" ON billing_customers
    IS 'Fixed: Uses user_profiles instead of non-existent organization_members';
COMMENT ON POLICY "org_members_select_subscriptions" ON subscriptions
    IS 'Fixed: Uses user_profiles instead of non-existent organization_members';
COMMENT ON POLICY "org_admins_select_payment_history" ON payment_history
    IS 'Fixed: Uses user_profiles instead of non-existent organization_members';

-- ============================================
-- FIX: stripe_webhook_events RLS policies
-- ============================================

-- Drop old policy
DROP POLICY IF EXISTS "admins_select_stripe_webhook_events" ON stripe_webhook_events;

-- Create corrected policy
CREATE POLICY "admins_select_stripe_webhook_events"
    ON stripe_webhook_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

COMMENT ON POLICY "admins_select_stripe_webhook_events" ON stripe_webhook_events
    IS 'Fixed: Uses user_profiles instead of non-existent organization_members';

-- Log success
SELECT 'RLS policies fixed successfully - using user_profiles instead of organization_members' as status;
