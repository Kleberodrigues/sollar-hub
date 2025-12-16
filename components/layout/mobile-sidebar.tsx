"use client";

import { Sidebar } from "./sidebar";
import { X } from "lucide-react";

interface MobileSidebarProps {
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ userRole, isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar mobile */}
      <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-secondary transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sidebar content */}
          <Sidebar userRole={userRole} />
        </div>
      </div>
    </>
  );
}
