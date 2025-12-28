"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SunIcon } from "@/components/Logo";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border-light h-14 flex items-center px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-bg-sage transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6 text-pm-brown" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/20 flex items-center justify-center">
            <SunIcon size={20} className="text-pm-terracotta" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-display font-bold">
              <span className="text-pm-olive">Psico</span>
              <span className="text-pm-terracotta">Mapa</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-light h-screen flex flex-col transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/20 flex items-center justify-center">
                <SunIcon size={24} className="text-pm-terracotta" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-bold">
                  <span className="text-pm-olive">Psico</span>
                  <span className="text-pm-terracotta">Mapa</span>
                </span>
                <span className="text-xs text-text-muted -mt-1">
                  Painel da Plataforma
                </span>
              </div>
            </div>
            {/* Close button - mobile only */}
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-bg-sage transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
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
            onClick={closeSidebar}
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
    </>
  );
}
