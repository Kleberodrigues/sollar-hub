import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClimateDashboard } from "@/components/climate/climate-dashboard";
import { CloudSun } from "lucide-react";

const CLIMA_QUESTIONNAIRE_ID = "b2222222-2222-2222-2222-222222222222";

export default async function ClimatePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()) as any;

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  // Get climate assessments for this organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessments, error: assessmentsError } = (await supabase
    .from("assessments")
    .select(
      `
      id,
      title,
      start_date,
      end_date,
      status
    `
    )
    .eq("organization_id", profile.organization_id)
    .eq("questionnaire_id", CLIMA_QUESTIONNAIRE_ID)
    .order("start_date", { ascending: false })) as any;

  // Debug log
  console.log("Climate Dashboard Debug:", {
    organizationId: profile.organization_id,
    questionnaireId: CLIMA_QUESTIONNAIRE_ID,
    assessmentsFound: assessments?.length || 0,
    error: assessmentsError?.message
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-pm-green-dark flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/20 flex items-center justify-center">
              <CloudSun className="w-5 h-5 text-pm-terracotta" />
            </div>
            Pesquisa de Clima
          </h1>
          <p className="text-text-secondary mt-1">
            Acompanhe o bem-estar e satisfação da sua equipe mês a mês
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <Suspense fallback={<ClimateLoading />}>
        <ClimateDashboard
          organizationId={profile.organization_id}
          assessments={assessments || []}
        />
      </Suspense>
    </div>
  );
}

function ClimateLoading() {
  return (
    <div className="space-y-6">
      {/* Filter Loading */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Top Row Loading - Q1 and Q9 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-64 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-64 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Q2-Q8 Loading */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
