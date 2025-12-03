import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuestionnaireForm } from "@/components/questionnaires/questionnaire-form";

export default async function NewQuestionnairePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Verificar se usuário pode criar questionários
  const canManage = ["admin", "manager"].includes(profile.role);

  if (!canManage) {
    redirect("/dashboard/questionnaires");
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-heading">
          Novo Questionário
        </h1>
        <p className="text-text-secondary mt-1">
          Crie um novo questionário de avaliação psicossocial
        </p>
      </div>

      {/* Form */}
      <QuestionnaireForm organizationId={profile.organization_id!} />
    </div>
  );
}
