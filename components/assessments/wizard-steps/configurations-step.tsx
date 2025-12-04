'use client';

/**
 * Step 4: Configurações
 *
 * Datas de início/término e configuração de lembretes
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WizardData } from '../assessment-wizard';
import { Calendar, Bell } from 'lucide-react';

interface ConfigurationsStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
}

export function ConfigurationsStep({
  data,
  onUpdate,
}: ConfigurationsStepProps) {
  const today = new Date().toISOString().split('T')[0];

  // Calcular duração do assessment
  const calculateDuration = () => {
    if (!data.startDate || !data.endDate) return null;

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const duration = calculateDuration();

  const getReminderLabel = (frequency: 'daily' | 'weekly' | 'none') => {
    const labels = {
      daily: 'Diariamente',
      weekly: 'Semanalmente',
      none: 'Sem lembretes',
    };
    return labels[frequency];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-heading mb-2">
          Configurações
        </h2>
        <p className="text-sm text-text-secondary">
          Defina quando o assessment estará ativo
        </p>
      </div>

      <div className="space-y-4">
        {/* Data de Início */}
        <div className="space-y-2">
          <Label htmlFor="start-date">
            Data de Início <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              id="start-date"
              type="date"
              value={data.startDate}
              min={today}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-text-muted">
            Participantes poderão responder a partir desta data
          </p>
        </div>

        {/* Data de Término */}
        <div className="space-y-2">
          <Label htmlFor="end-date">Data de Término (opcional)</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              id="end-date"
              type="date"
              value={data.endDate}
              min={data.startDate || today}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-text-muted">
            Se não definida, o assessment ficará ativo indefinidamente
          </p>
        </div>

        {/* Duração Preview */}
        {duration !== null && duration > 0 && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Duração:</strong>{' '}
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
              </p>
            </div>
          </div>
        )}

        {/* Frequência de Lembretes */}
        <div className="space-y-2">
          <Label htmlFor="reminder-frequency">
            Frequência de Lembretes
          </Label>
          <div className="relative">
            <Bell className="absolute left-3 top-3 h-4 w-4 text-text-muted z-10" />
            <Select
              value={data.reminderFrequency}
              onValueChange={(value: 'daily' | 'weekly' | 'none') =>
                onUpdate({ reminderFrequency: value })
              }
            >
              <SelectTrigger id="reminder-frequency" className="pl-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Sem Lembretes</span>
                    <span className="text-xs text-text-muted">
                      Participantes não receberão notificações
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="daily">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Diariamente</span>
                    <span className="text-xs text-text-muted">
                      Lembrete enviado todos os dias às 9h
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Semanalmente</span>
                    <span className="text-xs text-text-muted">
                      Lembrete enviado toda segunda-feira às 9h
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-text-muted">
            Lembretes serão enviados apenas para quem ainda não respondeu
          </p>
        </div>

        {/* Summary Card */}
        <div className="rounded-lg border border-border p-4 bg-background-secondary space-y-3">
          <h3 className="font-semibold text-text-heading text-sm">
            Resumo das Configurações
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Início:</span>
              <span className="text-text-heading font-medium">
                {data.startDate
                  ? new Date(data.startDate + 'T00:00:00').toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }
                    )
                  : 'Não definida'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Término:</span>
              <span className="text-text-heading font-medium">
                {data.endDate
                  ? new Date(data.endDate + 'T00:00:00').toLocaleDateString(
                      'pt-BR',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }
                    )
                  : 'Indefinida'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Lembretes:</span>
              <span className="text-text-heading font-medium">
                {getReminderLabel(data.reminderFrequency)}
              </span>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>💡 Dica:</strong> Recomendamos um período de 2 a 4 semanas
            para dar tempo suficiente para todos responderem, especialmente em
            organizações maiores.
          </p>
        </div>
      </div>
    </div>
  );
}
