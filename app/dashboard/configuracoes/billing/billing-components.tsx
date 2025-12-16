/**
 * Shared Billing Components
 * These components are used by both server and client billing components
 */

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Zap, Building2 } from "lucide-react";

export function PlanBadge({ plan }: { plan: string }) {
  const variants: Record<string, { icon: React.ReactNode; className: string }> = {
    free: {
      icon: <Zap className="h-3 w-3" />,
      className: "bg-gray-100 text-gray-700 border border-gray-200",
    },
    pro: {
      icon: <Crown className="h-3 w-3" />,
      className: "bg-pm-terracotta/10 text-pm-terracotta border border-pm-terracotta/30",
    },
    enterprise: {
      icon: <Building2 className="h-3 w-3" />,
      className: "bg-pm-olive/10 text-pm-olive border border-pm-olive/30",
    },
  };

  const variant = variants[plan] || variants.free;

  return (
    <Badge className={`${variant.className} flex items-center gap-1.5 px-3 py-1.5 font-medium`}>
      {variant.icon}
      <span className="capitalize">{plan}</span>
    </Badge>
  );
}

export function StatusIndicator({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500",
    trialing: "bg-blue-500",
    past_due: "bg-amber-500",
    canceled: "bg-gray-500",
    unpaid: "bg-red-500",
  };

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status] || colors.active} ring-2 ring-offset-2 ring-offset-white ${
        status === "active" ? "ring-green-200" :
        status === "trialing" ? "ring-blue-200" :
        status === "past_due" ? "ring-amber-200" :
        "ring-gray-200"
      }`}
    />
  );
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Ativo",
    trialing: "Periodo de teste",
    past_due: "Pagamento atrasado",
    canceled: "Cancelado",
    unpaid: "Nao pago",
    incomplete: "Incompleto",
  };
  return labels[status] || status;
}

export function PaymentHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-bg-sage/20">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
