'use client';

/**
 * Stepper Component
 *
 * Componente de navegação por passos (wizard) reutilizável
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  allowSkip?: boolean;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  allowSkip = false,
}: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = allowSkip || isCompleted;

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex-1',
                index !== steps.length - 1 && 'pr-8 sm:pr-20'
              )}
            >
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'h-full w-full',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                  />
                </div>
              )}

              {/* Step Circle and Content */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'group relative flex flex-col items-center',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                {/* Circle */}
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      'border-primary bg-background text-primary',
                    !isCompleted &&
                      !isCurrent &&
                      'border-border bg-background text-text-muted',
                    isClickable && 'group-hover:border-primary'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </span>

                {/* Text */}
                <span className="mt-2 text-center">
                  <span
                    className={cn(
                      'text-sm font-medium block',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-text-heading',
                      !isCompleted && !isCurrent && 'text-text-muted'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-text-muted block mt-0.5">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Mobile-friendly stepper (simplified)
export function MobileStepper({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: number;
}) {
  const current = steps.find((s) => s.id === currentStep);
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="w-full bg-border rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step info */}
      <div className="text-sm text-text-secondary text-center">
        Passo {currentStep} de {steps.length}: {current?.title}
      </div>
    </div>
  );
}
