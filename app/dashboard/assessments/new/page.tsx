import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentForm } from "@/components/assessments/assessment-form";
import { TEMPLATE_IDS_ARRAY } from "@/lib/constants/questionnaire-templates";

export default async function NewAssessmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil do usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single() as any);

  if (!profile) {
    redirect("/login");
  }

  // Verificar se usuário pode criar assessments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManage = ["admin", "manager"].includes((profile as any).role);

  if (!canManage) {
    redirect("/dashboard/assessments");
  }

  // Buscar questionários: templates padrão NR-1/NR-17 OU da organização do usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: questionnaires } = await (supabase
    .from("questionnaires")
    .select("id, title")
    .or(`organization_id.eq.${profile.organization_id},id.in.(${TEMPLATE_IDS_ARRAY.join(',')})`)
    .eq("is_active", true)
    .order("title") as any);

  // Buscar departamentos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: departments } = await (supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", profile.organization_id)
    .order("name") as any);

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
