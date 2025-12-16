import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuestionForm } from "@/components/questionnaires/question-form";

export default async function NewQuestionPage({
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

  // Verificar se usuário pode criar perguntas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManage = ["admin", "manager"].includes((profile as any).role);

  if (!canManage) {
    redirect("/dashboard/questionnaires");
  }

  // Buscar questionário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: questionnaire, error } = await (supabase
    .from("questionnaires")
    .select("id, title")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single() as any);

  if (error || !questionnaire) {
    notFound();
  }

  // Buscar próximo order_index
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("questionnaire_id", id) as any);

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
        questionnaireId={id}
        defaultOrderIndex={nextOrderIndex}
      />
    </div>
  );
}
