"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBillingHistory, type BillingItem, type BillingFilters } from "../actions";
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
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Building2,
  ExternalLink,
  DollarSign,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/types/admin.types";

// Status display configuration
const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "outline" }> = {
  paid: { label: "Pago", variant: "success" },
  pending: { label: "Pendente", variant: "warning" },
  failed: { label: "Falhou", variant: "danger" },
  refunded: { label: "Reembolsado", variant: "outline" },
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

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [payments, setPayments] = useState<BillingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters from URL
  const page = Number(searchParams.get("page")) || 1;
  const status = searchParams.get("status") || undefined;
  const pageSize = 20;

  // Load payments
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filters: BillingFilters = {
      page,
      pageSize,
      status,
    };

    const result = await getBillingHistory(filters);

    if ("error" in result) {
      setError(result.error);
    } else {
      setPayments(result.payments);
      setTotal(result.total);
      setTotalAmount(result.totalAmountCents);
      setHasMore(result.hasMore);
    }

    setLoading(false);
  }, [page, status]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Update URL with filters
  const updateFilters = (updates: Partial<BillingFilters & { page: number }>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/billing?${params.toString()}`);
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pm-brown">Faturamento</h1>
        <p className="text-text-muted mt-1">
          Histórico de pagamentos e faturamento da plataforma
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border-light p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Recebido</p>
              <p className="text-xl font-bold text-pm-brown">
                {loading ? <Skeleton className="h-6 w-24" /> : formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border-light p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total de Transações</p>
              <p className="text-xl font-bold text-pm-brown">
                {loading ? <Skeleton className="h-6 w-16" /> : total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border-light p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-pm-gold/20 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-pm-brown" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Ticket Médio</p>
              <p className="text-xl font-bold text-pm-brown">
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  formatCurrency(total > 0 ? Math.round(totalAmount / total) : 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-border-light p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              updateFilters({ status: value === "all" ? undefined : value, page: 1 })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
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
            `${total} pagamentos encontrados`
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
        ) : payments.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Nenhum pagamento encontrado</p>
            {status && (
              <Button
                variant="link"
                onClick={() => router.push("/admin/billing")}
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
                    Data
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-sm">
                    <Building2 className="h-4 w-4 inline-block mr-1" />
                    Organização
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-sm">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted text-sm">
                    Valor
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-text-muted text-sm">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const statusConfig = STATUS_CONFIG[payment.status] || {
                    label: payment.status,
                    variant: "outline" as const,
                  };

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-border-light last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-pm-gold/20 rounded-lg flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-pm-brown" />
                          </div>
                          <div>
                            <p className="font-medium text-pm-brown">
                              {formatDate(payment.createdAt)}
                            </p>
                            <p className="text-xs text-text-muted truncate max-w-[150px]">
                              ID: {payment.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {payment.organizationName ? (
                          <Link
                            href={`/admin/organizations/${payment.organizationId}`}
                            className="text-pm-brown hover:text-pm-terracotta transition-colors flex items-center gap-1"
                          >
                            {payment.organizationName}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-text-muted text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusConfig.variant} className="text-xs">
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-pm-brown">
                        {formatCurrency(payment.amountCents)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {payment.stripeInvoiceId && (
                          <Button variant="ghost" size="sm" className="gap-1" disabled>
                            Ver Invoice
                            <ExternalLink className="h-3 w-3" />
                          </Button>
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
