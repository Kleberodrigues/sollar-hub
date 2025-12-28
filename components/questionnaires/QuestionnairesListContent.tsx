'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, MessageSquare, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { isTemplateQuestionnaire, getLockedQuestionnaireInfo } from "@/lib/constants/questionnaire-templates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  is_locked?: boolean | null;
  created_at: string;
  questions?: Array<{ count: number }>;
}

interface QuestionnairesListContentProps {
  questionnaires: Questionnaire[] | null;
  canManage: boolean;
}

function QuestionnaireCard({ questionnaire, canManage: _canManage }: { questionnaire: Questionnaire; canManage: boolean }) {
  const questionCount = questionnaire.questions?.[0]?.count || 0;
  const isLocked = questionnaire.is_locked === true || isTemplateQuestionnaire(questionnaire.id);
  const lockedInfo = getLockedQuestionnaireInfo(questionnaire.id);

  return (
    <Card className={cn(
      "group transition-all duration-300 hover:shadow-lg border-l-4",
      questionnaire.is_active ? "border-l-pm-olive" : "border-l-gray-300"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                questionnaire.is_active ? "bg-pm-olive/10" : "bg-gray-100"
              )}>
                <FileText className={cn(
                  "w-5 h-5",
                  questionnaire.is_active ? "text-pm-olive" : "text-gray-500"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-display font-semibold text-text-heading">
                    {questionnaire.title}
                  </h3>
                  {isLocked && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="warning" className="gap-1 text-xs">
                            <Shield className="w-3 h-3" />
                            {lockedInfo?.regulation || 'Protegido'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">{lockedInfo?.name || 'Questionario Protegido'}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lockedInfo?.description || 'Este questionario segue requisitos regulatorios e nao pode ser editado.'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {questionnaire.description && (
                  <p className="text-sm text-text-muted line-clamp-1">
                    {questionnaire.description}
                  </p>
                )}
              </div>
              <span className={cn(
                "px-3 py-1 text-xs font-medium rounded-full",
                questionnaire.is_active
                  ? "bg-pm-green-light/50 text-pm-green-dark"
                  : "bg-gray-100 text-gray-700"
              )}>
                {questionnaire.is_active ? "Ativo" : "Inativo"}
              </span>
            </div>

            {/* Métricas */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2 bg-bg-sage px-3 py-1.5 rounded-lg">
                <MessageSquare className="w-4 h-4 text-pm-olive" />
                <span className="font-medium text-text-primary">{questionCount}</span>
                <span>{questionCount === 1 ? "pergunta" : "perguntas"}</span>
              </div>

            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2 ml-4">
            <Link href={`/dashboard/questionnaires/${questionnaire.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 hover:bg-pm-olive hover:text-white hover:border-pm-olive"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuestionnairesListContent({ questionnaires, canManage }: QuestionnairesListContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const activeCount = questionnaires?.filter(q => q.is_active).length || 0;
  const totalQuestions = questionnaires?.reduce((acc, q) => acc + (q.questions?.[0]?.count || 0), 0) || 0;

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
          <h1 className="font-display text-3xl font-bold text-text-heading">Questionários</h1>
          <p className="text-text-secondary mt-1">
            Gerencie questionários de avaliação psicossocial
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {questionnaires && questionnaires.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-pm-olive/10 to-white border-pm-olive/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Total</p>
                  <p className="text-2xl font-bold text-pm-olive">{questionnaires.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pm-olive/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pm-olive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pm-green-dark/10 to-white border-pm-green-dark/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Ativos</p>
                  <p className="text-2xl font-bold text-pm-green-dark">{activeCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pm-green-dark/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pm-green-dark" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pm-terracotta/10 to-white border-pm-terracotta/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Total de Perguntas</p>
                  <p className="text-2xl font-bold text-pm-terracotta">{totalQuestions}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pm-terracotta/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-pm-terracotta" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lista de questionários */}
      {!questionnaires || questionnaires.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <Card className="border-dashed border-2 flex-1 flex items-center justify-center">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pm-olive/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-pm-olive" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
                  Nenhum questionário encontrado
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Os questionários disponíveis aparecerão aqui.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4 flex-1">
          {questionnaires.map((questionnaire, index) => (
            <motion.div
              key={questionnaire.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <QuestionnaireCard
                questionnaire={questionnaire}
                canManage={canManage}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
