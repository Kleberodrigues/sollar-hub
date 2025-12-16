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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single() as any);

  if (!profile) {
    redirect("/login");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileData = profile as any;
  const organizationName =
    profileData.organizations && typeof profileData.organizations === "object"
      ? (profileData.organizations as { name: string }).name
      : "Organização";

  return (
    <DashboardLayoutClient
      userRole={profileData.role}
      userName={profileData.full_name || "Usuário"}
      organizationName={organizationName}
    >
      {children}
    </DashboardLayoutClient>
  );
}
