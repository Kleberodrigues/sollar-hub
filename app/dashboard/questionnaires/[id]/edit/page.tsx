import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuestionnaireForm } from "@/components/questionnaires/questionnaire-form";

export default async function EditQuestionnairePage({
  params,
}: {
  params: { id: string };
}) {
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

  // Verificar se usuário pode editar questionários
  const canManage = ["admin", "manager"].includes(profile.role);

  if (!canManage) {
    redirect("/dashboard/questionnaires");
  }

  // Buscar questionário
  const { data: questionnaire, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (error || !questionnaire) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-heading">
          Editar Questionário
        </h1>
        <p className="text-text-secondary mt-1">
          Atualize as informações do questionário
        </p>
      </div>

      {/* Form */}
      <QuestionnaireForm
        organizationId={profile.organization_id!}
        questionnaire={{
          id: questionnaire.id,
          title: questionnaire.title,
          description: questionnaire.description,
          is_active: questionnaire.is_active,
        }}
      />
    </div>
  );
}
