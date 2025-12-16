'use client';

/**
 * Step 2: Público-Alvo
 *
 * Seleção de departamentos e configuração de audiência
 */

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { WizardData } from '../assessment-wizard';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface AudienceStepProps {
  data: WizardData;
  departments: Array<{ id: string; name: string }>;
  onUpdate: (data: Partial<WizardData>) => void;
}

export function AudienceStep({ data, departments, onUpdate }: AudienceStepProps) {
  const handleDepartmentToggle = (departmentId: string, checked: boolean) => {
    const currentIds = data.departmentIds;
    const newIds = checked
      ? [...currentIds, departmentId]
      : currentIds.filter((id) => id !== departmentId);

    onUpdate({ departmentIds: newIds });
  };

  const handleAllOrganizationToggle = (checked: boolean) => {
    onUpdate({
      allOrganization: checked,
      departmentIds: checked ? [] : data.departmentIds,
    });
  };

  const selectedCount = data.allOrganization
    ? departments.length
    : data.departmentIds.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-heading mb-2">
          Público-Alvo
        </h2>
        <p className="text-sm text-text-secondary">
          Selecione quem participará deste assessment
        </p>
      </div>

      <div className="space-y-4">
        {/* Toda Organização Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background-secondary">
          <div className="space-y-0.5">
            <Label htmlFor="all-organization" className="text-base">
              Toda a Organização
            </Label>
            <p className="text-sm text-text-muted">
              Incluir todos os departamentos automaticamente
            </p>
          </div>
          <Switch
            id="all-organization"
            checked={data.allOrganization}
            onCheckedChange={handleAllOrganizationToggle}
          />
        </div>

        {/* Seleção Individual de Departamentos */}
        {!data.allOrganization && (
          <div className="space-y-3">
            <Label className="text-base">
              Selecionar Departamentos{' '}
              <span className="text-destructive">*</span>
            </Label>

            {departments.length === 0 ? (
              <div className="rounded-lg border border-border p-8 bg-background-secondary text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-text-muted" />
                <p className="text-sm text-text-secondary mb-1">
                  Nenhum departamento encontrado
                </p>
                <p className="text-xs text-text-muted">
                  Configure departamentos antes de criar assessments
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {departments.map((dept) => {
                  const isSelected = data.departmentIds.includes(dept.id);

                  return (
                    <div
                      key={dept.id}
                      className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-background-secondary transition-colors"
                    >
                      <Checkbox
                        id={`dept-${dept.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleDepartmentToggle(dept.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`dept-${dept.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium text-text-heading"
                      >
                        {dept.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Preview de Participantes */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Departamentos Selecionados
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                {data.allOrganization
                  ? 'Todos os departamentos da organização'
                  : selectedCount === 0
                  ? 'Nenhum departamento selecionado'
                  : selectedCount === 1
                  ? '1 departamento selecionado'
                  : `${selectedCount} departamentos selecionados`}
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700"
            >
              {selectedCount}
            </Badge>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>💡 Dica:</strong> Você pode ajustar o público-alvo mesmo
            após ativar o assessment. Novos participantes receberão tokens de
            acesso automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
