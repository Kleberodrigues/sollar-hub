'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  Target,
  Clock,
  Users,
  RefreshCw,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlanType } from "@/lib/stripe/config";
import {
  exportAnalyticsSummaryCSV,
  getReportData,
  type ExportResult,
} from "@/app/dashboard/analytics/export-actions";
import {
  generateAIReport,
  type AIReport,
} from "@/app/dashboard/analytics/ai-report-actions";

interface ReportTabProps {
  assessmentId: string;
  assessmentTitle: string;
  currentPlan: PlanType;
}

export function ReportTab({
  assessmentId,
  assessmentTitle,
  currentPlan: _currentPlan,
}: ReportTabProps) {
  const [isGenerating, setIsGenerating] = useState<"csv" | "pdf" | "ai" | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(content);
    const blob = new Blob([uint8Array], { type: `${mimeType.replace(/;$/, '')};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to handle export result errors
  const handleExportResult = (result: unknown, format: string): boolean => {
    if (typeof result === 'object' && result !== null && 'success' in result) {
      const exportResult = result as ExportResult;
      if (!exportResult.success) {
        if (exportResult.upgradeRequired) {
          toast.error(exportResult.error, {
            action: {
              label: 'Ver planos',
              onClick: () => window.location.href = '/dashboard/configuracoes/billing',
            },
          });
        } else {
          toast.error(exportResult.error || `Erro ao exportar ${format}`);
        }
        return false;
      }
    }
    return true;
  };

  const handleExportCSV = async () => {
    setIsGenerating("csv");
    try {
      const result = await exportAnalyticsSummaryCSV(assessmentId);

      if (!handleExportResult(result, 'CSV')) return;

      if (typeof result === 'string') {
        downloadFile(
          result,
          `relatorio-${assessmentId}-${Date.now()}.csv`,
          'text/csv;charset=utf-8;'
        );
        toast.success('Relatório CSV exportado com sucesso!');
        setLastGenerated(new Date().toLocaleTimeString("pt-BR"));
      }
    } catch (error) {
      console.error('[Export CSV] Error:', error);
      toast.error('Erro ao exportar CSV. Tente novamente.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExportPDF = async () => {
    setIsGenerating("pdf");
    try {
      const data = await getReportData(assessmentId);

      if (!handleExportResult(data, 'PDF')) return;

      // Importar dinamicamente o gerador de PDF
      const { generateAssessmentPDF } = await import('@/lib/pdf/assessment-report');
      const pdfBlob = await generateAssessmentPDF(data as Exclude<typeof data, ExportResult>);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${assessmentId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Relatório PDF gerado com sucesso!');
      setLastGenerated(new Date().toLocaleTimeString("pt-BR"));
    } catch (error) {
      console.error('[Export PDF] Error:', error);
      toast.error('Erro ao gerar relatório PDF. Tente novamente.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateAIReport = async () => {
    setIsGenerating("ai");
    setError(null);
    try {
      const result = await generateAIReport(assessmentId);

      if (!result.success) {
        setError(result.error || 'Erro ao gerar relatório');
        toast.error(result.error || 'Erro ao gerar relatório');
        return;
      }

      if (result.report) {
        setAiReport(result.report);
        setLastGenerated(new Date().toLocaleTimeString("pt-BR"));
        toast.success('Relatório gerado com sucesso!');
      }
    } catch (error) {
      console.error('[AI Report] Error:', error);
      setError('Erro ao gerar relatório. Tente novamente.');
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(null);
    }
  };

  const copyToClipboard = async () => {
    if (!aiReport) return;

    const text = `
RELATÓRIO DE RISCOS PSICOSSOCIAIS - ${assessmentTitle}
Gerado em: ${aiReport.generatedAt}

RESUMO EXECUTIVO
${aiReport.executiveSummary}

ANÁLISE POR CATEGORIA
${aiReport.riskAnalysis.map(r => `
${r.categoryName} (Score: ${r.score} - ${r.riskLevel === 'high' ? 'ALTO RISCO' : r.riskLevel === 'medium' ? 'MÉDIO RISCO' : 'BAIXO RISCO'})
${r.analysis}

Recomendações:
${r.recommendations.map(rec => `- ${rec}`).join('\n')}
`).join('\n')}

RECOMENDAÇÕES GERAIS
${aiReport.overallRecommendations.map(rec => `- ${rec}`).join('\n')}

PRIORIDADES DE AÇÃO
${aiReport.actionPriorities.map(p => `[${p.priority.toUpperCase()}] ${p.action} (Prazo: ${p.timeline}, Responsável: ${p.responsible})`).join('\n')}

CONCLUSÃO
${aiReport.conclusion}
    `.trim();

    await navigator.clipboard.writeText(text);
    toast.success('Relatório copiado para a área de transferência!');
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getRiskColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header - Simplified with single button */}
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
                    Relatório Inteligente
                  </h2>
                  <p className="text-text-muted">{assessmentTitle}</p>
                  <p className="text-sm text-purple-600 mt-1">
                    Análise completa gerada com IA
                  </p>
                  {lastGenerated && (
                    <p className="text-xs text-pm-olive mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Último relatório: {lastGenerated}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleGenerateAIReport}
                  disabled={isGenerating !== null}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isGenerating === "ai" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : aiReport ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Regenerar Relatório
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={isGenerating !== null}
                  >
                    {isGenerating === "csv" ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                    )}
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={isGenerating !== null}
                  >
                    {isGenerating === "pdf" ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <File className="w-4 h-4 mr-1" />
                    )}
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error State */}
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

      {/* AI Report Results */}
      {aiReport && (
        <>
          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-l-4 border-l-pm-olive">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-pm-olive" />
                  </div>
                  <CardTitle className="font-display text-xl text-text-heading">
                    Resumo Executivo
                  </CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Tudo
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary whitespace-pre-line leading-relaxed">
                  {aiReport.executiveSummary}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Analysis by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-pm-terracotta">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-pm-terracotta" />
                  </div>
                  <CardTitle className="font-display text-xl text-text-heading">
                    Análise por Categoria
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiReport.riskAnalysis.map((analysis, index) => (
                    <motion.div
                      key={analysis.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-bg-secondary"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-text-heading">
                            {analysis.categoryName}
                          </h4>
                          <Badge className={cn("border", getRiskColor(analysis.riskLevel))}>
                            {analysis.riskLevel === 'high' ? 'Alto Risco' :
                             analysis.riskLevel === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                          </Badge>
                        </div>
                        <span className="text-lg font-bold text-text-heading">
                          {analysis.score.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mb-3">
                        {analysis.analysis}
                      </p>
                      <div>
                        <p className="text-xs font-semibold text-text-heading mb-2">Recomendações:</p>
                        <ul className="space-y-1">
                          {analysis.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-pm-olive mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Priorities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="font-display text-xl text-text-heading">
                    Prioridades de Ação
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiReport.actionPriorities.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-bg-secondary flex items-start gap-4"
                    >
                      <Badge className={cn("border mt-0.5", getPriorityColor(action.priority))}>
                        {action.priority === 'high' ? 'Alta' :
                         action.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-text-heading">{action.action}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {action.timeline}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {action.responsible}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conclusion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-pm-olive/5 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pm-olive/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-pm-olive" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-text-heading mb-2">Conclusão</h3>
                    <p className="text-text-secondary leading-relaxed">
                      {aiReport.conclusion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Empty State - Show when no report generated */}
      {!aiReport && !isGenerating && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-dashed border-2">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-text-heading mb-3">
                  Relatório Inteligente
                </h3>
                <p className="text-text-secondary max-w-lg mx-auto mb-6 leading-relaxed">
                  Gere um relatório completo e personalizado com análise detalhada de cada categoria de risco,
                  recomendações específicas e prioridades de ação - tudo gerado automaticamente com IA.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <Badge variant="outline" className="px-3 py-1">
                    <FileText className="w-4 h-4 mr-1" />
                    Resumo Executivo
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Análise de Riscos
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Target className="w-4 h-4 mr-1" />
                    Plano de Ação
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Recomendações
                  </Badge>
                </div>
                <Button
                  onClick={handleGenerateAIReport}
                  disabled={isGenerating !== null}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
