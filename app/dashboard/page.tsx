import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ClipboardList, BarChart3, Users } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  // Buscar métricas
  const [
    { count: questionnairesCount },
    { count: assessmentsCount },
    { count: responsesCount },
    { count: teamCount },
  ] = await Promise.all([
    supabase
      .from("questionnaires")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile?.organization_id || ""),
    supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile?.organization_id || ""),
    supabase
      .from("responses")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile?.organization_id || ""),
  ]);

  const metrics = [
    {
      title: "Questionários",
      value: questionnairesCount || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Assessments Ativos",
      value: assessmentsCount || 0,
      icon: ClipboardList,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Respostas Coletadas",
      value: responsesCount || 0,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Membros da Equipe",
      value: teamCount || 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-heading">Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Visão geral da sua organização
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-muted">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-text-heading mt-2">
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cards informativos */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🎯 Primeiros Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Comece criando seu primeiro questionário de avaliação psicossocial:
            </p>
            <ol className="space-y-2 text-sm text-text-secondary">
              <li>1. Crie um questionário na seção "Questionários"</li>
              <li>2. Adicione perguntas sobre riscos psicossociais</li>
              <li>3. Crie um assessment e gere um link público</li>
              <li>4. Compartilhe o link com sua equipe</li>
              <li>5. Acompanhe as respostas e análises</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Funcionalidades disponíveis:
            </p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <span className="font-medium text-green-600">✓</span>{" "}
                Autenticação e segurança
              </li>
              <li>
                <span className="font-medium text-green-600">✓</span> Dashboard
                com métricas
              </li>
              <li>
                <span className="font-medium text-yellow-600">○</span>{" "}
                Gestão de questionários
              </li>
              <li>
                <span className="font-medium text-yellow-600">○</span>{" "}
                Assessments e links públicos
              </li>
              <li>
                <span className="font-medium text-yellow-600">○</span> Análise
                de riscos
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Informações do perfil */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase">
                Nome
              </p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {profile?.full_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase">
                Email
              </p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase">
                Perfil de Acesso
              </p>
              <p className="text-sm font-medium text-text-primary mt-1 capitalize">
                {profile?.role}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase">
                Organização
              </p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {profile?.organizations?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase">
                Membro desde
              </p>
              <p className="text-sm font-medium text-text-primary mt-1">
                {new Date(profile?.created_at || "").toLocaleDateString(
                  "pt-BR"
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
