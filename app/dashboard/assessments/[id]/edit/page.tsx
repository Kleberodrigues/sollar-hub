import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AssessmentForm } from "@/components/assessments/assessment-form";

export default async function EditAssessmentPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Verificar se usuário pode editar assessments
  const canManage = ["admin", "manager"].includes(profile.role);

  if (!canManage) {
    redirect("/dashboard/assessments");
  }

  // Buscar assessment
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (error || !assessment) {
    notFound();
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
          Editar Assessment
        </h1>
        <p className="text-text-secondary mt-1">
          Atualize as informações do assessment
        </p>
      </div>

      {/* Form */}
      <AssessmentForm
        organizationId={profile.organization_id!}
        questionnaires={questionnaires || []}
        departments={departments || []}
        assessment={{
          id: assessment.id,
          title: assessment.title,
          questionnaire_id: assessment.questionnaire_id,
          department_id: assessment.department_id,
          start_date: assessment.start_date,
          end_date: assessment.end_date,
          status: assessment.status,
        }}
      />
    </div>
  );
}
