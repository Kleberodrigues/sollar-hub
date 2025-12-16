-- Migration: 20251209000002_create_billing_tables.sql
-- Description: Create billing tables for Stripe integration (customers, subscriptions, payments)
-- Author: Claude
-- Date: 2025-12-09

-- ============================================
-- UP Migration
-- ============================================

-- Create plan_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('free', 'pro', 'enterprise');
    END IF;
END
$$;

-- Create subscription_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'active',
            'canceled',
            'past_due',
            'trialing',
            'unpaid',
            'incomplete',
            'incomplete_expired'
        );
    END IF;
END
$$;

-- ============================================
-- Table: billing_customers
-- Links Stripe customers to organizations
-- ============================================
CREATE TABLE IF NOT EXISTS billing_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_customers_org
    ON billing_customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe
    ON billing_customers(stripe_customer_id);

-- ============================================
-- Table: subscriptions
-- Stores subscription state for each organization
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    plan plan_type NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org
    ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe
    ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
    ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan
    ON subscriptions(plan);

-- ============================================
-- Table: payment_history
-- Records all payment transactions
-- ============================================
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'brl',
    status TEXT NOT NULL CHECK (status IN ('paid', 'failed', 'pending', 'refunded')),
    description TEXT,
    invoice_pdf_url TEXT,
    receipt_url TEXT,
    failure_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_org
    ON payment_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice
    ON payment_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status
    ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created
    ON payment_history(created_at DESC);

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: billing_customers
-- ============================================

-- Service role full access
CREATE POLICY "service_role_full_access_billing_customers"
    ON billing_customers FOR ALL
    USING (auth.role() = 'service_role');

-- Admins can view their org's billing customer
CREATE POLICY "org_admins_select_billing_customers"
    ON billing_customers FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE profile_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- RLS Policies: subscriptions
-- ============================================

-- Service role full access
CREATE POLICY "service_role_full_access_subscriptions"
    ON subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- All org members can view subscription (to check features)
CREATE POLICY "org_members_select_subscriptions"
    ON subscriptions FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE profile_id = auth.uid()
        )
    );

-- ============================================
-- RLS Policies: payment_history
-- ============================================

-- Service role full access
CREATE POLICY "service_role_full_access_payment_history"
    ON payment_history FOR ALL
    USING (auth.role() = 'service_role');

-- Only admins can view payment history
CREATE POLICY "org_admins_select_payment_history"
    ON payment_history FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE profile_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- Triggers for updated_at
-- ============================================

-- billing_customers trigger
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_billing_customers_updated_at'
    ) THEN
        CREATE TRIGGER update_billing_customers_updated_at
            BEFORE UPDATE ON billing_customers
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- subscriptions trigger
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at'
    ) THEN
        CREATE TRIGGER update_subscriptions_updated_at
            BEFORE UPDATE ON subscriptions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- ============================================
-- Helper function: Get organization plan
-- ============================================
CREATE OR REPLACE FUNCTION get_organization_plan(org_id UUID)
RETURNS plan_type AS $$
DECLARE
    org_plan plan_type;
BEGIN
    SELECT plan INTO org_plan
    FROM subscriptions
    WHERE organization_id = org_id
    AND status = 'active'
    LIMIT 1;

    RETURN COALESCE(org_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Helper function: Check if org has feature
-- ============================================
CREATE OR REPLACE FUNCTION org_has_feature(org_id UUID, feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    org_plan plan_type;
BEGIN
    org_plan := get_organization_plan(org_id);

    -- Define feature matrix
    CASE feature
        WHEN 'unlimited_assessments' THEN
            RETURN org_plan IN ('pro', 'enterprise');
        WHEN 'pdf_export' THEN
            RETURN org_plan IN ('pro', 'enterprise');
        WHEN 'api_access' THEN
            RETURN org_plan = 'enterprise';
        WHEN 'custom_branding' THEN
            RETURN org_plan IN ('pro', 'enterprise');
        WHEN 'priority_support' THEN
            RETURN org_plan IN ('pro', 'enterprise');
        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create default free subscription for existing orgs
-- ============================================
INSERT INTO subscriptions (organization_id, plan, status)
SELECT id, 'free', 'active'
FROM organizations
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions WHERE organization_id = organizations.id
)
ON CONFLICT (organization_id) DO NOTHING;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE billing_customers IS 'Links organizations to Stripe customers';
COMMENT ON TABLE subscriptions IS 'Stores subscription state for SaaS billing';
COMMENT ON TABLE payment_history IS 'Records all payment transactions from Stripe';

COMMENT ON COLUMN subscriptions.plan IS 'Current plan: free, pro, or enterprise';
COMMENT ON COLUMN subscriptions.status IS 'Stripe subscription status';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'If true, subscription will be canceled at period end';

COMMENT ON FUNCTION get_organization_plan IS 'Returns the current plan for an organization';
COMMENT ON FUNCTION org_has_feature IS 'Checks if organization has access to a specific feature based on plan';

-- ============================================
-- DOWN Migration (for reference)
-- ============================================
-- DROP FUNCTION IF EXISTS org_has_feature;
-- DROP FUNCTION IF EXISTS get_organization_plan;
-- DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
-- DROP TRIGGER IF EXISTS update_billing_customers_updated_at ON billing_customers;
-- DROP POLICY IF EXISTS "org_admins_select_payment_history" ON payment_history;
-- DROP POLICY IF EXISTS "service_role_full_access_payment_history" ON payment_history;
-- DROP POLICY IF EXISTS "org_members_select_subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "service_role_full_access_subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "org_admins_select_billing_customers" ON billing_customers;
-- DROP POLICY IF EXISTS "service_role_full_access_billing_customers" ON billing_customers;
-- DROP TABLE IF EXISTS payment_history;
-- DROP TABLE IF EXISTS subscriptions;
-- DROP TABLE IF EXISTS billing_customers;
-- DROP TYPE IF EXISTS subscription_status;
-- DROP TYPE IF EXISTS plan_type;
