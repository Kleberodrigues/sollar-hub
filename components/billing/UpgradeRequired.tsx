/**
 * Upgrade Required Component
 * Shows a lock overlay when a feature requires a higher plan
 */

'use client';

import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type PlanType, PLANS } from '@/lib/stripe/config';
import Link from 'next/link';

interface UpgradeRequiredProps {
  /** Feature that requires upgrade */
  feature: string;
  /** Plan required to access this feature */
  requiredPlan: PlanType;
  /** Current user's plan */
  currentPlan?: PlanType | null;
  /** Custom description */
  description?: string;
  /** Variant: overlay (covers content) or card (standalone) */
  variant?: 'overlay' | 'card' | 'inline' | 'badge';
  /** Children to render behind overlay (for overlay variant) */
  children?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function UpgradeRequired({
  feature,
  requiredPlan,
  currentPlan,
  description,
  variant = 'card',
  children,
  className,
}: UpgradeRequiredProps) {
  const planConfig = PLANS[requiredPlan];
  const currentPlanConfig = currentPlan ? PLANS[currentPlan] : null;

  const defaultDescription = `${feature} está disponível no plano ${planConfig.name} ou superior.`;

  if (variant === 'badge') {
    return (
      <Badge variant="outline" className={cn('gap-1 text-xs', className)}>
        <Lock className="h-3 w-3" />
        {planConfig.name}
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Lock className="h-4 w-4" />
        <span>{description || defaultDescription}</span>
        <Link href="/dashboard/configuracoes/billing">
          <Button variant="link" size="sm" className="h-auto p-0 text-primary">
            Fazer upgrade
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={cn('relative', className)}>
        {/* Content behind overlay (blurred) */}
        <div className="pointer-events-none select-none blur-sm opacity-50">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px] rounded-lg">
          <div className="text-center space-y-4 max-w-md p-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{feature}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {description || defaultDescription}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {currentPlanConfig && (
                <Badge variant="outline" className="text-xs">
                  Atual: {currentPlanConfig.name}
                </Badge>
              )}
              <Badge className="bg-primary text-xs">
                Requer: {planConfig.name}
              </Badge>
            </div>
            <Link href="/dashboard/configuracoes/billing">
              <Button className="gap-2">
                Fazer Upgrade
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{feature}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {description || defaultDescription}
        </p>
        <div className="flex items-center gap-2 mt-4">
          {currentPlanConfig && (
            <Badge variant="outline" className="text-xs">
              Atual: {currentPlanConfig.name}
            </Badge>
          )}
          <Badge className="bg-primary text-xs">
            Requer: {planConfig.name}
          </Badge>
        </div>
        <Link href="/dashboard/configuracoes/billing" className="mt-6">
          <Button className="gap-2">
            Ver Planos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Feature Gate Component
 * Conditionally renders children or upgrade prompt based on plan
 */
interface FeatureGateProps {
  /** Whether user can access this feature */
  hasAccess: boolean;
  /** Feature name for upgrade prompt */
  feature: string;
  /** Required plan */
  requiredPlan: PlanType;
  /** Current plan */
  currentPlan?: PlanType | null;
  /** Custom description */
  description?: string;
  /** Variant for upgrade prompt */
  variant?: 'overlay' | 'card' | 'inline';
  /** Children to render if has access */
  children: React.ReactNode;
  /** Fallback if no access (defaults to UpgradeRequired) */
  fallback?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function FeatureGate({
  hasAccess,
  feature,
  requiredPlan,
  currentPlan,
  description,
  variant = 'card',
  children,
  fallback,
  className,
}: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradeRequired
      feature={feature}
      requiredPlan={requiredPlan}
      currentPlan={currentPlan}
      description={description}
      variant={variant}
      className={className}
    >
      {variant === 'overlay' ? children : undefined}
    </UpgradeRequired>
  );
}
