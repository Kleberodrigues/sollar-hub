"use client";

import { useEffect, useState } from "react";
import { getDetailedMetrics, type DetailedMetrics } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";
import { formatCurrency, PLAN_LABELS, PLAN_COLORS } from "@/types/admin.types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

// Loading skeleton
function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  );
}

// Role labels
const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  admin: "Admin",
  member: "Membro",
};

// Role colors
const ROLE_COLORS: Record<string, string> = {
  owner: "#456807",
  admin: "#789750",
  member: "#77953E",
};

// Assessment status labels
const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  completed: "Concluído",
  archived: "Arquivado",
};

// Assessment status colors
const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  active: "#22c55e",
  completed: "#3b82f6",
  archived: "#6b7280",
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      setError(null);

      const result = await getDetailedMetrics();

      if (result.error) {
        setError(result.error);
      } else if (result.metrics) {
        setMetrics(result.metrics);
      }

      setLoading(false);
    }

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pm-brown">Métricas</h1>
          <p className="text-text-muted mt-1">Análise detalhada da plataforma</p>
        </div>
        <MetricsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600">Nenhuma métrica disponível</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userGrowthData = metrics.userGrowth.map((d) => ({
    month: new Date(d.month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    usuarios: d.count,
  }));

  const orgGrowthData = metrics.orgGrowth.map((d) => ({
    month: new Date(d.month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    organizacoes: d.count,
  }));

  const revenueData = metrics.revenueByMonth.map((d) => ({
    month: new Date(d.month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    receita: d.amountCents / 100,
  }));

  const usersByRoleData = Object.entries(metrics.usersByRole).map(([role, count]) => ({
    name: ROLE_LABELS[role] || role,
    value: count,
    fill: ROLE_COLORS[role] || "#789750",
  }));

  const orgsByPlanData = Object.entries(metrics.orgsByPlan).map(([plan, count]) => ({
    name: PLAN_LABELS[plan as keyof typeof PLAN_LABELS] || plan,
    value: count,
    fill: PLAN_COLORS[plan as keyof typeof PLAN_COLORS] || "#789750",
  }));

  const assessmentsByStatusData = Object.entries(metrics.assessmentsByStatus).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    fill: STATUS_COLORS[status] || "#789750",
  }));

  // Calculate totals
  const totalUsers = Object.values(metrics.usersByRole).reduce((sum, count) => sum + count, 0);
  const totalOrgs = Object.values(metrics.orgsByPlan).reduce((sum, count) => sum + count, 0);
  const totalRevenue = metrics.revenueByMonth.reduce((sum, d) => sum + d.amountCents, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pm-brown">Métricas</h1>
        <p className="text-text-muted mt-1">Análise detalhada da plataforma</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Usuários</p>
                <p className="text-2xl font-bold text-pm-brown">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Orgs Ativas</p>
                <p className="text-2xl font-bold text-pm-brown">{totalOrgs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-pm-olive/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-pm-olive" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Avaliações</p>
                <p className="text-2xl font-bold text-pm-brown">{metrics.totalAssessments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Receita Total</p>
                <p className="text-2xl font-bold text-pm-brown">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pm-brown">
              <TrendingUp className="h-5 w-5" />
              Crescimento de Usuários (12 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="usuarios"
                    stroke="#789750"
                    strokeWidth={2}
                    dot={{ fill: "#789750" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Organization Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pm-brown">
              <Building2 className="h-5 w-5" />
              Crescimento de Organizações (12 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orgGrowthData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="organizacoes" fill="#456807" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pm-brown">
              <DollarSign className="h-5 w-5" />
              Receita Mensal (12 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Receita"]} />
                  <Bar dataKey="receita" fill="#77953E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pm-brown">
              <MessageSquare className="h-5 w-5" />
              Estatísticas de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-pm-brown">{metrics.totalResponses}</p>
                <p className="text-sm text-text-muted">Total Respostas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-pm-brown">{metrics.avgResponsesPerAssessment}</p>
                <p className="text-sm text-text-muted">Média por Avaliação</p>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={assessmentsByStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {assessmentsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 - Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pm-brown">
              <PieChart className="h-5 w-5" />
              Distribuição de Usuários por Cargo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={usersByRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {usersByRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Organizations by Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pm-brown">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Organizações por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={orgsByPlanData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orgsByPlanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
