import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeleteQuestionnaireButton } from "@/components/questionnaires/delete-questionnaire-button";

export default async function QuestionnairePage({
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

  const canManage = ["admin", "manager"].includes(profile.role);

  // Buscar questionário com perguntas
  const { data: questionnaire, error } = await supabase
    .from("questionnaires")
    .select(
      `
      *,
      questions (
        id,
        question_text,
        question_type,
        options,
        is_required,
        order_index,
        created_at
      )
    `
    )
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (error || !questionnaire) {
    notFound();
  }

  // Ordenar perguntas
  const questions = (questionnaire.questions || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/questionnaires">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-text-heading">
            {questionnaire.title}
          </h1>

          {questionnaire.description && (
            <p className="text-text-secondary mt-2">
              {questionnaire.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                questionnaire.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {questionnaire.is_active ? "Ativo" : "Inativo"}
            </span>

            <span className="text-sm text-text-muted">
              {questions.length} {questions.length === 1 ? "pergunta" : "perguntas"}
            </span>

            <span className="text-sm text-text-muted">
              Criado em{" "}
              {new Date(questionnaire.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/questionnaires/${questionnaire.id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            </Link>

            <DeleteQuestionnaireButton questionnaireId={questionnaire.id} />
          </div>
        )}
      </div>

      {/* Perguntas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Perguntas</CardTitle>
          {canManage && (
            <Link
              href={`/dashboard/questionnaires/${questionnaire.id}/questions/new`}
            >
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Pergunta
              </Button>
            </Link>
          )}
        </CardHeader>

        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted mb-4">
                Nenhuma pergunta adicionada ainda.
              </p>
              {canManage && (
                <Link
                  href={`/dashboard/questionnaires/${questionnaire.id}/questions/new`}
                >
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Pergunta
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question: any, index: number) => (
                <div
                  key={question.id}
                  className="p-4 border border-border-light rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-text-muted">
                          {index + 1}.
                        </span>
                        <span className="text-sm font-medium text-text-heading">
                          {question.question_text}
                        </span>
                        {question.is_required && (
                          <span className="text-red-500 text-sm">*</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span className="capitalize">
                          Tipo: {question.question_type}
                        </span>
                        {question.options && question.options.length > 0 && (
                          <span>{question.options.length} opções</span>
                        )}
                      </div>

                      {/* Mostrar opções se houver */}
                      {question.options && question.options.length > 0 && (
                        <div className="mt-3 pl-6 space-y-1">
                          {question.options.map((option: string, idx: number) => (
                            <div key={idx} className="text-sm text-text-secondary">
                              • {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/questionnaires/${questionnaire.id}/questions/${question.id}/edit`}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
