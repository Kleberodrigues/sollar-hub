import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
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
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const organizationName =
    profile.organizations && typeof profile.organizations === "object"
      ? (profile.organizations as { name: string }).name
      : "Organização";

  return (
    <DashboardLayoutClient
      userRole={profile.role}
      userName={profile.full_name || "Usuário"}
      organizationName={organizationName}
    >
      {children}
    </DashboardLayoutClient>
  );
}
