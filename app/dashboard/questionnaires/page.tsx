import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default async function QuestionnairesPage() {
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
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Verificar se usuário pode gerenciar questionários (admin ou manager)
  const canManage = ["admin", "manager"].includes(profile.role);

  // Buscar questionários da organização
  const { data: questionnaires, error } = await supabase
    .from("questionnaires")
    .select(
      `
      *,
      questions:questions(count)
    `
    )
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar questionários:", error);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-heading">
            Questionários
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie questionários de avaliação psicossocial
          </p>
        </div>

        {canManage && (
          <Link href="/dashboard/questionnaires/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Questionário
            </Button>
          </Link>
        )}
      </div>

      {/* Lista de questionários */}
      {!questionnaires || questionnaires.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-heading mb-2">
                Nenhum questionário encontrado
              </h3>
              <p className="text-text-secondary mb-6">
                Comece criando seu primeiro questionário de avaliação
                psicossocial.
              </p>
              {canManage && (
                <Link href="/dashboard/questionnaires/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Questionário
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questionnaires.map((questionnaire) => {
            const questionCount = questionnaire.questions?.[0]?.count || 0;

            return (
              <Card key={questionnaire.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-sollar-green-dark" />
                        <h3 className="text-lg font-semibold text-text-heading">
                          {questionnaire.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            questionnaire.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {questionnaire.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      {questionnaire.description && (
                        <p className="text-text-secondary mb-4">
                          {questionnaire.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>
                            {questionCount}{" "}
                            {questionCount === 1 ? "pergunta" : "perguntas"}
                          </span>
                        </div>
                        <div>
                          Criado em{" "}
                          {new Date(questionnaire.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/questionnaires/${questionnaire.id}`}
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Visualizar
                        </Button>
                      </Link>

                      {canManage && (
                        <>
                          <Link
                            href={`/dashboard/questionnaires/${questionnaire.id}/edit`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
