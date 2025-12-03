"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { Send, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  is_required: boolean;
  order_index: number;
}

interface AssessmentResponseFormProps {
  assessmentId: string;
  questions: Question[];
}

export function AssessmentResponseForm({
  assessmentId,
  questions,
}: AssessmentResponseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Estado para armazenar respostas
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Calcular progresso
  const answeredCount = Object.keys(responses).filter(
    (key) => responses[key] !== undefined && responses[key] !== "" &&
    (Array.isArray(responses[key]) ? responses[key].length > 0 : true)
  ).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  function handleResponseChange(questionId: string, value: any) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function handleMultipleChoiceChange(questionId: string, option: string) {
    const current = responses[questionId] || [];
    const newValue = current.includes(option)
      ? current.filter((o: string) => o !== option)
      : [...current, option];

    setResponses((prev) => ({
      ...prev,
      [questionId]: newValue,
    }));
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
      // Validar perguntas obrigatórias
      for (const question of questions) {
        if (question.is_required && !responses[question.id]) {
          throw new Error(`Por favor, responda: "${question.question_text}"`);
        }
      }

      const supabase = createClient();

      // Gerar anonymous_id único para este respondente
      const anonymousId = uuidv4();

      // Preparar e inserir respostas
      const responsesToInsert = questions.map((question) => {
        let responseValue = responses[question.id];

        // Converter array para string separada por vírgulas se for multiple_choice
        if (
          question.question_type === "multiple_choice" &&
          Array.isArray(responseValue)
        ) {
          responseValue = responseValue.join(", ");
        }

        // Converter para string se não for
        if (typeof responseValue !== "string") {
          responseValue = String(responseValue || "");
        }

        return {
          assessment_id: assessmentId,
          question_id: question.id,
          response_text: responseValue,
          anonymous_id: anonymousId,
        };
      });

      const { error: insertError } = await supabase
        .from("responses")
        .insert(responsesToInsert);

      if (insertError) throw insertError;

      // Sucesso!
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erro ao enviar respostas:", err);
      setError(err.message || "Erro ao enviar respostas. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
            <div className="mb-4">
              <Label className="text-base font-semibold">
                {currentStep + 1}. {currentQuestion.question_text}
                {currentQuestion.is_required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
            </div>

            {/* Text */}
            {currentQuestion.question_type === "text" && (
              <Input
                value={responses[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleResponseChange(currentQuestion.id, e.target.value)
                }
                placeholder="Digite sua resposta..."
                required={currentQuestion.is_required}
                disabled={loading}
              />
            )}

            {/* Textarea */}
            {currentQuestion.question_type === "textarea" && (
              <Textarea
                value={responses[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleResponseChange(currentQuestion.id, e.target.value)
                }
                placeholder="Digite sua resposta..."
                rows={4}
                required={currentQuestion.is_required}
                disabled={loading}
              />
            )}

            {/* Single Choice */}
            {currentQuestion.question_type === "single_choice" && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="radio"
                      id={`${currentQuestion.id}-${idx}`}
                      name={currentQuestion.id}
                      value={option}
                      checked={responses[currentQuestion.id] === option}
                      onChange={(e) =>
                        handleResponseChange(currentQuestion.id, e.target.value)
                      }
                      required={currentQuestion.is_required}
                      disabled={loading}
                      className="w-4 h-4 text-sollar-green-dark"
                    />
                    <Label
                      htmlFor={`${currentQuestion.id}-${idx}`}
                      className="ml-2 font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Multiple Choice */}
            {currentQuestion.question_type === "multiple_choice" && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${currentQuestion.id}-${idx}`}
                      checked={(responses[currentQuestion.id] || []).includes(option)}
                      onChange={() =>
                        handleMultipleChoiceChange(currentQuestion.id, option)
                      }
                      disabled={loading}
                      className="w-4 h-4 text-sollar-green-dark rounded"
                    />
                    <Label
                      htmlFor={`${currentQuestion.id}-${idx}`}
                      className="ml-2 font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Likert Scale */}
            {(currentQuestion.question_type === "likert_5" ||
              currentQuestion.question_type === "likert_7") && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="radio"
                      id={`${currentQuestion.id}-${idx}`}
                      name={currentQuestion.id}
                      value={option}
                      checked={responses[currentQuestion.id] === option}
                      onChange={(e) =>
                        handleResponseChange(currentQuestion.id, e.target.value)
                      }
                      required={currentQuestion.is_required}
                      disabled={loading}
                      className="w-4 h-4 text-sollar-green-dark"
                    />
                    <Label
                      htmlFor={`${currentQuestion.id}-${idx}`}
                      className="ml-2 font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Number */}
            {currentQuestion.question_type === "number" && (
              <Input
                type="number"
                value={responses[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleResponseChange(currentQuestion.id, e.target.value)
                }
                placeholder="Digite um número..."
                required={currentQuestion.is_required}
                disabled={loading}
              />
            )}

            {/* Date */}
            {currentQuestion.question_type === "date" && (
              <Input
                type="date"
                value={responses[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleResponseChange(currentQuestion.id, e.target.value)
                }
                required={currentQuestion.is_required}
                disabled={loading}
              />
            )}
          </CardContent>
        </Card>

        {/* Erro */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Botões de Navegação */}
        <Card>
          <CardContent className="py-6">
            <div className="flex gap-4">
              {/* Botão Anterior */}
              <Button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstQuestion || loading}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Anterior
              </Button>

              {/* Botão Próximo ou Enviar */}
              {isLastQuestion ? (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Send className="w-5 h-5" />
                  {loading ? "Enviando..." : "Enviar Respostas"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  size="lg"
                  className="flex-1"
                >
                  Próxima
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>

            {isLastQuestion && (
              <p className="text-xs text-text-muted text-center mt-4">
                Ao enviar, você confirma que suas respostas são anônimas e serão
                usadas apenas para fins de análise organizacional.
              </p>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
