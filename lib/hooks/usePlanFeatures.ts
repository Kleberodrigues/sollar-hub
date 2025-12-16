/**
 * Hook para acessar features do plano no cliente
 * Busca as configurações do plano da organização atual
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PLANS, type PlanType, type PlanConfig } from '@/lib/stripe/config';

export type ExportFormat = 'csv' | 'pdf' | 'xlsx' | 'api';

export interface ClientPlanFeatures {
  plan: PlanType | null;
  planName: string;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  // Feature checks
  canExport: (format: ExportFormat) => boolean;
  canImport: () => boolean;
  hasApiAccess: () => boolean;
  hasComparativeAnalysis: () => boolean;
  hasSystemicAnalysis: () => boolean;
  hasElevatedAlerts: () => boolean;
  hasCustomBranding: () => boolean;
  hasPrioritySupport: () => boolean;
  hasDedicatedSupport: () => boolean;
  // Limits
  limits: PlanConfig['limits'] | null;
  // Helpers
  getExportFormats: () => ExportFormat[];
  getRequiredPlanFor: (feature: FeatureKey) => PlanType;
  canAccessFeature: (feature: FeatureKey) => boolean;
}

export type FeatureKey =
  | 'comparativeAnalysis'
  | 'systemicAnalysis'
  | 'elevatedAlerts'
  | 'apiAccess'
  | 'customBranding'
  | 'prioritySupport'
  | 'dedicatedSupport'
  | 'xlsxExport'
  | 'import';

// Feature requirements by plan
const FEATURE_REQUIREMENTS: Record<FeatureKey, PlanType> = {
  comparativeAnalysis: 'intermediario',
  systemicAnalysis: 'avancado',
  elevatedAlerts: 'avancado',
  apiAccess: 'avancado',
  customBranding: 'intermediario',
  prioritySupport: 'intermediario',
  dedicatedSupport: 'avancado',
  xlsxExport: 'avancado',
  import: 'intermediario',
};

// Plan hierarchy for comparison
const PLAN_HIERARCHY: Record<PlanType, number> = {
  base: 1,
  intermediario: 2,
  avancado: 3,
};

/**
 * Hook para acessar features do plano no cliente
 * @param initialPlan - Plano inicial (pode vir do servidor)
 */
export function usePlanFeatures(initialPlan?: PlanType | null): ClientPlanFeatures {
  const [plan, setPlan] = useState<PlanType | null>(initialPlan ?? null);
  const [isLoading, setIsLoading] = useState(!initialPlan);

  // Fetch plan from API if not provided
  useEffect(() => {
    if (initialPlan !== undefined) {
      setPlan(initialPlan);
      setIsLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/user/plan');
        if (response.ok) {
          const data = await response.json();
          setPlan(data.plan);
        }
      } catch (error) {
        console.error('[usePlanFeatures] Error fetching plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [initialPlan]);

  const config = plan ? PLANS[plan] : null;
  const hasActiveSubscription = plan !== null && config !== null;

  const canExport = useCallback((format: ExportFormat): boolean => {
    if (!config) return false;
    return config.capabilities.exports.includes(format);
  }, [config]);

  const canImport = useCallback((): boolean => {
    return plan === 'intermediario' || plan === 'avancado';
  }, [plan]);

  const hasApiAccess = useCallback((): boolean => {
    return config?.capabilities.apiAccess ?? false;
  }, [config]);

  const hasComparativeAnalysis = useCallback((): boolean => {
    return config?.capabilities.comparativeAnalysis ?? false;
  }, [config]);

  const hasSystemicAnalysis = useCallback((): boolean => {
    return config?.capabilities.systemicAnalysis ?? false;
  }, [config]);

  const hasElevatedAlerts = useCallback((): boolean => {
    return config?.capabilities.elevatedAlerts ?? false;
  }, [config]);

  const hasCustomBranding = useCallback((): boolean => {
    return config?.capabilities.customBranding ?? false;
  }, [config]);

  const hasPrioritySupport = useCallback((): boolean => {
    return config?.capabilities.prioritySupport ?? false;
  }, [config]);

  const hasDedicatedSupport = useCallback((): boolean => {
    return config?.capabilities.dedicatedSupport ?? false;
  }, [config]);

  const getExportFormats = useCallback((): ExportFormat[] => {
    return config?.capabilities.exports ?? [];
  }, [config]);

  const getRequiredPlanFor = useCallback((feature: FeatureKey): PlanType => {
    return FEATURE_REQUIREMENTS[feature];
  }, []);

  const canAccessFeature = useCallback((feature: FeatureKey): boolean => {
    if (!plan) return false;
    const requiredPlan = FEATURE_REQUIREMENTS[feature];
    return PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[requiredPlan];
  }, [plan]);

  return {
    plan,
    planName: config?.name ?? 'Sem plano',
    isLoading,
    hasActiveSubscription,
    canExport,
    canImport,
    hasApiAccess,
    hasComparativeAnalysis,
    hasSystemicAnalysis,
    hasElevatedAlerts,
    hasCustomBranding,
    hasPrioritySupport,
    hasDedicatedSupport,
    limits: config?.limits ?? null,
    getExportFormats,
    getRequiredPlanFor,
    canAccessFeature,
  };
}

/**
 * Get feature info for upgrade prompts
 */
export function getFeatureUpgradeInfo(feature: FeatureKey): {
  requiredPlan: PlanType;
  planName: string;
  message: string;
} {
  const requiredPlan = FEATURE_REQUIREMENTS[feature];
  const planConfig = PLANS[requiredPlan];

  const messages: Record<FeatureKey, string> = {
    comparativeAnalysis: 'Análise comparativa entre ciclos requer plano Intermediário ou superior.',
    systemicAnalysis: 'Análise sistêmica dos riscos psicossociais requer plano Avançado.',
    elevatedAlerts: 'Alertas de atenção elevada requerem plano Avançado.',
    apiAccess: 'Acesso à API requer plano Avançado.',
    customBranding: 'Branding personalizado requer plano Intermediário ou superior.',
    prioritySupport: 'Suporte prioritário requer plano Intermediário ou superior.',
    dedicatedSupport: 'Suporte dedicado requer plano Avançado.',
    xlsxExport: 'Exportação XLSX requer plano Avançado.',
    import: 'Importação de dados requer plano Intermediário ou superior.',
  };

  return {
    requiredPlan,
    planName: planConfig.name,
    message: messages[feature],
  };
}
