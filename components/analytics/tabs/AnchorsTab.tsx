'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anchor, Heart, Star, ThumbsUp,  Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnchorQuestion {
  id: string;
  text: string;
  averageScore: number;
  responseCount: number;
  distribution: { value: string; count: number; percentage: number }[];
}

interface AnchorsTabProps {
  anchors: AnchorQuestion[];
  overallAnchorScore: number;
  compact?: boolean;
}

export function AnchorsTab({ anchors, overallAnchorScore, compact = false }: AnchorsTabProps) {
  const getSatisfactionLevel = (score: number): { label: string; color: string; icon: typeof Heart } => {
    if (score >= 4) return { label: "Excelente", color: "text-green-600 bg-green-100", icon: Star };
    if (score >= 3) return { label: "Bom", color: "text-blue-600 bg-blue-100", icon: ThumbsUp };
    if (score >= 2) return { label: "Regular", color: "text-yellow-600 bg-yellow-100", icon: Shield };
    return { label: "Baixo", color: "text-red-600 bg-red-100", icon: Heart };
  };

  const overallLevel = getSatisfactionLevel(overallAnchorScore);
  const OverallIcon = overallLevel.icon;

  // Compact view for SectionCard
  if (compact) {
    if (anchors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Anchor className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-text-muted">Nenhuma âncora configurada</p>
          <p className="text-xs text-text-muted mt-1">Adicione perguntas da categoria &quot;anchors&quot;</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Score principal */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" className="stroke-gray-100" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                className="stroke-pm-olive" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${(overallAnchorScore / 5) * 88} 100`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-text-heading">{overallAnchorScore.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-heading">Índice de Satisfação</p>
            <Badge className={cn("mt-1 text-xs", overallLevel.color)}>
              <OverallIcon className="w-3 h-3 mr-1" />
              {overallLevel.label}
            </Badge>
          </div>
        </div>

        {/* Lista de âncoras compacta */}
        <div className="flex-1 space-y-2 overflow-auto">
          {anchors.slice(0, 4).map((anchor) => {
            const level = getSatisfactionLevel(anchor.averageScore);
            return (
              <div key={anchor.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="text-xs text-text-secondary line-clamp-1 flex-1">
                  {anchor.text.length > 40 ? anchor.text.substring(0, 40) + '...' : anchor.text}
                </span>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full",
                    level.label === "Excelente" && "bg-green-500",
                    level.label === "Bom" && "bg-blue-500",
                    level.label === "Regular" && "bg-yellow-500",
                    level.label === "Baixo" && "bg-red-500"
                  )} />
                  <span className="text-xs font-medium text-text-heading w-6 text-right">
                    {anchor.averageScore.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
          {anchors.length > 4 && (
            <p className="text-xs text-text-muted text-center pt-2">
              +{anchors.length - 4} mais
            </p>
          )}
        </div>
      </div>
    );
  }

  if (anchors.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <Anchor className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Âncoras de Satisfação
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              As âncoras medem fatores de proteção e satisfação.
              Adicione perguntas da categoria &quot;anchors&quot; ao questionário.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-pm-olive/10 via-white to-pm-sage-light/20 border-l-4 border-l-pm-olive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-pm-olive/20 flex items-center justify-center">
                  <Anchor className="w-8 h-8 text-pm-olive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Índice Geral de Satisfação
                  </h3>
                  <p className="text-sm text-text-muted">
                    Baseado em {anchors.length} indicadores de âncoras
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-pm-olive">
                    {overallAnchorScore.toFixed(1)}
                  </p>
                  <div className="text-sm text-text-muted">/5.0</div>
                </div>
                <Badge className={cn("mt-2", overallLevel.color)}>
                  <overallLevel.icon className="w-3 h-3 mr-1" />
                  {overallLevel.label}
                </Badge>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(overallAnchorScore / 5) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-pm-olive to-pm-olive-light rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Anchors */}
      <Card className="border-l-4 border-l-pm-terracotta">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pm-terracotta" />
          </div>
          <div>
            <CardTitle className="font-display text-xl text-text-heading">
              Detalhamento das Âncoras
            </CardTitle>
            <p className="text-sm text-text-muted">
              Fatores de proteção e satisfação no trabalho
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anchors.map((anchor, index) => {
              const level = getSatisfactionLevel(anchor.averageScore);
              return (
                <motion.div
                  key={anchor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-bg-secondary hover:bg-bg-sage transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-text-heading mb-2">
                        {anchor.text}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-text-muted">
                          {anchor.responseCount} respostas
                        </span>
                        <Badge className={cn("text-xs", level.color)}>
                          {level.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-text-heading">
                        {anchor.averageScore.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/* Distribution bars */}
                  <div className="mt-3 flex gap-1 h-2">
                    {anchor.distribution.map((dist, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-full transition-all",
                          dist.value === "5" && "bg-green-500",
                          dist.value === "4" && "bg-green-400",
                          dist.value === "3" && "bg-yellow-400",
                          dist.value === "2" && "bg-orange-400",
                          dist.value === "1" && "bg-red-400"
                        )}
                        style={{ width: `${dist.percentage}%` }}
                        title={`${dist.value}: ${dist.percentage}%`}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
