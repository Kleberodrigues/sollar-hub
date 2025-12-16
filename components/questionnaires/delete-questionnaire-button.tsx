"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DeleteQuestionnaireButtonProps {
  questionnaireId: string;
}

export function DeleteQuestionnaireButton({
  questionnaireId,
}: DeleteQuestionnaireButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setLoading(true);

    try {
      const supabase = createClient();

      // Deletar questionário (cascade vai deletar perguntas)
      const { error } = await supabase
        .from("questionnaires")
        .delete()
        .eq("id", questionnaireId);

      if (error) throw error;

      router.push("/dashboard/questionnaires");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      // Verificar se é erro de questionario protegido (trigger do banco)
      if (message.includes("protegido") || message.includes("portaria")) {
        alert("Este questionário é protegido pela Portaria NR-1 e não pode ser excluído.");
      } else {
        alert("Erro ao deletar questionário: " + message);
      }
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">Confirmar exclusão?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deletando..." : "Sim, deletar"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      className="gap-2"
      onClick={() => setShowConfirm(true)}
    >
      <Trash2 className="w-4 h-4" />
      Deletar
    </Button>
  );
}
