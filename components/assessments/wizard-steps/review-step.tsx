'use client';

/**
 * Step 5: Revisão
 *
 * Revisão final antes de ativar o assessment
 */

import { Badge } from '@/components/ui/badge';
import { WizardData } from '../assessment-wizard';
import {
  FileText,
  Users,
  Calendar,
  Bell,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  text: string;
}

interface ReviewStepProps {
  data: WizardData;
  questionnaires: Array<{ id: string; title: string; questions?: QuestionItem[] }>;
  departments: Array<{ id: string; name: string }>;
}

export function ReviewStep({
  data,
  questionnaires,
  departments,
}: ReviewStepProps) {
  const selectedQuestionnaire = questionnaires.find(
    (q) => q.id === data.questionnaireId
  );

  const selectedDepartments = data.allOrganization
    ? departments
    : departments.filter((d) => data.departmentIds.includes(d.id));

  const getTypeLabel = (type: 'nr1' | 'pulse' | 'custom') => {
    const labels = {
      nr1: 'NR-1 Completo',
      pulse: 'Pesquisa de Clima',
      custom: 'Personalizado',
    };
    return labels[type];
  };

  const getReminderLabel = (frequency: 'daily' | 'weekly' | 'none') => {
    const labels = {
      daily: 'Diariamente',
      weekly: 'Semanalmente',
      none: 'Sem lembretes',
    };
    return labels[frequency];
  };

  const calculateDuration = () => {
    if (!data.startDate || !data.endDate) return null;

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-heading mb-2">
          Revisão Final
        </h2>
        <p className="text-sm text-text-secondary">
          Confira todos os detalhes antes de ativar o assessment
        </p>
      </div>

      <div className="space-y-4">
        {/* Informações Básicas */}
        <div className="rounded-lg border border-border p-4 bg-background-secondary space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-text-heading">
              Informações Básicas
            </h3>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-text-muted">Título:</span>
              <p className="text-text-heading font-medium mt-0.5">
                {data.title}
              </p>
            </div>

            {data.description && (
              <div>
                <span className="text-text-muted">Descrição:</span>
                <p className="text-text-heading mt-0.5">{data.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline">{getTypeLabel(data.type)}</Badge>
              {data.isAnonymous && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Anônimo
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Público-Alvo */}
        <div className="rounded-lg border border-border p-4 bg-background-secondary space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-text-heading">Público-Alvo</h3>
          </div>

          <div className="space-y-2 text-sm">
            {data.allOrganization ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Toda a Organização</Badge>
                <span className="text-text-muted">
                  {departments.length} departamento
                  {departments.length !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-text-muted mb-2">
                  {selectedDepartments.length} departamento
                  {selectedDepartments.length !== 1 ? 's' : ''} selecionado
                  {selectedDepartments.length !== 1 ? 's' : ''}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedDepartments.map((dept) => (
                    <Badge key={dept.id} variant="outline">
                      {dept.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questionário */}
        <div className="rounded-lg border border-border p-4 bg-background-secondary space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-text-heading">Questionário</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <p className="text-text-heading font-medium">
                {selectedQuestionnaire?.title || 'Não selecionado'}
              </p>
              <p className="text-text-muted text-xs mt-1">
                {data.selectedQuestionIds.length} questão
                {data.selectedQuestionIds.length !== 1 ? 'ões' : ''}{' '}
                selecionada
                {data.selectedQuestionIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="rounded-lg border border-border p-4 bg-background-secondary space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-text-heading">Configurações</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Data de Início:</span>
              <span className="text-text-heading font-medium">
                {data.startDate
                  ? new Date(data.startDate + 'T00:00:00').toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }
                    )
                  : 'Não definida'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-muted">Data de Término:</span>
              <span className="text-text-heading font-medium">
                {data.endDate
                  ? new Date(data.endDate + 'T00:00:00').toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }
                    )
                  : 'Indefinida'}
              </span>
            </div>

            {duration !== null && duration > 0 && (
              <div className="flex justify-between pt-1 border-t border-border">
                <span className="text-text-muted">Duração:</span>
                <span className="text-text-heading font-medium">
                  {duration === 1
                    ? '1 dia'
                    : duration < 7
                    ? `${duration} dias`
                    : duration === 7
                    ? '1 semana'
                    : duration < 30
                    ? `${Math.floor(duration / 7)} semanas`
                    : `${Math.floor(duration / 30)} mês${
                        Math.floor(duration / 30) > 1 ? 'es' : ''
                      }`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Bell className="h-4 w-4 text-text-muted" />
              <span className="text-text-muted">Lembretes:</span>
              <Badge variant="default">
                {getReminderLabel(data.reminderFrequency)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info final */}
        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                Tudo pronto para ativar!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Ao clicar em &quot;Ativar Assessment&quot;, os participantes receberão
                acesso via n8n e poderão começar a responder.
                {data.isAnonymous &&
                  ' As respostas serão completamente anônimas.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
