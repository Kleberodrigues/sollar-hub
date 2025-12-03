import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentForm } from "@/components/assessments/assessment-form";

export default async function NewAssessmentPage() {
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
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Verificar se usuário pode criar assessments
  const canManage = ["admin", "manager"].includes(profile.role);

  if (!canManage) {
    redirect("/dashboard/assessments");
  }

  // Buscar questionários disponíveis
  const { data: questionnaires } = await supabase
    .from("questionnaires")
    .select("id, title")
    .eq("organization_id", profile.organization_id)
    .eq("is_active", true)
    .order("title");

  // Buscar departamentos
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", profile.organization_id)
    .order("name");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-heading">
          Novo Assessment
        </h1>
        <p className="text-text-secondary mt-1">
          Crie um novo assessment para coletar respostas
        </p>
      </div>

      {/* Form */}
      <AssessmentForm
        organizationId={profile.organization_id!}
        questionnaires={questionnaires || []}
        departments={departments || []}
      />
    </div>
  );
}
