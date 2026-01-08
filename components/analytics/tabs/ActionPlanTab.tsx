'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Check,
  X,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlanType } from "@/lib/stripe/config";
import { generateAIActionPlan, type ActionItem } from "@/app/dashboard/analytics/ai-action-plan-actions";
import { createActionPlan, getActionPlans, deleteActionPlan } from "@/app/dashboard/action-plan/actions";
import { RISK_BLOCK_LABELS, type RiskBlock, type ActionPlan } from "@/app/dashboard/action-plan/types";

interface ActionPlanTabProps {
  assessmentId: string;
  currentPlan: PlanType;
  highRiskCategories: { category: string; score: number }[];
}

// Map AI category to RiskBlock
function mapCategoryToRiskBlock(category: string): RiskBlock | undefined {
  const mapping: Record<string, RiskBlock> = {
    'Gestão do Tempo e Sobrecarga': 'demands_and_pace',
    'Demandas e Ritmo': 'demands_and_pace',
    'Autonomia e Clareza': 'autonomy_clarity_change',
    'Liderança e Reconhecimento': 'leadership_recognition',
    'Relações e Comunicação': 'relationships_communication',
    'Equilíbrio Vida-Trabalho': 'work_life_health',
    'Violência e Assédio': 'violence_harassment',
  };
  return mapping[category];
}

export function ActionPlanTab({
  assessmentId,
  currentPlan: _currentPlan,
  highRiskCategories,
}: ActionPlanTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiActions, setAiActions] = useState<ActionItem[] | null>(null);
  const [acceptedActions, setAcceptedActions] = useState<ActionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ActionItem>>({});
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    responsible: '',
    deadline: '',
    risk_block: '' as RiskBlock | '',
  });

  // Load existing accepted actions on mount
  useEffect(() => {
    loadAcceptedActions();
  }, [assessmentId]);

  const loadAcceptedActions = async () => {
    const actions = await getActionPlans(assessmentId);
    setAcceptedActions(actions);
  };

  const canUseAI = true;

  const handleGenerate = async () => {
    if (!canUseAI) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateAIActionPlan(assessmentId, highRiskCategories);

      if (result.success && result.actions) {
        setAiActions(result.actions);
        toast.success('Plano de ação gerado com sucesso!');
      } else if (result.error === 'INSUFFICIENT_DATA') {
        setError("Esta avaliação ainda não possui respostas suficientes para gerar um plano de ação. Aguarde os participantes responderem o questionário.");
      } else {
        setError(result.error || "Erro ao gerar plano de ação. Tente novamente.");
      }
    } catch (err) {
      console.error('[ActionPlanTab] Exception:', err);
      setError("Erro ao gerar plano de ação. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptAction = async (action: ActionItem) => {
    setIsSaving(true);
    try {
      const result = await createActionPlan({
        title: action.title,
        description: action.description,
        responsible: action.responsible,
        deadline: undefined, // AI gives timeline like "2-4 semanas", not a date
        risk_block: mapCategoryToRiskBlock(action.category),
        comments: `Prazo sugerido: ${action.timeline} | Impacto esperado: ${action.expectedImpact}`,
        assessment_id: assessmentId,
      });

      if (result.success && result.data) {
        setAcceptedActions([result.data, ...acceptedActions]);
        setAiActions(aiActions?.filter(a => a.id !== action.id) || null);
        toast.success('Ação aceita e salva!');
      } else {
        toast.error(result.error || 'Erro ao salvar ação');
      }
    } catch {
      toast.error('Erro ao salvar ação');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectAction = (actionId: string) => {
    setAiActions(aiActions?.filter(a => a.id !== actionId) || null);
    toast.info('Ação rejeitada');
  };

  const handleStartEdit = (action: ActionItem) => {
    setEditingId(action.id);
    setEditForm({ ...action });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm) return;

    setAiActions(aiActions?.map(a =>
      a.id === editingId ? { ...a, ...editForm } as ActionItem : a
    ) || null);
    setEditingId(null);
    setEditForm({});
    toast.success('Ação atualizada');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleCreateManual = async () => {
    if (!manualForm.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const result = await createActionPlan({
        title: manualForm.title,
        description: manualForm.description || undefined,
        responsible: manualForm.responsible || undefined,
        deadline: manualForm.deadline || undefined,
        risk_block: manualForm.risk_block || undefined,
        assessment_id: assessmentId,
      });

      if (result.success && result.data) {
        setAcceptedActions([result.data, ...acceptedActions]);
        setManualForm({ title: '', description: '', responsible: '', deadline: '', risk_block: '' });
        setIsAddingManual(false);
        toast.success('Ação criada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao criar ação');
      }
    } catch {
      toast.error('Erro ao criar ação');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccepted = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta ação?')) return;

    const result = await deleteActionPlan(id);
    if (result.success) {
      setAcceptedActions(acceptedActions.filter(a => a.id !== id));
      toast.success('Ação excluída');
    } else {
      toast.error(result.error || 'Erro ao excluir');
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
    if (!aiActions) return;

    const text = aiActions.map(a =>
      `[${getPriorityLabel(a.priority)}] ${a.title}\n${a.description}\nPrazo: ${a.timeline} | Responsável: ${a.responsible}\nImpacto: ${a.expectedImpact}\n`
    ).join('\n---\n\n');

    navigator.clipboard.writeText(text);
    toast.success('Plano copiado!');
  };

  const handleExportCSV = () => {
    if (!aiActions) return;

    const headers = ['Prioridade', 'Categoria', 'Título', 'Descrição', 'Prazo', 'Responsável', 'Impacto Esperado'];
    const rows = aiActions.map(a => [
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
    if (!aiActions) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plano de Ação - ${new Date().toLocaleDateString('pt-BR')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #789750; border-bottom: 2px solid #789750; padding-bottom: 10px; }
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
        ${aiActions.map(a => `
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
        <Card className="border-l-4 border-l-pm-olive bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-pm-olive/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-pm-olive" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-heading">
                    Plano de Ação
                  </h2>
                  <p className="text-text-muted">
                    Gere recomendações com IA ou crie ações manualmente
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingManual(true)}
                  disabled={isAddingManual}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Manual
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!canUseAI || isGenerating}
                  className="bg-pm-olive hover:bg-pm-olive-dark"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : aiActions ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerar
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar com IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-600 font-medium">Erro ao gerar plano:</p>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Manual Action Form */}
      <AnimatePresence>
        {isAddingManual && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-2 border-dashed border-pm-terracotta/30 bg-pm-terracotta/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-pm-terracotta" />
                  Nova Ação Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-text-muted">Título *</label>
                    <Input
                      value={manualForm.title}
                      onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                      placeholder="Ex: Implementar programa de bem-estar"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-text-muted">Descrição</label>
                    <Textarea
                      value={manualForm.description}
                      onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                      placeholder="Detalhes da ação..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">Responsável</label>
                    <Input
                      value={manualForm.responsible}
                      onChange={(e) => setManualForm({ ...manualForm, responsible: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">Prazo</label>
                    <Input
                      type="date"
                      value={manualForm.deadline}
                      onChange={(e) => setManualForm({ ...manualForm, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">Bloco de Risco</label>
                    <Select
                      value={manualForm.risk_block}
                      onValueChange={(v) => setManualForm({ ...manualForm, risk_block: v as RiskBlock })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RISK_BLOCK_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingManual(false);
                      setManualForm({ title: '', description: '', responsible: '', deadline: '', risk_block: '' });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateManual} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accepted Actions */}
      {acceptedActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="font-display text-xl text-text-heading">
                  Ações Aceitas ({acceptedActions.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {acceptedActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 rounded-xl bg-green-50 border border-green-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {action.risk_block && (
                            <Badge variant="outline">{RISK_BLOCK_LABELS[action.risk_block]}</Badge>
                          )}
                          <Badge className="bg-green-100 text-green-700">Aceita</Badge>
                        </div>
                        <h4 className="font-semibold text-text-heading mb-1">{action.title}</h4>
                        {action.description && (
                          <p className="text-sm text-text-muted mb-2">{action.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-text-muted">
                          {action.responsible && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> {action.responsible}
                            </span>
                          )}
                          {action.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {new Date(action.deadline).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccepted(action.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Action Plan Results */}
      {aiActions && aiActions.length > 0 && (
        <>
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {aiActions.filter(a => a.priority === "high").length}
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
                      {aiActions.filter(a => a.priority === "medium").length}
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
                      {aiActions.filter(a => a.priority === "low").length}
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
          >
            <Card className="border-l-4 border-l-pm-olive">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-pm-olive" />
                  </div>
                  <CardTitle className="font-display text-xl text-text-heading">
                    Sugestões da IA ({aiActions.length})
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
                        CSV (Excel)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportPDF}>
                        <FileText className="w-4 h-4 mr-2" />
                        PDF (Imprimir)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted mb-4">
                  Revise as sugestões abaixo. Você pode editar, aceitar ou rejeitar cada ação.
                </p>
                <div className="space-y-4">
                  {aiActions
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
                        {editingId === action.id ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <Input
                              value={editForm.title || ''}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              placeholder="Título"
                            />
                            <Textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Descrição"
                              rows={2}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                value={editForm.responsible || ''}
                                onChange={(e) => setEditForm({ ...editForm, responsible: e.target.value })}
                                placeholder="Responsável"
                              />
                              <Input
                                value={editForm.timeline || ''}
                                onChange={(e) => setEditForm({ ...editForm, timeline: e.target.value })}
                                placeholder="Prazo"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                <X className="w-4 h-4 mr-1" /> Cancelar
                              </Button>
                              <Button size="sm" onClick={handleSaveEdit}>
                                <Save className="w-4 h-4 mr-1" /> Salvar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
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
                            <div className="flex flex-col gap-2 min-w-[100px]">
                              <Button
                                size="sm"
                                className="bg-pm-olive hover:bg-pm-olive-dark text-white shadow-sm"
                                onClick={() => handleAcceptAction(action)}
                                disabled={isSaving}
                              >
                                <Check className="w-4 h-4 mr-1" /> Aceitar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-pm-terracotta/30 text-pm-terracotta hover:bg-pm-terracotta/10 hover:border-pm-terracotta"
                                onClick={() => handleStartEdit(action)}
                              >
                                <Pencil className="w-4 h-4 mr-1" /> Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                onClick={() => handleRejectAction(action.id)}
                              >
                                <X className="w-4 h-4 mr-1" /> Rejeitar
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Empty State */}
      {!aiActions && !isGenerating && acceptedActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-dashed border-2 bg-white">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pm-olive/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-pm-olive" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
                  Crie seu Plano de Ação
                </h3>
                <p className="text-text-secondary max-w-md mx-auto mb-6">
                  Gere recomendações personalizadas com IA ou crie ações manualmente
                  para melhorar os indicadores de risco.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingManual(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Manual
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    className="bg-pm-olive hover:bg-pm-olive-dark"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar com IA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
