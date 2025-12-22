import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserList } from "@/components/users/UserList";
import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { BulkImportDialog } from "@/components/users/BulkImportDialog";
import { UsersPageContent, UsersErrorState } from "@/components/users/UsersPageContent";
import { listOrganizationUsers } from "./actions";
import { getOrganizationDepartments } from "./bulk-import-actions";

export default async function UsersPage() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se é responsavel_empresa ou super_admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("role, organization_id, is_super_admin, organizations(name)")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileData = profile as any;
  if (!profileData || (profileData.role !== "responsavel_empresa" && !profileData.is_super_admin)) {
    redirect("/dashboard");
  }

  // Buscar usuários da organização e departamentos
  const [result, deptResult] = await Promise.all([
    listOrganizationUsers(),
    getOrganizationDepartments(),
  ]);

  if (result.error) {
    return <UsersErrorState error={result.error} />;
  }

  const users = result.users || [];
  const departments = deptResult.departments || [];
  const orgData = profile.organizations;
  const organizationName =
    orgData && typeof orgData === "object" && !Array.isArray(orgData)
      ? (orgData as { name: string }).name
      : Array.isArray(orgData) && orgData.length > 0
      ? (orgData[0] as { name: string }).name
      : "Organização";

  return (
    <UsersPageContent
      users={users}
      organizationName={organizationName}
      inviteDialog={<InviteUserDialog />}
      bulkImportDialog={<BulkImportDialog departments={departments} />}
      userList={<UserList users={users} />}
    />
  );
}
