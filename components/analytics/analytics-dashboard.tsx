import { Card, CardContent } from "@/components/ui/card";
import {
  getAssessmentAnalytics,
  getAllQuestionsDistribution,
} from "@/app/dashboard/analytics/actions";
import { AnalyticsDashboardContent } from "./AnalyticsDashboardContent";
import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { PlanType } from "@/lib/stripe/config";

interface AnalyticsDashboardProps {
  assessmentId: string;
}

export async function AnalyticsDashboard({
  assessmentId,
}: AnalyticsDashboardProps) {
  // Fetch analytics data
  const analytics = await getAssessmentAnalytics(assessmentId);
  const questionDistributions = await getAllQuestionsDistribution(assessmentId);

  // Fetch current plan
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let currentPlan: PlanType | undefined = undefined;

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase
      .from("user_profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single() as any);

    if (profile?.organization_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: subscription } = await (supabase
        .from("subscriptions")
        .select("plan")
        .eq("organization_id", profile.organization_id)
        .single() as any);

      if (subscription?.plan) {
        currentPlan = subscription.plan as PlanType;
      }
    }
  }

  if (!analytics) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Não foi possível carregar os dados de análise. Tente novamente mais tarde.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnalyticsDashboardContent
      analytics={analytics}
      questionDistributions={questionDistributions}
      assessmentId={assessmentId}
      currentPlan={currentPlan}
    />
  );
}
