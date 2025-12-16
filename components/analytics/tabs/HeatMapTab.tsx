'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCategoryName } from "@/app/dashboard/analytics/utils";

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
}

export function HeatMapTab({ heatMapData, categories }: HeatMapTabProps) {
  // Group data by category
  const groupedData = categories.reduce((acc, category) => {
    acc[category] = heatMapData
      .filter(cell => cell.category === category)
      .sort((a, b) => a.questionIndex - b.questionIndex);
    return acc;
  }, {} as Record<string, HeatMapCell[]>);

  const getHeatColor = (score: number): string => {
    // Score 1-5, where higher can be good or bad depending on context
    // Using a neutral color scale
    if (score >= 4.5) return "bg-red-600";
    if (score >= 4.0) return "bg-red-500";
    if (score >= 3.5) return "bg-orange-500";
    if (score >= 3.0) return "bg-yellow-500";
    if (score >= 2.5) return "bg-yellow-400";
    if (score >= 2.0) return "bg-green-400";
    if (score >= 1.5) return "bg-green-500";
    return "bg-green-600";
  };

  const getTextColor = (score: number): string => {
    if (score >= 3.5 || score < 2.0) return "text-white";
    return "text-gray-800";
  };

  if (heatMapData.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Mapa de Calor
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              O mapa de calor será gerado quando houver respostas suficientes
              para análise visual.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-muted">Legenda de cores (média das respostas)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-text-muted">Baixo</span>
                <div className="flex">
                  <div className="w-6 h-6 bg-green-600 rounded-l" />
                  <div className="w-6 h-6 bg-green-500" />
                  <div className="w-6 h-6 bg-green-400" />
                  <div className="w-6 h-6 bg-yellow-400" />
                  <div className="w-6 h-6 bg-yellow-500" />
                  <div className="w-6 h-6 bg-orange-500" />
                  <div className="w-6 h-6 bg-red-500" />
                  <div className="w-6 h-6 bg-red-600 rounded-r" />
                </div>
                <span className="text-xs text-text-muted">Alto</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-l-4 border-l-pm-terracotta">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-pm-terracotta" />
            </div>
            <div>
              <CardTitle className="font-display text-xl text-text-heading">
                Mapa de Calor por Pergunta
              </CardTitle>
              <p className="text-sm text-text-muted">
                Visualização das médias de resposta por categoria e pergunta
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="space-y-6">
                {categories
                  .filter(cat => groupedData[cat]?.length > 0)
                  .map((category, catIndex) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: catIndex * 0.1 }}
                    >
                      <h4 className="text-sm font-semibold text-text-heading mb-2">
                        {getCategoryName(category)}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {groupedData[category].map((cell, index) => (
                          <Tooltip key={`${category}-${index}`}>
                            <TooltipTrigger asChild>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                className={cn(
                                  "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-pm-olive transition-all",
                                  getHeatColor(cell.averageScore),
                                  getTextColor(cell.averageScore)
                                )}
                              >
                                <span className="text-sm font-bold">
                                  {cell.averageScore.toFixed(1)}
                                </span>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[300px]">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm">Q{cell.questionIndex + 1}</p>
                                <p className="text-xs">{cell.questionText}</p>
                                <div className="flex justify-between text-xs pt-1 border-t">
                                  <span>Média: {cell.averageScore.toFixed(2)}</span>
                                  <span>{cell.responseCount} respostas</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-l-4 border-l-pm-olive">
          <CardHeader>
            <CardTitle className="font-display text-lg text-text-heading">
              Resumo por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories
                .filter(cat => groupedData[cat]?.length > 0)
                .map((category) => {
                  const cells = groupedData[category];
                  const avgScore = cells.reduce((sum, c) => sum + c.averageScore, 0) / cells.length;
                  const highRiskCount = cells.filter(c => c.averageScore >= 3.5).length;

                  return (
                    <div
                      key={category}
                      className="p-3 rounded-lg bg-bg-secondary"
                    >
                      <p className="text-sm font-medium text-text-heading mb-2">
                        {getCategoryName(category)}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Média:</span>
                        <span className="font-semibold">{avgScore.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Perguntas:</span>
                        <span>{cells.length}</span>
                      </div>
                      {highRiskCount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Alto risco:</span>
                          <span>{highRiskCount}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
