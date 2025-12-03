import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssessmentResponseForm } from "@/components/assessments/assessment-response-form";
import { CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default async function PublicAssessmentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Buscar assessment - PÚBLICO (sem auth)
  const { data: assessment, error } = await supabase
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
          question_text,
          question_type,
          options,
          is_required,
          order_index
        )
      ),
      organizations (
        name
      )
    `
    )
    .eq("id", params.id)
    .eq("status", "active")
    .single();

  if (error || !assessment) {
    notFound();
  }

  // Verificar se assessment está dentro do período válido
  const today = new Date().toISOString().split("T")[0];
  const isExpired = assessment.end_date && assessment.end_date < today;
  const notStarted = assessment.start_date > today;

  if (isExpired || notStarted) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-heading mb-2">
              Assessment Indisponível
            </h1>
            <p className="text-text-secondary">
              {notStarted
                ? `Este assessment estará disponível a partir de ${new Date(
                    assessment.start_date
                  ).toLocaleDateString("pt-BR")}`
                : `Este assessment encerrou em ${new Date(
                    assessment.end_date!
                  ).toLocaleDateString("pt-BR")}`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ordenar perguntas
  const questions = (assessment.questionnaires?.questions || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  return (
    <div className="min-h-screen bg-bg-secondary py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-sollar-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <p className="text-sm text-text-muted">
                {assessment.organizations?.name}
              </p>
            </div>

            <CardTitle className="text-2xl">{assessment.title}</CardTitle>

            {assessment.questionnaires?.description && (
              <p className="text-text-secondary mt-2">
                {assessment.questionnaires.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-text-muted">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(assessment.start_date).toLocaleDateString("pt-BR")}
                  {assessment.end_date &&
                    ` - ${new Date(assessment.end_date).toLocaleDateString(
                      "pt-BR"
                    )}`}
                </span>
              </div>
              <div>{questions.length} perguntas</div>
            </div>
          </CardHeader>
        </Card>

        {/* Aviso de Anonimato */}
        <Card className="border-sollar-green-dark bg-sollar-green-light">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-sollar-green-dark flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-text-heading mb-1">
                  Suas respostas são 100% anônimas
                </h3>
                <p className="text-sm text-text-secondary">
                  Não coletamos identificação pessoal. Suas respostas são
                  agregadas com as de outros participantes para gerar insights
                  organizacionais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Respostas */}
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-muted">
                Este questionário ainda não possui perguntas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AssessmentResponseForm
            assessmentId={assessment.id}
            questions={questions}
          />
        )}
      </div>
    </div>
  );
}
