'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Save,
  X,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  type ActionPlan,
  type ActionPlanStatus,
  type RiskBlock,
  RISK_BLOCK_LABELS,
  STATUS_LABELS,
} from '@/app/dashboard/action-plan/types';
import {
  createActionPlan,
  updateActionPlan,
  deleteActionPlan,
} from '@/app/dashboard/action-plan/actions';

interface ActionPlanContentProps {
  actionPlans: ActionPlan[];
  canEdit: boolean;
  assessmentId?: string;
  prefilledRiskBlock?: string;
}

const STATUS_ICONS: Record<ActionPlanStatus, React.ReactNode> = {
  pending: <Circle className="w-4 h-4 text-gray-400" />,
  in_progress: <Clock className="w-4 h-4 text-blue-500" />,
  delayed: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
};

const STATUS_COLORS: Record<ActionPlanStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  delayed: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
};

export function ActionPlanContent({
  actionPlans: initialPlans,
  canEdit,
  assessmentId,
  prefilledRiskBlock,
}: ActionPlanContentProps) {
  const [plans, setPlans] = useState<ActionPlan[]>(initialPlans);
  const [isAdding, setIsAdding] = useState(!!prefilledRiskBlock);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ActionPlanStatus | 'all'>('all');
  const [riskBlockFilter, setRiskBlockFilter] = useState<RiskBlock | 'all'>('all');
  const [isPending, startTransition] = useTransition();

  // New action form state
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    responsible: '',
    deadline: '',
    risk_block: (prefilledRiskBlock || '') as RiskBlock | '',
    comments: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<ActionPlan>>({});

  const filteredPlans = plans.filter((plan) => {
    if (statusFilter !== 'all' && plan.status !== statusFilter) return false;
    if (riskBlockFilter !== 'all' && plan.risk_block !== riskBlockFilter) return false;
    return true;
  });

  const handleAddAction = () => {
    if (!newAction.title.trim()) {
      toast.error('O título da ação é obrigatório');
      return;
    }

    startTransition(async () => {
      const result = await createActionPlan({
        title: newAction.title,
        description: newAction.description || undefined,
        responsible: newAction.responsible || undefined,
        deadline: newAction.deadline || undefined,
        risk_block: newAction.risk_block as RiskBlock || undefined,
        comments: newAction.comments || undefined,
        assessment_id: assessmentId,
      });

      if (result.success && result.data) {
        setPlans([result.data, ...plans]);
        setNewAction({ title: '', description: '', responsible: '', deadline: '', risk_block: '', comments: '' });
        setIsAdding(false);
        toast.success('Ação criada com sucesso');
      } else {
        toast.error(result.error || 'Erro ao criar ação');
      }
    });
  };

  const handleUpdateStatus = (id: string, status: ActionPlanStatus) => {
    startTransition(async () => {
      const result = await updateActionPlan(id, { status });
      if (result.success) {
        setPlans(plans.map(p => p.id === id ? { ...p, status } : p));
        toast.success('Status atualizado');
      } else {
        toast.error(result.error || 'Erro ao atualizar');
      }
    });
  };

  const handleSaveEdit = (id: string) => {
    startTransition(async () => {
      // Convert null values to undefined for API compatibility
      const updateInput = {
        title: editForm.title || undefined,
        description: editForm.description || undefined,
        responsible: editForm.responsible || undefined,
        deadline: editForm.deadline || undefined,
        comments: editForm.comments || undefined,
      };
      const result = await updateActionPlan(id, updateInput);
      if (result.success) {
        setPlans(plans.map(p => p.id === id ? { ...p, ...editForm } : p));
        setEditingId(null);
        setEditForm({});
        toast.success('Ação atualizada');
      } else {
        toast.error(result.error || 'Erro ao atualizar');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente excluir esta ação?')) return;

    startTransition(async () => {
      const result = await deleteActionPlan(id);
      if (result.success) {
        setPlans(plans.filter(p => p.id !== id));
        toast.success('Ação excluída');
      } else {
        toast.error(result.error || 'Erro ao excluir');
      }
    });
  };

  const startEdit = (plan: ActionPlan) => {
    setEditingId(plan.id);
    setEditForm({
      title: plan.title,
      description: plan.description || '',
      responsible: plan.responsible || '',
      deadline: plan.deadline || '',
      comments: plan.comments || '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 items-center flex-wrap">
          <Filter className="w-4 h-4 text-text-muted" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ActionPlanStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={riskBlockFilter} onValueChange={(v) => setRiskBlockFilter(v as RiskBlock | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Bloco de Risco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os blocos</SelectItem>
              {Object.entries(RISK_BLOCK_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canEdit && !isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Ação
          </Button>
        )}
      </div>

      {/* Add New Action Form */}
      {isAdding && canEdit && (
        <Card className="border-2 border-dashed border-pm-terracotta/30 bg-pm-terracotta/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-pm-terracotta" />
              Nova Ação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-muted">Título *</label>
                <Input
                  value={newAction.title}
                  onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                  placeholder="Ex: Revisar carga de trabalho da equipe X"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-text-muted">Descrição</label>
                <Input
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  placeholder="Detalhes da ação..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">Responsável</label>
                <Input
                  value={newAction.responsible}
                  onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">Prazo</label>
                <Input
                  type="date"
                  value={newAction.deadline}
                  onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">Bloco de Risco</label>
                <Select
                  value={newAction.risk_block}
                  onValueChange={(v) => setNewAction({ ...newAction, risk_block: v as RiskBlock })}
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
              <div>
                <label className="text-sm font-medium text-text-muted">Comentários</label>
                <Input
                  value={newAction.comments}
                  onChange={(e) => setNewAction({ ...newAction, comments: e.target.value })}
                  placeholder="Observações..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewAction({ title: '', description: '', responsible: '', deadline: '', risk_block: '', comments: '' });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleAddAction} disabled={isPending}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plans Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pm-olive/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-pm-olive" />
              </div>
              <h3 className="font-display text-lg font-semibold text-text-heading mb-2">
                Nenhuma ação encontrada
              </h3>
              <p className="text-text-muted text-sm">
                {plans.length === 0
                  ? 'Comece criando sua primeira ação de melhoria'
                  : 'Ajuste os filtros para ver mais ações'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Ação</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Bloco</TableHead>
                  <TableHead>Status</TableHead>
                  {canEdit && <TableHead className="w-[100px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      {editingId === plan.id ? (
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      ) : (
                        <div>
                          <p className="font-medium">{plan.title}</p>
                          {plan.description && (
                            <p className="text-sm text-text-muted line-clamp-1">{plan.description}</p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === plan.id ? (
                        <Input
                          value={editForm.responsible || ''}
                          onChange={(e) => setEditForm({ ...editForm, responsible: e.target.value })}
                        />
                      ) : (
                        plan.responsible || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === plan.id ? (
                        <Input
                          type="date"
                          value={editForm.deadline || ''}
                          onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        />
                      ) : (
                        plan.deadline
                          ? new Date(plan.deadline).toLocaleDateString('pt-BR')
                          : '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.risk_block ? (
                        <Badge variant="outline" className="text-xs">
                          {RISK_BLOCK_LABELS[plan.risk_block]}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {canEdit ? (
                        <Select
                          value={plan.status}
                          onValueChange={(v) => handleUpdateStatus(plan.id, v as ActionPlanStatus)}
                        >
                          <SelectTrigger className={cn('w-36', STATUS_COLORS[plan.status])}>
                            <div className="flex items-center gap-2">
                              {STATUS_ICONS[plan.status]}
                              <span className="text-xs">{STATUS_LABELS[plan.status]}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  {STATUS_ICONS[value as ActionPlanStatus]}
                                  {label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={STATUS_COLORS[plan.status]}>
                          <span className="flex items-center gap-1">
                            {STATUS_ICONS[plan.status]}
                            {STATUS_LABELS[plan.status]}
                          </span>
                        </Badge>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        {editingId === plan.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(plan.id)}
                              disabled={isPending}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null);
                                setEditForm({});
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(plan)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(plan.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
