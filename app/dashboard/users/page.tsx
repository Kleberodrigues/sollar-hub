import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserList } from "@/components/users/UserList";
import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { UsersPageContent, UsersErrorState } from "@/components/users/UsersPageContent";
import { listOrganizationUsers } from "./actions";
import type { PlanType } from "@/lib/stripe/config";

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
  // Permitir acesso para admin, responsavel_empresa, membro e super_admin
  const allowedRoles = ["admin", "responsavel_empresa", "membro"];
  const canAccessUsersPage = profileData && (
    allowedRoles.includes(profileData.role) ||
    profileData.is_super_admin
  );
  if (!canAccessUsersPage) {
    redirect("/dashboard");
  }

  // Buscar usuários da organização
  const result = await listOrganizationUsers();

  if (result.error) {
    return <UsersErrorState error={result.error} />;
  }

  const users = result.users || [];
  const orgData = profile.organizations;
  const organizationName =
    orgData && typeof orgData === "object" && !Array.isArray(orgData)
      ? (orgData as { name: string }).name
      : Array.isArray(orgData) && orgData.length > 0
      ? (orgData[0] as { name: string }).name
      : "Organização";

  // Buscar plano atual da organização
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription } = await (supabase
    .from("subscriptions")
    .select("plan")
    .eq("organization_id", profileData.organization_id)
    .single() as any);

  const currentPlan: PlanType = subscription?.plan || 'base';

  // Contar membros e gerentes atuais para limitar convites
  const memberCount = users.filter((u: { role: string }) => u.role === "membro").length;
  const managerCount = users.filter((u: { role: string }) => u.role === "responsavel_empresa").length;

  // Apenas responsavel_empresa e super_admin podem convidar novos usuários
  const canInviteUsers = profileData.role === "responsavel_empresa" || profileData.is_super_admin;

  return (
    <UsersPageContent
      users={users}
      organizationName={organizationName}
      inviteDialog={canInviteUsers ? <InviteUserDialog memberCount={memberCount} managerCount={managerCount} currentPlan={currentPlan} /> : null}
      userList={<UserList users={users} />}
    />
  );
}
