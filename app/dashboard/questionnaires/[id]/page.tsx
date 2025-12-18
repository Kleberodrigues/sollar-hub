import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { DeleteQuestionnaireButton } from "@/components/questionnaires/delete-questionnaire-button";
import { TEMPLATE_IDS_ARRAY, isTemplateQuestionnaire, getLockedQuestionnaireInfo } from "@/lib/constants/questionnaire-templates";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuestionRow {
  id: string;
  text: string | null;
  type: string | null;
  is_required: boolean;
  order_index: number;
  options: string[] | null;
}

export default async function QuestionnairePage({
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManage = ["admin", "manager"].includes((profile as any).role);

  // Buscar questionário com perguntas (templates globais OU da organização)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: questionnaire, error } = await (supabase
    .from("questionnaires")
    .select(
      `
      *,
      questions (
        id,
        text,
        type,
        options,
        is_required,
        order_index,
        created_at
      )
    `
    )
    .eq("id", id)
    .or(`organization_id.eq.${profile.organization_id},id.in.(${TEMPLATE_IDS_ARRAY.join(',')})`)
    .single() as any);

  if (error || !questionnaire) {
    notFound();
  }

  // Verificar se é protegido (is_locked no banco OU template por ID)
  const isLocked = questionnaire.is_locked === true || isTemplateQuestionnaire(id);
  const lockedInfo = getLockedQuestionnaireInfo(id);

  // Ordenar perguntas
  const questions = (questionnaire.questions || []).sort(
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
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

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-heading">
              {questionnaire.title}
            </h1>
            {isLocked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="warning" className="gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      {lockedInfo?.regulation || 'Protegido'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium">{lockedInfo?.name || 'Questionario Protegido'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lockedInfo?.description || 'Este questionario segue requisitos regulatorios e nao pode ser editado.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

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
      </div>

      {/* Perguntas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Perguntas</CardTitle>
        </CardHeader>

        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted mb-4">
                Nenhuma pergunta adicionada ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question: QuestionRow, index: number) => (
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
                          {question.text}
                        </span>
                        {question.is_required && (
                          <span className="text-red-500 text-sm">*</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span className="capitalize">
                          Tipo: {question.type}
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
