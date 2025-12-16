import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuestionForm } from "@/components/questionnaires/question-form";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; questionId: string }>;
}) {
  const { id, questionId } = await params;
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

  // Verificar se usuário pode editar perguntas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManage = ["admin", "manager"].includes((profile as any).role);

  if (!canManage) {
    redirect("/dashboard/questionnaires");
  }

  // Buscar questionário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: questionnaire, error: qError } = await (supabase
    .from("questionnaires")
    .select("id, title")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single() as any);

  if (qError || !questionnaire) {
    notFound();
  }

  // Buscar pergunta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: question, error: questionError } = await (supabase
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .eq("questionnaire_id", id)
    .single() as any);

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
        questionnaireId={id}
        question={{
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options,
          is_required: question.is_required,
          order_index: question.order_index,
        }}
      />
    </div>
  );
}
