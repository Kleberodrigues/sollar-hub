"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/types/admin.types";

interface MRRChartDataPoint {
  month: string;
  mrr: number;
  subscriptions: number;
}

interface MRRChartProps {
  data: MRRChartDataPoint[];
  className?: string;
}

// Format date for tooltip (full month name)
function formatTooltipDate(dateString: string): string {
  if (!dateString) return "";

  // If already formatted (e.g., "jan. de 24"), return as is
  if (dateString.includes(" de ")) return dateString;

  // Try parsing as ISO date
  const date = new Date(dateString + "T12:00:00");

  if (isNaN(date.getTime())) {
    const match = dateString.match(/^(\d{4})-(\d{2})/);
    if (match) {
      const [, year, month] = match;
      const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
                         "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
      const monthIndex = parseInt(month, 10) - 1;
      return `${monthNames[monthIndex]} de ${year}`;
    }
    return dateString;
  }

  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const formattedDate = label ? formatTooltipDate(label) : "";

  const mrrValue = payload.find((p) => p.dataKey === "mrr");

  return (
    <div className="bg-white border border-border-light rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-pm-brown mb-2 capitalize">
        {formattedDate}
      </p>
      {mrrValue && (
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: mrrValue.color }}
          />
          <span className="text-text-muted">MRR:</span>
          <span className="font-medium text-pm-brown">
            {formatCurrency(mrrValue.value)}
          </span>
        </div>
      )}
    </div>
  );
}

// Format currency for Y axis - compact format for large values
function formatYAxisCurrency(valueInCents: number): string {
  const valueInReais = valueInCents / 100;

  if (valueInReais >= 1000000) {
    return `R$ ${(valueInReais / 1000000).toFixed(1)}M`;
  }
  if (valueInReais >= 1000) {
    return `R$ ${(valueInReais / 1000).toFixed(valueInReais >= 10000 ? 0 : 1)}k`;
  }
  return `R$ ${valueInReais.toFixed(0)}`;
}

// Parse date string safely and format for display
function formatMonthLabel(dateString: string): string {
  // Handle ISO date format "2024-12-01" or similar
  if (!dateString) return "";

  // Try parsing as ISO date (add time to avoid timezone issues)
  const date = new Date(dateString + "T12:00:00");

  if (isNaN(date.getTime())) {
    // If invalid, try extracting year-month manually
    const match = dateString.match(/^(\d{4})-(\d{2})/);
    if (match) {
      const [, year, month] = match;
      const monthNames = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
                         "jul.", "ago.", "set.", "out.", "nov.", "dez."];
      const monthIndex = parseInt(month, 10) - 1;
      const shortYear = year.slice(-2);
      return `${monthNames[monthIndex]} de ${shortYear}`;
    }
    return dateString;
  }

  return date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

export function MRRChart({ data, className }: MRRChartProps) {
  // Format data for chart
  const chartData = data.map((item) => ({
    ...item,
    formattedMonth: formatMonthLabel(item.month),
  }));

  // Calculate max value to determine Y axis width
  const maxValue = Math.max(...data.map(d => d.mrr), 0);
  const yAxisWidth = maxValue >= 100000000 ? 70 : maxValue >= 10000000 ? 60 : 55;

  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-border-light p-6 shadow-sm h-full">
        <h3 className="text-lg font-semibold text-pm-brown mb-4">
          Evolução do MRR
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E8E8E8"
                vertical={false}
              />
              <XAxis
                dataKey="formattedMonth"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8A8A8A", fontSize: 12 }}
              />
              <YAxis
                yAxisId="mrr"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8A8A8A", fontSize: 11 }}
                width={yAxisWidth}
                tickFormatter={formatYAxisCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="mrr"
                type="monotone"
                dataKey="mrr"
                stroke="#456807"
                strokeWidth={2}
                dot={{ fill: "#456807", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#456807" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
