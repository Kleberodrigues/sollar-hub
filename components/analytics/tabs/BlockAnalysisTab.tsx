'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryScoresChart } from "../category-scores-chart";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Brain,
  Shield,
  Heart,
  MessageSquare,
  Briefcase,
  Info,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryName } from "@/app/dashboard/analytics/utils";
import { SuppressedBadge, SuppressionTooltipContent } from "../SuppressedDataCard";
import { ANONYMITY_THRESHOLDS } from "@/lib/constants/anonymity-thresholds";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

interface CategoryResponse {
  category: string;
  averageScore: number;
  responseCount: number;
  questionCount: number;
  riskLevel: "low" | "medium" | "high";
  isSuppressed?: boolean;
}

interface BlockAnalysisTabProps {
  categories: CategoryResponse[];
}

// Category icons mapping
const categoryIcons: Record<string, React.ElementType> = {
  demands_and_pace: Briefcase,
  autonomy_clarity_change: Brain,
  leadership_recognition: Users,
  relationships_communication: MessageSquare,
  work_life_health: Heart,
  violence_harassment: Shield,
};

// Category descriptions
const categoryDescriptions: Record<string, string> = {
  demands_and_pace: "Carga de trabalho, prazos e ritmo das atividades",
  autonomy_clarity_change: "Liberdade de decisão e clareza nas funções",
  leadership_recognition: "Qualidade da gestão e reconhecimento",
  relationships_communication: "Ambiente de trabalho e comunicação",
  work_life_health: "Equilíbrio entre vida pessoal e profissional",
  violence_harassment: "Segurança psicológica e respeito",
};

// Risk level configurations
const riskConfig = {
  low: {
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    icon: CheckCircle,
    iconColor: "text-emerald-500",
    bgIcon: "bg-emerald-500/20",
    progressBg: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
    ringColor: "ring-emerald-500",
    label: "Saudável",
    description: "Nível adequado de gestão",
  },
  medium: {
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    icon: Clock,
    iconColor: "text-amber-500",
    bgIcon: "bg-amber-500/20",
    progressBg: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    ringColor: "ring-amber-500",
    label: "Atenção",
    description: "Requer monitoramento",
  },
  high: {
    gradient: "from-red-500/20 via-red-500/10 to-transparent",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    bgIcon: "bg-red-500/20",
    progressBg: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-300",
    ringColor: "ring-red-500",
    label: "Crítico",
    description: "Ação imediata necessária",
  },
};

export function BlockAnalysisTab({ categories }: BlockAnalysisTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter out suggestions and anchors for the main block analysis
  const blockCategories = categories.filter(
    (cat) => cat.category !== "suggestions" && cat.category !== "anchors"
  );

  // Calculate summary stats
  const avgScore = blockCategories.length > 0
    ? blockCategories.reduce((sum, cat) => sum + cat.averageScore, 0) / blockCategories.length
    : 0;
  const highRiskCount = blockCategories.filter(c => c.riskLevel === "high").length;
  const mediumRiskCount = blockCategories.filter(c => c.riskLevel === "medium").length;
  const lowRiskCount = blockCategories.filter(c => c.riskLevel === "low").length;

  const getOverallStatus = () => {
    if (highRiskCount > 0) return { status: "high", label: "Atenção Necessária", color: "text-red-500" };
    if (mediumRiskCount > 2) return { status: "medium", label: "Monitoramento Recomendado", color: "text-amber-500" };
    return { status: "low", label: "Situação Saudável", color: "text-emerald-500" };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-white to-pm-cream/30">
          <div className="absolute inset-0 bg-gradient-to-r from-pm-terracotta/5 via-transparent to-pm-olive/5 pointer-events-none" />
          <CardContent className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left side - Main score */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pm-terracotta/20 to-pm-olive/20 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white shadow-inner flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-text-heading">
                          {avgScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-text-muted block">/5.0</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                      overallStatus.status === "high" && "bg-red-500",
                      overallStatus.status === "medium" && "bg-amber-500",
                      overallStatus.status === "low" && "bg-emerald-500"
                    )}
                  >
                    {overallStatus.status === "high" && <AlertTriangle className="w-4 h-4 text-white" />}
                    {overallStatus.status === "medium" && <Clock className="w-4 h-4 text-white" />}
                    {overallStatus.status === "low" && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-text-heading">
                    Análise NR-1
                  </h2>
                  <p className={cn("text-lg font-medium", overallStatus.color)}>
                    {overallStatus.label}
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    {blockCategories.length} categorias avaliadas
                  </p>
                </div>
              </div>

              {/* Right side - Risk distribution */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:scale-105 transition-transform">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mb-1" />
                  <span className="text-2xl font-bold text-emerald-600">{lowRiskCount}</span>
                  <span className="text-xs text-emerald-600 font-medium">Saudável</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-2xl font-bold text-amber-600">{mediumRiskCount}</span>
                  <span className="text-xs text-amber-600 font-medium">Atenção</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-red-50 border border-red-200 hover:scale-105 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-red-500 mb-1" />
                  <span className="text-2xl font-bold text-red-600">{highRiskCount}</span>
                  <span className="text-xs text-red-600 font-medium">Crítico</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {blockCategories.map((category, index) => {
            const config = riskConfig[category.riskLevel];
            const Icon = categoryIcons[category.category] || BarChart3;
            const StatusIcon = config.icon;
            const isHovered = hoveredCategory === category.category;
            const isSelected = selectedCategory === category.category;
            const percentage = (category.averageScore / 5) * 100;
            const isSuppressed = category.isSuppressed === true;

            // Render suppressed card for categories with insufficient responses
            if (isSuppressed) {
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Card className="relative overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-heading text-base leading-tight">
                              {getCategoryName(category.category)}
                            </h3>
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                              {categoryDescriptions[category.category]}
                            </p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <SuppressedBadge />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <SuppressionTooltipContent
                                currentCount={category.responseCount}
                                minimumRequired={ANONYMITY_THRESHOLDS.CATEGORY_MINIMUM}
                                countType="responses"
                              />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Suppression message */}
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                          <Lock className="w-8 h-8 text-amber-600" />
                        </div>
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          Dados Protegidos
                        </p>
                        <p className="text-xs text-amber-700">
                          {category.responseCount} de {ANONYMITY_THRESHOLDS.CATEGORY_MINIMUM} respostas necessárias
                        </p>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center justify-center pt-3 border-t border-amber-200">
                        <div className="flex items-center gap-4 text-xs text-amber-700">
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
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onMouseEnter={() => setHoveredCategory(category.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.category ? null : category.category
                )}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-500 border-2",
                    "hover:shadow-2xl hover:-translate-y-1",
                    config.border,
                    isHovered && `shadow-xl ${config.glow}`,
                    isSelected && `ring-2 ${config.ringColor}`
                  )}
                >
                  {/* Background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
                    config.gradient
                  )} />

                  <CardContent className="relative p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform",
                            config.bgIcon,
                            isHovered && "scale-110"
                          )}
                        >
                          <Icon className={cn("w-6 h-6", config.iconColor)} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-heading text-base leading-tight">
                            {getCategoryName(category.category)}
                          </h3>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                            {categoryDescriptions[category.category]}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 border shadow-sm",
                          config.badge
                        )}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>

                    {/* Score display */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-4xl font-bold transition-transform", config.iconColor, isHovered && "scale-105")}>
                            {category.averageScore.toFixed(1)}
                          </span>
                          <span className="text-lg text-text-muted">/5</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Pontuação média
                        </p>
                      </div>

                      {/* Circular progress indicator */}
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            className="stroke-gray-200"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            className={cn(
                              "transition-all duration-700",
                              category.riskLevel === "low" && "stroke-emerald-500",
                              category.riskLevel === "medium" && "stroke-amber-500",
                              category.riskLevel === "high" && "stroke-red-500"
                            )}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${percentage * 0.88} 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-text-heading">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {category.responseCount} respostas
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3.5 h-3.5" />
                          {category.questionCount} perguntas
                        </span>
                      </div>
                      <div className={cn("transition-transform", isHovered && "translate-x-1")}>
                        <ChevronRight className={cn("w-5 h-5", config.iconColor)} />
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isSelected && (
                      <div className="pt-4 mt-4 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/50">
                          <Info className="w-4 h-4 text-pm-olive mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-text-heading mb-1">
                              {config.description}
                            </p>
                            <p className="text-xs text-text-muted">
                              {category.riskLevel === "high" &&
                                "Esta categoria requer atenção prioritária. Considere implementar ações corretivas imediatas."}
                              {category.riskLevel === "medium" &&
                                "Monitore esta categoria regularmente e implemente melhorias preventivas."}
                              {category.riskLevel === "low" &&
                                "Esta categoria está em nível saudável. Continue mantendo as boas práticas."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-pm-olive/5 via-transparent to-pm-terracotta/5 pointer-events-none" />
          <CardHeader className="relative flex flex-row items-center gap-4 border-b border-gray-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pm-olive to-pm-olive/80 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-display text-xl text-text-heading">
                Comparativo de Categorias
              </CardTitle>
              <p className="text-sm text-text-muted mt-1">
                Visualização da pontuação média por bloco NR-1
              </p>
            </div>
          </CardHeader>
          <CardContent className="relative pt-6">
            <CategoryScoresChart categories={blockCategories
              .filter(c => c.isSuppressed !== true)
              .map(c => ({ ...c, isSuppressed: c.isSuppressed ?? false }))} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend/Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700">Score 3.5 - 5.0</p>
              <p className="text-xs text-emerald-600">Nível saudável de gestão</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-700">Score 2.5 - 3.4</p>
              <p className="text-xs text-amber-600">Requer monitoramento</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-700">Score 0.0 - 2.4</p>
              <p className="text-xs text-red-600">Ação corretiva necessária</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
