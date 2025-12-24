/* eslint-disable no-console */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import {
  AnalyticsPageContent,
  AnalyticsNotFoundState,
} from "@/components/analytics/AnalyticsPageContent";
import { AssessmentSelector } from "@/components/analytics/AssessmentSelector";

interface AnalyticsPageProps {
  searchParams: Promise<{ assessment?: string }>;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single() as any);

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  // Log para diagnóstico de role
  console.log('[Analytics] User profile:', {
    userId: user.id,
    organizationId: profile.organization_id,
    role: profile.role
  });

  // Aviso se role não permite ver responses
  if (profile.role && !['admin', 'manager'].includes(profile.role)) {
    console.warn('[Analytics] User role does not have access to responses:', profile.role);
  }

  const assessmentId = params.assessment;

  // Se não tiver assessment selecionado, mostrar seletor
  if (!assessmentId) {
    // Buscar assessments da organização com contagem de respostas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessmentsRaw } = await (supabase
      .from("assessments")
      .select(`
        id,
        title,
        description,
        status,
        start_date,
        end_date
      `)
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false }) as any);

    // Log para diagnóstico
    console.log('[Analytics] Fetching response counts for assessments:', {
      organizationId: profile.organization_id,
      assessmentCount: assessmentsRaw?.length || 0
    });

    // Buscar contagem de respostas para cada assessment
    const assessments = await Promise.all(
      (assessmentsRaw || []).map(async (assessment: {
        id: string;
        title: string;
        description?: string;
        status: string;
        start_date?: string;
        end_date?: string;
      }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count, error: countError } = await (supabase
          .from("responses")
          .select("id", { count: "exact", head: true })
          .eq("assessment_id", assessment.id) as any);

        // Log para diagnóstico de contagem
        console.log('[Analytics] Response count for assessment:', {
          assessmentId: assessment.id,
          title: assessment.title,
          count,
          error: countError?.message
        });

        return {
          ...assessment,
          response_count: count || 0,
        };
      })
    );

    return (
      <AnalyticsPageContent title="Análise de Riscos">
        <AssessmentSelector assessments={assessments} />
      </AnalyticsPageContent>
    );
  }

  // Get assessment details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error } = await (supabase
    .from("assessments")
    .select(
      `
      id,
      title,
      description,
      start_date,
      end_date,
      status,
      questionnaires (
        id,
        title
      )
    `
    )
    .eq("id", assessmentId)
    .single() as any);

  if (error || !assessment) {
    return (
      <AnalyticsPageContent title="Análise de Riscos">
        <AnalyticsNotFoundState />
      </AnalyticsPageContent>
    );
  }

  const subtitle = `${assessment.title}${assessment.questionnaires?.title ? ` - ${assessment.questionnaires.title}` : ""}`;

  return (
    <AnalyticsPageContent
      title="Análise de Riscos"
      subtitle={subtitle}
      showBackButton
    >
      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsDashboard assessmentId={assessmentId} />
      </Suspense>
    </AnalyticsPageContent>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="bg-gradient-to-br from-gray-50 to-white"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-l-4 border-l-gray-200">
            <CardHeader className="flex flex-row items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
