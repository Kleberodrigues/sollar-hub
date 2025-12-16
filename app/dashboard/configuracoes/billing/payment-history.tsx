/**
 * Payment History Table Component - Compact Enterprise Edition
 */

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Receipt, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

interface PaymentHistoryTableProps {
  organizationId: string;
}

interface Payment {
  id: string;
  stripe_invoice_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  invoice_pdf_url: string | null;
  receipt_url: string | null;
  created_at: string;
  failure_message: string | null;
}

export async function PaymentHistoryTable({ organizationId }: PaymentHistoryTableProps) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payments, error } = await (supabase
    .from("payment_history")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(10) as any);

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-8 w-8 mx-auto text-red-400 mb-2" />
        <p className="text-sm text-red-600">Erro ao carregar histórico</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-8 w-8 mx-auto text-text-muted mb-2" />
        <p className="text-sm text-text-muted">Nenhum pagamento ainda</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light">
            <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Data</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Valor</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Status</th>
            <th className="text-right py-2 px-3 text-xs font-medium text-text-muted">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light/50">
          {payments.map((payment: Payment) => (
            <tr key={payment.id} className="hover:bg-bg-sage/10 transition-colors">
              <td className="py-2 px-3 text-text-secondary">
                {new Date(payment.created_at).toLocaleDateString("pt-BR")}
              </td>
              <td className="py-2 px-3 font-medium text-text-heading">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: payment.currency.toUpperCase(),
                }).format(payment.amount_cents / 100)}
              </td>
              <td className="py-2 px-3">
                <StatusBadge status={payment.status} />
              </td>
              <td className="py-2 px-3">
                <div className="flex justify-end gap-1">
                  {payment.invoice_pdf_url && (
                    <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                      <a href={payment.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  {payment.receipt_url && (
                    <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                      <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
    paid: {
      className: "bg-green-50 text-green-700 border-green-200",
      label: "Pago",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    pending: {
      className: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Pendente",
      icon: <Clock className="h-3 w-3" />,
    },
    failed: {
      className: "bg-red-50 text-red-700 border-red-200",
      label: "Falhou",
      icon: <XCircle className="h-3 w-3" />,
    },
    refunded: {
      className: "bg-gray-50 text-gray-700 border-gray-200",
      label: "Reembolsado",
      icon: <RefreshCw className="h-3 w-3" />,
    },
  };

  const { className, label, icon } = config[status] || config.pending;

  return (
    <Badge variant="outline" className={`${className} text-xs gap-1 px-2 py-0.5`}>
      {icon}
      {label}
    </Badge>
  );
}
