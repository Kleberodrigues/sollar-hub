'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Users,
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  Target,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Assessment {
  id: string;
  title: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  response_count: number;
  action_count: number;
}

interface ActionPlanSelectorProps {
  assessments: Assessment[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: 'Ativo',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  completed: {
    label: 'Concluído',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  archived: {
    label: 'Arquivado',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <Clock className="h-3 w-3" />,
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ActionPlanSelector({ assessments }: ActionPlanSelectorProps) {
  if (assessments.length === 0) {
    return (
      <Card className="border-dashed border-2 border-pm-olive/30">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <FileText className="w-10 h-10 text-pm-olive" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-text-heading mb-3">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Crie uma avaliação primeiro para poder criar planos de ação.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border-l-4 border-l-pm-olive bg-gradient-to-r from-pm-olive/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pm-olive/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pm-olive" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-text-heading">
                Selecione uma Avaliação
              </h2>
              <p className="text-sm text-text-muted">
                Escolha a avaliação para criar ou gerenciar o plano de ação com IA
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {assessments.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </motion.div>
    </div>
  );
}

interface AssessmentCardProps {
  assessment: Assessment;
}

function AssessmentCard({ assessment }: AssessmentCardProps) {
  const status = statusConfig[assessment.status] || statusConfig.draft;
  const href = `/dashboard/action-plan?assessment=${assessment.id}`;

  return (
    <motion.div variants={item}>
      <Link href={href}>
        <Card
          className={cn(
            'group relative overflow-hidden transition-all duration-300',
            'hover:shadow-md hover:border-pm-olive/30 cursor-pointer'
          )}
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pm-olive to-pm-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />

          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-semibold text-text-heading truncate">
                  {assessment.title}
                </h4>
                {assessment.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {assessment.description}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn('shrink-0 gap-1', status.color)}
              >
                {status.icon}
                {status.label}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-pm-olive" />
                <span>{assessment.response_count} respostas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-pm-terracotta" />
                <span>{assessment.action_count} ações</span>
              </div>
            </div>

            {/* Date Range */}
            {(assessment.start_date || assessment.end_date) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3 w-3" />
                <span>
                  {assessment.start_date
                    ? new Date(assessment.start_date).toLocaleDateString('pt-BR')
                    : '—'}{' '}
                  até{' '}
                  {assessment.end_date
                    ? new Date(assessment.end_date).toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </div>
            )}

            {/* Action hint */}
            <div className="flex items-center justify-between pt-3 border-t border-border-light">
              <span className="text-sm text-pm-olive font-medium">
                Gerenciar Plano de Ação
              </span>
              <ChevronRight className="h-4 w-4 text-pm-olive group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
