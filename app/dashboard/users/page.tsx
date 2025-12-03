import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserList } from "@/components/users/UserList";
import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listOrganizationUsers } from "./actions";

export default async function UsersPage() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se é admin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, organization_id, organizations(name)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Buscar usuários da organização
  const result = await listOrganizationUsers();

  if (result.error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const users = result.users || [];
  const organizationName =
    profile.organizations && typeof profile.organizations === "object"
      ? (profile.organizations as { name: string }).name
      : "Organização";

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-heading">
              Gerenciar Usuários
            </h1>
            <p className="text-text-secondary mt-1">
              {organizationName} • {users.length}{" "}
              {users.length === 1 ? "usuário" : "usuários"}
            </p>
          </div>
          <InviteUserDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Usuários</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Administradores</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter((u) => u.role === "admin").length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gerentes</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter((u) => u.role === "manager").length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Membros</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter((u) => u.role === "member").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários da Organização</CardTitle>
            <CardDescription>
              Gerencie os membros, altere roles e controle o acesso à
              plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserList users={users} />
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sobre os Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong className="text-text-heading">Administrador:</strong>{" "}
                <span className="text-text-secondary">
                  Acesso total ao sistema, incluindo gestão de usuários e
                  configurações
                </span>
              </div>
              <div>
                <strong className="text-text-heading">Gerente:</strong>{" "}
                <span className="text-text-secondary">
                  Pode criar e gerenciar diagnósticos, visualizar relatórios
                </span>
              </div>
              <div>
                <strong className="text-text-heading">Membro:</strong>{" "}
                <span className="text-text-secondary">
                  Pode visualizar diagnósticos e responder questionários
                </span>
              </div>
              <div>
                <strong className="text-text-heading">Visualizador:</strong>{" "}
                <span className="text-text-secondary">
                  Apenas visualização de diagnósticos e relatórios
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-text-secondary">
              <p>
                ✅ Todos os dados são isolados por organização (RLS
                multi-tenant)
              </p>
              <p>✅ Apenas administradores podem gerenciar usuários</p>
              <p>
                ✅ Usuários desativados não podem mais acessar a plataforma
              </p>
              <p>
                ✅ Alterações de role são aplicadas imediatamente no próximo
                login
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
