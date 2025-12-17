"use client";

import { cn } from "@/lib/utils";
import {
  DollarSign,
  Building2,
  Users,
  Percent,
  TrendingUp,
  FileText,
  LucideIcon,
} from "lucide-react";
import { formatCurrency, formatPercentChange } from "@/types/admin.types";

type IconType = "currency" | "building" | "users" | "percent" | "chart" | "assessment";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: IconType;
  trend?: "up" | "down" | "neutral";
  format?: "currency" | "number" | "percent";
  className?: string;
}

const iconMap: Record<IconType, LucideIcon> = {
  currency: DollarSign,
  building: Building2,
  users: Users,
  percent: Percent,
  chart: TrendingUp,
  assessment: FileText,
};

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon = "chart",
  trend,
  format = "number",
  className,
}: KPICardProps) {
  const Icon = iconMap[icon];

  // Format the value based on format prop
  const formattedValue = (() => {
    if (typeof value === "string") return value;

    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percent":
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString("pt-BR");
    }
  })();

  // Determine trend based on change value if not provided
  const effectiveTrend = trend || (change !== undefined ? (change >= 0 ? "up" : "down") : undefined);

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-border-light p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <p className="text-2xl font-bold text-pm-brown">{formattedValue}</p>

          {/* Change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  effectiveTrend === "up" && "text-pm-green-dark",
                  effectiveTrend === "down" && "text-pm-terracotta",
                  effectiveTrend === "neutral" && "text-text-muted"
                )}
              >
                {formatPercentChange(change)}
              </span>
              {changeLabel && (
                <span className="text-xs text-text-muted">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={cn(
            "p-3 rounded-lg",
            effectiveTrend === "up" && "bg-green-50 text-pm-green-dark",
            effectiveTrend === "down" && "bg-red-50 text-pm-terracotta",
            !effectiveTrend && "bg-bg-sage text-pm-olive"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// Grid wrapper for KPI cards
interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function KPIGrid({ children, columns = 4 }: KPIGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {children}
    </div>
  );
}
