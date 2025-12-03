"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Send, CheckCircle } from "lucide-react";
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

  // Estado para armazenar respostas
  const [responses, setResponses] = useState<Record<string, any>>({});

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardContent className="pt-6">
            <div className="mb-4">
              <Label className="text-base font-semibold">
                {index + 1}. {question.question_text}
                {question.is_required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
            </div>

            {/* Text */}
            {question.question_type === "text" && (
              <Input
                value={responses[question.id] || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                placeholder="Digite sua resposta..."
                required={question.is_required}
                disabled={loading}
              />
            )}

            {/* Textarea */}
            {question.question_type === "textarea" && (
              <Textarea
                value={responses[question.id] || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                placeholder="Digite sua resposta..."
                rows={4}
                required={question.is_required}
                disabled={loading}
              />
            )}

            {/* Single Choice */}
            {question.question_type === "single_choice" && (
              <div className="space-y-2">
                {question.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="radio"
                      id={`${question.id}-${idx}`}
                      name={question.id}
                      value={option}
                      checked={responses[question.id] === option}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                      required={question.is_required}
                      disabled={loading}
                      className="w-4 h-4 text-sollar-green-dark"
                    />
                    <Label
                      htmlFor={`${question.id}-${idx}`}
                      className="ml-2 font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Multiple Choice */}
            {question.question_type === "multiple_choice" && (
              <div className="space-y-2">
                {question.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${question.id}-${idx}`}
                      checked={(responses[question.id] || []).includes(option)}
                      onChange={() =>
                        handleMultipleChoiceChange(question.id, option)
                      }
                      disabled={loading}
                      className="w-4 h-4 text-sollar-green-dark rounded"
                    />
                    <Label
                      htmlFor={`${question.id}-${idx}`}
                      className="ml-2 font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Likert Scale */}
            {(question.question_type === "likert_5" ||
              question.question_type === "likert_7") && (
              <div className="space-y-2">
                {question.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="radio"
                      id={`${question.id}-${idx}`}
                      name={question.id}
                      value={option}
                      checked={responses[question.id] === option}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                      required={question.is_required}
                      disabled={loading}
                      className="w-4 h-4 text-sollar-green-dark"
                    />
                    <Label
                      htmlFor={`${question.id}-${idx}`}
                      className="ml-2 font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Number */}
            {question.question_type === "number" && (
              <Input
                type="number"
                value={responses[question.id] || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                placeholder="Digite um número..."
                required={question.is_required}
                disabled={loading}
              />
            )}

            {/* Date */}
            {question.question_type === "date" && (
              <Input
                type="date"
                value={responses[question.id] || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                required={question.is_required}
                disabled={loading}
              />
            )}
          </CardContent>
        </Card>
      ))}

      {/* Erro */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Botão de envio */}
      <Card>
        <CardContent className="py-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2"
            size="lg"
          >
            <Send className="w-5 h-5" />
            {loading ? "Enviando..." : "Enviar Respostas"}
          </Button>

          <p className="text-xs text-text-muted text-center mt-4">
            Ao enviar, você confirma que suas respostas são anônimas e serão
            usadas apenas para fins de análise organizacional.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
