"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CategoryScore } from "@/app/dashboard/analytics/actions";
import { getCategoryName } from "@/app/dashboard/analytics/actions";

interface CategoryScoresChartProps {
  categories: CategoryScore[];
}

export function CategoryScoresChart({ categories }: CategoryScoresChartProps) {
  // Transform data for chart
  const chartData = categories.map((cat) => ({
    name: getCategoryName(cat.category),
    score: cat.averageScore,
    riskLevel: cat.riskLevel,
  }));

  // Color based on risk level
  const getBarColor = (riskLevel: "low" | "medium" | "high") => {
    switch (riskLevel) {
      case "low":
        return "#22c55e"; // green
      case "medium":
        return "#eab308"; // yellow
      case "high":
        return "#ef4444"; // red
      default:
        return "#3b82f6"; // blue
    }
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            className="text-xs fill-text-secondary"
          />
          <YAxis
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            className="text-xs fill-text-secondary"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--text-heading))" }}
            formatter={(value: number) => [value.toFixed(2), "Pontuação"]}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.riskLevel)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
