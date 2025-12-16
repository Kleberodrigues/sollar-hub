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
  ReferenceLine,
  
} from "recharts";
import { CategoryScore } from "@/app/dashboard/analytics/actions";
import { getCategoryName, getRiskLevelLabel } from "@/app/dashboard/analytics/utils";

interface CategoryScoresChartProps {
  categories: CategoryScore[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; score: number; riskLevel: string; responseCount: number; questionCount: number } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const riskColors = {
      low: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
      medium: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
      high: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
    };
    const colors = riskColors[data.riskLevel as keyof typeof riskColors] || riskColors.medium;

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-4 min-w-[200px]">
        <p className="font-semibold text-gray-900 text-sm mb-2">{data.name}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Pontuação:</span>
            <span className="font-bold text-lg text-gray-900">{data.score.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Nível de Risco:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
              {getRiskLevelLabel(data.riskLevel as "low" | "medium" | "high")}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-gray-100">
            <span className="text-gray-500 text-xs">Respostas:</span>
            <span className="text-gray-700 text-xs">{data.responseCount} em {data.questionCount} perguntas</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend
const CustomLegend = () => (
  <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-green-500"></div>
      <span className="text-sm text-gray-600">Baixo Risco</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-yellow-500"></div>
      <span className="text-sm text-gray-600">Médio Risco</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-red-500"></div>
      <span className="text-sm text-gray-600">Alto Risco</span>
    </div>
  </div>
);

export function CategoryScoresChart({ categories }: CategoryScoresChartProps) {
  // Transform data for chart - horizontal bars work better for long labels
  const chartData = categories.map((cat) => ({
    name: getCategoryName(cat.category),
    shortName: getCategoryName(cat.category).length > 25
      ? getCategoryName(cat.category).substring(0, 22) + "..."
      : getCategoryName(cat.category),
    score: cat.averageScore,
    riskLevel: cat.riskLevel,
    responseCount: cat.responseCount,
    questionCount: cat.questionCount,
  }));

  // Color based on risk level
  const getBarColor = (riskLevel: "low" | "medium" | "high") => {
    switch (riskLevel) {
      case "low":
        return "#22c55e"; // green-500
      case "medium":
        return "#eab308"; // yellow-500
      case "high":
        return "#ef4444"; // red-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Reference line thresholds for NR-1
  const riskThresholds = {
    lowToMedium: 2.5,
    mediumToHigh: 3.5,
  };

  return (
    <div className="space-y-4">
      {/* Main Chart - Horizontal bars for better label readability */}
      <div className="w-full h-[450px] bg-gradient-to-br from-gray-50/50 to-white rounded-xl p-4 border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 20,
              right: 40,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={true}
              stroke="#e5e7eb"
            />
            <XAxis
              type="number"
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={200}
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={false}
            />

            {/* Reference lines for risk thresholds */}
            <ReferenceLine
              x={riskThresholds.lowToMedium}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "Limite Baixo",
                position: "top",
                fill: "#22c55e",
                fontSize: 10,
                fontWeight: 600
              }}
            />
            <ReferenceLine
              x={riskThresholds.mediumToHigh}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "Limite Alto",
                position: "top",
                fill: "#ef4444",
                fontSize: 10,
                fontWeight: 600
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />

            <Bar
              dataKey="score"
              radius={[0, 6, 6, 0]}
              barSize={28}
              animationDuration={800}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.riskLevel as "low" | "medium" | "high")}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <CustomLegend />

      {/* Risk Scale Info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Escala de Risco NR-1</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0 - Baixo Risco</span>
          <span>2.5 - Médio Risco</span>
          <span>5 - Alto Risco</span>
        </div>
      </div>
    </div>
  );
}
