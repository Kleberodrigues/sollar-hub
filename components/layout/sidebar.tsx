"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  Building2,
  Settings,
} from "lucide-react";

interface SidebarProps {
  userRole: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "member", "viewer"],
  },
  {
    title: "Questionários",
    href: "/dashboard/questionnaires",
    icon: FileText,
    roles: ["admin", "manager"],
  },
  {
    title: "Assessments",
    href: "/dashboard/assessments",
    icon: ClipboardList,
    roles: ["admin", "manager", "member", "viewer"],
  },
  {
    title: "Análise de Riscos",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin", "manager", "viewer"],
  },
  {
    title: "Departamentos",
    href: "/dashboard/departments",
    icon: Building2,
    roles: ["admin", "manager"],
  },
  {
    title: "Usuários",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  // Filtrar itens baseado no role do usuário
  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-white border-r border-border-light flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border-light">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sollar-green-dark rounded-md flex items-center justify-center">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <span className="text-lg font-semibold text-text-heading">
            Sollar Insight
          </span>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-1">
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
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sollar-green-light text-sollar-green-dark"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer com role badge */}
      <div className="p-4 border-t border-border-light">
        <div className="px-4 py-2 bg-bg-secondary rounded-lg">
          <p className="text-xs font-medium text-text-muted uppercase">
            Seu Perfil
          </p>
          <p className="text-sm font-semibold text-text-primary capitalize mt-1">
            {userRole}
          </p>
        </div>
      </div>
    </aside>
  );
}
