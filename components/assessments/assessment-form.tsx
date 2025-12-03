"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface AssessmentFormProps {
  organizationId: string;
  questionnaires: Array<{ id: string; title: string }>;
  departments: Array<{ id: string; name: string }>;
  assessment?: {
    id: string;
    title: string;
    questionnaire_id: string;
    department_id: string | null;
    start_date: string;
    end_date: string | null;
    status: string;
  };
}

export function AssessmentForm({
  organizationId,
  questionnaires,
  departments,
  assessment,
}: AssessmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    title: assessment?.title || "",
    questionnaire_id: assessment?.questionnaire_id || "",
    department_id: assessment?.department_id || "",
    start_date: assessment?.start_date || today,
    end_date: assessment?.end_date || "",
    status: assessment?.status || "draft",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Validações
      if (!formData.questionnaire_id) {
        throw new Error("Selecione um questionário");
      }

      if (!formData.title.trim()) {
        throw new Error("Digite um título para o assessment");
      }

      const assessmentData = {
        organization_id: organizationId,
        title: formData.title,
        questionnaire_id: formData.questionnaire_id,
        department_id: formData.department_id || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
      };

      if (assessment) {
        // Atualizar assessment existente
        const { error: updateError } = await supabase
          .from("assessments")
          .update({
            ...assessmentData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assessment.id);

        if (updateError) throw updateError;

        router.push(`/dashboard/assessments/${assessment.id}`);
        router.refresh();
      } else {
        // Criar novo assessment
        const { data, error: insertError } = await supabase
          .from("assessments")
          .insert(assessmentData)
          .select()
          .single();

        if (insertError) throw insertError;

        router.push(`/dashboard/assessments/${data.id}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Erro ao salvar assessment:", err);
      setError(err.message || "Erro ao salvar assessment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título do Assessment <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Avaliação Q1 2024"
              required
              disabled={loading}
            />
          </div>

          {/* Questionário */}
          <div className="space-y-2">
            <Label htmlFor="questionnaire_id">
              Questionário <span className="text-red-500">*</span>
            </Label>
            {questionnaires.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Nenhum questionário ativo encontrado. Crie um questionário
                  primeiro.
                </p>
                <Link href="/dashboard/questionnaires/new">
                  <Button type="button" variant="outline" size="sm" className="mt-2">
                    Criar Questionário
                  </Button>
                </Link>
              </div>
            ) : (
              <select
                id="questionnaire_id"
                value={formData.questionnaire_id}
                onChange={(e) =>
                  setFormData({ ...formData, questionnaire_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-sollar-green-dark"
                required
                disabled={loading}
              >
                <option value="">Selecione um questionário</option>
                {questionnaires.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Departamento (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="department_id">
              Departamento (opcional - deixe vazio para toda organização)
            </Label>
            <select
              id="department_id"
              value={formData.department_id}
              onChange={(e) =>
                setFormData({ ...formData, department_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-sollar-green-dark"
              disabled={loading}
            >
              <option value="">Toda a organização</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Período */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Data de Início <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término (opcional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                min={formData.start_date}
                disabled={loading}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-sollar-green-dark"
              required
              disabled={loading}
            >
              <option value="draft">Rascunho (não visível)</option>
              <option value="active">Ativo (aceita respostas)</option>
              <option value="closed">Fechado (não aceita mais respostas)</option>
            </select>
            <p className="text-xs text-text-muted">
              Apenas assessments ativos podem receber respostas pelo link público
            </p>
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
        <Link href="/dashboard/assessments">
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        <Button type="submit" disabled={loading || questionnaires.length === 0} className="gap-2">
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Assessment"}
        </Button>
      </div>
    </form>
  );
}
