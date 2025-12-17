import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Sollar Admin - Painel da Plataforma",
  description: "Painel administrativo para visualização de métricas da plataforma Sollar",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se é super_admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("user_profiles")
    .select("is_super_admin, full_name")
    .eq("id", user.id)
    .single()) as any;

  if (!profile?.is_super_admin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-bg-secondary">
      {/* Sidebar */}
      <AdminSidebar userName={profile.full_name || user.email || "Super Admin"} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
