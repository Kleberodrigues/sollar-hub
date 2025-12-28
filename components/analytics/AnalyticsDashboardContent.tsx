'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImportDialog } from "./ImportDialog";
import { ExportButtons } from "./export-buttons";
import {
  Users,
  TrendingUp,
  BarChart3,
  Building2,
  Anchor,
  Cloud,
  Grid3X3,
  FileOutput,
  Sparkles,
  Maximize2,
  X,
  Shield,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Target,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/lib/stripe/config";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { SuppressedDataCard } from "./SuppressedDataCard";
import { ANONYMITY_THRESHOLDS } from "@/lib/constants/anonymity-thresholds";
import { RISK_CATEGORIES, ALL_CATEGORIES } from "@/types";

// Loading skeleton for dynamic tabs
function TabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

// Dynamic imports for code splitting - heavy components (Recharts, etc.)
const BlockAnalysisTab = dynamic(() => import("./tabs/BlockAnalysisTab").then(m => ({ default: m.BlockAnalysisTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const DepartmentAnalysisTab = dynamic(() => import("./tabs/DepartmentAnalysisTab").then(m => ({ default: m.DepartmentAnalysisTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const AnchorsTab = dynamic(() => import("./tabs/AnchorsTab").then(m => ({ default: m.AnchorsTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const WordCloudTab = dynamic(() => import("./tabs/WordCloudTab").then(m => ({ default: m.WordCloudTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const HeatMapTab = dynamic(() => import("./tabs/HeatMapTab").then(m => ({ default: m.HeatMapTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const ReportTab = dynamic(() => import("./tabs/ReportTab").then(m => ({ default: m.ReportTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const ActionPlanTab = dynamic(() => import("./tabs/ActionPlanTab").then(m => ({ default: m.ActionPlanTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const ClimaTrendTab = dynamic(() => import("./tabs/ClimaTrendTab").then(m => ({ default: m.ClimaTrendTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const ClimaSurveyDashboard = dynamic(() => import("./clima/ClimaSurveyDashboard").then(m => ({ default: m.ClimaSurveyDashboard })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});
const NR1ExecutiveDashboard = dynamic(() => import("./NR1ExecutiveDashboard").then(m => ({ default: m.NR1ExecutiveDashboard })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

interface CategoryResponse {
  category: string;
  averageScore: number;
  responseCount: number;
  questionCount: number;
  riskLevel: "low" | "medium" | "high";
  isSuppressed?: boolean;
}

interface Analytics {
  totalParticipants: number;
  totalQuestions: number;
  completionRate: number;
  lastResponseDate: string | null;
  responsesByCategory: CategoryResponse[];
  isSuppressed?: boolean;
  suppressionInfo?: {
    currentCount: number;
    minimumRequired: number;
    remaining: number;
  };
}

interface QuestionDistribution {
  questionId: string;
  questionText: string;
  questionType: string;
  questionCategory: string;
  responses: { value: string; count: number; percentage: number }[];
}

interface DepartmentData {
  id: string;
  name: string;
  participantCount: number;
  responseCount: number;
  averageScore: number;
  riskLevel: "low" | "medium" | "high";
  employeeCount?: number;
  isSuppressed?: boolean;
}

interface AnalyticsDashboardContentProps {
  analytics: Analytics;
  questionDistributions: QuestionDistribution[];
  assessmentId: string;
  assessmentTitle?: string;
  assessmentType?: 'nr1' | 'pulse' | 'custom';
  currentPlan?: PlanType;
  onDataChange?: () => void;
  departments?: DepartmentData[];
}

// Framer Motion Variants seguindo o Design System Sollar
const sollarMotion = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
    },
  },
};

// Modal Fullscreen seguindo Design System
function FullscreenModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="fixed inset-4 md:inset-8 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light bg-gradient-to-r from-bg-sage to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-pm-terracotta" />
              </div>
              <h2 className="font-display text-xl font-semibold text-text-heading">{title}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-pm-terracotta/10"
            >
              <X className="w-5 h-5 text-text-muted" />
            </Button>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-bg-secondary">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Card de Seção - Design Limpo e Profissional
function SectionCard({
  title,
  icon: Icon,
  children,
  onExpand,
  accentColor = "terracotta",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onExpand: () => void;
  accentColor?: "terracotta" | "olive" | "amber";
}) {
  const colors = {
    terracotta: {
      iconBg: "bg-pm-terracotta/10",
      iconColor: "text-pm-terracotta",
      hoverBorder: "hover:border-pm-terracotta/30",
    },
    olive: {
      iconBg: "bg-pm-olive/10",
      iconColor: "text-pm-olive",
      hoverBorder: "hover:border-pm-olive/30",
    },
    amber: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      hoverBorder: "hover:border-amber-300",
    },
  };

  const colorSet = colors[accentColor];

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-md group bg-white border-border-light flex flex-col h-full",
      colorSet.hoverBorder
    )}>
      {/* Header compacto */}
      <div className="px-5 py-4 border-b border-border-light/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorSet.iconBg)}>
            <Icon className={cn("w-5 h-5", colorSet.iconColor)} />
          </div>
          <h3 className="text-base font-semibold text-text-heading">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="h-8 w-8 p-0 opacity-50 hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="w-4 h-4 text-text-muted" />
        </Button>
      </div>
      {/* Content com altura mínima consistente */}
      <CardContent className="p-5 flex-1 min-h-[260px] flex flex-col">
        {children}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboardContent({
  analytics,
  questionDistributions,
  assessmentId,
  assessmentTitle = "Assessment",
  assessmentType = 'nr1',
  currentPlan = 'base',
  onDataChange,
  departments = [],
}: AnalyticsDashboardContentProps) {
  const isPulse = assessmentType === 'pulse';
  const [fullscreenSection, setFullscreenSection] = useState<string | null>(null);
  const [showClimaView, setShowClimaView] = useState(isPulse); // Default to clima view for pulse
  const hasResponses = analytics.totalParticipants > 0;

  // Calcular distribuição de risco
  const riskDistribution = useMemo(() => {
    const categories = analytics.responsesByCategory;
    const low = categories.filter(c => c.riskLevel === "low").length;
    const medium = categories.filter(c => c.riskLevel === "medium").length;
    const high = categories.filter(c => c.riskLevel === "high").length;
    const total = categories.length || 1;
    return {
      low: Math.round((low / total) * 100),
      medium: Math.round((medium / total) * 100),
      high: Math.round((high / total) * 100),
      lowCount: low,
      mediumCount: medium,
      highCount: high,
    };
  }, [analytics.responsesByCategory]);

  // Score médio geral
  const overallScore = useMemo(() => {
    if (analytics.responsesByCategory.length === 0) return 0;
    const sum = analytics.responsesByCategory.reduce((acc, c) => acc + c.averageScore, 0);
    return (sum / analytics.responsesByCategory.length).toFixed(1);
  }, [analytics.responsesByCategory]);

  // Preparar dados
  const anchorsData = useMemo(() => {
    const anchorsCategory = analytics.responsesByCategory.find(c => c.category === "anchors");
    const anchorsQuestions = questionDistributions.filter(
      q => q.questionCategory === "anchors"
    );
    return {
      anchors: anchorsQuestions.map(q => ({
        id: q.questionId,
        text: q.questionText,
        averageScore: q.responses.reduce((sum, r) => {
          const val = parseFloat(r.value);
          return isNaN(val) ? sum : sum + (val * r.count);
        }, 0) / q.responses.reduce((sum, r) => sum + r.count, 0) || 0,
        responseCount: q.responses.reduce((sum, r) => sum + r.count, 0),
        distribution: q.responses,
      })),
      overallScore: anchorsCategory?.averageScore || 0,
    };
  }, [analytics.responsesByCategory, questionDistributions]);

  const textResponses = useMemo(() => {
    return questionDistributions
      .filter(q => q.questionType === "text" || q.questionType === "long_text")
      .map(q => ({
        questionId: q.questionId,
        questionText: q.questionText,
        responses: q.responses.map(r => r.value),
      }));
  }, [questionDistributions]);

  const heatMapData = useMemo(() => {
    const cats = RISK_CATEGORIES;
    return questionDistributions
      .filter(q => q.questionType === "likert_scale")
      .map((q, index) => {
        const avgScore = q.responses.reduce((sum, r) => {
          const val = parseFloat(r.value);
          return isNaN(val) ? sum : sum + (val * r.count);
        }, 0) / q.responses.reduce((sum, r) => sum + r.count, 0) || 0;
        return {
          category: cats[index % cats.length],
          questionIndex: index,
          questionText: q.questionText,
          averageScore: avgScore,
          responseCount: q.responses.reduce((sum, r) => sum + r.count, 0),
        };
      });
  }, [questionDistributions]);

  const highRiskCategories = useMemo(() => {
    return analytics.responsesByCategory
      .filter(c => c.riskLevel === "high")
      .map(c => ({ category: c.category, score: c.averageScore }));
  }, [analytics.responsesByCategory]);

  const categories = ALL_CATEGORIES;

  // Empty state
  if (!hasResponses) {
    return (
      <div className="space-y-6" data-testid="analytics-dashboard">
        <div className="flex justify-end gap-2">
          <ImportDialog assessmentId={assessmentId} currentPlan={currentPlan} onImportComplete={onDataChange} />
        </div>
        <Card className="border-dashed border-2 border-pm-olive/30">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-pm-olive" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-text-heading mb-3">
                Ainda não há respostas
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Os gráficos e análises aparecerão quando houver respostas coletadas para esta avaliação.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Suppression state - protect anonymity when insufficient responses
  if (analytics.isSuppressed && analytics.suppressionInfo) {
    return (
      <div className="space-y-6" data-testid="analytics-dashboard">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-heading">Análise de Resultados</h1>
            <p className="text-sm text-text-muted mt-1">{assessmentTitle}</p>
          </div>
          <div className="flex gap-2">
            <ImportDialog assessmentId={assessmentId} currentPlan={currentPlan} onImportComplete={onDataChange} />
          </div>
        </div>
        <SuppressedDataCard
          currentCount={analytics.suppressionInfo.currentCount}
          minimumRequired={analytics.suppressionInfo.minimumRequired}
          title="Aguardando Mais Respostas"
          description={`Para proteger o anonimato dos respondentes e garantir analises estatisticamente significativas, o dashboard de analytics requer no minimo ${ANONYMITY_THRESHOLDS.ASSESSMENT_MINIMUM} participantes.`}
          countType="responses"
        />
        {/* Show basic stats without detailed analysis */}
        <Card className="border-pm-olive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-text-muted">
              <Users className="w-5 h-5 text-pm-olive" />
              <div>
                <p className="text-sm font-medium">Participantes até o momento</p>
                <p className="text-2xl font-display font-bold text-text-heading">{analytics.totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={sollarMotion.container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      data-testid="analytics-dashboard"
    >
      {/* Header com Ações */}
      <motion.div variants={sollarMotion.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-heading">
            {isPulse && showClimaView ? 'Pesquisa de Clima' : 'Análise de Resultados'}
          </h1>
          <p className="text-sm text-text-muted mt-1">{assessmentTitle}</p>
        </div>
        <div className="flex gap-2">
          {isPulse && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClimaView(!showClimaView)}
              className={cn(
                "gap-2",
                showClimaView ? "bg-pm-olive/10 border-pm-olive text-pm-olive" : ""
              )}
            >
              <Activity className="w-4 h-4" />
              {showClimaView ? 'Visão Geral' : 'Visão Clima'}
            </Button>
          )}
          <ImportDialog assessmentId={assessmentId} currentPlan={currentPlan} onImportComplete={onDataChange} />
          <ExportButtons assessmentId={assessmentId} currentPlan={currentPlan} />
        </div>
      </motion.div>

      {/* Dashboard Pesquisa de Clima (quando selecionado) */}
      {isPulse && showClimaView && (
        <motion.div variants={sollarMotion.fadeUp}>
          <ClimaSurveyDashboard assessmentId={assessmentId} />
        </motion.div>
      )}

      {/* Conteúdo padrão - Dashboard NR-1 Executivo Unificado */}
      {(!isPulse || !showClimaView) && (
        <>
          {/* Dashboard NR-1 Executivo com Mapa de Calor Profissional */}
          <motion.div variants={sollarMotion.fadeUp}>
            <NR1ExecutiveDashboard
              analytics={analytics}
              assessmentTitle={assessmentTitle}
            />
          </motion.div>

          {/* Cards de Ação - Relatório e IA */}
          <motion.div variants={sollarMotion.fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Relatório Executivo */}
            <Card className="bg-white border border-gray-200 border-l-4 border-l-pm-terracotta hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
              onClick={() => setFullscreenSection("report")}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
                      <FileOutput className="w-6 h-6 text-pm-terracotta" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-text-heading">Relatório Executivo</h3>
                      <p className="text-sm text-text-muted">Gere relatório PDF/CSV completo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-pm-terracotta transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* Plano de Ação com IA */}
            <Card className="bg-white border border-gray-200 border-l-4 border-l-purple-500 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
              onClick={() => setFullscreenSection("action")}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-text-heading">Plano de Ação com IA</h3>
                      <p className="text-sm text-text-muted">Recomendações personalizadas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-700 text-xs border-0">IA</Badge>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grid de Análises Complementares */}
          <motion.div variants={sollarMotion.fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Departamentos */}
            <SectionCard
              title="Departamentos"
              icon={Building2}
              onExpand={() => setFullscreenSection("departments")}
              accentColor="olive"
            >
              <DepartmentAnalysisTab departments={departments} totalParticipants={analytics.totalParticipants} compact />
            </SectionCard>

            {/* Âncoras */}
            <SectionCard
              title="Âncoras de Satisfação"
              icon={Anchor}
              onExpand={() => setFullscreenSection("anchors")}
              accentColor="olive"
            >
              <AnchorsTab anchors={anchorsData.anchors} overallAnchorScore={anchorsData.overallScore} compact />
            </SectionCard>

            {/* Nuvem de Palavras */}
            <SectionCard
              title="Nuvem de Palavras"
              icon={Cloud}
              onExpand={() => setFullscreenSection("wordcloud")}
              accentColor="terracotta"
            >
              <WordCloudTab textResponses={textResponses} />
            </SectionCard>

            {/* REMOVIDO: Antigo bloco "Blocos NR-1" por bloco - agora está no NR1ExecutiveDashboard */}

          </motion.div>
        </>
      )}

      {/* Fullscreen Modals */}
      <FullscreenModal
        isOpen={fullscreenSection === "blocks"}
        onClose={() => setFullscreenSection(null)}
        title="Análise por Blocos NR-1"
        icon={BarChart3}
      >
        <BlockAnalysisTab categories={analytics.responsesByCategory} />
      </FullscreenModal>

      <FullscreenModal
        isOpen={fullscreenSection === "departments"}
        onClose={() => setFullscreenSection(null)}
        title="Análise por Departamentos"
        icon={Building2}
      >
        <DepartmentAnalysisTab departments={departments} totalParticipants={analytics.totalParticipants} />
      </FullscreenModal>

      <FullscreenModal
        isOpen={fullscreenSection === "anchors"}
        onClose={() => setFullscreenSection(null)}
        title="Âncoras de Satisfação"
        icon={Anchor}
      >
        <AnchorsTab anchors={anchorsData.anchors} overallAnchorScore={anchorsData.overallScore} />
      </FullscreenModal>

      <FullscreenModal
        isOpen={fullscreenSection === "wordcloud"}
        onClose={() => setFullscreenSection(null)}
        title="Nuvem de Palavras"
        icon={Cloud}
      >
        <WordCloudTab textResponses={textResponses} />
      </FullscreenModal>

      <FullscreenModal
        isOpen={fullscreenSection === "heatmap"}
        onClose={() => setFullscreenSection(null)}
        title="Mapa de Calor"
        icon={Grid3X3}
      >
        <HeatMapTab heatMapData={heatMapData} categories={categories} />
      </FullscreenModal>


      <FullscreenModal
        isOpen={fullscreenSection === "report"}
        onClose={() => setFullscreenSection(null)}
        title="Relatório Executivo"
        icon={FileOutput}
      >
        <ReportTab assessmentId={assessmentId} assessmentTitle={assessmentTitle} currentPlan={currentPlan} />
      </FullscreenModal>

      <FullscreenModal
        isOpen={fullscreenSection === "action"}
        onClose={() => setFullscreenSection(null)}
        title="Plano de Ação com IA"
        icon={Sparkles}
      >
        <ActionPlanTab assessmentId={assessmentId} currentPlan={currentPlan} highRiskCategories={highRiskCategories} />
      </FullscreenModal>

      {isPulse && (
        <FullscreenModal
          isOpen={fullscreenSection === "climatrend"}
          onClose={() => setFullscreenSection(null)}
          title="Tendência do Clima Organizacional"
          icon={TrendingUp}
        >
          <ClimaTrendTab assessmentType={assessmentType} />
        </FullscreenModal>
      )}
    </motion.div>
  );
}
