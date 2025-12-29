import { Suspense } from "react";
import { getAdminDashboardMetrics, getMRRTimeSeries, getOrganizationsList, getChurnMetrics } from "./actions";
import { KPICard, KPIGrid } from "@/components/admin/kpi-card";
import { MRRChart } from "@/components/admin/mrr-chart";
import { PlanDistributionChart } from "@/components/admin/plan-distribution-chart";
import { OrganizationsTable } from "@/components/admin/organizations-table";
import { calculateMRR } from "@/types/admin.types";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton for KPI cards
function KPICardsSkeleton() {
  return (
    <KPIGrid>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-border-light p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </KPIGrid>
  );
}

// Loading skeleton for charts
function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-border-light p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-[300px]" />
      </div>
      <div className="bg-white rounded-lg border border-border-light p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
}

// Main dashboard content
async function DashboardContent() {
  // Fetch all data in parallel
  const [metricsResult, mrrResult, orgsResult, churnResult] = await Promise.all([
    getAdminDashboardMetrics(),
    getMRRTimeSeries(12),
    getOrganizationsList({ page: 1, pageSize: 5 }),
    getChurnMetrics(),
  ]);

  if (metricsResult.error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-800">Erro ao carregar métricas: {metricsResult.error}</p>
      </div>
    );
  }

  const metrics = metricsResult.metrics!;
  const mrrData = mrrResult.data || [];
  const orgsData = "error" in orgsResult ? { organizations: [], total: 0, hasMore: false } : orgsResult;
  const churnData = churnResult.metrics;

  // Calculate MRR
  const currentMRR = calculateMRR(metrics.planDistribution);
  const previousMRR = mrrData.length >= 2 ? mrrData[mrrData.length - 2].mrrCents : currentMRR;
  const mrrChange = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

  // Prepare chart data
  const mrrChartData = mrrData.map((item) => ({
    month: item.month,
    mrr: item.mrrCents,
    subscriptions: item.subscriptionCount,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KPIGrid>
        <KPICard
          title="MRR (Receita Mensal)"
          value={currentMRR}
          change={mrrChange}
          changeLabel="vs. mês anterior"
          icon="currency"
          format="currency"
        />
        <KPICard
          title="Empresas Ativas"
          value={metrics.totalOrganizations}
          change={metrics.newOrganizations30d}
          changeLabel="novos (30d)"
          icon="building"
          trend={metrics.newOrganizations30d > 0 ? "up" : "neutral"}
        />
        <KPICard
          title="Total de Respondentes"
          value={metrics.totalResponses}
          icon="users"
        />
        <KPICard
          title="Taxa de Churn"
          value={churnData?.churnRate || 0}
          icon="percent"
          format="percent"
          trend={churnData && churnData.churnRate > 5 ? "down" : "up"}
        />
      </KPIGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MRRChart data={mrrChartData} />
        <PlanDistributionChart data={metrics.planDistribution} />
      </div>

      {/* Additional Metrics */}
      <KPIGrid columns={3}>
        <KPICard
          title="Avaliações Realizadas"
          value={metrics.totalAssessments}
          change={metrics.assessments30d}
          changeLabel="novos (30d)"
          icon="assessment"
          trend={metrics.assessments30d > 0 ? "up" : "neutral"}
        />
        <KPICard
          title="Total de Usuários"
          value={metrics.totalUsers}
          change={metrics.newUsers30d}
          changeLabel="novos (30d)"
          icon="users"
          trend={metrics.newUsers30d > 0 ? "up" : "neutral"}
        />
        <KPICard
          title="Receita Mensal"
          value={metrics.revenueCurrentMonthCents}
          format="currency"
          icon="currency"
          trend={metrics.revenueCurrentMonthCents > metrics.revenueLastMonthCents ? "up" : "down"}
        />
      </KPIGrid>

      {/* Recent Organizations */}
      <div>
        <h3 className="text-lg font-semibold text-pm-brown mb-4">
          Organizações Recentes
        </h3>
        <OrganizationsTable
          organizations={orgsData.organizations}
          total={orgsData.total}
          hasMore={orgsData.hasMore}
        />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pm-brown">
          Visão Geral da Plataforma
        </h1>
        <p className="text-text-muted mt-1">
          Métricas e indicadores de todas as organizações
        </p>
      </div>

      {/* Dashboard Content */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <KPICardsSkeleton />
            <ChartsSkeleton />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
