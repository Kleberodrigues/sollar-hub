import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuestionForm } from "@/components/questionnaires/question-form";

export default async function EditQuestionPage({
  params,
}: {
  params: { id: string; questionId: string };
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

  // Verificar se usuário pode editar perguntas
  const canManage = ["admin", "manager"].includes(profile.role);

  if (!canManage) {
    redirect("/dashboard/questionnaires");
  }

  // Buscar questionário
  const { data: questionnaire, error: qError } = await supabase
    .from("questionnaires")
    .select("id, title")
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (qError || !questionnaire) {
    notFound();
  }

  // Buscar pergunta
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("id", params.questionId)
    .eq("questionnaire_id", params.id)
    .single();

  if (questionError || !question) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-heading">
          Editar Pergunta
        </h1>
        <p className="text-text-secondary mt-1">
          Questionário: {questionnaire.title}
        </p>
      </div>

      {/* Form */}
      <QuestionForm
        questionnaireId={params.id}
        question={{
          id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          is_required: question.is_required,
          order_index: question.order_index,
        }}
      />
    </div>
  );
}
