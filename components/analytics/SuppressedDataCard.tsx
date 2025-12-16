'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SuppressedDataCardProps {
  /** Numero atual de respostas/funcionarios */
  currentCount: number;
  /** Minimo necessario para exibir dados */
  minimumRequired: number;
  /** Titulo do card (opcional) */
  title?: string;
  /** Descricao personalizada (opcional) */
  description?: string;
  /** Variante visual */
  variant?: 'default' | 'compact' | 'inline';
  /** Tipo de contagem (respostas ou funcionarios) */
  countType?: 'responses' | 'employees';
  /** Classes CSS adicionais */
  className?: string;
}

export function SuppressedDataCard({
  currentCount,
  minimumRequired,
  title = 'Dados Protegidos',
  description,
  variant = 'default',
  countType = 'responses',
  className,
}: SuppressedDataCardProps) {
  const remaining = Math.max(0, minimumRequired - currentCount);
  const percentComplete = Math.min(100, (currentCount / minimumRequired) * 100);

  const countLabel = countType === 'responses' ? 'respostas' : 'funcionarios';
  const defaultDescription = `Para garantir o anonimato dos respondentes, esta analise requer no minimo ${minimumRequired} ${countLabel}.`;

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm",
        className
      )}>
        <Lock className="w-4 h-4 flex-shrink-0" />
        <span>
          {currentCount} de {minimumRequired} {countLabel} ({remaining} {remaining === 1 ? 'falta' : 'faltam'})
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-900 text-sm">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={percentComplete} className="h-1.5 flex-1 bg-amber-200" />
              <span className="text-xs text-amber-700 whitespace-nowrap">
                {currentCount}/{minimumRequired}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Card className={cn(
      "border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
      className
    )}>
      <CardContent className="py-8 px-6">
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-display font-semibold text-amber-900">
            {title}
          </h3>

          {/* Description */}
          <p className="text-amber-800 max-w-md mx-auto text-sm">
            {description || defaultDescription}
          </p>

          {/* Progress Section */}
          <div className="max-w-xs mx-auto space-y-2 pt-2">
            <Progress
              value={percentComplete}
              className="h-2 bg-amber-200"
            />

            <div className="flex justify-between text-sm">
              <span className="text-amber-700">
                <span className="font-semibold">{currentCount}</span> {countLabel} atuais
              </span>
              <span className="text-amber-600">
                Faltam <span className="font-semibold">{remaining}</span>
              </span>
            </div>
          </div>

          {/* Additional info */}
          <div className="flex items-center justify-center gap-2 text-xs text-amber-600 pt-2">
            <Lock className="w-3 h-3" />
            <span>Protecao de anonimato ativa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Badge simples para indicar dados suprimidos
 */
export function SuppressedBadge({
  className
}: {
  className?: string
}) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium",
      className
    )}>
      <Lock className="w-3 h-3" />
      <span>Protegido</span>
    </div>
  );
}

/**
 * Tooltip content para explicar supressao
 */
export function SuppressionTooltipContent({
  currentCount,
  minimumRequired,
  countType = 'responses',
}: {
  currentCount: number;
  minimumRequired: number;
  countType?: 'responses' | 'employees';
}) {
  const remaining = Math.max(0, minimumRequired - currentCount);
  const countLabel = countType === 'responses' ? 'respostas' : 'funcionarios';

  return (
    <div className="space-y-1 text-xs">
      <p className="font-medium">Dados protegidos por anonimato</p>
      <p className="text-muted-foreground">
        Necessario: {minimumRequired} {countLabel}
      </p>
      <p className="text-muted-foreground">
        Atual: {currentCount} | Faltam: {remaining}
      </p>
    </div>
  );
}
