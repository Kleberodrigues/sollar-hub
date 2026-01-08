import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, BarChart3 } from "lucide-react";
import Link from "next/link";
import { ParticipantImportDialog } from "@/components/assessments/ParticipantImportDialog";
import { ParticipantsList } from "@/components/assessments/ParticipantsList";
import { getParticipants } from "../participant-import-actions";
import { getQuestionnaireSlug } from "@/lib/constants/questionnaire-templates";

export default async function AssessmentPage({
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
  const canManage = ["admin", "manager", "Responsável", "responsavel", "responsavel_empresa"].includes((profile as any).role);

  // Buscar assessment com dados relacionados
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error } = await (supabase
    .from("assessments")
    .select(
      `
      *,
      questionnaires (
        id,
        title,
        description,
        questions (
          id,
          text,
          type
        )
      ),
      departments (
        id,
        name
      ),
      responses (
        id,
        created_at
      )
    `
    )
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single() as any);

  if (error || !assessment) {
    notFound();
  }

  const responseCount = assessment.responses?.length || 0;
  const questionCount = assessment.questionnaires?.questions?.length || 0;
  const isActive = assessment.status === "active";
  const today = new Date().toISOString().split("T")[0];
  const isExpired = assessment.end_date && assessment.end_date < today;

  // Buscar participantes importados
  const participantsResult = await getParticipants(id);
  const participants = participantsResult.participants || [];
  const participantCount = participants.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/assessments">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-text-heading">
            {assessment.title}
          </h1>

          <div className="flex items-center gap-4 mt-4">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                isExpired
                  ? "bg-gray-100 text-gray-700"
                  : isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {isExpired ? "Encerrado" : isActive ? "Ativo" : "Rascunho"}
            </span>

            <span className="text-sm text-text-muted">
              {responseCount} {responseCount === 1 ? "resposta" : "respostas"}
            </span>

            <span className="text-sm text-text-muted">
              {new Date(assessment.start_date).toLocaleDateString("pt-BR")}
              {" - "}
              {assessment.end_date
                ? new Date(assessment.end_date).toLocaleDateString("pt-BR")
                : "Sem data fim"}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <ParticipantImportDialog
              assessmentId={assessment.id}
              assessmentTitle={assessment.title}
            />
            <Link href={`/dashboard/assessments/${assessment.id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            </Link>
          </div>
        )}
      </div>


      {/* Informações da Avaliação */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase mb-1">
                Questionário
              </p>
              <Link
                href={`/dashboard/questionnaires/${getQuestionnaireSlug(assessment.questionnaires?.id || '')}`}
                className="text-sm font-medium text-pm-green-dark hover:underline"
              >
                {assessment.questionnaires?.title || "N/A"}
              </Link>
            </div>

            <div>
              <p className="text-xs font-medium text-text-muted uppercase mb-1">
                Perguntas
              </p>
              <p className="text-sm font-medium text-text-primary">
                {questionCount} {questionCount === 1 ? "pergunta" : "perguntas"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-text-muted uppercase mb-1">
                Escopo
              </p>
              <p className="text-sm font-medium text-text-primary">
                {assessment.department_id
                  ? `Departamento: ${assessment.departments?.name || "N/A"}`
                  : "Toda a organização"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-text-muted uppercase mb-1">
                Criado em
              </p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(assessment.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase mb-1">
                Total de Respostas
              </p>
              <p className="text-3xl font-bold text-pm-green-dark">
                {responseCount}
              </p>
            </div>

            {responseCount > 0 && (
              <>
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">
                    Primeira Resposta
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(
                      assessment.responses![0].created_at
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">
                    Última Resposta
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(
                      assessment.responses![responseCount - 1].created_at
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </>
            )}

            {responseCount === 0 && (
              <p className="text-sm text-text-muted">
                Nenhuma resposta coletada ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Participantes Importados */}
      {participantCount > 0 && (
        <ParticipantsList participants={participants} />
      )}

      {/* Ações rápidas */}
      {responseCount > 0 && (
        <Card className="border-l-4 border-l-pm-olive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-pm-olive" />
              </div>
              <CardTitle>Análise Completa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Visualize dashboards interativos, gráficos detalhados e todas as métricas da avaliação.
            </p>
            <div className="flex gap-2">
              <Link href={`/dashboard/analytics?assessment=${assessment.id}`}>
                <Button className="bg-pm-olive hover:bg-pm-olive/90">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Abrir Dashboard Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
