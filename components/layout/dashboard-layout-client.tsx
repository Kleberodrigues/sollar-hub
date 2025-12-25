"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { Toaster } from "@/components/ui/toaster";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  organizationName: string;
  isSuperAdmin?: boolean;
}

export function DashboardLayoutClient({
  children,
  userRole,
  userName,
  organizationName,
  isSuperAdmin = false,
}: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-secondary">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar userRole={userRole} isSuperAdmin={isSuperAdmin} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        userRole={userRole}
        isSuperAdmin={isSuperAdmin}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          userName={userName}
          organizationName={organizationName}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
