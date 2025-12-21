"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrganizationsList } from "../actions";
import type { OrganizationListItem, OrganizationListFilters, PlanType, SubscriptionStatus } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  FileText,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/types/admin.types";

// Plan display configuration
const PLAN_CONFIG: Record<string, { label: string; color: string }> = {
  base: { label: "Base", color: "bg-blue-100 text-blue-800" },
  intermediario: { label: "Intermediário", color: "bg-amber-100 text-amber-800" },
  avancado: { label: "Avançado", color: "bg-pm-gold/20 text-pm-brown" },
};

// Status display configuration
const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "outline" }> = {
  active: { label: "Ativo", variant: "success" },
  trialing: { label: "Trial", variant: "warning" },
  canceled: { label: "Cancelado", variant: "danger" },
  past_due: { label: "Pendente", variant: "warning" },
};

// Loading skeleton
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export default function OrganizationsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [_hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters from URL
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const plan = (searchParams.get("plan") as PlanType) || undefined;
  const status = (searchParams.get("status") as SubscriptionStatus) || undefined;
  const pageSize = 20;

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState(search);

  // Load organizations
  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filters: OrganizationListFilters = {
      page,
      pageSize,
      search: search || undefined,
      plan,
      status,
    };

    const result = await getOrganizationsList(filters);

    if ("error" in result) {
      setError(result.error);
    } else {
      setOrganizations(result.organizations);
      setTotal(result.total);
      setHasMore(result.hasMore);
    }

    setLoading(false);
  }, [page, search, plan, status]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateFilters({ search: searchInput, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL with filters
  const updateFilters = (updates: Partial<OrganizationListFilters & { page: number }>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/organizations?${params.toString()}`);
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pm-brown">Organizações</h1>
        <p className="text-text-muted mt-1">
          Gerencie e visualize todas as organizações da plataforma
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-border-light p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Buscar por nome..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Plan Filter */}
          <Select
            value={plan || "all"}
            onValueChange={(value) =>
              updateFilters({ plan: value === "all" ? undefined : (value as PlanType), page: 1 })
            }
          >
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

          {/* Status Filter */}
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              updateFilters({ status: value === "all" ? undefined : (value as SubscriptionStatus), page: 1 })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="trialing">Trial</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>
          {loading ? (
            <Skeleton className="h-4 w-32 inline-block" />
          ) : (
            `${total} organizações encontradas`
          )}
        </span>
        <span>
          Página {page} de {totalPages || 1}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-border-light overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Nenhuma organização encontrada</p>
            {(search || plan || status) && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchInput("");
                  router.push("/admin/organizations");
                }}
                className="mt-2"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border-light">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-sm">
                    Organização
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-sm">
                    Plano
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-sm">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-text-muted text-sm">
                    <Users className="h-4 w-4 inline-block mr-1" />
                    Usuários
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-text-muted text-sm">
                    <FileText className="h-4 w-4 inline-block mr-1" />
                    Avaliações
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted text-sm">
                    Criado em
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted text-sm">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => {
                  const planConfig = org.plan ? PLAN_CONFIG[org.plan] : null;
                  const statusConfig = org.subscriptionStatus
                    ? STATUS_CONFIG[org.subscriptionStatus]
                    : null;

                  return (
                    <tr
                      key={org.id}
                      className="border-b border-border-light last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-pm-gold/20 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-pm-brown" />
                          </div>
                          <div>
                            <p className="font-medium text-pm-brown">{org.name}</p>
                            <p className="text-xs text-text-muted truncate max-w-[200px]">
                              ID: {org.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {planConfig ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planConfig.color}`}
                          >
                            {planConfig.label}
                          </span>
                        ) : (
                          <span className="text-text-muted text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {statusConfig ? (
                          <Badge variant={statusConfig.variant} className="text-xs">
                            {statusConfig.label}
                          </Badge>
                        ) : (
                          <span className="text-text-muted text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-pm-brown font-medium">{org.userCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-pm-brown font-medium">{org.assessmentCount}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-text-muted text-sm">
                        {formatDate(org.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/organizations/${org.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            Ver detalhes
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilters({ page: page - 1 })}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "primary" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ page: pageNum })}
                  disabled={loading}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilters({ page: page + 1 })}
            disabled={page >= totalPages || loading}
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
