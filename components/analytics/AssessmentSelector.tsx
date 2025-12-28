'use client';

/**
 * Assessment Selector Component
 *
 * Grid de cards para seleção de assessments na página de analytics
 * Mostra assessments com respostas disponíveis para análise
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Users,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
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
}

interface AssessmentSelectorProps {
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
    icon: <AlertCircle className="h-3 w-3" />,
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

export function AssessmentSelector({ assessments }: AssessmentSelectorProps) {
  // Filtrar assessments com pelo menos uma resposta
  const assessmentsWithResponses = assessments.filter((a) => a.response_count > 0);
  const assessmentsWithoutResponses = assessments.filter((a) => a.response_count === 0);

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-text-heading mb-2">
          Nenhum assessment encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Crie um assessment e colete respostas para visualizar as análises aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Assessments com respostas */}
      {assessmentsWithResponses.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
            Assessments com dados ({assessmentsWithResponses.length})
          </h3>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {assessmentsWithResponses.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </motion.div>
        </div>
      )}

      {/* Assessments sem respostas */}
      {assessmentsWithoutResponses.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
            Aguardando respostas ({assessmentsWithoutResponses.length})
          </h3>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {assessmentsWithoutResponses.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                disabled
              />
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface AssessmentCardProps {
  assessment: Assessment;
  disabled?: boolean;
}

function AssessmentCard({ assessment, disabled }: AssessmentCardProps) {
  const status = statusConfig[assessment.status] || statusConfig.draft;
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const href = section
    ? `/dashboard/analytics?assessment=${assessment.id}&section=${section}`
    : `/dashboard/analytics?assessment=${assessment.id}`;

  const content = (
    <motion.div variants={item}>
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-300',
          disabled
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:shadow-md hover:border-pm-terracotta/30 cursor-pointer'
        )}
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pm-terracotta to-pm-olive opacity-0 group-hover:opacity-100 transition-opacity" />

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
              className={cn('text-xs gap-1 shrink-0', status.color)}
            >
              {status.icon}
              {status.label}
            </Badge>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{assessment.response_count} respostas</span>
            </div>
            {assessment.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(assessment.start_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Action indicator */}
          {!disabled && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 text-xs text-pm-terracotta font-medium">
                Ver análise
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Disabled overlay */}
          {disabled && (
            <div className="mt-3 pt-3 border-t border-dashed">
              <p className="text-xs text-muted-foreground text-center">
                Colete respostas para analisar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}
