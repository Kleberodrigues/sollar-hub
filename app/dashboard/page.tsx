import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar perfil do usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single() as any);

  // Buscar métricas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [
    { count: questionnairesCount },
    { count: assessmentsCount },
    { count: responsesCount },
    { count: teamCount },
  ] = await Promise.all([
    supabase
      .from("questionnaires")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile?.organization_id || ""),
    supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile?.organization_id || ""),
    supabase
      .from("responses")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile?.organization_id || ""),
  ]) as any;

  const metrics = {
    questionnairesCount: questionnairesCount || 0,
    assessmentsCount: assessmentsCount || 0,
    responsesCount: responsesCount || 0,
    teamCount: teamCount || 0,
  };

  return (
    <DashboardContent
      metrics={metrics}
      profile={profile}
      userEmail={user.email || ""}
    />
  );
}
