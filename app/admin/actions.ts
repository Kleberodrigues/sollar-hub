"use server";

/**
 * Admin Dashboard Server Actions
 *
 * Server actions for fetching platform-wide metrics and data for the super admin dashboard.
 * All actions require is_super_admin = true in user_profiles.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  AdminDashboardMetrics,
  ChurnMetrics,
  MRRTimeSeries,
  OrganizationListItem,
  OrganizationListFilters,
  OrganizationListResponse,
  PlanDistribution,
  PLAN_PRICES_MONTHLY_CENTS,
} from "@/types/admin.types";
import type { PlanType, SubscriptionStatus } from "@/types";

// ============================================
// Helper: Verify Super Admin Access
// ============================================

async function verifySuperAdminAccess(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("user_profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single()) as any;

  if (!profile?.is_super_admin) {
    return { success: false, error: "Acesso negado: requer privilégios de super admin" };
  }

  return { success: true, userId: user.id };
}

// ============================================
// Get Dashboard Metrics
// ============================================

export async function getAdminDashboardMetrics(): Promise<{
  metrics?: AdminDashboardMetrics;
  error?: string;
}> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error };
  }

  const supabase = await createClient();

  try {
    // Fetch all metrics in parallel
    const [
      orgsResult,
      newOrgsResult,
      usersResult,
      newUsersResult,
      subsResult,
      baseCount,
      intermediarioCount,
      avancadoCount,
      canceledCount,
      trialingCount,
      currentMonthRevenue,
      lastMonthRevenue,
      assessmentsResult,
      newAssessmentsResult,
    ] = await Promise.all([
      // Total organizations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("organizations").select("id", { count: "exact", head: true }),
      // New organizations (30 days)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("organizations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      // Total users
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("user_profiles").select("id", { count: "exact", head: true }),
      // New users (30 days)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      // Active subscriptions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      // Plan counts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "base")
        .eq("status", "active"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "intermediario")
        .eq("status", "active"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "avancado")
        .eq("status", "active"),
      // Canceled subscriptions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "canceled"),
      // Trialing subscriptions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "trialing"),
      // Current month revenue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("payment_history")
        .select("amount_cents")
        .eq("status", "paid")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      // Last month revenue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("payment_history")
        .select("amount_cents")
        .eq("status", "paid")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
        .lt("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      // Total assessments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("assessments").select("id", { count: "exact", head: true }),
      // New assessments (30 days)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("assessments")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Sum revenue amounts
    const currentRevenue = currentMonthRevenue.data?.reduce(
      (sum: number, p: { amount_cents: number }) => sum + (p.amount_cents || 0),
      0
    ) || 0;
    const lastRevenue = lastMonthRevenue.data?.reduce(
      (sum: number, p: { amount_cents: number }) => sum + (p.amount_cents || 0),
      0
    ) || 0;

    const metrics: AdminDashboardMetrics = {
      totalOrganizations: orgsResult.count || 0,
      newOrganizations30d: newOrgsResult.count || 0,
      totalUsers: usersResult.count || 0,
      newUsers30d: newUsersResult.count || 0,
      activeSubscriptions: subsResult.count || 0,
      planDistribution: {
        base: baseCount.count || 0,
        intermediario: intermediarioCount.count || 0,
        avancado: avancadoCount.count || 0,
      },
      canceledSubscriptions: canceledCount.count || 0,
      trialingSubscriptions: trialingCount.count || 0,
      revenueCurrentMonthCents: currentRevenue,
      revenueLastMonthCents: lastRevenue,
      totalAssessments: assessmentsResult.count || 0,
      assessments30d: newAssessmentsResult.count || 0,
    };

    return { metrics };
  } catch (error) {
    console.error("[Admin] Error fetching dashboard metrics:", error);
    return { error: "Erro ao buscar métricas do dashboard" };
  }
}

// ============================================
// Get MRR Time Series
// ============================================

export async function getMRRTimeSeries(months: number = 12): Promise<{
  data?: MRRTimeSeries;
  error?: string;
}> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error };
  }

  const supabase = await createClient();

  try {
    // Get all subscriptions with creation and cancellation dates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscriptions, error } = (await (supabase as any)
      .from("subscriptions")
      .select("id, plan, status, created_at, canceled_at")
      .in("status", ["active", "trialing", "canceled"])) as {
      data: Array<{
        id: string;
        plan: PlanType;
        status: string;
        created_at: string;
        canceled_at: string | null;
      }> | null;
      error: Error | null;
    };

    if (error) throw error;

    // Plan prices (monthly, in cents)
    const planPrices: Record<PlanType, number> = {
      base: 3308, // R$ 33,08
      intermediario: 4142, // R$ 41,42
      avancado: 4975, // R$ 49,75
    };

    // Generate month series
    const result: MRRTimeSeries = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      // Count active subscriptions for this month
      const activeInMonth = (subscriptions || []).filter((sub) => {
        const createdAt = new Date(sub.created_at);
        const canceledAt = sub.canceled_at ? new Date(sub.canceled_at) : null;

        // Subscription was created before or during this month
        const wasCreated = createdAt <= monthEnd;

        // Subscription was not canceled before this month started
        const wasNotCanceled = !canceledAt || canceledAt >= monthDate;

        return wasCreated && wasNotCanceled;
      });

      // Calculate MRR for this month
      const mrr = activeInMonth.reduce((sum, sub) => {
        return sum + (planPrices[sub.plan] || 0);
      }, 0);

      result.push({
        month: monthDate.toISOString().slice(0, 10),
        mrrCents: mrr,
        subscriptionCount: activeInMonth.length,
      });
    }

    return { data: result };
  } catch (error) {
    console.error("[Admin] Error fetching MRR time series:", error);
    return { error: "Erro ao buscar série temporal de MRR" };
  }
}

// ============================================
// Get Churn Metrics
// ============================================

export async function getChurnMetrics(): Promise<{
  metrics?: ChurnMetrics;
  error?: string;
}> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error };
  }

  const supabase = await createClient();

  try {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Get subscriptions that were active at month start
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: monthStartSubs } = (await (supabase as any)
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .lt("created_at", monthStart.toISOString())
      .or(`canceled_at.is.null,canceled_at.gte.${monthStart.toISOString()}`)) as any;

    // Get subscriptions canceled this month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: canceledSubs, count: canceledCount } = (await (supabase as any)
      .from("subscriptions")
      .select("plan", { count: "exact" })
      .gte("canceled_at", monthStart.toISOString())
      .lt("canceled_at", new Date().toISOString())) as any;

    const totalAtStart = monthStartSubs?.count || 1; // Avoid division by zero
    const canceled = canceledCount || 0;

    // Calculate churned MRR
    const planPrices: Record<string, number> = {
      base: 3308,
      intermediario: 4142,
      avancado: 4975,
    };

    const churnedMRR = (canceledSubs || []).reduce(
      (sum: number, sub: { plan: string }) => sum + (planPrices[sub.plan] || 0),
      0
    );

    return {
      metrics: {
        totalAtMonthStart: totalAtStart,
        canceledThisMonth: canceled,
        churnRate: totalAtStart > 0 ? Number(((canceled / totalAtStart) * 100).toFixed(2)) : 0,
        churnedMRRCents: churnedMRR,
      },
    };
  } catch (error) {
    console.error("[Admin] Error fetching churn metrics:", error);
    return { error: "Erro ao buscar métricas de churn" };
  }
}

// ============================================
// Get Organizations List
// ============================================

export async function getOrganizationsList(
  filters: OrganizationListFilters = {}
): Promise<OrganizationListResponse | { error: string }> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error! };
  }

  const supabase = await createClient();
  const { search, plan, status, page = 1, pageSize = 20 } = filters;
  const offset = (page - 1) * pageSize;

  try {
    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("organizations")
      .select(
        `
        id,
        name,
        created_at,
        subscriptions (
          plan,
          status
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Apply search filter
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: orgs, count, error } = await query;

    if (error) throw error;

    // Get user counts for each organization
    const orgIds = (orgs || []).map((o: { id: string }) => o.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userCounts } = (await (supabase as any)
      .from("user_profiles")
      .select("organization_id")
      .in("organization_id", orgIds)) as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessmentCounts } = (await (supabase as any)
      .from("assessments")
      .select("organization_id")
      .in("organization_id", orgIds)) as any;

    // Count by organization
    const userCountMap = new Map<string, number>();
    const assessmentCountMap = new Map<string, number>();

    (userCounts || []).forEach((u: { organization_id: string }) => {
      userCountMap.set(u.organization_id, (userCountMap.get(u.organization_id) || 0) + 1);
    });

    (assessmentCounts || []).forEach((a: { organization_id: string }) => {
      assessmentCountMap.set(a.organization_id, (assessmentCountMap.get(a.organization_id) || 0) + 1);
    });

    // Map to response format
    let organizations: OrganizationListItem[] = (orgs || []).map(
      (org: {
        id: string;
        name: string;
        created_at: string;
        subscriptions: Array<{ plan: PlanType; status: SubscriptionStatus }> | null;
      }) => {
        const subscription = org.subscriptions?.[0];
        return {
          id: org.id,
          name: org.name,
          createdAt: org.created_at,
          plan: subscription?.plan || null,
          subscriptionStatus: subscription?.status || null,
          userCount: userCountMap.get(org.id) || 0,
          assessmentCount: assessmentCountMap.get(org.id) || 0,
        };
      }
    );

    // Apply plan filter (client-side due to nested relation)
    if (plan) {
      organizations = organizations.filter((org) => org.plan === plan);
    }

    // Apply status filter (client-side due to nested relation)
    if (status) {
      organizations = organizations.filter((org) => org.subscriptionStatus === status);
    }

    return {
      organizations,
      total: count || 0,
      hasMore: offset + pageSize < (count || 0),
    };
  } catch (error) {
    console.error("[Admin] Error fetching organizations list:", error);
    return { error: "Erro ao buscar lista de organizações" };
  }
}

// ============================================
// Check Super Admin Status
// ============================================

export async function checkSuperAdminStatus(): Promise<{
  isSuperAdmin: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isSuperAdmin: false, error: "Não autenticado" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("user_profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single()) as any;

  return { isSuperAdmin: profile?.is_super_admin === true };
}
