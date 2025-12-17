"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

interface AdminSidebarProps {
  userName?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Organizações",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    name: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Faturamento",
    href: "/admin/billing",
    icon: CreditCard,
  },
  {
    name: "Métricas",
    href: "/admin/metrics",
    icon: TrendingUp,
  },
  {
    name: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-border-light h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-light">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pm-green-dark rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          <div>
            <h1 className="font-semibold text-pm-brown text-sm">Sollar Admin</h1>
            <p className="text-xs text-text-muted">Painel da Plataforma</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-pm-green-dark text-white"
                  : "text-text-secondary hover:bg-bg-sage hover:text-pm-green-dark"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-light space-y-2">
        {/* Back to Dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-sage hover:text-pm-green-dark transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Voltar ao Dashboard
        </Link>

        {/* User info */}
        {userName && (
          <div className="px-3 py-2">
            <p className="text-xs text-text-muted">Logado como</p>
            <p className="text-sm font-medium text-pm-brown truncate">{userName}</p>
          </div>
        )}

        {/* Logout */}
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
