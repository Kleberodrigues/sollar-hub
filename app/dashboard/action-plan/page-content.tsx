'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ActionPlanPageContentProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  children: React.ReactNode;
}

export function ActionPlanPageContent({
  title,
  subtitle,
  showBackButton,
  children,
}: ActionPlanPageContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link href="/dashboard/action-plan">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pm-olive" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-text-heading">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-text-muted">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </motion.div>
  );
}
