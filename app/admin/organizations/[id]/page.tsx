"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrganizationDetails, type OrganizationDetails } from "../../actions";
import { KPICard, KPIGrid } from "@/components/admin/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  CreditCard,
  Calendar,
  Folder,
  MessageSquare,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/types/admin.types";

// Plan display names
const PLAN_NAMES: Record<string, string> = {
  base: "Base",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

// Subscription status display
const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "outline" }> = {
  active: { label: "Ativo", variant: "success" },
  trialing: { label: "Trial", variant: "warning" },
  canceled: { label: "Cancelado", variant: "danger" },
  past_due: { label: "Pagamento Pendente", variant: "warning" },
  paused: { label: "Pausado", variant: "outline" },
};

// Loading skeleton
function OrganizationDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-border-light p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border-light p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border-light p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrganization() {
      setLoading(true);
      setError(null);

      const result = await getOrganizationDetails(organizationId);

      if (result.error) {
        setError(result.error);
      } else if (result.organization) {
        setOrganization(result.organization);
      }

      setLoading(false);
    }

    if (organizationId) {
      loadOrganization();
    }
  }, [organizationId]);

  if (loading) {
    return <OrganizationDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">Organização não encontrada</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = organization.subscription?.status
    ? STATUS_CONFIG[organization.subscription.status] || { label: organization.subscription.status, variant: "outline" as const }
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/organizations">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-pm-brown" />
              <h1 className="text-2xl font-bold text-pm-brown">{organization.name}</h1>
            </div>
            <p className="text-text-muted mt-1">
              Criado em {formatDate(organization.createdAt)}
            </p>
          </div>
        </div>

        {organization.subscription && statusConfig && (
          <div className="flex items-center gap-3">
            <Badge variant={statusConfig.variant} className="text-sm px-3 py-1">
              {statusConfig.label}
            </Badge>
            {organization.subscription.plan && (
              <Badge variant="default" className="text-sm px-3 py-1">
                Plano {PLAN_NAMES[organization.subscription.plan] || organization.subscription.plan}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <KPIGrid>
        <KPICard
          title="Usuários"
          value={organization.stats.totalUsers}
          icon="users"
        />
        <KPICard
          title="Departamentos"
          value={organization.stats.totalDepartments}
          icon="building"
        />
        <KPICard
          title="Avaliações"
          value={organization.stats.totalAssessments}
          icon="assessment"
        />
        <KPICard
          title="Respostas"
          value={organization.stats.totalResponses}
          icon="chart"
        />
      </KPIGrid>

      {/* Subscription Details */}
      {organization.subscription && (
        <div className="bg-white rounded-lg border border-border-light p-6">
          <h3 className="text-lg font-semibold text-pm-brown mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Detalhes da Assinatura
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-text-muted">Plano</p>
              <p className="font-medium text-pm-brown">
                {PLAN_NAMES[organization.subscription.plan || ""] || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Status</p>
              <p className="font-medium text-pm-brown">
                {statusConfig?.label || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Período Atual</p>
              <p className="font-medium text-pm-brown">
                {organization.subscription.currentPeriodStart
                  ? `${formatDate(organization.subscription.currentPeriodStart)} - ${formatDate(organization.subscription.currentPeriodEnd || "")}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Trial Termina</p>
              <p className="font-medium text-pm-brown">
                {organization.subscription.trialEnd
                  ? formatDate(organization.subscription.trialEnd)
                  : "N/A"}
              </p>
            </div>
          </div>
          {organization.subscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800 text-sm">
                Esta assinatura será cancelada ao final do período atual.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Table */}
        <div className="bg-white rounded-lg border border-border-light p-6">
          <h3 className="text-lg font-semibold text-pm-brown mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({organization.users.length})
          </h3>
          {organization.users.length === 0 ? (
            <p className="text-text-muted text-sm">Nenhum usuário encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2 px-2 font-medium text-text-muted">Nome</th>
                    <th className="text-left py-2 px-2 font-medium text-text-muted">Papel</th>
                    <th className="text-right py-2 px-2 font-medium text-text-muted">Criado</th>
                  </tr>
                </thead>
                <tbody>
                  {organization.users.slice(0, 10).map((user) => (
                    <tr key={user.id} className="border-b border-border-light last:border-0">
                      <td className="py-2 px-2 text-pm-brown">{user.fullName || "Sem nome"}</td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-right text-text-muted">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {organization.users.length > 10 && (
                <p className="text-text-muted text-sm mt-2 text-center">
                  E mais {organization.users.length - 10} usuários...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Departments Table */}
        <div className="bg-white rounded-lg border border-border-light p-6">
          <h3 className="text-lg font-semibold text-pm-brown mb-4 flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Departamentos ({organization.departments.length})
          </h3>
          {organization.departments.length === 0 ? (
            <p className="text-text-muted text-sm">Nenhum departamento encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2 px-2 font-medium text-text-muted">Nome</th>
                    <th className="text-right py-2 px-2 font-medium text-text-muted">Membros</th>
                  </tr>
                </thead>
                <tbody>
                  {organization.departments.map((dept) => (
                    <tr key={dept.id} className="border-b border-border-light last:border-0">
                      <td className="py-2 px-2 text-pm-brown">{dept.name}</td>
                      <td className="py-2 px-2 text-right text-text-muted">
                        {dept.memberCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white rounded-lg border border-border-light p-6">
        <h3 className="text-lg font-semibold text-pm-brown mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Avaliações Recentes ({organization.assessments.length})
        </h3>
        {organization.assessments.length === 0 ? (
          <p className="text-text-muted text-sm">Nenhuma avaliação encontrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left py-2 px-2 font-medium text-text-muted">Título</th>
                  <th className="text-left py-2 px-2 font-medium text-text-muted">Status</th>
                  <th className="text-right py-2 px-2 font-medium text-text-muted">Respostas</th>
                  <th className="text-right py-2 px-2 font-medium text-text-muted">Criado</th>
                </tr>
              </thead>
              <tbody>
                {organization.assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-border-light last:border-0">
                    <td className="py-2 px-2 text-pm-brown">{assessment.title}</td>
                    <td className="py-2 px-2">
                      <Badge
                        variant={assessment.status === "published" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {assessment.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-right text-text-muted flex items-center justify-end gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {assessment.responseCount}
                    </td>
                    <td className="py-2 px-2 text-right text-text-muted">
                      {formatDate(assessment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg border border-border-light p-6">
        <h3 className="text-lg font-semibold text-pm-brown mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Pagamentos Recentes
        </h3>
        {organization.recentPayments.length === 0 ? (
          <p className="text-text-muted text-sm">Nenhum pagamento encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left py-2 px-2 font-medium text-text-muted">Data</th>
                  <th className="text-left py-2 px-2 font-medium text-text-muted">Status</th>
                  <th className="text-right py-2 px-2 font-medium text-text-muted">Valor</th>
                </tr>
              </thead>
              <tbody>
                {organization.recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border-light last:border-0">
                    <td className="py-2 px-2 text-pm-brown">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-2 px-2">
                      <Badge
                        variant={payment.status === "paid" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {payment.status === "paid" ? "Pago" : payment.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-pm-brown">
                      {formatCurrency(payment.amountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
