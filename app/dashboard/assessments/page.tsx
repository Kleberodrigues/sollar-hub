import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentsListContent } from "@/components/assessments/AssessmentsListContent";

export default async function AssessmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil do usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single() as any);

  if (!profile) {
    redirect("/login");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManage = ["admin", "manager"].includes((profile as any).role);

  // Buscar assessments da organização
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessments } = await (supabase
    .from("assessments")
    .select(
      `
      *,
      questionnaires (
        id,
        title
      ),
      departments (
        id,
        name
      ),
      responses:responses(count)
    `
    )
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false }) as any);

  return (
    <AssessmentsListContent
      assessments={assessments}
      canManage={canManage}
    />
  );
}
