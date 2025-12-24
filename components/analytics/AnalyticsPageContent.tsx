'use client';

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft, FileSearch } from "lucide-react";

interface AnalyticsPageContentProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function AnalyticsPageContent({
  children,
  title,
  subtitle,
  showBackButton = false
}: AnalyticsPageContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="p-6 pb-12 space-y-6 flex-1 flex flex-col bg-white/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link href="/dashboard/assessments">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-pm-olive hover:text-white hover:border-pm-olive"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-text-heading">{title}</h1>
            {subtitle && (
              <p className="text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content with animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function AnalyticsEmptyState() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col"
    >
      <Card className="border-dashed border-2 flex-1 flex items-center justify-center">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Análise de Riscos
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Selecione uma avaliação para visualizar os dados de análise e métricas detalhadas.
            </p>
            <Button
              asChild
              className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-white"
            >
              <Link href="/dashboard/assessments">
                <FileSearch className="w-4 h-4 mr-2" />
                Ver Avaliações
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AnalyticsNotFoundState() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <FileSearch className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Avaliação não encontrada
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              A avaliação solicitada não foi encontrada ou você não tem permissão para visualizá-la.
            </p>
            <Button
              asChild
              className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-white"
            >
              <Link href="/dashboard/assessments">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Avaliações
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
