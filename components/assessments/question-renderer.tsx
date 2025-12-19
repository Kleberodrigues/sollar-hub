'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text?: string | null;
  question_text?: string | null;
  type?: string | null;
  question_type?: string | null;
  options?: string[] | null;
  is_required: boolean;
  scale_labels?: Record<string, string> | null;
  allow_skip?: boolean;
  min_value?: number | null;
  max_value?: number | null;
}

type ResponseValue = string | number | string[] | null;

interface QuestionRendererProps {
  question: Question;
  questionNumber: number;
  value: ResponseValue;
  onChange: (value: ResponseValue) => void;
  onSkip?: () => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  questionNumber,
  value,
  onChange,
  onSkip,
  disabled = false,
}: QuestionRendererProps) {
  // Get question text (support both old and new column names)
  const questionText = question.text || question.question_text || '';
  const questionType = question.type || question.question_type || 'text';

  // Parse scale labels if they exist
  const scaleLabels = question.scale_labels
    ? typeof question.scale_labels === 'string'
      ? JSON.parse(question.scale_labels)
      : question.scale_labels
    : null;

  // Parse options if they exist
  const options = question.options
    ? typeof question.options === 'string'
      ? JSON.parse(question.options)
      : Array.isArray(question.options)
      ? question.options
      : []
    : [];

  // Check if this is a Likert scale question
  const isLikertScale = questionType === 'likert_scale';
  const likertOptions = isLikertScale
    ? question.min_value != null && question.max_value != null
      ? Array.from(
          { length: question.max_value - question.min_value + 1 },
          (_, i) => question.min_value! + i
        )
      : [1, 2, 3, 4, 5] // Default 1-5 scale
    : [];

  // Check if this is an NPS scale (0-10 horizontal)
  const isNpsScale = questionType === 'nps_scale';
  const npsOptions = isNpsScale
    ? question.min_value != null && question.max_value != null
      ? Array.from(
          { length: question.max_value - question.min_value + 1 },
          (_, i) => question.min_value! + i
        )
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Default 0-10 scale
    : [];

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="mb-4">
        <Label className="text-base font-semibold text-text-heading">
          {questionNumber}. {questionText}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>

      {/* Text Input */}
      {questionType === 'text' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite sua resposta..."
          rows={4}
          required={question.is_required}
          disabled={disabled}
          className="w-full"
        />
      )}

      {/* Likert Scale */}
      {isLikertScale && (
        <div className="space-y-3">
          <div className="grid gap-2">
            {likertOptions.map((optionValue) => {
              // Só usa label customizado se existir e for diferente do próprio valor
              const customLabel = scaleLabels?.[optionValue.toString()];
              const hasCustomLabel = customLabel && customLabel !== optionValue.toString();

              return (
                <div
                  key={optionValue}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-pm-green-dark/50 ${
                    value === optionValue
                      ? 'border-pm-green-dark bg-pm-green-light/10'
                      : 'border-border-default'
                  }`}
                  onClick={() => !disabled && onChange(optionValue)}
                >
                  <input
                    type="radio"
                    id={`${question.id}-${optionValue}`}
                    name={question.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={() => onChange(optionValue)}
                    required={question.is_required && !question.allow_skip}
                    disabled={disabled}
                    className="w-4 h-4 text-pm-green-dark cursor-pointer"
                  />
                  <Label
                    htmlFor={`${question.id}-${optionValue}`}
                    className="ml-3 font-normal cursor-pointer flex-1"
                  >
                    <span className="font-medium text-pm-green-dark mr-2">
                      {optionValue}
                    </span>
                    {hasCustomLabel && customLabel}
                  </Label>
                </div>
              );
            })}
          </div>

          {/* "Prefiro não responder" button */}
          {question.allow_skip && onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={disabled}
              className="w-full mt-4 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Prefiro não responder
            </Button>
          )}
        </div>
      )}

      {/* NPS Scale (0-10 horizontal) */}
      {isNpsScale && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-1 sm:gap-2">
            {npsOptions.map((optionValue) => (
              <button
                key={optionValue}
                type="button"
                onClick={() => !disabled && onChange(optionValue)}
                disabled={disabled}
                className={`flex-1 min-w-[28px] h-10 sm:h-12 rounded-lg border-2 font-semibold text-sm sm:text-base transition-all ${
                  value === optionValue
                    ? 'border-pm-green-dark bg-pm-green-dark text-white'
                    : 'border-border-default bg-white hover:border-pm-green-dark/50 text-text-primary'
                }`}
              >
                {optionValue}
              </button>
            ))}
          </div>
          {/* Scale labels */}
          <div className="flex justify-between text-xs sm:text-sm text-text-muted px-1">
            <span>Totalmente insatisfeito</span>
            <span>Neutro</span>
            <span>Totalmente satisfeito</span>
          </div>

          {/* "Prefiro não responder" button */}
          {question.allow_skip && onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={disabled}
              className="w-full mt-4 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Prefiro não responder
            </Button>
          )}
        </div>
      )}

      {/* Multiple Choice */}
      {questionType === 'multiple_choice' && (
        <div className="space-y-2">
          {options.map((option: string, idx: number) => (
            <div
              key={idx}
              className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-pm-green-dark/50 ${
                value === option
                  ? 'border-pm-green-dark bg-pm-green-light/10'
                  : 'border-border-default'
              }`}
              onClick={() => !disabled && onChange(option)}
            >
              <input
                type="radio"
                id={`${question.id}-${idx}`}
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                required={question.is_required}
                disabled={disabled}
                className="w-4 h-4 text-pm-green-dark cursor-pointer"
              />
              <Label
                htmlFor={`${question.id}-${idx}`}
                className="ml-3 font-normal cursor-pointer flex-1"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Yes/No */}
      {questionType === 'yes_no' && (
        <div className="space-y-2">
          {['Sim', 'Não'].map((option) => (
            <div
              key={option}
              className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-pm-green-dark/50 ${
                value === option
                  ? 'border-pm-green-dark bg-pm-green-light/10'
                  : 'border-border-default'
              }`}
              onClick={() => !disabled && onChange(option)}
            >
              <input
                type="radio"
                id={`${question.id}-${option}`}
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                required={question.is_required}
                disabled={disabled}
                className="w-4 h-4 text-pm-green-dark cursor-pointer"
              />
              <Label
                htmlFor={`${question.id}-${option}`}
                className="ml-3 font-normal cursor-pointer flex-1"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Help text for "Prefiro não responder" */}
      {question.allow_skip && (
        <p className="text-xs text-text-muted mt-2 italic">
          💡 Você pode pular esta pergunta se não se sentir confortável em responder.
        </p>
      )}
    </div>
  );
}
