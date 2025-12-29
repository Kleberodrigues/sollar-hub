'use client';

import { ActionPlanTab } from '@/components/analytics/tabs/ActionPlanTab';
import type { PlanType } from '@/lib/stripe/config';

interface ActionPlanDashboardProps {
  assessmentId: string;
  currentPlan: PlanType;
}

export function ActionPlanDashboard({
  assessmentId,
  currentPlan,
}: ActionPlanDashboardProps) {
  // For now, we don't pass high risk categories since they require analytics data
  // The AI will analyze the assessment directly
  return (
    <ActionPlanTab
      assessmentId={assessmentId}
      currentPlan={currentPlan}
      highRiskCategories={[]}
    />
  );
}
