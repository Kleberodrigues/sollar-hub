'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
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
  Plus,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/lib/stripe/config";
import { generateAIActionPlan, type ActionItem } from "@/app/dashboard/analytics/ai-action-plan-actions";

interface ActionPlanTabProps {
  assessmentId: string;
  currentPlan: PlanType;
  highRiskCategories: { category: string; score: number }[];
}

export function ActionPlanTab({
  assessmentId,
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

    console.log('[ActionPlanTab] Starting generation...');
    console.log('[ActionPlanTab] Assessment ID:', assessmentId);
    console.log('[ActionPlanTab] High risk categories:', highRiskCategories);

    setIsGenerating(true);
    setError(null);

    try {
      // Chamar server action com IA real
      const result = await generateAIActionPlan(assessmentId, highRiskCategories);
      console.log('[ActionPlanTab] Result:', result);

      if (result.success && result.actions) {
        console.log('[ActionPlanTab] Success! Actions:', result.actions.length);
        setActionPlan(result.actions);
      } else {
        console.error('[ActionPlanTab] Error:', result.error);
        setError(result.error || "Erro ao gerar plano de ação. Tente novamente.");
      }
    } catch (err) {
      console.error('[ActionPlanTab] Exception:', err);
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

  const handleCopyPlan = () => {
    if (!actionPlan) return;

    const text = actionPlan.map(a =>
      `[${getPriorityLabel(a.priority)}] ${a.title}\n${a.description}\nPrazo: ${a.timeline} | Responsável: ${a.responsible}\nImpacto: ${a.expectedImpact}\n`
    ).join('\n---\n\n');

    navigator.clipboard.writeText(text);
  };

  const handleExportCSV = () => {
    if (!actionPlan) return;

    const headers = ['Prioridade', 'Categoria', 'Título', 'Descrição', 'Prazo', 'Responsável', 'Impacto Esperado'];
    const rows = actionPlan.map(a => [
      getPriorityLabel(a.priority),
      a.category,
      a.title,
      a.description.replace(/"/g, '""'),
      a.timeline,
      a.responsible,
      a.expectedImpact
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plano-acao-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!actionPlan) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plano de Ação - ${new Date().toLocaleDateString('pt-BR')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
          .action { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
          .header { display: flex; gap: 8px; margin-bottom: 8px; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .high { background: #fee2e2; color: #dc2626; }
          .medium { background: #fef3c7; color: #d97706; }
          .low { background: #dcfce7; color: #16a34a; }
          .category { background: #f3f4f6; color: #374151; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
          .description { color: #6b7280; margin-bottom: 12px; }
          .meta { display: flex; gap: 24px; font-size: 14px; color: #6b7280; }
          .impact { color: #16a34a; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>🎯 Plano de Ação com IA</h1>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        ${actionPlan.map(a => `
          <div class="action">
            <div class="header">
              <span class="badge ${a.priority}">${getPriorityLabel(a.priority)}</span>
              <span class="badge category">${a.category}</span>
            </div>
            <div class="title">${a.title}</div>
            <div class="description">${a.description}</div>
            <div class="meta">
              <span>⏱️ ${a.timeline}</span>
              <span>👥 ${a.responsible}</span>
              <span class="impact">📈 ${a.expectedImpact}</span>
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
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
        <Card className="border-l-4 border-l-purple-500 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-purple-600" />
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
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-600 font-medium">Erro ao gerar plano:</p>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
              <Button
                onClick={handleGenerate}
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 text-red-600 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
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
                  <Button variant="outline" size="sm" onClick={handleCopyPlan}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportCSV}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Exportar CSV (Excel)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportPDF}>
                        <FileText className="w-4 h-4 mr-2" />
                        Exportar PDF (Imprimir)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button asChild size="sm" className="bg-pm-terracotta hover:bg-pm-terracotta/90">
                    <Link href="/dashboard/action-plan">
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Ação
                    </Link>
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
                        className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
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
          <Card className="border-dashed border-2 bg-white">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
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
