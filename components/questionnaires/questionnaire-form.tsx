"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface QuestionnaireFormProps {
  organizationId: string;
  questionnaire?: {
    id: string;
    title: string;
    description: string | null;
    is_active: boolean;
  };
}

export function QuestionnaireForm({
  organizationId,
  questionnaire,
}: QuestionnaireFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: questionnaire?.title || "",
    description: questionnaire?.description || "",
    is_active: questionnaire?.is_active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (questionnaire) {
        // Atualizar questionário existente
        const { error: updateError } = await supabase
          .from("questionnaires")
          .update({
            title: formData.title,
            description: formData.description || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", questionnaire.id);

        if (updateError) throw updateError;

        router.push(`/dashboard/questionnaires/${questionnaire.id}`);
        router.refresh();
      } else {
        // Criar novo questionário
        const { data, error: insertError } = await supabase
          .from("questionnaires")
          .insert({
            organization_id: organizationId,
            title: formData.title,
            description: formData.description || null,
            is_active: formData.is_active,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        router.push(`/dashboard/questionnaires/${data.id}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Erro ao salvar questionário:", err);
      setError(err.message || "Erro ao salvar questionário");
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
              Título do Questionário <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Avaliação de Riscos Psicossociais 2024"
              required
              disabled={loading}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva o objetivo deste questionário..."
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-sollar-green-dark rounded border-gray-300 focus:ring-sollar-green-dark"
              disabled={loading}
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Questionário ativo (disponível para uso)
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
        <Link href="/dashboard/questionnaires">
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Questionário"}
        </Button>
      </div>
    </form>
  );
}
