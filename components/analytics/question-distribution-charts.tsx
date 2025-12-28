"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { QuestionDistribution } from "@/app/dashboard/analytics/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface QuestionDistributionChartsProps {
  distributions: QuestionDistribution[];
}

// Color palette for charts - using design system colors
const COLORS = [
  "#789750", // pm-olive
  "#B14A2B", // pm-terracotta
  "#456807", // pm-green-dark
  "#9DB075", // pm-sage
  "#77953E", // pm-green-medium
  "#6A8445", // pm-olive-dark
  "#C45A3A", // pm-terracotta-hover
  "#4C2012", // pm-brown
];

export function QuestionDistributionCharts({
  distributions,
}: QuestionDistributionChartsProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const currentDistribution = distributions[selectedQuestionIndex];

  // Transform data for charts
  const chartData = currentDistribution.responses.map((r) => ({
    name: r.value,
    value: r.count,
    percentage: r.percentage,
  }));

  return (
    <div className="space-y-4">
      {/* Question Selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedQuestionIndex}
            onChange={(e) => setSelectedQuestionIndex(Number(e.target.value))}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-heading focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {distributions.map((dist, index) => (
              <option key={dist.questionId} value={index}>
                Pergunta {index + 1}: {dist.questionText.slice(0, 60)}
                {dist.questionText.length > 60 ? "..." : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={chartType === "bar" ? "primary" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Barras
          </Button>
          <Button
            variant={chartType === "pie" ? "primary" : "outline"}
            size="sm"
            onClick={() => setChartType("pie")}
            className="gap-2"
          >
            <PieChartIcon className="w-4 h-4" />
            Pizza
          </Button>
        </div>
      </div>

      {/* Chart Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentDistribution.questionText}
          </CardTitle>
          <p className="text-sm text-text-muted">
            Total de respostas:{" "}
            {currentDistribution.responses.reduce((sum, r) => sum + r.count, 0)}
          </p>
        </CardHeader>
        <CardContent>
          {chartType === "bar" ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs fill-text-secondary"
                />
                <YAxis className="text-xs fill-text-secondary" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--text-heading))" }}
                  formatter={(value: number, _name: string) => {
                    const item = chartData.find((d) => d.value === value);
                    return [
                      `${value} (${item?.percentage.toFixed(1)}%)`,
                      "Respostas",
                    ];
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.name}: ${entry.percentage.toFixed(1)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    const item = chartData.find((d) => d.name === name);
                    return [
                      `${value} (${item?.percentage.toFixed(1)}%)`,
                      "Respostas",
                    ];
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Response Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento das Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-heading">
                    Resposta
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-heading">
                    Quantidade
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-heading">
                    Porcentagem
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentDistribution.responses.map((response, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        {response.value}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-text-secondary">
                      {response.count}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-text-secondary">
                      {response.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
