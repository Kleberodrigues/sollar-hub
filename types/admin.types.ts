/**
 * Admin Dashboard Types
 *
 * TypeScript types for the Super Admin platform-wide dashboard
 */

import type { PlanType, SubscriptionStatus } from './index';

// Re-export types for convenience
export type { PlanType, SubscriptionStatus };

// ============================================
// Dashboard Metrics Types
// ============================================

/**
 * Main dashboard metrics returned from get_admin_platform_metrics()
 */
export interface AdminDashboardMetrics {
  totalOrganizations: number;
  newOrganizations30d: number;
  totalUsers: number;
  newUsers30d: number;
  activeSubscriptions: number;
  planDistribution: PlanDistribution;
  canceledSubscriptions: number;
  trialingSubscriptions: number;
  revenueCurrentMonthCents: number;
  revenueLastMonthCents: number;
  totalAssessments: number;
  assessments30d: number;
  totalResponses: number;
}

/**
 * Plan distribution counts
 */
export interface PlanDistribution {
  base: number;
  intermediario: number;
  avancado: number;
}

/**
 * Calculated MRR metrics
 */
export interface MRRMetrics {
  currentMRR: number;
  previousMRR: number;
  mrrChange: number;
  mrrChangePercent: number;
}

/**
 * Churn metrics returned from get_admin_churn_metrics()
 */
export interface ChurnMetrics {
  totalAtMonthStart: number;
  canceledThisMonth: number;
  churnRate: number;
  churnedMRRCents: number;
}

// ============================================
// Time Series Types
// ============================================

/**
 * MRR time series data point
 */
export interface MRRTimeSeriesPoint {
  month: string; // ISO date string
  mrrCents: number;
  subscriptionCount: number;
}

/**
 * MRR time series response
 */
export type MRRTimeSeries = MRRTimeSeriesPoint[];

// ============================================
// Organization List Types
// ============================================

/**
 * Organization list item for the admin table
 */
export interface OrganizationListItem {
  id: string;
  name: string;
  createdAt: string;
  plan: PlanType | null;
  subscriptionStatus: SubscriptionStatus | null;
  userCount: number;
  assessmentCount: number;
}

/**
 * Organization list response
 */
export interface OrganizationListResponse {
  organizations: OrganizationListItem[];
  total: number;
  hasMore: boolean;
}

/**
 * Organization list filters
 */
export interface OrganizationListFilters {
  search?: string;
  plan?: PlanType;
  status?: SubscriptionStatus;
  page?: number;
  pageSize?: number;
}

// ============================================
// KPI Card Types
// ============================================

/**
 * KPI card configuration
 */
export interface KPICardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: 'currency' | 'building' | 'users' | 'percent' | 'chart' | 'assessment';
  trend?: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'number' | 'percent';
}

// ============================================
// Chart Data Types
// ============================================

/**
 * Line chart data point for MRR chart
 */
export interface MRRChartDataPoint {
  month: string;
  mrr: number;
  subscriptions: number;
}

/**
 * Pie chart data point for plan distribution
 */
export interface PlanDistributionChartData {
  name: string;
  value: number;
  fill: string;
}

// ============================================
// Constants
// ============================================

/**
 * Plan prices in cents (annual prices)
 * Source: lib/stripe/config.ts - PLANS configuration
 */
export const PLAN_PRICES_ANNUAL_CENTS = {
  base: 397000, // R$ 3.970,00/ano
  intermediario: 497000, // R$ 4.970,00/ano
  avancado: 597000, // R$ 5.970,00/ano
} as const;

/**
 * Plan prices monthly (annual / 12)
 */
export const PLAN_PRICES_MONTHLY_CENTS = {
  base: Math.round(PLAN_PRICES_ANNUAL_CENTS.base / 12), // R$ 330,83/mes
  intermediario: Math.round(PLAN_PRICES_ANNUAL_CENTS.intermediario / 12), // R$ 414,17/mes
  avancado: Math.round(PLAN_PRICES_ANNUAL_CENTS.avancado / 12), // R$ 497,50/mes
} as const;

/**
 * Plan labels in Portuguese
 */
export const PLAN_LABELS: Record<PlanType, string> = {
  base: 'Base',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

/**
 * Plan colors for charts
 */
export const PLAN_COLORS: Record<PlanType, string> = {
  base: '#77953E', // pm-green-medium
  intermediario: '#789750', // pm-olive
  avancado: '#456807', // pm-green-dark
};

/**
 * Subscription status labels in Portuguese
 */
export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Ativo',
  canceled: 'Cancelado',
  past_due: 'Atrasado',
  trialing: 'Trial',
  unpaid: 'Não Pago',
  incomplete: 'Incompleto',
  incomplete_expired: 'Expirado',
};

// ============================================
// Utility Functions
// ============================================

/**
 * Format cents to BRL currency string
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Format percentage with sign
 */
export function formatPercentChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Calculate MRR from plan distribution
 */
export function calculateMRR(distribution: PlanDistribution): number {
  return (
    distribution.base * PLAN_PRICES_MONTHLY_CENTS.base +
    distribution.intermediario * PLAN_PRICES_MONTHLY_CENTS.intermediario +
    distribution.avancado * PLAN_PRICES_MONTHLY_CENTS.avancado
  );
}

/**
 * Format ISO date string to localized date
 */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return '-';
  }
}

/**
 * Format ISO date string to localized date and time
 */
export function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return '-';
  }
}
