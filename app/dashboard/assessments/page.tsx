import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import Link from "next/link";
import { AssessmentCard } from "@/components/assessments/assessment-card";

export default async function AssessmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const canManage = ["admin", "manager"].includes(profile.role);

  // Buscar assessments da organização
  const { data: assessments, error } = await supabase
    .from("assessments")
    .select(
      `
      *,
      questionnaires (
        id,
        title
      ),
      departments (
        id,
        name
      ),
      responses:responses(count)
    `
    )
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar assessments:", error);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-heading">Assessments</h1>
          <p className="text-text-secondary mt-1">
            Gerencie avaliações e colete respostas
          </p>
        </div>

        {canManage && (
          <Link href="/dashboard/assessments/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Assessment
            </Button>
          </Link>
        )}
      </div>

      {/* Lista de assessments */}
      {!assessments || assessments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ClipboardList className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-heading mb-2">
                Nenhum assessment encontrado
              </h3>
              <p className="text-text-secondary mb-6">
                Crie um assessment para começar a coletar respostas.
              </p>
              {canManage && (
                <Link href="/dashboard/assessments/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Assessment
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
