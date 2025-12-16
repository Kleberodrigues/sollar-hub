'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Search } from "lucide-react";
import { AssessmentCard } from "./assessment-card";

interface Assessment {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string | null;
  department_id: string | null;
  questionnaires?: {
    id: string;
    title: string;
  } | null;
  departments?: {
    id: string;
    name: string;
  } | null;
  responses?: Array<{ count: number }>;
}

interface AssessmentsListContentProps {
  assessments: Assessment[] | null;
  canManage: boolean;
}

export function AssessmentsListContent({ assessments, canManage }: AssessmentsListContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const activeCount = assessments?.filter(a => a.status === "active").length || 0;
  const draftCount = assessments?.filter(a => a.status === "draft").length || 0;
  const totalResponses = assessments?.reduce((acc, a) => acc + (a.responses?.[0]?.count || 0), 0) || 0;

  return (
    <div ref={ref} className="p-6 pb-12 space-y-6 flex-1 flex flex-col bg-white/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-text-heading">Assessments</h1>
          <p className="text-text-secondary mt-1">
            Gerencie avaliações e colete respostas da sua equipe
          </p>
        </div>

        {canManage && (
          <Button
            asChild
            className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-white gap-2"
          >
            <Link href="/dashboard/assessments/new">
              <Plus className="w-4 h-4" />
              Novo Assessment
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Stats Cards */}
      {assessments && assessments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-pm-terracotta/10 to-white border-pm-terracotta/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Ativos</p>
                  <p className="text-2xl font-bold text-pm-terracotta">{activeCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pm-terracotta/20 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-pm-terracotta" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pm-olive/10 to-white border-pm-olive/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Rascunhos</p>
                  <p className="text-2xl font-bold text-pm-olive">{draftCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pm-olive/20 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-pm-olive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pm-green-dark/10 to-white border-pm-green-dark/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Total de Respostas</p>
                  <p className="text-2xl font-bold text-pm-green-dark">{totalResponses}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pm-green-dark/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-pm-green-dark" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lista de assessments */}
      {!assessments || assessments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <Card className="border-dashed border-2 flex-1 flex items-center justify-center">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pm-terracotta/10 flex items-center justify-center">
                  <ClipboardList className="w-8 h-8 text-pm-terracotta" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
                  Nenhum assessment encontrado
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Crie um assessment para começar a coletar respostas da sua equipe sobre riscos psicossociais.
                </p>
                {canManage && (
                  <Button
                    asChild
                    className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-white"
                  >
                    <Link href="/dashboard/assessments/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Assessment
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment, index) => (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <AssessmentCard
                assessment={assessment}
                canManage={canManage}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
