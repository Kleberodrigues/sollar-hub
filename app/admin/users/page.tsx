"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUsersList, type UserListItem, type UserListFilters } from "../actions";
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
  Users,
  Building2,
  Shield,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/types/admin.types";

// Role display configuration
const ROLE_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "outline" }> = {
  owner: { label: "Proprietário", variant: "success" },
  admin: { label: "Admin", variant: "warning" },
  member: { label: "Membro", variant: "outline" },
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

export default function UsersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [_hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters from URL
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || undefined;
  const pageSize = 20;

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState(search);

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filters: UserListFilters = {
      page,
      pageSize,
      search: search || undefined,
      role,
    };

    const result = await getUsersList(filters);

    if ("error" in result) {
      setError(result.error);
    } else {
      setUsers(result.users);
      setTotal(result.total);
      setHasMore(result.hasMore);
    }

    setLoading(false);
  }, [page, search, role]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
  const updateFilters = (updates: Partial<UserListFilters & { page: number }>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/users?${params.toString()}`);
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pm-brown">Usuários</h1>
        <p className="text-text-muted mt-1">
          Gerencie e visualize todos os usuários da plataforma
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

          {/* Role Filter */}
          <Select
            value={role || "all"}
            onValueChange={(value) =>
              updateFilters({ role: value === "all" ? undefined : value, page: 1 })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="owner">Proprietário</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Membro</SelectItem>
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
            `${total} usuários encontrados`
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
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Nenhum usuário encontrado</p>
            {(search || role) && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchInput("");
                  router.push("/admin/users");
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
                    Usuário
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-sm">
                    Cargo
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-sm">
                    <Building2 className="h-4 w-4 inline-block mr-1" />
                    Organização
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
                {users.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role] || { label: user.role, variant: "outline" as const };

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-border-light last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-pm-gold/20 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-pm-brown" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-pm-brown">
                                {user.fullName || "Sem nome"}
                              </p>
                              {user.isSuperAdmin && (
                                <span title="Super Admin">
                                  <Shield className="h-4 w-4 text-pm-terracotta" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted truncate max-w-[200px]">
                              ID: {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={roleConfig.variant} className="text-xs">
                          {roleConfig.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.organizationName ? (
                          <Link
                            href={`/admin/organizations/${user.organizationId}`}
                            className="text-pm-brown hover:text-pm-terracotta transition-colors flex items-center gap-1"
                          >
                            {user.organizationName}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-text-muted text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-text-muted text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.organizationId && (
                          <Link href={`/admin/organizations/${user.organizationId}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Ver org
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
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
