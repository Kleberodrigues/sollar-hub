"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SunIcon } from "@/components/Logo";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  Building2,
  Settings,
  CreditCard,
  Shield,
} from "lucide-react";

interface SidebarProps {
  userRole: string;
  isSuperAdmin?: boolean;
}

// Role labels for display
const ROLE_LABELS: Record<string, string> = {
  admin: "Super Admin",
  responsavel_empresa: "Responsável",
  membro: "Membro",
};

const navigationItems = [
  {
    title: "Página Inicial",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "responsavel_empresa", "membro"],
  },
  {
    title: "Questionários",
    href: "/dashboard/questionnaires",
    icon: FileText,
    roles: ["admin", "responsavel_empresa"],
  },
  {
    title: "Avaliações",
    href: "/dashboard/assessments",
    icon: ClipboardList,
    roles: ["admin", "responsavel_empresa", "membro"],
  },
  {
    title: "Análise de Riscos",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin", "responsavel_empresa", "membro"],
  },
  {
    title: "Departamentos",
    href: "/dashboard/departments",
    icon: Building2,
    roles: ["admin", "responsavel_empresa"],
  },
  {
    title: "Usuários",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin", "responsavel_empresa"],
  },
  {
    title: "Assinatura",
    href: "/dashboard/configuracoes/billing",
    icon: CreditCard,
    roles: ["admin", "responsavel_empresa"],
  },
  {
    title: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "responsavel_empresa"],
  },
];

export function Sidebar({ userRole, isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  // Filtrar itens baseado no role do usuário
  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-white border-r border-border-light flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border-light">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/20 flex items-center justify-center">
            <SunIcon size={24} className="text-pm-terracotta" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-display font-bold relative">
              <span className="text-pm-olive">Psico</span>
              <span className="text-pm-terracotta">Mapa</span>
            </span>
            <span className="text-xs text-text-muted -mt-1">
              Diagnóstico NR-1
            </span>
          </div>
        </Link>
      </div>

      {/* Link Admin para Super Admins */}
      {isSuperAdmin && (
        <div className="px-4 pt-4">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              "bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-700 border border-purple-200",
              "hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-300"
            )}
          >
            <Shield className="w-5 h-5" />
            <span>Painel Admin</span>
          </Link>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-pm-terracotta/10 text-pm-terracotta border-l-4 border-pm-terracotta"
                  : "text-text-secondary hover:bg-bg-sage hover:text-text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-pm-terracotta")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer com role badge */}
      <div className="p-4 border-t border-border-light">
        <div className="px-4 py-3 bg-gradient-to-r from-bg-sage to-[#fff5e9] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pm-olive/20 flex items-center justify-center">
              <SunIcon size={16} className="text-pm-olive" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">
                Seu Perfil
              </p>
              <p className="text-sm font-semibold text-text-heading">
                {ROLE_LABELS[userRole] || userRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
