import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuestionForm } from "@/components/questionnaires/question-form";

export default async function NewQuestionPage({
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

  // Verificar se usuário pode criar perguntas
  const canManage = ["admin", "manager"].includes(profile.role);

  if (!canManage) {
    redirect("/dashboard/questionnaires");
  }

  // Buscar questionário
  const { data: questionnaire, error } = await supabase
    .from("questionnaires")
    .select("id, title")
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (error || !questionnaire) {
    notFound();
  }

  // Buscar próximo order_index
  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("questionnaire_id", params.id);

  const nextOrderIndex = (count || 0) + 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-heading">
          Adicionar Pergunta
        </h1>
        <p className="text-text-secondary mt-1">
          Questionário: {questionnaire.title}
        </p>
      </div>

      {/* Form */}
      <QuestionForm
        questionnaireId={params.id}
        defaultOrderIndex={nextOrderIndex}
      />
    </div>
  );
}
