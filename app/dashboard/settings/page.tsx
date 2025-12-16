import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPageContent } from "@/components/settings/SettingsPageContent";
import { getSettings } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Verificar autenticacao
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se e admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!profile || (profile as any).role !== "admin") {
    redirect("/dashboard");
  }

  // Buscar configuracoes
  const settings = await getSettings();

  if (settings.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erro ao carregar configuracoes: {settings.error}</p>
        </div>
      </div>
    );
  }

  return (
    <SettingsPageContent
      organization={settings.organization}
      profile={settings.profile}
      email={settings.email}
    />
  );
}
