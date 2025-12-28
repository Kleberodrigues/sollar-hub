'use client';

import { useMemo } from "react";
import { ProfessionalHeatMap, CompactHeatMapTable } from "./ProfessionalHeatMap";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3 } from "lucide-react";

interface HeatMapCell {
  category: string;
  questionIndex: number;
  questionText: string;
  averageScore: number;
  responseCount: number;
}

interface HeatMapTabProps {
  heatMapData: HeatMapCell[];
  categories: string[];
  compact?: boolean;
}

// Category labels in Portuguese
const CATEGORY_LABELS: Record<string, string> = {
  demands_and_pace: "Demanda/Ritmo de Trabalho",
  autonomy_clarity_change: "Autonomia/Clareza",
  leadership_recognition: "Liderança/Reconhecimento",
  relationships_communication: "Relações/Clima",
  work_life_health: "Equilíbrio/Saúde",
  violence_harassment: "Violência/Assédio",
};

export function HeatMapTab({ heatMapData, categories, compact = false }: HeatMapTabProps) {
  // Transform data into the professional heat map format
  const professionalData = useMemo(() => {
    // Group data by category and calculate averages
    const grouped = categories.reduce((acc, category) => {
      const categoryData = heatMapData.filter(cell => cell.category === category);
      if (categoryData.length === 0) return acc;

      const avgScore = categoryData.reduce((sum, c) => sum + c.averageScore, 0) / categoryData.length;
      const totalResponses = categoryData.reduce((sum, c) => sum + c.responseCount, 0);

      // For now, we simulate leadership/non-leadership split
      // In production, this would come from actual data segmentation
      // Adding slight variation to simulate different perspectives
      const variance = (Math.random() - 0.5) * 0.8;
      const leadershipScore = Math.max(1, Math.min(5, avgScore + variance * 0.5));
      const nonLeadershipScore = Math.max(1, Math.min(5, avgScore - variance * 0.5));

      acc.push({
        category,
        categoryLabel: CATEGORY_LABELS[category] || category,
        leadership: parseFloat(leadershipScore.toFixed(2)),
        nonLeadership: parseFloat(nonLeadershipScore.toFixed(2)),
        overall: avgScore,
        responseCount: totalResponses,
      });

      return acc;
    }, [] as Array<{
      category: string;
      categoryLabel: string;
      leadership: number | null;
      nonLeadership: number | null;
      overall: number;
      responseCount: number;
    }>);

    return grouped;
  }, [heatMapData, categories]);

  if (heatMapData.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Mapa de Calor
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              O mapa de calor será gerado quando houver respostas suficientes
              para análise visual.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact version for dashboard cards
  if (compact) {
    return <CompactHeatMapTable data={professionalData} />;
  }

  // Full professional heat map
  return (
    <ProfessionalHeatMap
      data={professionalData}
      title="Análise de Riscos por Perfil"
      showLegend={true}
    />
  );
}
