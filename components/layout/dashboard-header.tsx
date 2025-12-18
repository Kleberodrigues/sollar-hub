"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, ChevronRight, Menu, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification as NotificationType,
} from "@/app/dashboard/notifications/actions";
import {
  getNotificationTimeLabel,
  getNotificationIcon,
} from "@/lib/notifications/utils";

interface DashboardHeaderProps {
  userName: string;
  organizationName: string;
  onMenuClick?: () => void;
}

interface DisplayNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
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

export function DashboardHeader({
  userName,
  organizationName,
  onMenuClick,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Transform backend notification to display format
  const transformNotification = useCallback((n: NotificationType): DisplayNotification => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: getNotificationTimeLabel(n.created_at),
    read: n.read,
    icon: getNotificationIcon(n.type),
  }), []);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getNotifications(10, 0, false);
      setNotifications(result.notifications.map(transformNotification));
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error("[Header] Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [transformNotification]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();

    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Server update
    const success = await markNotificationAsRead(id);
    if (!success) {
      // Revert on failure
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    // Server update
    const success = await markAllNotificationsAsRead();
    if (!success) {
      // Revert on failure
      fetchNotifications();
    }
  };
﻿
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
              <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-white rounded-lg shadow-lg border border-border-light z-50">
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
﻿
                {/* Lista de Notificações */}
                <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="px-4 py-8 text-center text-text-muted">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Carregando...
                    </div>
                  ) : notifications.length === 0 ? (
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
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">{notification.icon}</span>
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
