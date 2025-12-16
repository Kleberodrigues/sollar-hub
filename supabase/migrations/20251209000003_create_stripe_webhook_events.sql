-- Migration: 20251209000003_create_stripe_webhook_events.sql
-- Description: Create stripe_webhook_events table for idempotency
-- Author: Claude
-- Date: 2025-12-09

-- ============================================
-- UP Migration
-- ============================================

-- Create stripe_webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id
    ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at
    ON stripe_webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type
    ON stripe_webhook_events(event_type);

-- Enable RLS
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Service role can do everything (webhooks run as service role)
CREATE POLICY "service_role_full_access_stripe_webhook_events"
    ON stripe_webhook_events FOR ALL
    USING (auth.role() = 'service_role');

-- Admins can view webhook events
CREATE POLICY "admins_select_stripe_webhook_events"
    ON stripe_webhook_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM organization_members
            WHERE profile_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE stripe_webhook_events IS 'Stores Stripe webhook event IDs for idempotency to prevent duplicate processing';
COMMENT ON COLUMN stripe_webhook_events.stripe_event_id IS 'Unique Stripe event ID (evt_xxx)';
COMMENT ON COLUMN stripe_webhook_events.event_type IS 'Type of Stripe event (e.g., customer.subscription.updated)';
COMMENT ON COLUMN stripe_webhook_events.processed_at IS 'When the event was successfully processed';

-- ============================================
-- Cleanup old events (optional, run manually or via cron)
-- ============================================
-- Events older than 30 days can be safely deleted
-- DELETE FROM stripe_webhook_events WHERE created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- DOWN Migration (for reference)
-- ============================================
-- DROP POLICY IF EXISTS "service_role_full_access_stripe_webhook_events" ON stripe_webhook_events;
-- DROP POLICY IF EXISTS "admins_select_stripe_webhook_events" ON stripe_webhook_events;
-- DROP TABLE IF EXISTS stripe_webhook_events;
