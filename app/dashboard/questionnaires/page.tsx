import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuestionnairesListContent } from "@/components/questionnaires/QuestionnairesListContent";
import { TEMPLATE_IDS_ARRAY } from "@/lib/constants/questionnaire-templates";

export default async function QuestionnairesPage() {
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

  // Verificar se usuário pode gerenciar questionários (admin ou manager)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManage = ["admin", "manager"].includes((profile as any).role);

  // Buscar questionários: templates padrão NR-1/NR-17 OU da organização do usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: questionnaires } = await (supabase
    .from("questionnaires")
    .select(
      `
      *,
      questions:questions(count)
    `
    )
    .or(`organization_id.eq.${profile.organization_id},id.in.(${TEMPLATE_IDS_ARRAY.join(',')})`)
    .order("created_at", { ascending: false }) as any);

  return (
    <QuestionnairesListContent
      questionnaires={questionnaires}
      canManage={canManage}
    />
  );
}
