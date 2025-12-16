import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuestionnaireForm } from "@/components/questionnaires/questionnaire-form";
import { isTemplateQuestionnaire, LOCKED_QUESTIONNAIRE_MESSAGES } from "@/lib/constants/questionnaire-templates";

export default async function EditQuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    .select("*")
    .eq("id", user.id)
    .single() as any);

  if (!profile) {
    redirect("/login");
  }

  // Verificar se usuário pode editar questionários
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManage = ["admin", "manager"].includes((profile as any).role);

  if (!canManage) {
    redirect("/dashboard/questionnaires");
  }

  // Buscar questionário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: questionnaire, error } = await (supabase
    .from("questionnaires")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single() as any);

  if (error || !questionnaire) {
    notFound();
  }

  // Verificar se o questionario esta protegido (is_locked ou template)
  const isLocked = questionnaire.is_locked === true || isTemplateQuestionnaire(id);
  if (isLocked) {
    // Redirecionar com mensagem de erro usando searchParams
    redirect(`/dashboard/questionnaires/${id}?error=${encodeURIComponent(LOCKED_QUESTIONNAIRE_MESSAGES.cannotEdit)}`);
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
