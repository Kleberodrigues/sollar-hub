import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AssessmentResponseFormV2 } from "@/components/assessments/assessment-response-form-v2";
import { AlertCircle } from "lucide-react";

export default async function PublicAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Buscar assessment - PÚBLICO (sem auth)
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
        introduction_text,
        lgpd_consent_text,
        questionnaire_type,
        questions (
          id,
          text,
          question_text,
          type,
          question_type,
          options,
          is_required,
          order_index,
          scale_labels,
          allow_skip,
          risk_inverted,
          is_strategic_open,
          min_value,
          max_value,
          category
        )
      ),
      organizations (
        name
      )
    `
    )
    .eq("id", id)
    .eq("status", "active")
    .single() as any);

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
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
  );

  return (
    <div className="min-h-screen bg-bg-secondary py-6 px-4">
      <div className="max-w-3xl mx-auto">
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
          <AssessmentResponseFormV2
            assessmentId={assessment.id}
            questionnaire={assessment.questionnaires}
            questions={questions}
          />
        )}
      </div>
    </div>
  );
}
