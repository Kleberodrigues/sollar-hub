"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PLAN_LABELS, PLAN_COLORS, type PlanDistribution } from "@/types/admin.types";
import type { PlanType } from "@/types";

interface PlanDistributionChartProps {
  data: PlanDistribution;
  className?: string;
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { name: string; value: number; fill: string; percent: number };
  }>;
}) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-border-light rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.fill }}
        />
        <span className="font-medium text-pm-brown">{data.name}</span>
      </div>
      <div className="mt-1 text-sm text-text-muted">
        <span className="font-medium text-pm-brown">{data.value}</span>{" "}
        assinaturas ({(data.percent * 100).toFixed(1)}%)
      </div>
    </div>
  );
}

// Custom legend component
function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-text-secondary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function PlanDistributionChart({
  data,
  className,
}: PlanDistributionChartProps) {
  // Transform data for the chart
  const chartData = (Object.keys(data) as PlanType[]).map((plan) => ({
    name: PLAN_LABELS[plan],
    value: data[plan],
    fill: PLAN_COLORS[plan],
  }));

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to each data point
  const chartDataWithPercent = chartData.map((item) => ({
    ...item,
    percent: total > 0 ? item.value / total : 0,
  }));

  // If no data, show empty state
  if (total === 0) {
    return (
      <div className={className}>
        <div className="bg-white rounded-lg border border-border-light p-6 shadow-sm h-full">
          <h3 className="text-lg font-semibold text-pm-brown mb-4">
            Distribuição de Planos
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-text-muted">Nenhuma assinatura ativa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-border-light p-6 shadow-sm h-full">
        <h3 className="text-lg font-semibold text-pm-brown mb-4">
          Distribuição de Planos
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartDataWithPercent}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartDataWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={<CustomLegend />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Total in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center mt-[-60px]">
            <p className="text-2xl font-bold text-pm-brown">{total}</p>
            <p className="text-xs text-text-muted">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
