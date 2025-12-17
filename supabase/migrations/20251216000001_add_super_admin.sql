-- Migration: 20251216000001_add_super_admin.sql
-- Description: Add super admin functionality for platform-wide visibility
-- Author: Claude
-- Date: 2025-12-16

-- ============================================
-- Purpose: Enable the SaaS owner to view all organizations,
-- subscriptions, users, and metrics across the entire platform.
-- Super admins have READ-ONLY access to all data.
-- ============================================

-- ============================================
-- Step 1: Add is_super_admin column to user_profiles
-- ============================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Create partial index for efficient super_admin lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_super_admin
ON user_profiles(is_super_admin)
WHERE is_super_admin = TRUE;

COMMENT ON COLUMN user_profiles.is_super_admin IS
  'Platform-level super admin flag. Super admins can view all data across all organizations (read-only).';

-- ============================================
-- Step 2: Create helper function is_super_admin()
-- ============================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_super_admin() IS
  'Returns TRUE if current user is a platform super admin';

-- ============================================
-- Step 3: RLS Policies - Super admin can view ALL organizations
-- ============================================
CREATE POLICY "super_admin_view_all_organizations"
ON organizations FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_organizations" ON organizations IS
  'Super admins can view all organizations across the platform';

-- ============================================
-- Step 4: RLS Policies - Super admin can view ALL user profiles
-- ============================================
CREATE POLICY "super_admin_view_all_user_profiles"
ON user_profiles FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_user_profiles" ON user_profiles IS
  'Super admins can view all user profiles across the platform';

-- ============================================
-- Step 5: RLS Policies - Super admin can view ALL subscriptions
-- ============================================
CREATE POLICY "super_admin_view_all_subscriptions"
ON subscriptions FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_subscriptions" ON subscriptions IS
  'Super admins can view all subscriptions across the platform';

-- ============================================
-- Step 6: RLS Policies - Super admin can view ALL billing customers
-- ============================================
CREATE POLICY "super_admin_view_all_billing_customers"
ON billing_customers FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_billing_customers" ON billing_customers IS
  'Super admins can view all billing customers across the platform';

-- ============================================
-- Step 7: RLS Policies - Super admin can view ALL payment history
-- ============================================
CREATE POLICY "super_admin_view_all_payment_history"
ON payment_history FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_payment_history" ON payment_history IS
  'Super admins can view all payment history across the platform';

-- ============================================
-- Step 8: RLS Policies - Super admin can view ALL departments
-- ============================================
CREATE POLICY "super_admin_view_all_departments"
ON departments FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_departments" ON departments IS
  'Super admins can view all departments across the platform';

-- ============================================
-- Step 9: RLS Policies - Super admin can view ALL assessments
-- ============================================
CREATE POLICY "super_admin_view_all_assessments"
ON assessments FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_assessments" ON assessments IS
  'Super admins can view all assessments across the platform';

-- ============================================
-- Step 10: RLS Policies - Super admin can view ALL webhook events
-- ============================================
CREATE POLICY "super_admin_view_all_webhook_events"
ON webhook_events FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_webhook_events" ON webhook_events IS
  'Super admins can view all webhook events across the platform';

-- ============================================
-- Step 11: RLS Policies - Super admin can view ALL Stripe webhook events
-- ============================================
CREATE POLICY "super_admin_view_all_stripe_webhook_events"
ON stripe_webhook_events FOR SELECT
USING (is_super_admin());

COMMENT ON POLICY "super_admin_view_all_stripe_webhook_events" ON stripe_webhook_events IS
  'Super admins can view all Stripe webhook events across the platform';

-- ============================================
-- Step 12: Create view for admin dashboard metrics
-- This aggregates data for the super admin dashboard
-- ============================================
CREATE OR REPLACE VIEW admin_platform_metrics AS
SELECT
  (SELECT COUNT(*) FROM organizations) AS total_organizations,
  (SELECT COUNT(*) FROM organizations WHERE created_at >= NOW() - INTERVAL '30 days') AS new_organizations_30d,
  (SELECT COUNT(*) FROM user_profiles) AS total_users,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at >= NOW() - INTERVAL '30 days') AS new_users_30d,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') AS active_subscriptions,
  (SELECT COUNT(*) FROM subscriptions WHERE plan = 'base' AND status = 'active') AS plan_base_count,
  (SELECT COUNT(*) FROM subscriptions WHERE plan = 'intermediario' AND status = 'active') AS plan_intermediario_count,
  (SELECT COUNT(*) FROM subscriptions WHERE plan = 'avancado' AND status = 'active') AS plan_avancado_count,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'canceled') AS canceled_subscriptions,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'trialing') AS trialing_subscriptions,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM payment_history WHERE status = 'paid' AND created_at >= DATE_TRUNC('month', NOW())) AS revenue_current_month_cents,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM payment_history WHERE status = 'paid' AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW())) AS revenue_last_month_cents,
  (SELECT COUNT(*) FROM assessments) AS total_assessments,
  (SELECT COUNT(*) FROM assessments WHERE created_at >= NOW() - INTERVAL '30 days') AS assessments_30d;

COMMENT ON VIEW admin_platform_metrics IS
  'Aggregated platform metrics for super admin dashboard';

-- ============================================
-- Step 13: Grant access to admin_platform_metrics view
-- ============================================
-- RLS doesn't apply to views directly, so we secure via function
CREATE OR REPLACE FUNCTION get_admin_platform_metrics()
RETURNS TABLE (
  total_organizations BIGINT,
  new_organizations_30d BIGINT,
  total_users BIGINT,
  new_users_30d BIGINT,
  active_subscriptions BIGINT,
  plan_base_count BIGINT,
  plan_intermediario_count BIGINT,
  plan_avancado_count BIGINT,
  canceled_subscriptions BIGINT,
  trialing_subscriptions BIGINT,
  revenue_current_month_cents BIGINT,
  revenue_last_month_cents BIGINT,
  total_assessments BIGINT,
  assessments_30d BIGINT
) AS $$
BEGIN
  -- Only super admins can call this function
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: requires super admin privileges';
  END IF;

  RETURN QUERY SELECT * FROM admin_platform_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_admin_platform_metrics() IS
  'Returns platform metrics for super admin dashboard (requires super admin privileges)';

-- ============================================
-- Step 14: Create function to get organizations list with details
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_organizations_list(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_plan plan_type DEFAULT NULL,
  p_status subscription_status DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_at TIMESTAMPTZ,
  plan plan_type,
  subscription_status subscription_status,
  user_count BIGINT,
  assessment_count BIGINT
) AS $$
BEGIN
  -- Only super admins can call this function
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: requires super admin privileges';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.created_at,
    s.plan,
    s.status AS subscription_status,
    (SELECT COUNT(*) FROM user_profiles up WHERE up.organization_id = o.id) AS user_count,
    (SELECT COUNT(*) FROM assessments a WHERE a.organization_id = o.id) AS assessment_count
  FROM organizations o
  LEFT JOIN subscriptions s ON s.organization_id = o.id
  WHERE
    (p_search IS NULL OR o.name ILIKE '%' || p_search || '%')
    AND (p_plan IS NULL OR s.plan = p_plan)
    AND (p_status IS NULL OR s.status = p_status)
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_admin_organizations_list IS
  'Returns paginated list of organizations with details for super admin (requires super admin privileges)';

-- ============================================
-- Step 15: Create function to get MRR time series
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_mrr_timeseries(
  p_months INT DEFAULT 12
)
RETURNS TABLE (
  month DATE,
  mrr_cents BIGINT,
  subscription_count BIGINT
) AS $$
BEGIN
  -- Only super admins can call this function
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: requires super admin privileges';
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT generate_series(
      DATE_TRUNC('month', NOW() - (p_months || ' months')::INTERVAL),
      DATE_TRUNC('month', NOW()),
      '1 month'::INTERVAL
    )::DATE AS month
  ),
  -- Plan prices in cents (annual prices / 12 for MRR)
  plan_prices AS (
    SELECT 'base'::plan_type AS plan, 33083 AS monthly_cents -- R$ 397/ano = R$ 33,08/mes
    UNION ALL
    SELECT 'intermediario'::plan_type, 41416 -- R$ 497/ano = R$ 41,42/mes
    UNION ALL
    SELECT 'avancado'::plan_type, 49750 -- R$ 597/ano = R$ 49,75/mes
  )
  SELECT
    m.month,
    COALESCE(SUM(pp.monthly_cents), 0)::BIGINT AS mrr_cents,
    COUNT(s.id)::BIGINT AS subscription_count
  FROM months m
  LEFT JOIN subscriptions s ON
    s.created_at <= m.month + INTERVAL '1 month'
    AND (s.canceled_at IS NULL OR s.canceled_at > m.month)
    AND s.status IN ('active', 'trialing')
  LEFT JOIN plan_prices pp ON pp.plan = s.plan
  GROUP BY m.month
  ORDER BY m.month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_admin_mrr_timeseries IS
  'Returns MRR time series for super admin dashboard (requires super admin privileges)';

-- ============================================
-- Step 16: Create function to get churn metrics
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_churn_metrics()
RETURNS TABLE (
  total_at_month_start BIGINT,
  canceled_this_month BIGINT,
  churn_rate NUMERIC,
  churned_mrr_cents BIGINT
) AS $$
DECLARE
  month_start DATE;
BEGIN
  -- Only super admins can call this function
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: requires super admin privileges';
  END IF;

  month_start := DATE_TRUNC('month', NOW())::DATE;

  RETURN QUERY
  WITH month_start_subs AS (
    SELECT COUNT(*) AS cnt
    FROM subscriptions
    WHERE created_at < month_start
    AND (canceled_at IS NULL OR canceled_at >= month_start)
    AND status IN ('active', 'trialing')
  ),
  canceled_subs AS (
    SELECT COUNT(*) AS cnt
    FROM subscriptions
    WHERE canceled_at >= month_start
    AND canceled_at < NOW()
  ),
  plan_prices AS (
    SELECT 'base'::plan_type AS plan, 33083 AS monthly_cents
    UNION ALL
    SELECT 'intermediario'::plan_type, 41416
    UNION ALL
    SELECT 'avancado'::plan_type, 49750
  ),
  churned_revenue AS (
    SELECT COALESCE(SUM(pp.monthly_cents), 0) AS total
    FROM subscriptions s
    JOIN plan_prices pp ON pp.plan = s.plan
    WHERE s.canceled_at >= month_start
    AND s.canceled_at < NOW()
  )
  SELECT
    ms.cnt AS total_at_month_start,
    cs.cnt AS canceled_this_month,
    CASE
      WHEN ms.cnt > 0 THEN ROUND((cs.cnt::NUMERIC / ms.cnt::NUMERIC) * 100, 2)
      ELSE 0
    END AS churn_rate,
    cr.total::BIGINT AS churned_mrr_cents
  FROM month_start_subs ms, canceled_subs cs, churned_revenue cr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_admin_churn_metrics IS
  'Returns churn metrics for super admin dashboard (requires super admin privileges)';

-- ============================================
-- Verification
-- ============================================
SELECT 'Super admin migration completed successfully' AS status;
