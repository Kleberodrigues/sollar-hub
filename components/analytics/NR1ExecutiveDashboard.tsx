'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Target,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Calendar,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalHeatMap } from "./tabs/ProfessionalHeatMap";

interface CategoryResponse {
  category: string;
  averageScore: number;
  responseCount: number;
  questionCount: number;
  riskLevel: "low" | "medium" | "high";
  isSuppressed?: boolean;
}

interface NR1ExecutiveDashboardProps {
  analytics: {
    totalParticipants: number;
    totalQuestions: number;
    completionRate: number;
    lastResponseDate: string | null;
    responsesByCategory: CategoryResponse[];
  };
  assessmentTitle?: string;
}

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  demands_and_pace: "Demanda/Ritmo de Trabalho",
  autonomy_clarity_change: "Autonomia/Clareza",
  leadership_recognition: "Liderança/Reconhecimento",
  relationships_communication: "Relações/Clima",
  work_life_health: "Equilíbrio/Saúde",
  violence_harassment: "Violência/Assédio",
};

// Risk thresholds - aligned with backend (actions.ts)
// Higher score = higher risk (after normalization)
const getRiskConfig = (score: number) => {
  if (score >= 3.5) return {
    level: 'high',
    label: 'Alto Risco',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    description: 'Ação imediata',
  };
  if (score >= 2.5) return {
    level: 'medium',
    label: 'Médio Risco',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    description: 'Requer atenção',
  };
  return {
    level: 'low',
    label: 'Baixo Risco',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
    description: 'Ambiente saudável',
  };
};

export function NR1ExecutiveDashboard({
  analytics,
  assessmentTitle = "Avaliação NR-1"
}: NR1ExecutiveDashboardProps) {
  // Filter risk categories (exclude anchors and suggestions)
  const riskCategories = useMemo(() => {
    return analytics.responsesByCategory.filter(
      c => c.category !== 'anchors' && c.category !== 'suggestions' && !c.isSuppressed
    );
  }, [analytics.responsesByCategory]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (riskCategories.length === 0) return null;

    const avgScore = riskCategories.reduce((sum, c) => sum + c.averageScore, 0) / riskCategories.length;
    const high = riskCategories.filter(c => c.riskLevel === 'high').length;
    const medium = riskCategories.filter(c => c.riskLevel === 'medium').length;
    const low = riskCategories.filter(c => c.riskLevel === 'low').length;

    return {
      avgScore,
      riskConfig: getRiskConfig(avgScore),
      distribution: { high, medium, low },
      total: riskCategories.length,
    };
  }, [riskCategories]);

  // Prepare heat map data
  const heatMapData = useMemo(() => {
    return riskCategories.map(cat => {
      // Simulate leadership split (in production, this would come from segmented data)
      const variance = 0.3;
      return {
        category: cat.category,
        categoryLabel: CATEGORY_LABELS[cat.category] || cat.category,
        leadership: Math.max(1, Math.min(5, cat.averageScore - variance)),
        nonLeadership: Math.max(1, Math.min(5, cat.averageScore + variance)),
        overall: cat.averageScore,
        responseCount: cat.responseCount,
      };
    });
  }, [riskCategories]);

  // Sort categories by risk level (high first)
  const sortedCategories = useMemo(() => {
    return [...riskCategories].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.riskLevel] - order[b.riskLevel];
    });
  }, [riskCategories]);

  if (!metrics) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aguardando Dados
          </h3>
          <p className="text-gray-500">
            O dashboard será exibido quando houver respostas suficientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = metrics.riskConfig.icon;

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Risk Score */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl font-bold">
                          {metrics.avgScore.toFixed(1)}
                        </span>
                        <span className="text-sm text-white/60 block">/5.0</span>
                      </div>
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center",
                      metrics.riskConfig.level === 'low' && "bg-emerald-500",
                      metrics.riskConfig.level === 'medium' && "bg-amber-500",
                      metrics.riskConfig.level === 'high' && "bg-red-500"
                    )}>
                      <StatusIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Índice Geral NR-1</h2>
                    <p className={cn(
                      "text-lg font-medium",
                      metrics.riskConfig.level === 'low' && "text-emerald-400",
                      metrics.riskConfig.level === 'medium' && "text-amber-400",
                      metrics.riskConfig.level === 'high' && "text-red-400"
                    )}>
                      {metrics.riskConfig.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Distribution */}
              <div className="lg:col-span-1">
                <p className="text-sm text-white/60 mb-3">Distribuição de Risco</p>
                <div className="flex items-end gap-2 h-16">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span className="text-2xl font-bold">{metrics.distribution.high}</span>
                      <span className="text-sm text-white/60">críticas</span>
                    </div>
                    <Progress
                      value={(metrics.distribution.high / metrics.total) * 100}
                      className="h-2 bg-white/20 [&>div]:bg-red-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span className="text-2xl font-bold">{metrics.distribution.medium}</span>
                      <span className="text-sm text-white/60">atenção</span>
                    </div>
                    <Progress
                      value={(metrics.distribution.medium / metrics.total) * 100}
                      className="h-2 bg-white/20 [&>div]:bg-amber-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span className="text-2xl font-bold">{metrics.distribution.low}</span>
                      <span className="text-sm text-white/60">saudáveis</span>
                    </div>
                    <Progress
                      value={(metrics.distribution.low / metrics.total) * 100}
                      className="h-2 bg-white/20 [&>div]:bg-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="lg:col-span-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/60 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Participantes</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.totalParticipants}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/60 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xs">Conclusão</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/60 mb-1">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs">Categorias</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.total}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/60 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Última Resp.</span>
                    </div>
                    <p className="text-sm font-medium">
                      {analytics.lastResponseDate
                        ? new Date(analytics.lastResponseDate).toLocaleDateString('pt-BR')
                        : '—'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Heat Map - Professional Table Format */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ProfessionalHeatMap
          data={heatMapData}
          title="Análise de Riscos por Bloco NR-1"
          showLegend={true}
        />
      </motion.div>

      {/* Category Details Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Detalhamento por Categoria</CardTitle>
                  <p className="text-sm text-slate-500">
                    {sortedCategories.length} blocos NR-1 avaliados
                  </p>
                </div>
              </div>
              {metrics.distribution.high > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {metrics.distribution.high} categoria(s) crítica(s)
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {sortedCategories.map((category, index) => {
                const config = getRiskConfig(category.averageScore);
                const Icon = config.icon;
                const percentage = (category.averageScore / 5) * 100;
                const trend = category.averageScore > 3 ? 'up' : category.averageScore < 2.5 ? 'down' : 'stable';

                return (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Risk indicator */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        config.bg
                      )}>
                        <Icon className={cn("w-6 h-6", config.color)} />
                      </div>

                      {/* Category info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800 truncate">
                            {CATEGORY_LABELS[category.category] || category.category}
                          </h4>
                          <Badge className={cn("text-xs", config.bg, config.color, config.border)}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {category.responseCount} respostas
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {category.questionCount} perguntas
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-3xl font-bold tabular-nums", config.color)}>
                            {category.averageScore.toFixed(1)}
                          </span>
                          {trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                          {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className="w-24 mt-1">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                config.level === 'low' && "bg-emerald-500",
                                config.level === 'medium' && "bg-amber-500",
                                config.level === 'high' && "bg-red-500"
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Level Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700">Baixo Risco</p>
              <p className="text-xs text-emerald-600">Score &lt; 2.5 - Ambiente saudável</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-700">Médio Risco</p>
              <p className="text-xs text-amber-600">Score 2.5-3.5 - Monitoramento</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-700">Alto Risco</p>
              <p className="text-xs text-red-600">Score ≥ 3.5 - Ação imediata</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
