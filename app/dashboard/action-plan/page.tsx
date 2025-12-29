import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionPlanPageContent } from "./page-content";
import { ActionPlanSelector } from "./selector";

interface ActionPlanPageProps {
  searchParams: Promise<{ assessment?: string }>;
}

export default async function ActionPlanPage({
  searchParams,
}: ActionPlanPageProps) {
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

  const assessmentId = params.assessment;

  // Se não tiver assessment selecionado, mostrar seletor
  if (!assessmentId) {
    // Buscar assessments da organização
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

    // Buscar contagem de respostas e ações para cada assessment
    const assessments = await Promise.all(
      (assessmentsRaw || []).map(async (assessment: {
        id: string;
        title: string;
        description?: string;
        status: string;
        start_date?: string;
        end_date?: string;
      }) => {
        // Contagem de respostas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count: responseCount } = await (supabase
          .from("responses")
          .select("id", { count: "exact", head: true })
          .eq("assessment_id", assessment.id) as any);

        // Contagem de ações
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count: actionCount } = await (supabase
          .from("action_plans")
          .select("id", { count: "exact", head: true })
          .eq("assessment_id", assessment.id) as any);

        return {
          ...assessment,
          response_count: responseCount || 0,
          action_count: actionCount || 0,
        };
      })
    );

    return (
      <ActionPlanPageContent title="Plano de Ação">
        <ActionPlanSelector assessments={assessments} />
      </ActionPlanPageContent>
    );
  }

  // Get assessment details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error } = await (supabase
    .from("assessments")
    .select(`
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
    `)
    .eq("id", assessmentId)
    .single() as any);

  if (error || !assessment) {
    return (
      <ActionPlanPageContent title="Plano de Ação">
        <Card className="border-dashed border-2 border-red-200">
          <CardContent className="py-16">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Avaliação não encontrada
              </h3>
              <p className="text-text-muted">
                A avaliação solicitada não existe ou você não tem permissão para acessá-la.
              </p>
            </div>
          </CardContent>
        </Card>
      </ActionPlanPageContent>
    );
  }

  // Get organization plan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase
    .from("organizations")
    .select("plan")
    .eq("id", profile.organization_id)
    .single() as any);

  const subtitle = `${assessment.title}${assessment.questionnaires?.title ? ` - ${assessment.questionnaires.title}` : ""}`;

  return (
    <ActionPlanPageContent
      title="Plano de Ação"
      subtitle={subtitle}
      showBackButton
    >
      <Suspense fallback={<ActionPlanLoading />}>
        <ActionPlanDashboard
          assessmentId={assessmentId}
          currentPlan={org?.plan || 'base'}
        />
      </Suspense>
    </ActionPlanPageContent>
  );
}

// Client component for the action plan dashboard
import { ActionPlanDashboard } from "./dashboard";

function ActionPlanLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
