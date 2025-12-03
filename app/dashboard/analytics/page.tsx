import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

interface AnalyticsPageProps {
  searchParams: { assessment?: string };
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const assessmentId = searchParams.assessment;

  if (!assessmentId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">
              Selecione um assessment para visualizar os dados de análise.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get assessment details
  const { data: assessment, error } = await supabase
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
    .single();

  if (error || !assessment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Assessment não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">
              O assessment solicitado não foi encontrado ou você não tem
              permissão para visualizá-lo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">
          Análise de Dados
        </h1>
        <p className="text-text-secondary">
          {assessment.title} - {assessment.questionnaires?.[0]?.title}
        </p>
      </div>

      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsDashboard assessmentId={assessmentId} />
      </Suspense>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
