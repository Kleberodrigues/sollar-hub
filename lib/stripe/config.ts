/**
 * Stripe configuration and plan definitions
 * Updated: 2025-12-14 - New plan structure (Base/Intermediario/Avancado)
 */

import Stripe from "stripe";

// ============================================
// Stripe Client
// ============================================

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set - Stripe functionality disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    })
  : null;

// ============================================
// Type Definitions
// ============================================

export type PlanType = "base" | "intermediario" | "avancado";
export type BillingInterval = "yearly"; // Only yearly billing

export interface PlanConfig {
  name: string;
  description: string;
  objective: string;
  price: {
    yearly: string | null; // Stripe Price ID
  };
  priceAmount: {
    yearly: number; // Amount in centavos
  };
  priceDisplay: {
    yearly: string;
    perMonth: string; // Display as monthly equivalent
  };
  features: string[];
  limits: {
    minEmployees: number;
    maxEmployees: number;
    maxActiveAssessments: number;
    maxQuestionsPerAssessment: number;
    maxTeamMembers: number;
    aiAnalysesPerMonth: number;
    aiActionPlansPerMonth: number;
  };
  capabilities: {
    analytics: "basic" | "advanced" | "custom";
    exports: ("csv" | "pdf" | "xlsx" | "api")[];
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    dedicatedSupport: boolean;
    comparativeAnalysis: boolean;
    systemicAnalysis: boolean;
    elevatedAlerts: boolean;
  };
}

// ============================================
// Plan Configuration
// ============================================

export const PLANS: Record<PlanType, PlanConfig> = {
  base: {
    name: "Base",
    description: "Para empresas de 50 a 120 colaboradores",
    objective: "Cumprir a NR-1 com clareza",
    price: {
      yearly: process.env.STRIPE_PRICE_BASE_YEARLY || null,
    },
    priceAmount: {
      yearly: 397000, // R$ 3.970,00 em centavos
    },
    priceDisplay: {
      yearly: "R$ 3.970",
      perMonth: "R$ 330,83",
    },
    features: [
      "IA vertical em riscos psicossociais",
      "Dashboards automaticos",
      "Relatorio tecnico personalizado",
      "Plano de acao orientado a prevencao",
      "Analise por clusters de risco",
      "Assessments ilimitados",
      "Export PDF e CSV",
      "Suporte por email",
    ],
    limits: {
      minEmployees: 50,
      maxEmployees: 120,
      maxActiveAssessments: Infinity,
      maxQuestionsPerAssessment: 100,
      maxTeamMembers: 10,
      aiAnalysesPerMonth: 20,
      aiActionPlansPerMonth: 10,
    },
    capabilities: {
      analytics: "basic",
      exports: ["csv", "pdf"],
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      dedicatedSupport: false,
      comparativeAnalysis: false,
      systemicAnalysis: false,
      elevatedAlerts: false,
    },
  },
  intermediario: {
    name: "Intermediario",
    description: "Para empresas de 121 a 250 colaboradores",
    objective: "Apoiar decisoes gerenciais",
    price: {
      yearly: process.env.STRIPE_PRICE_INTERMEDIARIO_YEARLY || null,
    },
    priceAmount: {
      yearly: 497000, // R$ 4.970,00 em centavos
    },
    priceDisplay: {
      yearly: "R$ 4.970",
      perMonth: "R$ 414,17",
    },
    features: [
      "Tudo do plano Base",
      "Analise comparativa entre ciclos",
      "Priorizacao de riscos por impacto organizacional",
      "Dashboards comparativos (tempo/areas)",
      "Relatorio executivo para lideranca",
      "Branding personalizado",
      "Suporte prioritario",
    ],
    limits: {
      minEmployees: 121,
      maxEmployees: 250,
      maxActiveAssessments: Infinity,
      maxQuestionsPerAssessment: 150,
      maxTeamMembers: 25,
      aiAnalysesPerMonth: 50,
      aiActionPlansPerMonth: 25,
    },
    capabilities: {
      analytics: "advanced",
      exports: ["csv", "pdf"],
      apiAccess: false,
      customBranding: true,
      prioritySupport: true,
      dedicatedSupport: false,
      comparativeAnalysis: true,
      systemicAnalysis: false,
      elevatedAlerts: false,
    },
  },
  avancado: {
    name: "Avancado",
    description: "Para empresas de 251 a 400 colaboradores",
    objective: "Atender organizacoes de maior complexidade",
    price: {
      yearly: process.env.STRIPE_PRICE_AVANCADO_YEARLY || null,
    },
    priceAmount: {
      yearly: 597000, // R$ 5.970,00 em centavos
    },
    priceDisplay: {
      yearly: "R$ 5.970",
      perMonth: "R$ 497,50",
    },
    features: [
      "Tudo do plano Intermediario",
      "Analise sistemica dos riscos psicossociais",
      "Correlacao entre fatores organizacionais",
      "Alertas de atencao elevada",
      "Relatorio tecnico estruturado para gestao de riscos",
      "Acesso a API",
      "Export XLSX",
      "Suporte dedicado",
    ],
    limits: {
      minEmployees: 251,
      maxEmployees: 400,
      maxActiveAssessments: Infinity,
      maxQuestionsPerAssessment: Infinity,
      maxTeamMembers: Infinity,
      aiAnalysesPerMonth: Infinity,
      aiActionPlansPerMonth: Infinity,
    },
    capabilities: {
      analytics: "custom",
      exports: ["csv", "pdf", "xlsx", "api"],
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      dedicatedSupport: true,
      comparativeAnalysis: true,
      systemicAnalysis: true,
      elevatedAlerts: true,
    },
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get price ID for a plan (only yearly available)
 */
export function getPriceId(plan: PlanType): string | null {
  return PLANS[plan]?.price.yearly || null;
}

/**
 * Get plan type from Stripe price ID
 */
export function getPlanFromPriceId(priceId: string): PlanType | null {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.price.yearly === priceId) {
      return plan as PlanType;
    }
  }
  return null;
}

/**
 * Get plan configuration
 */
export function getPlanConfig(plan: PlanType): PlanConfig {
  return PLANS[plan] || PLANS.base;
}

/**
 * Check if a plan has a specific capability
 */
export function planHasCapability(
  plan: PlanType,
  capability: keyof PlanConfig["capabilities"]
): boolean {
  const config = PLANS[plan];
  if (!config) return false;

  const value = config.capabilities[capability];
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  return !!value;
}

/**
 * Check if upgrade is possible between plans
 */
export function canUpgrade(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ["base", "intermediario", "avancado"];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  return targetIndex > currentIndex;
}

/**
 * Get all plans for pricing page
 */
export function getAllPlans(): Array<{ type: PlanType; config: PlanConfig }> {
  return Object.entries(PLANS).map(([type, config]) => ({
    type: type as PlanType,
    config,
  }));
}

/**
 * Get recommended plan based on employee count
 */
export function getRecommendedPlan(employeeCount: number): PlanType | null {
  if (employeeCount >= 50 && employeeCount <= 120) return "base";
  if (employeeCount >= 121 && employeeCount <= 250) return "intermediario";
  if (employeeCount >= 251 && employeeCount <= 400) return "avancado";
  return null; // Employee count outside supported range
}

/**
 * Check if employee count is valid for a plan
 */
export function isValidEmployeeCount(plan: PlanType, employeeCount: number): boolean {
  const config = PLANS[plan];
  if (!config) return false;
  return employeeCount >= config.limits.minEmployees && employeeCount <= config.limits.maxEmployees;
}

/**
 * Get plan that supports given employee count
 */
export function getPlanForEmployeeCount(employeeCount: number): PlanType | null {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (employeeCount >= config.limits.minEmployees && employeeCount <= config.limits.maxEmployees) {
      return plan as PlanType;
    }
  }
  return null;
}
