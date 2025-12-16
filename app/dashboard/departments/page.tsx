import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DepartmentsPageContent } from "@/components/departments/DepartmentsPageContent";
import { listDepartments, seedDepartments } from "./actions";

export default async function DepartmentsPage() {
  const supabase = await createClient();

  // Verificar autenticacao
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se e admin ou manager
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("role, organization_id, organizations(name)")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!profile || !["admin", "manager"].includes((profile as any).role)) {
    redirect("/dashboard");
  }

  // Buscar departamentos
  let result = await listDepartments();

  // Auto-seed departments if less than 3 exist
  if (!result.error && result.departments.length < 3) {
    await seedDepartments();
    // Reload departments after seeding
    result = await listDepartments();
  }

  if (result.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erro ao carregar departamentos: {result.error}</p>
        </div>
      </div>
    );
  }

  const departments = result.departments || [];
  const orgData = profile.organizations;
  const organizationName =
    orgData && typeof orgData === "object" && !Array.isArray(orgData)
      ? (orgData as { name: string }).name
      : Array.isArray(orgData) && orgData.length > 0
      ? (orgData[0] as { name: string }).name
      : "Organizacao";

  return (
    <DepartmentsPageContent
      departments={departments}
      organizationName={organizationName}
    />
  );
}
