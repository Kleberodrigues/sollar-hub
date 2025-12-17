"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Users, FileText, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLAN_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  type OrganizationListItem,
} from "@/types/admin.types";
import type { PlanType, SubscriptionStatus } from "@/types";
import { cn } from "@/lib/utils";

interface OrganizationsTableProps {
  organizations: OrganizationListItem[];
  total: number;
  hasMore: boolean;
  onSearch?: (search: string) => void;
  onPlanFilter?: (plan: PlanType | "all") => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

// Get badge variant based on subscription status
function getStatusBadgeVariant(
  status: SubscriptionStatus | null
): "default" | "success" | "warning" | "outline" {
  switch (status) {
    case "active":
      return "success";
    case "trialing":
      return "default";
    case "past_due":
    case "unpaid":
      return "warning";
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
      return "outline";
    default:
      return "outline";
  }
}

// Get badge variant based on plan
function getPlanBadgeColor(plan: PlanType | null): string {
  switch (plan) {
    case "avancado":
      return "bg-pm-green-dark text-white";
    case "intermediario":
      return "bg-pm-olive text-white";
    case "base":
      return "bg-pm-green-medium text-white";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function OrganizationsTable({
  organizations,
  total,
  hasMore,
  onSearch,
  onPlanFilter,
  onLoadMore,
  isLoading,
}: OrganizationsTableProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanType | "all">("all");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handlePlanChange = (value: PlanType | "all") => {
    setPlanFilter(value);
    onPlanFilter?.(value);
  };

  return (
    <div className="bg-white rounded-lg border border-border-light shadow-sm">
      {/* Header with search and filters */}
      <div className="p-4 border-b border-border-light">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Buscar organização..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={planFilter} onValueChange={handlePlanChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="intermediario">Intermediário</SelectItem>
              <SelectItem value="avancado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-text-muted mt-2">
          {total} organização{total !== 1 ? "ões" : ""} encontrada
          {total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-sage">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                Organização
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                Plano
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                Status
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary">
                Usuários
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary">
                Avaliações
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                Criada em
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  Nenhuma organização encontrada
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr
                  key={org.id}
                  className="hover:bg-bg-tertiary cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/organizations/${org.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-bg-sage rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-pm-olive" />
                      </div>
                      <div>
                        <p className="font-medium text-pm-brown">{org.name}</p>
                        <p className="text-xs text-text-muted truncate max-w-[200px]">
                          ID: {org.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                        getPlanBadgeColor(org.plan)
                      )}
                    >
                      {org.plan ? PLAN_LABELS[org.plan] : "Sem plano"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(org.subscriptionStatus)}>
                      {org.subscriptionStatus
                        ? SUBSCRIPTION_STATUS_LABELS[org.subscriptionStatus]
                        : "N/A"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-text-muted" />
                      <span className="font-medium">{org.userCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="h-4 w-4 text-text-muted" />
                      <span className="font-medium">{org.assessmentCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-5 w-5 text-text-muted" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="p-4 border-t border-border-light text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}
    </div>
  );
}
