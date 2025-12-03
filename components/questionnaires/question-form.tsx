"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";

interface QuestionFormProps {
  questionnaireId: string;
  defaultOrderIndex?: number;
  question?: {
    id: string;
    question_text: string;
    question_type: string;
    options: string[] | null;
    is_required: boolean;
    order_index: number;
  };
}

const QUESTION_TYPES = [
  { value: "text", label: "Texto Curto" },
  { value: "textarea", label: "Texto Longo" },
  { value: "single_choice", label: "Múltipla Escolha (uma resposta)" },
  { value: "multiple_choice", label: "Múltipla Escolha (várias respostas)" },
  { value: "likert_5", label: "Escala Likert (1-5)" },
  { value: "likert_7", label: "Escala Likert (1-7)" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
];

export function QuestionForm({
  questionnaireId,
  defaultOrderIndex = 1,
  question,
}: QuestionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    question_text: question?.question_text || "",
    question_type: question?.question_type || "text",
    is_required: question?.is_required ?? true,
    order_index: question?.order_index || defaultOrderIndex,
    options: question?.options || [],
  });

  const [newOption, setNewOption] = useState("");

  // Tipos de pergunta que precisam de opções
  const needsOptions = ["single_choice", "multiple_choice"].includes(
    formData.question_type
  );

  // Tipos de pergunta que já têm opções predefinidas (Likert)
  const hasFixedOptions = ["likert_5", "likert_7"].includes(
    formData.question_type
  );

  function addOption() {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()],
      });
      setNewOption("");
    }
  }

  function removeOption(index: number) {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar opções para tipos que precisam
    if (needsOptions && formData.options.length === 0) {
      setError("Adicione pelo menos uma opção para este tipo de pergunta");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Preparar opções baseado no tipo
      let options = null;
      if (needsOptions) {
        options = formData.options;
      } else if (formData.question_type === "likert_5") {
        options = [
          "1 - Discordo Totalmente",
          "2 - Discordo",
          "3 - Neutro",
          "4 - Concordo",
          "5 - Concordo Totalmente",
        ];
      } else if (formData.question_type === "likert_7") {
        options = [
          "1 - Discordo Totalmente",
          "2 - Discordo",
          "3 - Discordo Parcialmente",
          "4 - Neutro",
          "5 - Concordo Parcialmente",
          "6 - Concordo",
          "7 - Concordo Totalmente",
        ];
      }

      if (question) {
        // Atualizar pergunta existente
        const { error: updateError } = await supabase
          .from("questions")
          .update({
            question_text: formData.question_text,
            question_type: formData.question_type,
            options,
            is_required: formData.is_required,
            order_index: formData.order_index,
          })
          .eq("id", question.id);

        if (updateError) throw updateError;

        router.push(`/dashboard/questionnaires/${questionnaireId}`);
        router.refresh();
      } else {
        // Criar nova pergunta
        const { error: insertError } = await supabase.from("questions").insert({
          questionnaire_id: questionnaireId,
          question_text: formData.question_text,
          question_type: formData.question_type,
          options,
          is_required: formData.is_required,
          order_index: formData.order_index,
        });

        if (insertError) throw insertError;

        router.push(`/dashboard/questionnaires/${questionnaireId}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Erro ao salvar pergunta:", err);
      setError(err.message || "Erro ao salvar pergunta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Texto da Pergunta */}
          <div className="space-y-2">
            <Label htmlFor="question_text">
              Texto da Pergunta <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              placeholder="Digite a pergunta..."
              rows={3}
              required
              disabled={loading}
            />
          </div>

          {/* Tipo de Pergunta */}
          <div className="space-y-2">
            <Label htmlFor="question_type">
              Tipo de Pergunta <span className="text-red-500">*</span>
            </Label>
            <select
              id="question_type"
              value={formData.question_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  question_type: e.target.value,
                  options: [], // Reset options quando muda o tipo
                })
              }
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-sollar-green-dark"
              required
              disabled={loading}
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Opções (para múltipla escolha) */}
          {needsOptions && (
            <div className="space-y-2">
              <Label>
                Opções de Resposta <span className="text-red-500">*</span>
              </Label>

              {/* Lista de opções */}
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={option} disabled className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Adicionar nova opção */}
              <div className="flex items-center gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Digite uma opção..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={loading}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>

              <p className="text-xs text-text-muted">
                Pressione Enter ou clique em Adicionar para incluir cada opção
              </p>
            </div>
          )}

          {/* Info para Likert */}
          {hasFixedOptions && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                As opções da escala Likert serão criadas automaticamente.
              </p>
            </div>
          )}

          {/* Ordem */}
          <div className="space-y-2">
            <Label htmlFor="order_index">Ordem de Exibição</Label>
            <Input
              id="order_index"
              type="number"
              min="1"
              value={formData.order_index}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order_index: parseInt(e.target.value) || 1,
                })
              }
              disabled={loading}
            />
          </div>

          {/* Obrigatória */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_required"
              checked={formData.is_required}
              onChange={(e) =>
                setFormData({ ...formData, is_required: e.target.checked })
              }
              className="w-4 h-4 text-sollar-green-dark rounded border-gray-300 focus:ring-sollar-green-dark"
              disabled={loading}
            />
            <Label htmlFor="is_required" className="font-normal cursor-pointer">
              Pergunta obrigatória
            </Label>
          </div>

          {/* Erro */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/questionnaires/${questionnaireId}`}>
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Pergunta"}
        </Button>
      </div>
    </form>
  );
}
