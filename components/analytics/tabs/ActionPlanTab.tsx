'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  TrendingDown,
  RefreshCw,
  Copy,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/lib/stripe/config";

interface ActionItem {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  timeline: string;
  responsible: string;
  expectedImpact: string;
}

interface ActionPlanTabProps {
  assessmentId: string;
  currentPlan: PlanType;
  highRiskCategories: { category: string; score: number }[];
}

// Simulated AI-generated action plan (in production, this would call an API)
const generateActionPlan = async (
  highRiskCategories: { category: string; score: number }[]
): Promise<ActionItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const actionTemplates: Record<string, ActionItem[]> = {
    demands_and_pace: [
      {
        id: "1",
        priority: "high",
        category: "Demandas e Ritmo",
        title: "Revisão da distribuição de tarefas",
        description: "Realizar análise da carga de trabalho por colaborador e redistribuir demandas de forma equilibrada.",
        timeline: "2-4 semanas",
        responsible: "Gestores de Área",
        expectedImpact: "Redução de 30% nas queixas de sobrecarga",
      },
      {
        id: "2",
        priority: "medium",
        category: "Demandas e Ritmo",
        title: "Implementar pausas programadas",
        description: "Estabelecer política de pausas regulares durante a jornada de trabalho.",
        timeline: "1-2 semanas",
        responsible: "RH",
        expectedImpact: "Aumento de 20% na produtividade",
      },
    ],
    autonomy_clarity_change: [
      {
        id: "3",
        priority: "high",
        category: "Autonomia e Clareza",
        title: "Definir papéis e responsabilidades",
        description: "Documentar e comunicar claramente as responsabilidades de cada função.",
        timeline: "3-4 semanas",
        responsible: "Gestão + RH",
        expectedImpact: "Redução de 40% em conflitos de papel",
      },
    ],
    leadership_recognition: [
      {
        id: "4",
        priority: "high",
        category: "Liderança",
        title: "Programa de feedback contínuo",
        description: "Implementar ciclos regulares de feedback entre líderes e equipes.",
        timeline: "4-6 semanas",
        responsible: "Liderança",
        expectedImpact: "Aumento de 25% no engajamento",
      },
    ],
    relationships_communication: [
      {
        id: "5",
        priority: "medium",
        category: "Relações",
        title: "Workshops de comunicação",
        description: "Realizar treinamentos sobre comunicação não-violenta e resolução de conflitos.",
        timeline: "4-8 semanas",
        responsible: "RH + Consultoria",
        expectedImpact: "Melhoria de 35% no clima organizacional",
      },
    ],
    work_life_health: [
      {
        id: "6",
        priority: "high",
        category: "Equilíbrio",
        title: "Política de desconexão",
        description: "Implementar política que limite comunicações fora do horário de trabalho.",
        timeline: "2-3 semanas",
        responsible: "Diretoria + RH",
        expectedImpact: "Redução de 50% em burnout",
      },
    ],
    violence_harassment: [
      {
        id: "7",
        priority: "high",
        category: "Violência e Assédio",
        title: "Canal de denúncias confidencial",
        description: "Implementar ou fortalecer canal seguro para relatos de assédio.",
        timeline: "1-2 semanas",
        responsible: "Compliance + RH",
        expectedImpact: "100% de cobertura em casos reportados",
      },
    ],
  };

  const actions: ActionItem[] = [];
  highRiskCategories.forEach(({ category }) => {
    const categoryActions = actionTemplates[category] || [];
    actions.push(...categoryActions);
  });

  return actions.length > 0 ? actions : [
    {
      id: "default",
      priority: "low",
      category: "Geral",
      title: "Manter monitoramento contínuo",
      description: "Continuar acompanhando indicadores e realizando pesquisas periódicas.",
      timeline: "Contínuo",
      responsible: "RH",
      expectedImpact: "Manutenção dos níveis atuais",
    },
  ];
};

export function ActionPlanTab({
  assessmentId: _assessmentId,
  currentPlan: _currentPlan,
  highRiskCategories,
}: ActionPlanTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionPlan, setActionPlan] = useState<ActionItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // All plans have access to AI action plan features
  const canUseAI = true;

  const handleGenerate = async () => {
    if (!canUseAI) return;

    setIsGenerating(true);
    setError(null);

    try {
      const plan = await generateActionPlan(highRiskCategories);
      setActionPlan(plan);
    } catch {
      setError("Erro ao gerar plano de ação. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 via-white to-pm-terracotta/5 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-heading">
                    Plano de Ação com IA
                  </h2>
                  <p className="text-text-muted">
                    Recomendações personalizadas baseadas nos resultados
                  </p>
                  {highRiskCategories.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">
                        {highRiskCategories.length} categoria(s) em alto risco
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!canUseAI || isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : actionPlan ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Plano
                  </>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Plan Results */}
      {actionPlan && (
        <>
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {actionPlan.filter(a => a.priority === "high").length}
                    </p>
                    <p className="text-sm text-red-600">Alta Prioridade</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {actionPlan.filter(a => a.priority === "medium").length}
                    </p>
                    <p className="text-sm text-yellow-600">Média Prioridade</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {actionPlan.filter(a => a.priority === "low").length}
                    </p>
                    <p className="text-sm text-green-600">Baixa Prioridade</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Actions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="font-display text-xl text-text-heading">
                    Ações Recomendadas
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actionPlan
                    .sort((a, b) => {
                      const order = { high: 0, medium: 1, low: 2 };
                      return order[a.priority] - order[b.priority];
                    })
                    .map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
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
                            <p className="text-sm text-text-muted mb-3">
                              {action.description}
                            </p>
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
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Empty State */}
      {!actionPlan && !isGenerating && canUseAI && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-dashed border-2">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
                  Gere seu Plano de Ação
                </h3>
                <p className="text-text-secondary max-w-md mx-auto mb-6">
                  Nossa IA irá analisar os resultados do assessment e gerar
                  recomendações personalizadas para melhorar os indicadores.
                </p>
                <Button
                  onClick={handleGenerate}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Plano de Ação
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
