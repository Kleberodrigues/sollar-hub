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
// Get Organization Details
// ============================================

export interface OrganizationDetails {
  id: string;
  name: string;
  createdAt: string;
  subscription: {
    plan: PlanType | null;
    status: SubscriptionStatus | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
  } | null;
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  departments: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
  assessments: Array<{
    id: string;
    title: string;
    status: string;
    responseCount: number;
    createdAt: string;
  }>;
  stats: {
    totalUsers: number;
    totalDepartments: number;
    totalAssessments: number;
    totalResponses: number;
  };
  recentPayments: Array<{
    id: string;
    amountCents: number;
    status: string;
    createdAt: string;
  }>;
}

export async function getOrganizationDetails(
  organizationId: string
): Promise<{ organization?: OrganizationDetails; error?: string }> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error };
  }

  const supabase = await createClient();

  try {
    // Fetch organization with subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: org, error: orgError } = (await (supabase as any)
      .from("organizations")
      .select(`
        id,
        name,
        created_at,
        subscriptions (
          plan,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          trial_end
        )
      `)
      .eq("id", organizationId)
      .single()) as any;

    if (orgError || !org) {
      return { error: "Organização não encontrada" };
    }

    // Fetch users with their auth emails
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users } = (await (supabase as any)
      .from("user_profiles")
      .select("id, full_name, role, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })) as any;

    // Get user emails from auth (using admin client would be better, but we use RPC or join)
    const _userIds = (users || []).map((u: { id: string }) => u.id);

    // Fetch departments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: departments } = (await (supabase as any)
      .from("departments")
      .select(`
        id,
        name,
        department_members (id)
      `)
      .eq("organization_id", organizationId)
      .order("name")) as any;

    // Fetch assessments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessments } = (await (supabase as any)
      .from("assessments")
      .select(`
        id,
        title,
        status,
        created_at,
        responses (id)
      `)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(10)) as any;

    // Fetch recent payments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: payments } = (await (supabase as any)
      .from("payment_history")
      .select("id, amount_cents, status, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5)) as any;

    // Count total responses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalResponses } = (await (supabase as any)
      .from("responses")
      .select("id", { count: "exact", head: true })
      .in(
        "assessment_id",
        (assessments || []).map((a: { id: string }) => a.id)
      )) as any;

    const subscription = org.subscriptions?.[0];

    const organization: OrganizationDetails = {
      id: org.id,
      name: org.name,
      createdAt: org.created_at,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end,
          }
        : null,
      users: (users || []).map((u: any) => ({
        id: u.id,
        fullName: u.full_name,
        email: "", // Email not available directly from user_profiles
        role: u.role,
        createdAt: u.created_at,
      })),
      departments: (departments || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        memberCount: d.department_members?.length || 0,
      })),
      assessments: (assessments || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        responseCount: a.responses?.length || 0,
        createdAt: a.created_at,
      })),
      stats: {
        totalUsers: users?.length || 0,
        totalDepartments: departments?.length || 0,
        totalAssessments: assessments?.length || 0,
        totalResponses: totalResponses || 0,
      },
      recentPayments: (payments || []).map((p: any) => ({
        id: p.id,
        amountCents: p.amount_cents,
        status: p.status,
        createdAt: p.created_at,
      })),
    };

    return { organization };
  } catch (error) {
    console.error("[Admin] Error fetching organization details:", error);
    return { error: "Erro ao buscar detalhes da organização" };
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

// ============================================
// Get Users List (Platform-wide)
// ============================================

export interface UserListItem {
  id: string;
  fullName: string | null;
  role: string;
  organizationId: string | null;
  organizationName: string | null;
  createdAt: string;
  isSuperAdmin: boolean;
}

export interface UserListFilters {
  search?: string;
  role?: string;
  organizationId?: string;
  page?: number;
  pageSize?: number;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  hasMore: boolean;
}

export async function getUsersList(
  filters: UserListFilters = {}
): Promise<UserListResponse | { error: string }> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error! };
  }

  const supabase = await createClient();
  const { search, role, organizationId, page = 1, pageSize = 20 } = filters;
  const offset = (page - 1) * pageSize;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("user_profiles")
      .select(
        `
        id,
        full_name,
        role,
        organization_id,
        created_at,
        is_super_admin,
        organizations (
          name
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Apply search filter
    if (search) {
      query = query.ilike("full_name", `%${search}%`);
    }

    // Apply role filter
    if (role) {
      query = query.eq("role", role);
    }

    // Apply organization filter
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data: users, count, error } = await query;

    if (error) throw error;

    const mappedUsers: UserListItem[] = (users || []).map((u: any) => ({
      id: u.id,
      fullName: u.full_name,
      role: u.role,
      organizationId: u.organization_id,
      organizationName: u.organizations?.name || null,
      createdAt: u.created_at,
      isSuperAdmin: u.is_super_admin || false,
    }));

    return {
      users: mappedUsers,
      total: count || 0,
      hasMore: offset + pageSize < (count || 0),
    };
  } catch (error) {
    console.error("[Admin] Error fetching users list:", error);
    return { error: "Erro ao buscar lista de usuários" };
  }
}

// ============================================
// Get Billing History (Platform-wide)
// ============================================

export interface BillingItem {
  id: string;
  organizationId: string;
  organizationName: string | null;
  amountCents: number;
  status: string;
  stripeInvoiceId: string | null;
  createdAt: string;
}

export interface BillingFilters {
  organizationId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface BillingListResponse {
  payments: BillingItem[];
  total: number;
  totalAmountCents: number;
  hasMore: boolean;
}

export async function getBillingHistory(
  filters: BillingFilters = {}
): Promise<BillingListResponse | { error: string }> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error! };
  }

  const supabase = await createClient();
  const { organizationId, status, startDate, endDate, page = 1, pageSize = 20 } = filters;
  const offset = (page - 1) * pageSize;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("payment_history")
      .select(
        `
        id,
        organization_id,
        amount_cents,
        status,
        stripe_invoice_id,
        created_at,
        organizations (
          name
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: payments, count, error } = await query;

    if (error) throw error;

    // Get total amount for filtered payments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let totalQuery = (supabase as any)
      .from("payment_history")
      .select("amount_cents")
      .eq("status", "paid");

    if (organizationId) {
      totalQuery = totalQuery.eq("organization_id", organizationId);
    }
    if (startDate) {
      totalQuery = totalQuery.gte("created_at", startDate);
    }
    if (endDate) {
      totalQuery = totalQuery.lte("created_at", endDate);
    }

    const { data: totalData } = await totalQuery;
    const totalAmountCents = (totalData || []).reduce(
      (sum: number, p: { amount_cents: number }) => sum + (p.amount_cents || 0),
      0
    );

    const mappedPayments: BillingItem[] = (payments || []).map((p: any) => ({
      id: p.id,
      organizationId: p.organization_id,
      organizationName: p.organizations?.name || null,
      amountCents: p.amount_cents,
      status: p.status,
      stripeInvoiceId: p.stripe_invoice_id,
      createdAt: p.created_at,
    }));

    return {
      payments: mappedPayments,
      total: count || 0,
      totalAmountCents,
      hasMore: offset + pageSize < (count || 0),
    };
  } catch (error) {
    console.error("[Admin] Error fetching billing history:", error);
    return { error: "Erro ao buscar histórico de faturamento" };
  }
}

// ============================================
// Get Detailed Metrics
// ============================================

export interface DetailedMetrics {
  // User metrics
  usersByRole: Record<string, number>;
  userGrowth: Array<{ month: string; count: number }>;

  // Organization metrics
  orgsByPlan: Record<string, number>;
  orgGrowth: Array<{ month: string; count: number }>;

  // Assessment metrics
  totalAssessments: number;
  assessmentsByStatus: Record<string, number>;
  totalResponses: number;
  avgResponsesPerAssessment: number;

  // Revenue metrics
  revenueByMonth: Array<{ month: string; amountCents: number }>;
  revenueByPlan: Record<string, number>;
}

export async function getDetailedMetrics(): Promise<{
  metrics?: DetailedMetrics;
  error?: string;
}> {
  const accessCheck = await verifySuperAdminAccess();
  if (!accessCheck.success) {
    return { error: accessCheck.error };
  }

  const supabase = await createClient();

  try {
    // Fetch all data in parallel
    const [
      usersResult,
      orgsResult,
      subsResult,
      assessmentsResult,
      responsesResult,
      paymentsResult,
    ] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("user_profiles").select("role, created_at"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("organizations").select("created_at"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("subscriptions").select("plan, status"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("assessments").select("id, status, created_at"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("responses").select("id", { count: "exact", head: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("payment_history")
        .select("amount_cents, created_at")
        .eq("status", "paid"),
    ]);

    // Calculate users by role
    const usersByRole: Record<string, number> = {};
    (usersResult.data || []).forEach((u: { role: string }) => {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
    });

    // Calculate user growth (last 12 months)
    const userGrowth = calculateMonthlyGrowth(
      (usersResult.data || []).map((u: { created_at: string }) => u.created_at)
    );

    // Calculate org growth
    const orgGrowth = calculateMonthlyGrowth(
      (orgsResult.data || []).map((o: { created_at: string }) => o.created_at)
    );

    // Calculate orgs by plan (active subscriptions only)
    const orgsByPlan: Record<string, number> = {};
    (subsResult.data || [])
      .filter((s: { status: string }) => s.status === "active")
      .forEach((s: { plan: string }) => {
        orgsByPlan[s.plan] = (orgsByPlan[s.plan] || 0) + 1;
      });

    // Calculate assessments by status
    const assessmentsByStatus: Record<string, number> = {};
    (assessmentsResult.data || []).forEach((a: { status: string }) => {
      assessmentsByStatus[a.status] = (assessmentsByStatus[a.status] || 0) + 1;
    });

    // Calculate revenue by month
    const revenueByMonth = calculateRevenueByMonth(paymentsResult.data || []);

    // Calculate revenue by plan (estimated from active subscriptions)
    const planPrices: Record<string, number> = {
      base: 39700,
      intermediario: 49700,
      avancado: 59700,
    };
    const revenueByPlan: Record<string, number> = {};
    Object.entries(orgsByPlan).forEach(([plan, count]) => {
      revenueByPlan[plan] = (count as number) * (planPrices[plan] || 0);
    });

    const totalAssessments = assessmentsResult.data?.length || 0;
    const totalResponses = responsesResult.count || 0;

    return {
      metrics: {
        usersByRole,
        userGrowth,
        orgsByPlan,
        orgGrowth,
        totalAssessments,
        assessmentsByStatus,
        totalResponses,
        avgResponsesPerAssessment: totalAssessments > 0 ? Math.round(totalResponses / totalAssessments) : 0,
        revenueByMonth,
        revenueByPlan,
      },
    };
  } catch (error) {
    console.error("[Admin] Error fetching detailed metrics:", error);
    return { error: "Erro ao buscar métricas detalhadas" };
  }
}

// Helper function to calculate monthly growth
function calculateMonthlyGrowth(dates: string[]): Array<{ month: string; count: number }> {
  const now = new Date();
  const result: Array<{ month: string; count: number }> = [];

  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const count = dates.filter((d) => {
      const date = new Date(d);
      return date >= monthDate && date <= monthEnd;
    }).length;

    result.push({
      month: monthDate.toISOString().slice(0, 7),
      count,
    });
  }

  return result;
}

// Helper function to calculate revenue by month
function calculateRevenueByMonth(
  payments: Array<{ amount_cents: number; created_at: string }>
): Array<{ month: string; amountCents: number }> {
  const now = new Date();
  const result: Array<{ month: string; amountCents: number }> = [];

  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const amountCents = payments
      .filter((p) => {
        const date = new Date(p.created_at);
        return date >= monthDate && date <= monthEnd;
      })
      .reduce((sum, p) => sum + (p.amount_cents || 0), 0);

    result.push({
      month: monthDate.toISOString().slice(0, 7),
      amountCents,
    });
  }

  return result;
}
