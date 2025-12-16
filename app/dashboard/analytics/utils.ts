/**
 * Analytics utility functions (non-server-action helpers)
 */

import { CATEGORY_LABELS } from "@/types";

/**
 * Get category name in Portuguese (using Sollar 8-block structure)
 */
export function getCategoryName(category: string): string {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
}

/**
 * Get risk level label in Portuguese
 */
export function getRiskLevelLabel(level: "low" | "medium" | "high"): string {
  const labels = {
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
  };
  return labels[level];
}

/**
 * Get risk level color for badge UI
 */
export function getRiskLevelColor(
  level: "low" | "medium" | "high"
): string {
  const colors = {
    low: "text-green-700 bg-green-100 border-green-300",
    medium: "text-yellow-700 bg-yellow-100 border-yellow-300",
    high: "text-red-700 bg-red-100 border-red-300",
  };
  return colors[level];
}

/**
 * Get card background gradient based on risk level
 */
export function getRiskLevelCardStyle(
  level: "low" | "medium" | "high"
): { bg: string; border: string; text: string } {
  const styles = {
    low: {
      bg: "bg-gradient-to-br from-green-50 to-green-100/50",
      border: "border-green-200",
      text: "text-green-700",
    },
    medium: {
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100/50",
      border: "border-yellow-200",
      text: "text-yellow-700",
    },
    high: {
      bg: "bg-gradient-to-br from-red-50 to-red-100/50",
      border: "border-red-200",
      text: "text-red-700",
    },
  };
  return styles[level];
}
