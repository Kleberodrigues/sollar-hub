'use client';

/**
 * Step 1: Informações Básicas
 *
 * Título, descrição, tipo e configuração de anonimato
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { WizardData } from '../assessment-wizard';

interface BasicInfoStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-heading mb-2">
          Informações Básicas
        </h2>
        <p className="text-sm text-text-secondary">
          Defina o título, tipo e configurações iniciais do assessment
        </p>
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Título do Assessment <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Ex: Avaliação de Riscos Psicossociais - Janeiro 2025"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <p className="text-xs text-text-muted">
            Escolha um nome descritivo que identifique este assessment
          </p>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Descreva o objetivo e contexto deste assessment..."
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={4}
          />
          <p className="text-xs text-text-muted">
            Esta descrição ajudará a contextualizar o assessment para os participantes
          </p>
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label htmlFor="type">
            Tipo de Assessment <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.type}
            onValueChange={(value: 'nr1' | 'pulse' | 'custom') =>
              onUpdate({ type: value })
            }
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nr1">
                <div className="flex flex-col items-start">
                  <span className="font-medium">NR-1 Completo</span>
                  <span className="text-xs text-text-muted">
                    Questionário padrão baseado na NR-1 (40 questões)
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="pulse">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Pulse Survey</span>
                  <span className="text-xs text-text-muted">
                    Questionário rápido (5-10 questões)
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="custom">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Personalizado</span>
                  <span className="text-xs text-text-muted">
                    Selecionar questões manualmente
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Anonimato */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background-secondary">
          <div className="space-y-0.5">
            <Label htmlFor="anonymous" className="text-base">
              Respostas Anônimas
            </Label>
            <p className="text-sm text-text-muted">
              Recomendado: participantes se sentem mais à vontade para responder
              honestamente
            </p>
          </div>
          <Switch
            id="anonymous"
            checked={data.isAnonymous}
            onCheckedChange={(checked) => onUpdate({ isAnonymous: checked })}
          />
        </div>

        {/* Info box */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Dica:</strong> Assessments anônimos geralmente obtêm
            respostas mais sinceras e precisas, especialmente em temas
            sensíveis como riscos psicossociais.
          </p>
        </div>
      </div>
    </div>
  );
}
