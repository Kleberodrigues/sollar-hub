"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { QuestionnaireIntroduction } from "./questionnaire-introduction";
import { QuestionRenderer } from "./question-renderer";
import { dispatchResponseReceived } from "@/app/dashboard/assessments/actions";

interface Question {
  id: string;
  text?: string | null;
  question_text?: string | null;
  type?: string | null;
  question_type?: string | null;
  options?: string[] | null;
  is_required: boolean;
  order_index: number;
  scale_labels?: Record<string, string> | null;
  allow_skip?: boolean;
  risk_inverted?: boolean;
  is_strategic_open?: boolean;
  min_value?: number | null;
  max_value?: number | null;
  category?: string | null;
}

type ResponseValue = string | number | string[] | null;

interface Questionnaire {
  id: string;
  title: string;
  description?: string | null;
  introduction_text?: string | null;
  lgpd_consent_text?: string | null;
  questionnaire_type?: string | null;
}

interface AssessmentResponseFormProps {
  assessmentId: string;
  questionnaire: Questionnaire;
  questions: Question[];
}

export function AssessmentResponseFormV2({
  assessmentId,
  questionnaire,
  questions,
}: AssessmentResponseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showIntroduction, setShowIntroduction] = useState(true);

  // Estado para armazenar respostas
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});

  // Calcular progresso
  const answeredCount = Object.keys(responses).filter(
    (key) =>
      responses[key] !== undefined &&
      responses[key] !== "" &&
      responses[key] !== null &&
      (Array.isArray(responses[key]) ? responses[key].length > 0 : true)
  ).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  function handleResponseChange(questionId: string, value: ResponseValue) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function handleSkipQuestion(questionId: string) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: null, // null = skipped
    }));
    // Auto-advance to next question
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleNext() {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const isFirstQuestion = currentStep === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar perguntas obrigatórias (exceto as com allow_skip)
      for (const question of questions) {
        const hasResponse = responses[question.id] !== undefined && responses[question.id] !== "";

        if (question.is_required && !hasResponse && !question.allow_skip) {
          const questionText = question.text || question.question_text || '';
          throw new Error(`Por favor, responda: "${questionText}"`);
        }
      }

      const supabase = createClient();

      // Gerar anonymous_id único para este respondente
      const anonymousId = uuidv4();

      // Preparar e inserir respostas
      const responsesToInsert = questions.map((question) => {
        let responseValue = responses[question.id];
        let numericValue: number | null = null;

        // Se for null (skipped), armazenar como string vazia
        if (responseValue === null || responseValue === undefined) {
          responseValue = "";
        }

        // Converter array para string separada por vírgulas se for multiple_choice
        if (Array.isArray(responseValue)) {
          responseValue = responseValue.join(", ");
        }

        // Converter para string se não for
        if (typeof responseValue !== "string") {
          responseValue = String(responseValue);
        }

        // Extrair valor numérico para likert_scale e outros tipos numéricos
        const questionType = question.type || question.question_type;
        if (questionType === "likert_scale" || questionType === "rating" || questionType === "numeric") {
          const parsed = parseInt(responseValue, 10);
          if (!isNaN(parsed)) {
            numericValue = parsed;
          }
        }

        return {
          assessment_id: assessmentId,
          question_id: question.id,
          response_text: responseValue,
          value: numericValue,
          anonymous_id: anonymousId,
        };
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from("responses")
        .insert(responsesToInsert);

      if (insertError) throw insertError;

      // Dispatch response_received event to n8n (fire and forget)
      dispatchResponseReceived({
        assessmentId,
        anonymousId,
      }).catch((err) => {
        console.error('[ResponseForm] Failed to dispatch event:', err);
      });

      // Sucesso!
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao enviar respostas. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Tela de introdução/LGPD
  if (showIntroduction && (questionnaire.introduction_text || questionnaire.lgpd_consent_text)) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold text-text-heading">
          Pesquisa
        </h1>
        <QuestionnaireIntroduction
          title={questionnaire.title}
          introductionText={questionnaire.introduction_text}
          lgpdConsentText={questionnaire.lgpd_consent_text}
          onAccept={() => setShowIntroduction(false)}
        />
      </div>
    );
  }

  // Tela de sucesso
  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-heading mb-2">
            Respostas Enviadas com Sucesso!
          </h2>
          <p className="text-text-secondary mb-6">
            Obrigado por participar desta avaliação. Suas respostas foram
            registradas de forma anônima.
          </p>
          <Button onClick={() => router.push("/")}>Voltar para Home</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-heading">
                Pergunta {currentStep + 1} de {questions.length}
              </span>
              <span className="text-text-muted">
                {answeredCount} de {questions.length} respondidas
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card key={currentQuestion.id}>
          <CardContent className="pt-6">
            <QuestionRenderer
              question={currentQuestion}
              questionNumber={currentStep + 1}
              value={responses[currentQuestion.id]}
              onChange={(value) => handleResponseChange(currentQuestion.id, value)}
              onSkip={
                currentQuestion.allow_skip
                  ? () => handleSkipQuestion(currentQuestion.id)
                  : undefined
              }
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion || loading}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {!isLastQuestion ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex-1"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Respostas
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
