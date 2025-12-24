"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  Brain,
  ListChecks,
  ChevronRight,
  
  CheckCircle,
  Clock,
  Target,
  Users,
  TrendingDown,
  Pencil,
  Save,
  X,
  Trash2,
  
  Eye,
  Crown,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getAIUsage,
  getAIGenerations,
  generateAIAnalysis,
  generateAIActionPlan,
  updateAIGeneration,
  deleteAIGeneration,
  type AIGeneration,
  type AIAnalysis,
  type ActionItem,
  type AIUsage,
} from "@/app/dashboard/assessments/ai-actions";
import Link from "next/link";

interface AIInsightsCardProps {
  assessmentId: string;
  responseCount: number;
  highRiskCategories?: { category: string; score: number }[];
}

export function AIInsightsCard({
  assessmentId,
  responseCount,
  highRiskCategories = [],
}: AIInsightsCardProps) {
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<AIGeneration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load data on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps -- loadData is stable, only depends on assessmentId
  useEffect(() => {
    loadData();
  }, [assessmentId]);

  async function loadData() {
    setIsLoading(true);
    const [usageResult, generationsResult] = await Promise.all([
      getAIUsage(),
      getAIGenerations(assessmentId),
    ]);

    if (usageResult.usage) setUsage(usageResult.usage);
    if (generationsResult.generations) setGenerations(generationsResult.generations);
    setIsLoading(false);
  }

  // Handle generate analysis
  async function handleGenerateAnalysis() {
    if (responseCount === 0) {
      toast({
        title: "Sem respostas",
        description: "Aguarde ter pelo menos uma resposta para gerar a análise.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAnalysis(true);
    const result = await generateAIAnalysis(assessmentId);

    if (result.success && result.generation) {
      setGenerations([result.generation, ...generations]);
      toast({
        title: "Análise gerada!",
        description: "Sua análise IA está pronta para visualização.",
      });
      loadData(); // Refresh usage
    } else {
      toast({
        title: "Erro ao gerar",
        description: result.error || "Tente novamente.",
        variant: "destructive",
      });
    }
    setIsGeneratingAnalysis(false);
  }

  // Handle generate action plan
  async function handleGeneratePlan() {
    if (responseCount === 0) {
      toast({
        title: "Sem respostas",
        description: "Aguarde ter pelo menos uma resposta para gerar o plano.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPlan(true);
    const result = await generateAIActionPlan(assessmentId, highRiskCategories);

    if (result.success && result.generation) {
      setGenerations([result.generation, ...generations]);
      toast({
        title: "Plano gerado!",
        description: "Seu plano de ação IA está pronto para visualização.",
      });
      loadData(); // Refresh usage
    } else {
      toast({
        title: "Erro ao gerar",
        description: result.error || "Tente novamente.",
        variant: "destructive",
      });
    }
    setIsGeneratingPlan(false);
  }

  // Handle save edit
  async function handleSaveEdit() {
    if (!selectedGeneration) return;

    try {
      const parsedContent = JSON.parse(editedContent);
      const result = await updateAIGeneration(selectedGeneration.id, parsedContent);

      if (result.success) {
        toast({ title: "Alterações salvas!" });
        setIsEditing(false);
        loadData();
      } else {
        toast({
          title: "Erro ao salvar",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "JSON inválido",
        description: "Verifique o formato do conteúdo.",
        variant: "destructive",
      });
    }
  }

  // Handle delete
  async function handleDelete() {
    if (!deleteId) return;

    const result = await deleteAIGeneration(deleteId);
    if (result.success) {
      setGenerations(generations.filter((g) => g.id !== deleteId));
      setSelectedGeneration(null);
      toast({ title: "Geração removida" });
    }
    setDeleteId(null);
  }

  // Usage percentage
  const analysesPercent = usage
    ? usage.analyses_limit === Infinity
      ? 0
      : (usage.analyses_count / usage.analyses_limit) * 100
    : 0;
  const plansPercent = usage
    ? usage.action_plans_limit === Infinity
      ? 0
      : (usage.action_plans_count / usage.action_plans_limit) * 100
    : 0;

  const canGenerateAnalysis = usage
    ? usage.analyses_limit === Infinity || usage.analyses_count < usage.analyses_limit
    : false;
  const canGeneratePlan = usage
    ? usage.action_plans_limit === Infinity || usage.action_plans_count < usage.action_plans_limit
    : false;

  // Split generations by type
  const _analyses = generations.filter((g) => g.type === "analysis");
  const _actionPlans = generations.filter((g) => g.type === "action_plan");

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-l-4 border-l-purple-500 overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-purple-50 via-white to-pm-terracotta/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-display text-text-heading">
                  Insights com IA
                </CardTitle>
                <p className="text-sm text-text-muted">
                  Análises e planos de ação personalizados
                </p>
              </div>
            </div>
            {usage && (
              <Badge variant="outline" className="gap-1.5 bg-white">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                {usage.analyses_limit === Infinity
                  ? "Ilimitado"
                  : `${usage.analyses_count + usage.action_plans_count}/${usage.analyses_limit + usage.action_plans_limit} usados`}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Usage Progress */}
          {usage && usage.analyses_limit !== Infinity && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-bg-secondary rounded-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Brain className="w-4 h-4" />
                    Análises IA
                  </span>
                  <span className="font-medium">
                    {usage.analyses_count}/{usage.analyses_limit}
                  </span>
                </div>
                <Progress value={analysesPercent} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4" />
                    Planos de Ação
                  </span>
                  <span className="font-medium">
                    {usage.action_plans_count}/{usage.action_plans_limit}
                  </span>
                </div>
                <Progress value={plansPercent} className="h-2" />
              </div>
            </div>
          )}

          {/* Generation Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Analysis Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative p-5 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group"
              onClick={canGenerateAnalysis ? handleGenerateAnalysis : undefined}
            >
              {isGeneratingAnalysis && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-heading mb-1">
                    Gerar Análise IA
                  </h3>
                  <p className="text-sm text-text-muted mb-3">
                    Análise completa dos riscos psicossociais com insights e recomendações baseadas nos dados coletados.
                  </p>
                  <Button
                    size="sm"
                    disabled={!canGenerateAnalysis || isGeneratingAnalysis || responseCount === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {responseCount === 0 ? "Aguardando respostas" : "Gerar Análise"}
                  </Button>
                </div>
              </div>
              {!canGenerateAnalysis && (
                <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-heading mb-1">
                      Limite atingido
                    </p>
                    <Link href="/dashboard/configuracoes/billing">
                      <Button size="sm" variant="outline">
                        Fazer Upgrade
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Plan Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative p-5 rounded-xl border-2 border-dashed border-pm-terracotta/30 bg-pm-terracotta/5 hover:border-pm-terracotta/60 hover:bg-pm-terracotta/10 transition-all cursor-pointer group"
              onClick={canGeneratePlan ? handleGeneratePlan : undefined}
            >
              {isGeneratingPlan && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-pm-terracotta" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pm-terracotta/10 flex items-center justify-center group-hover:bg-pm-terracotta/20 transition-colors">
                  <ListChecks className="w-6 h-6 text-pm-terracotta" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-heading mb-1">
                    Gerar Plano de Ação
                  </h3>
                  <p className="text-sm text-text-muted mb-3">
                    Ações práticas e personalizadas para melhorar cada área de risco identificada no assessment.
                  </p>
                  <Button
                    size="sm"
                    disabled={!canGeneratePlan || isGeneratingPlan || responseCount === 0}
                    className="bg-pm-terracotta hover:bg-pm-terracotta/90"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {responseCount === 0 ? "Aguardando respostas" : "Gerar Plano"}
                  </Button>
                </div>
              </div>
              {!canGeneratePlan && (
                <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-heading mb-1">
                      Limite atingido
                    </p>
                    <Link href="/dashboard/configuracoes/billing">
                      <Button size="sm" variant="outline">
                        Fazer Upgrade
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Previous Generations */}
          {generations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-text-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-muted" />
                Gerações Anteriores
              </h4>
              <div className="space-y-2">
                {generations.slice(0, 5).map((gen) => (
                  <motion.div
                    key={gen.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary hover:bg-bg-sage transition-colors cursor-pointer group"
                    onClick={() => setSelectedGeneration(gen)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          gen.type === "analysis"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-pm-terracotta/10 text-pm-terracotta"
                        )}
                      >
                        {gen.type === "analysis" ? (
                          <Brain className="w-4 h-4" />
                        ) : (
                          <ListChecks className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-text-heading">
                          {gen.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(gen.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {gen.is_edited && (
                            <span className="ml-2 text-amber-600">(editado)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pm-terracotta/5 border border-purple-100">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-heading">Como funciona:</strong> Nossa IA analisa todas as respostas do seu assessment para identificar padrões e gerar insights acionáveis. Os planos de ação são totalmente editáveis pelo administrador.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <Dialog open={!!selectedGeneration} onOpenChange={() => {
        setSelectedGeneration(null);
        setIsEditing(false);
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    selectedGeneration?.type === "analysis"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-pm-terracotta/10 text-pm-terracotta"
                  )}
                >
                  {selectedGeneration?.type === "analysis" ? (
                    <Brain className="w-5 h-5" />
                  ) : (
                    <ListChecks className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <DialogTitle>{selectedGeneration?.title}</DialogTitle>
                  <DialogDescription>
                    Gerado em{" "}
                    {selectedGeneration &&
                      new Date(selectedGeneration.created_at).toLocaleDateString("pt-BR")}
                    {selectedGeneration?.is_edited && " (editado)"}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(true);
                        setEditedContent(JSON.stringify(selectedGeneration?.content, null, 2));
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeleteId(selectedGeneration?.id || null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="font-mono text-sm h-[400px]"
                placeholder="Edite o JSON do conteúdo..."
              />
            ) : selectedGeneration?.type === "analysis" ? (
              <AnalysisView analysis={selectedGeneration.content as AIAnalysis} />
            ) : (
              <ActionPlanView actions={selectedGeneration?.content as ActionItem[]} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover geração?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A geração será arquivada e não aparecerá mais na lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Analysis View Component
function AnalysisView({ analysis }: { analysis: AIAnalysis }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "Baixo";
      case "medium":
        return "Moderado";
      case "high":
        return "Elevado";
      case "critical":
        return "Crítico";
      default:
        return risk;
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Summary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary">
        <div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center",
            getRiskColor(analysis.overallRisk)
          )}
        >
          <span className="text-2xl font-bold">{analysis.riskScore}</span>
        </div>
        <div>
          <Badge className={getRiskColor(analysis.overallRisk)}>
            Risco {getRiskLabel(analysis.overallRisk)}
          </Badge>
          <p className="mt-2 text-sm text-text-secondary">{analysis.summary}</p>
        </div>
      </div>

      {/* Key Findings */}
      <div>
        <h4 className="font-semibold text-text-heading mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Principais Descobertas
        </h4>
        <ul className="space-y-2">
          {analysis.keyFindings.map((finding, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Category Breakdown */}
      <div>
        <h4 className="font-semibold text-text-heading mb-3">
          Análise por Categoria
        </h4>
        <div className="space-y-3">
          {analysis.categoryBreakdown.map((cat, i) => (
            <div key={i} className="p-3 rounded-lg bg-bg-secondary">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{cat.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{cat.score}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      cat.status === "healthy" && "border-green-500 text-green-600",
                      cat.status === "attention" && "border-yellow-500 text-yellow-600",
                      cat.status === "critical" && "border-red-500 text-red-600"
                    )}
                  >
                    {cat.status === "healthy"
                      ? "Saudável"
                      : cat.status === "attention"
                      ? "Atenção"
                      : "Crítico"}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-text-muted">{cat.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-semibold text-text-heading mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Recomendações
        </h4>
        <ul className="space-y-2">
          {analysis.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <ChevronRight className="w-4 h-4 text-pm-terracotta mt-0.5 flex-shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Action Plan View Component
function ActionPlanView({ actions }: { actions: ActionItem[] }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  // Sort by priority
  const sortedActions = [...(actions || [])].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] || 2) - (order[b.priority] || 2);
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-red-50 text-center">
          <p className="text-2xl font-bold text-red-600">
            {actions?.filter((a) => a.priority === "high").length || 0}
          </p>
          <p className="text-xs text-red-600">Alta Prioridade</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-50 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {actions?.filter((a) => a.priority === "medium").length || 0}
          </p>
          <p className="text-xs text-yellow-600">Média Prioridade</p>
        </div>
        <div className="p-3 rounded-lg bg-green-50 text-center">
          <p className="text-2xl font-bold text-green-600">
            {actions?.filter((a) => a.priority === "low").length || 0}
          </p>
          <p className="text-xs text-green-600">Baixa Prioridade</p>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {sortedActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-bg-secondary hover:bg-bg-sage transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("border", getPriorityColor(action.priority))}>
                    {getPriorityLabel(action.priority)}
                  </Badge>
                  <Badge variant="outline">{action.category}</Badge>
                </div>
                <h4 className="font-semibold text-text-heading mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-text-muted mb-3">{action.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span>{action.timeline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span>{action.responsible}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">{action.expectedImpact}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
