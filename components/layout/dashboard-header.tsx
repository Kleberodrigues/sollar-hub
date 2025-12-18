"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, ChevronRight, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";

interface DashboardHeaderProps {
  userName: string;
  organizationName: string;
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mapa de rotas para breadcrumbs
const routeLabels: Record<string, string> = {
  "/dashboard": "Página Inicial",
  "/dashboard/users": "Usuários",
  "/dashboard/questionnaires": "Questionários",
  "/dashboard/assessments": "Assessments",
  "/dashboard/analytics": "Análise de Riscos",
  "/dashboard/departments": "Departamentos",
  "/dashboard/team": "Equipe",
  "/dashboard/settings": "Configurações",
};

// Mock notifications - será substituído por dados reais do backend
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nova avaliação disponível",
    message: "Uma nova avaliação de risco foi criada para sua equipe.",
    time: "5 min atrás",
    read: false,
  },
  {
    id: "2",
    title: "Relatório gerado",
    message: "O relatório mensal de riscos está pronto para download.",
    time: "1 hora atrás",
    read: false,
  },
  {
    id: "3",
    title: "Lembrete",
    message: "3 colaboradores ainda não completaram a avaliação.",
    time: "2 horas atrás",
    read: true,
  },
];
export function DashboardHeader({
  userName,
  organizationName,
  onMenuClick,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-border-light z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                  <h3 className="font-semibold text-text-primary">Notificações</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:text-primary-dark transition-colors"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-text-muted hover:text-text-primary rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lista de Notificações */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-text-muted">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors cursor-pointer ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"} text-text-primary truncate`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-text-muted mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-border-light">
                    <Link
                      href="/dashboard/notifications"
                      className="text-sm text-primary hover:text-primary-dark transition-colors block text-center"
                      onClick={() => setShowNotifications(false)}
                    >
                      Ver todas as notificações
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

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
