-- =============================================
-- AI Generations Table
-- Tracks AI-generated analyses and action plans
-- Used for upsell/cross-sell based on usage quantity
-- =============================================

-- Create AI generation types enum
CREATE TYPE ai_generation_type AS ENUM ('analysis', 'action_plan');

-- Create AI generations table
CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Generation metadata
    type ai_generation_type NOT NULL,
    title VARCHAR(255) NOT NULL,

    -- Content storage
    content JSONB NOT NULL DEFAULT '{}',
    summary TEXT, -- Brief text summary for display

    -- Edit tracking
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    edited_by UUID REFERENCES auth.users(id),

    -- Versioning
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES ai_generations(id), -- For regenerated versions

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_ai_generations_org ON ai_generations(organization_id);
CREATE INDEX idx_ai_generations_assessment ON ai_generations(assessment_id);
CREATE INDEX idx_ai_generations_type ON ai_generations(type);
CREATE INDEX idx_ai_generations_created ON ai_generations(created_at DESC);
CREATE INDEX idx_ai_generations_org_type_created ON ai_generations(organization_id, type, created_at DESC);

-- Enable RLS
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view AI generations for their organization
CREATE POLICY "Users can view org AI generations"
ON ai_generations FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

-- Admins and managers can create AI generations
CREATE POLICY "Admins and managers can create AI generations"
ON ai_generations FOR INSERT
TO authenticated
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
);

-- Admins and managers can update AI generations
CREATE POLICY "Admins and managers can update AI generations"
ON ai_generations FOR UPDATE
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
);

-- Only admins can delete AI generations
CREATE POLICY "Admins can delete AI generations"
ON ai_generations FOR DELETE
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =============================================
-- AI Usage Tracking Table
-- Monthly usage counters for billing/limits
-- =============================================

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Counters
    analyses_count INTEGER DEFAULT 0,
    action_plans_count INTEGER DEFAULT 0,
    total_generations INTEGER DEFAULT 0,

    -- Limits (snapshot at period start)
    analyses_limit INTEGER DEFAULT 0,
    action_plans_limit INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint for org + period
    UNIQUE (organization_id, period_start)
);

-- Index for quick lookups
CREATE INDEX idx_ai_usage_org_period ON ai_usage(organization_id, period_start DESC);

-- Enable RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage
CREATE POLICY "Users can view org AI usage"
ON ai_usage FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

-- Only system can modify ai_usage (via service role)
CREATE POLICY "Service can manage AI usage"
ON ai_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =============================================
-- Function to get or create current period usage
-- =============================================

CREATE OR REPLACE FUNCTION get_or_create_ai_usage(p_organization_id UUID)
RETURNS ai_usage AS $$
DECLARE
    v_usage ai_usage;
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    -- Calculate current billing period (monthly)
    v_period_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    v_period_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    -- Try to get existing record
    SELECT * INTO v_usage
    FROM ai_usage
    WHERE organization_id = p_organization_id
    AND period_start = v_period_start;

    -- If not exists, create it
    IF NOT FOUND THEN
        INSERT INTO ai_usage (organization_id, period_start, period_end)
        VALUES (p_organization_id, v_period_start, v_period_end)
        RETURNING * INTO v_usage;
    END IF;

    RETURN v_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function to increment AI usage
-- =============================================

CREATE OR REPLACE FUNCTION increment_ai_usage(
    p_organization_id UUID,
    p_type ai_generation_type
)
RETURNS ai_usage AS $$
DECLARE
    v_usage ai_usage;
BEGIN
    -- Get or create current period
    v_usage := get_or_create_ai_usage(p_organization_id);

    -- Increment appropriate counter
    IF p_type = 'analysis' THEN
        UPDATE ai_usage
        SET analyses_count = analyses_count + 1,
            total_generations = total_generations + 1,
            updated_at = NOW()
        WHERE id = v_usage.id
        RETURNING * INTO v_usage;
    ELSIF p_type = 'action_plan' THEN
        UPDATE ai_usage
        SET action_plans_count = action_plans_count + 1,
            total_generations = total_generations + 1,
            updated_at = NOW()
        WHERE id = v_usage.id
        RETURNING * INTO v_usage;
    END IF;

    RETURN v_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Trigger to auto-update timestamps
-- =============================================

CREATE OR REPLACE FUNCTION update_ai_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_generations_updated_at
    BEFORE UPDATE ON ai_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_generations_updated_at();
