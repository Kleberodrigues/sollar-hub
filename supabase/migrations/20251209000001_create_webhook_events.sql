-- Migration: 20251209000001_create_webhook_events.sql
-- Description: Create webhook_events table for n8n integration
-- Author: Claude
-- Date: 2025-12-09

-- ============================================
-- UP Migration
-- ============================================

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    attempts INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_org_id
    ON webhook_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status
    ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type
    ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at
    ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status_attempts
    ON webhook_events(status, attempts) WHERE status = 'failed';

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Service role can do everything
CREATE POLICY "service_role_full_access_webhook_events"
    ON webhook_events FOR ALL
    USING (auth.role() = 'service_role');

-- Admins can view webhook events for their organization
CREATE POLICY "org_admins_select_webhook_events"
    ON webhook_events FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE profile_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_webhook_events_updated_at'
    ) THEN
        CREATE TRIGGER update_webhook_events_updated_at
            BEFORE UPDATE ON webhook_events
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Add comment
COMMENT ON TABLE webhook_events IS 'Stores webhook events for n8n integration with retry support';
COMMENT ON COLUMN webhook_events.event_type IS 'Type of event (e.g., diagnostic.activated, risk.threshold.exceeded)';
COMMENT ON COLUMN webhook_events.payload IS 'Full JSON payload sent to webhook';
COMMENT ON COLUMN webhook_events.status IS 'Current status: pending, sent, failed, delivered';
COMMENT ON COLUMN webhook_events.attempts IS 'Number of delivery attempts';

-- ============================================
-- DOWN Migration (for reference)
-- ============================================
-- DROP TRIGGER IF EXISTS update_webhook_events_updated_at ON webhook_events;
-- DROP POLICY IF EXISTS "service_role_full_access_webhook_events" ON webhook_events;
-- DROP POLICY IF EXISTS "org_admins_select_webhook_events" ON webhook_events;
-- DROP TABLE IF EXISTS webhook_events;
