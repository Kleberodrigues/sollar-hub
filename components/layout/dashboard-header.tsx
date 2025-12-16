"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, ChevronRight, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface DashboardHeaderProps {
  userName: string;
  organizationName: string;
  onMenuClick?: () => void;
}

// Mapa de rotas para breadcrumbs
const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/users": "Usuários",
  "/dashboard/questionnaires": "Questionários",
  "/dashboard/assessments": "Assessments",
  "/dashboard/analytics": "Análise de Riscos",
  "/dashboard/departments": "Departamentos",
  "/dashboard/team": "Equipe",
  "/dashboard/settings": "Configurações",
};

export function DashboardHeader({
  userName,
  organizationName,
  onMenuClick,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleSignOut() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    }
  }

  // Gerar breadcrumbs baseado na rota atual
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string; isLast: boolean }> = [];

    let currentPath = "";
    for (const path of paths) {
      currentPath += `/${path}`;
      const label = routeLabels[currentPath] || path;
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: currentPath === pathname,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-secondary transition-colors mr-4"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              )}
              {crumb.isLast ? (
                <span className="text-sm font-medium text-text-primary capitalize">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary capitalize transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notificações */}
          <button className="relative p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-secondary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User info */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                {userName}
              </p>
              <p className="text-xs text-text-muted">{organizationName}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>

          {/* Mobile logout button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="md:hidden"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
