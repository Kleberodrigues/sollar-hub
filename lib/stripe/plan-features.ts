/**
 * Plan Features - Server-side utilities for checking plan capabilities
 * Updated: 2025-12-14 - New plan structure (Base/Intermediario/Avancado)
 */

import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanType, type PlanConfig } from "./config";

export type ExportFormat = "csv" | "pdf" | "xlsx" | "api";

export interface PlanFeatures {
  plan: PlanType | null;
  config: PlanConfig | null;
  canExport: (format: ExportFormat) => boolean;
  canImport: () => boolean;
  hasApiAccess: () => boolean;
  hasComparativeAnalysis: () => boolean;
  hasSystemicAnalysis: () => boolean;
  hasElevatedAlerts: () => boolean;
  getExportFormats: () => ExportFormat[];
  limits: PlanConfig["limits"] | null;
  hasActiveSubscription: boolean;
}

/**
 * Get organization ID from user's profile
 */
async function getOrganizationIdFromUser(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single() as any);

  return profile?.organization_id || null;
}

/**
 * Get plan from organization's subscription
 * Returns null if no active subscription (no free tier anymore)
 */
async function getPlanFromOrganization(organizationId: string): Promise<PlanType | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription } = await (supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("organization_id", organizationId)
    .single() as any);

  // Only return the plan if subscription is active
  if (subscription?.status === "active" && subscription?.plan) {
    return subscription.plan as PlanType;
  }

  // No active subscription - no access (no free tier)
  return null;
}

/**
 * Get plan features for the current user's organization
 * Use this in Server Actions and Server Components
 */
export async function getServerPlanFeatures(): Promise<PlanFeatures> {
  const organizationId = await getOrganizationIdFromUser();

  if (!organizationId) {
    // Return no features if no organization
    return createPlanFeatures(null);
  }

  const plan = await getPlanFromOrganization(organizationId);
  return createPlanFeatures(plan);
}

/**
 * Get plan features for a specific organization
 * Use this when you already have the organization ID
 */
export async function getOrganizationPlanFeatures(
  organizationId: string
): Promise<PlanFeatures> {
  const plan = await getPlanFromOrganization(organizationId);
  return createPlanFeatures(plan);
}

/**
 * Create plan features object from plan type
 * Returns restricted features if plan is null (no subscription)
 */
export function createPlanFeatures(plan: PlanType | null): PlanFeatures {
  const config = plan ? PLANS[plan] : null;
  const hasActiveSubscription = plan !== null && config !== null;

  return {
    plan,
    config,
    hasActiveSubscription,
    canExport: (format: ExportFormat) => {
      if (!config) return false;
      return config.capabilities.exports.includes(format);
    },
    canImport: () => {
      // Import requires Intermediario or Avancado
      return plan === "intermediario" || plan === "avancado";
    },
    hasApiAccess: () => {
      if (!config) return false;
      return config.capabilities.apiAccess;
    },
    hasComparativeAnalysis: () => {
      if (!config) return false;
      return config.capabilities.comparativeAnalysis;
    },
    hasSystemicAnalysis: () => {
      if (!config) return false;
      return config.capabilities.systemicAnalysis;
    },
    hasElevatedAlerts: () => {
      if (!config) return false;
      return config.capabilities.elevatedAlerts;
    },
    getExportFormats: () => {
      if (!config) return [];
      return config.capabilities.exports;
    },
    limits: config?.limits || null,
  };
}

/**
 * Get plan display info for upgrade prompts
 */
export function getUpgradeInfo(format: ExportFormat): {
  requiredPlan: PlanType;
  message: string;
} {
  const formatRequirements: Record<ExportFormat, { plan: PlanType; message: string }> = {
    csv: {
      plan: "base",
      message: "CSV esta disponivel em todos os planos.",
    },
    pdf: {
      plan: "base",
      message: "PDF esta disponivel em todos os planos.",
    },
    xlsx: {
      plan: "avancado",
      message: "Exportar XLSX requer plano Avancado.",
    },
    api: {
      plan: "avancado",
      message: "Acesso a API requer plano Avancado.",
    },
  };

  return {
    requiredPlan: formatRequirements[format].plan,
    message: formatRequirements[format].message,
  };
}

/**
 * Get feature upgrade info
 */
export function getFeatureUpgradeInfo(feature: string): {
  requiredPlan: PlanType;
  message: string;
} {
  const featureRequirements: Record<string, { plan: PlanType; message: string }> = {
    comparativeAnalysis: {
      plan: "intermediario",
      message: "Analise comparativa entre ciclos requer plano Intermediario ou superior.",
    },
    dashboardsComparativos: {
      plan: "intermediario",
      message: "Dashboards comparativos requerem plano Intermediario ou superior.",
    },
    relatorioExecutivo: {
      plan: "intermediario",
      message: "Relatorio executivo para lideranca requer plano Intermediario ou superior.",
    },
    systemicAnalysis: {
      plan: "avancado",
      message: "Analise sistemica dos riscos psicossociais requer plano Avancado.",
    },
    correlacaoFatores: {
      plan: "avancado",
      message: "Correlacao entre fatores organizacionais requer plano Avancado.",
    },
    alertasElevados: {
      plan: "avancado",
      message: "Alertas de atencao elevada requerem plano Avancado.",
    },
    apiAccess: {
      plan: "avancado",
      message: "Acesso a API requer plano Avancado.",
    },
  };

  const req = featureRequirements[feature];
  return req ? {
    requiredPlan: req.plan,
    message: req.message,
  } : {
    requiredPlan: "base",
    message: "Esta funcionalidade requer uma assinatura ativa.",
  };
}
