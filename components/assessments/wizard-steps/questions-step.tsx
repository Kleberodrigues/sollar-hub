'use client';

/**
 * Step 3: Questões
 *
 * Seleção de questionário e preview de questões
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WizardData } from '../assessment-wizard';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2 } from 'lucide-react';

interface QuestionItem {
  id: string;
  text: string;
  type: string;
  category: string;
}

interface QuestionsStepProps {
  data: WizardData;
  questionnaires: Array<{ id: string; title: string; questions?: QuestionItem[] }>;
  onUpdate: (data: Partial<WizardData>) => void;
}

export function QuestionsStep({
  data,
  questionnaires,
  onUpdate,
}: QuestionsStepProps) {
  const selectedQuestionnaire = questionnaires.find(
    (q) => q.id === data.questionnaireId
  );

  const questions = selectedQuestionnaire?.questions || [];
  const selectedCount = data.selectedQuestionIds.length;
  const totalCount = questions.length;

  const handleQuestionnaireChange = (questionnaireId: string) => {
    // Ao mudar questionário, selecionar todas as questões automaticamente
    const questionnaire = questionnaires.find((q) => q.id === questionnaireId);
    const allQuestionIds =
      questionnaire?.questions?.map((q) => q.id) || [];

    onUpdate({
      questionnaireId,
      selectedQuestionIds: allQuestionIds,
    });
  };

  const getCategoryBadge = (category: string) => {
    const categoryLabels: Record<string, string> = {
      demands: 'Demandas',
      control: 'Controle',
      support: 'Apoio',
      relationships: 'Relacionamentos',
      role: 'Papel',
      change: 'Mudança',
    };

    return categoryLabels[category] || category;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-heading mb-2">
          Questionário
        </h2>
        <p className="text-sm text-text-secondary">
          Selecione o questionário para este assessment
        </p>
      </div>

      <div className="space-y-4">
        {/* Seleção de Questionário */}
        <div className="space-y-2">
          <Label htmlFor="questionnaire">
            Questionário <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.questionnaireId}
            onValueChange={handleQuestionnaireChange}
          >
            <SelectTrigger id="questionnaire">
              <SelectValue placeholder="Selecione um questionário" />
            </SelectTrigger>
            <SelectContent>
              {questionnaires.length === 0 ? (
                <div className="p-4 text-sm text-text-muted text-center">
                  Nenhum questionário disponível
                </div>
              ) : (
                questionnaires.map((questionnaire) => (
                  <SelectItem key={questionnaire.id} value={questionnaire.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{questionnaire.title}</span>
                      <span className="text-xs text-text-muted">
                        {questionnaire.questions?.length || 0} questões
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Preview de Questões */}
        {data.questionnaireId && (
          <>
            {/* Summary Card */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedQuestionnaire?.title}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    {selectedCount} de {totalCount} questões selecionadas
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

            {/* Lista de Questões */}
            {questions.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-base">
                  Preview das Questões ({totalCount})
                </Label>
                <div className="max-h-96 overflow-y-auto space-y-2 rounded-lg border border-border p-4">
                  {questions.map((question: QuestionItem, index: number) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-heading font-medium mb-1">
                          {question.text}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryBadge(question.category)}
                          </Badge>
                          {question.type === 'likert_scale' && (
                            <Badge variant="default" className="text-xs">
                              Escala Likert
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-8 bg-background-secondary text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-text-muted" />
                <p className="text-sm text-text-secondary mb-1">
                  Este questionário não possui questões
                </p>
                <p className="text-xs text-text-muted">
                  Selecione outro questionário ou configure questões primeiro
                </p>
              </div>
            )}
          </>
        )}

        {/* Info box */}
        {!data.questionnaireId && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>💡 Dica:</strong> O questionário NR-1 Completo já está
              configurado com as 40 questões recomendadas pela norma
              regulamentadora.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
