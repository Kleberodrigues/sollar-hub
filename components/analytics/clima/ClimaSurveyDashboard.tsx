'use client';

/**
 * ClimaSurveyDashboard - Dashboard para Pesquisa de Clima
 *
 * Estrutura das 10 perguntas:
 * Q1: Bem-estar (1-5)
 * Q2-Q3: Carga de Trabalho (1-5)
 * Q4-Q6: Liderança (1-5)
 * Q7-Q8: Clima & Segurança (1-5)
 * Q9: Satisfação NPS (0-10)
 * Q10: Pergunta Aberta (texto)
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  Briefcase,
  Users,
  Shield,
  Target,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getClimaAnalytics, type ClimaAnalytics, type ClimaQuestionData, type ClimaThemeData } from '@/app/dashboard/analytics/clima-actions';

interface ClimaSurveyDashboardProps {
  assessmentId: string;
}

// Ícones por tema
const THEME_ICONS: Record<string, React.ElementType> = {
  bem_estar: Heart,
  carga_trabalho: Briefcase,
  lideranca: Users,
  clima: Shield,
  satisfacao: Target,
  qualitativo: MessageSquare,
};

// Cores por tema
const THEME_COLORS: Record<string, { bg: string; icon: string; text: string }> = {
  bem_estar: { bg: 'bg-rose-50', icon: 'text-rose-500', text: 'text-rose-700' },
  carga_trabalho: { bg: 'bg-amber-50', icon: 'text-amber-500', text: 'text-amber-700' },
  lideranca: { bg: 'bg-blue-50', icon: 'text-blue-500', text: 'text-blue-700' },
  clima: { bg: 'bg-emerald-50', icon: 'text-emerald-500', text: 'text-emerald-700' },
  satisfacao: { bg: 'bg-pm-olive/10', icon: 'text-pm-olive', text: 'text-pm-olive' },
  qualitativo: { bg: 'bg-purple-50', icon: 'text-purple-500', text: 'text-purple-700' },
};

// Componente de Card de Tema
function ThemeCard({ theme }: { theme: ClimaThemeData }) {
  const Icon = THEME_ICONS[theme.theme] || AlertCircle;
  const colors = THEME_COLORS[theme.theme] || THEME_COLORS.qualitativo;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <Badge className="bg-green-100 text-green-700 text-xs">Bom</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700 text-xs">Atenção</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-700 text-xs">Crítico</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={cn('border-none shadow-sm', colors.bg)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-white/60')}>
            <Icon className={cn('w-5 h-5', colors.icon)} />
          </div>
          {getRiskBadge(theme.riskLevel)}
        </div>
        <p className="text-xs text-text-muted mb-1">{theme.label}</p>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-2xl font-display font-bold', colors.text)}>
            {theme.averageScore.toFixed(1)}
          </span>
          <span className="text-xs text-text-muted">/5</span>
        </div>
        <p className="text-xs text-text-muted mt-1">
          {theme.responseCount} respostas
        </p>
      </CardContent>
    </Card>
  );
}

// Componente de Pergunta Individual
function QuestionCard({ question }: { question: ClimaQuestionData }) {
  const colors = THEME_COLORS[question.theme] || THEME_COLORS.qualitativo;

  // Barra de progresso baseada na escala
  const maxScale = question.scale === '0-10' ? 10 : 5;
  const progressPercent = (question.averageScore / maxScale) * 100;

  // Cor da barra baseada no score
  const getBarColor = () => {
    const normalizedScore = question.scale === '0-10'
      ? question.averageScore / 2 // Normaliza 0-10 para 0-5
      : question.averageScore;

    if (normalizedScore >= 4) return 'bg-green-500';
    if (normalizedScore >= 3) return 'bg-amber-400';
    if (normalizedScore >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white border border-border-light hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn('text-xs border-0', colors.bg, colors.text)}>
              {question.themeLabel}
            </Badge>
          </div>
          <p className="text-sm text-text-heading font-medium line-clamp-2">
            {question.questionText}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={cn('text-xl font-bold', colors.text)}>
            {question.averageScore.toFixed(1)}
          </p>
          <p className="text-xs text-text-muted">
            /{maxScale}
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn('h-full rounded-full', getBarColor())}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
        <span>{question.responseCount} respostas</span>
        {question.distribution.length > 0 && (
          <span>
            Mais frequente: {question.distribution[question.distribution.length - 1]?.value}
            ({question.distribution[question.distribution.length - 1]?.percentage}%)
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Componente de Satisfação NPS (Q9)
function NPSSection({ question }: { question: ClimaQuestionData }) {
  const score = question.averageScore;

  // Classificar NPS
  const getNPSCategory = (s: number) => {
    if (s >= 9) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (s >= 7) return { label: 'Bom', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (s >= 5) return { label: 'Neutro', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const category = getNPSCategory(score);

  // Calcular detratores, neutros e promotores
  const detractors = question.distribution
    .filter(d => {
      const val = parseInt(d.value);
      return !isNaN(val) && val <= 6;
    })
    .reduce((sum, d) => sum + d.count, 0);

  const passives = question.distribution
    .filter(d => {
      const val = parseInt(d.value);
      return !isNaN(val) && (val === 7 || val === 8);
    })
    .reduce((sum, d) => sum + d.count, 0);

  const promoters = question.distribution
    .filter(d => {
      const val = parseInt(d.value);
      return !isNaN(val) && val >= 9;
    })
    .reduce((sum, d) => sum + d.count, 0);

  const total = detractors + passives + promoters;

  return (
    <Card className="border-pm-olive/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-pm-olive" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-text-heading">
                Satisfação Geral
              </CardTitle>
              <p className="text-xs text-text-muted">{question.questionText}</p>
            </div>
          </div>
          <Badge className={cn('text-xs', category.bg, category.color)}>{category.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pm-olive/5 to-pm-olive/10">
            <p className="text-xs text-text-muted mb-1">Nota Média</p>
            <p className="text-5xl font-display font-bold text-pm-olive">
              {score.toFixed(1)}
            </p>
            <p className="text-sm text-text-muted mt-1">de 10</p>
          </div>

          {/* Distribuição NPS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Promotores (9-10)</span>
              <span className="text-sm font-medium text-green-600">
                {total > 0 ? Math.round((promoters / total) * 100) : 0}% ({promoters})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Neutros (7-8)</span>
              <span className="text-sm font-medium text-amber-600">
                {total > 0 ? Math.round((passives / total) * 100) : 0}% ({passives})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Detratores (0-6)</span>
              <span className="text-sm font-medium text-red-600">
                {total > 0 ? Math.round((detractors / total) * 100) : 0}% ({detractors})
              </span>
            </div>

            {/* Barra de distribuição */}
            <div className="flex h-3 rounded-full overflow-hidden mt-2">
              {promoters > 0 && (
                <div
                  className="bg-green-500"
                  style={{ width: `${(promoters / total) * 100}%` }}
                />
              )}
              {passives > 0 && (
                <div
                  className="bg-amber-400"
                  style={{ width: `${(passives / total) * 100}%` }}
                />
              )}
              {detractors > 0 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${(detractors / total) * 100}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Respostas Abertas (Q10)
function OpenResponsesSection({ textResponses }: { textResponses: { text: string; theme?: string }[] }) {
  if (textResponses.length === 0) {
    return (
      <Card className="border-pm-terracotta/20">
        <CardContent className="py-8 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-text-muted">Nenhuma resposta aberta ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-pm-terracotta/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-pm-terracotta" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-text-heading">
              Feedback Aberto
            </CardTitle>
            <p className="text-xs text-text-muted">{textResponses.length} respostas</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {textResponses.slice(0, 10).map((response, index) => (
            <div key={index} className="p-3 rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-secondary italic">
                &ldquo;{response.text}&rdquo;
              </p>
            </div>
          ))}
          {textResponses.length > 10 && (
            <p className="text-xs text-text-muted text-center pt-2">
              +{textResponses.length - 10} respostas
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Principal
export function ClimaSurveyDashboard({ assessmentId }: ClimaSurveyDashboardProps) {
  const [data, setData] = useState<ClimaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getClimaAnalytics(assessmentId);

      if (result) {
        setData(result);
      } else {
        setError('Não foi possível carregar os dados da pesquisa de clima.');
      }

      setLoading(false);
    }

    fetchData();
  }, [assessmentId]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || data.totalParticipants === 0) {
    return (
      <Card className="border-dashed border-2 border-pm-olive/30">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
            <Target className="w-8 h-8 text-pm-olive" />
          </div>
          <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
            Pesquisa de Clima
          </h3>
          <p className="text-text-secondary max-w-md mx-auto">
            Os indicadores aparecerão quando houver respostas coletadas para esta pesquisa.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separar Q9 e Q10 das outras perguntas
  const q1to8 = data.questions.filter(q => q.questionNumber >= 1 && q.questionNumber <= 8);
  const q9 = data.questions.find(q => q.questionNumber === 9);
  const themesWithoutNPS = data.themes.filter(t => t.theme !== 'satisfacao' && t.theme !== 'qualitativo');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-text-heading">
            Pesquisa de Clima
          </h2>
          <p className="text-sm text-text-muted">
            {data.totalParticipants} participantes • 10 indicadores
          </p>
        </div>
      </div>

      {/* Cards de Resumo por Tema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {themesWithoutNPS.map((theme) => (
          <ThemeCard key={theme.theme} theme={theme} />
        ))}
      </div>

      {/* Q9 - Satisfação NPS */}
      {q9 && <NPSSection question={q9} />}

      {/* Q1-Q8 - Perguntas Detalhadas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-text-heading">
            Detalhamento por Pergunta
          </CardTitle>
          <p className="text-xs text-text-muted">Escala 1-5: Nunca → Sempre</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q1to8.map((question) => (
              <QuestionCard key={question.questionId} question={question} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Q10 - Respostas Abertas */}
      <OpenResponsesSection textResponses={data.textResponses} />

      {/* Legenda */}
      <Card className="bg-bg-secondary border-border-light">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-text-heading mb-2">Escala de Respostas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-muted">
            <div>
              <p className="font-medium text-text-secondary">Q1 (Sentimento):</p>
              <p>Muito mal (1) → Muito bem (5)</p>
            </div>
            <div>
              <p className="font-medium text-text-secondary">Q2-Q8 (Frequência):</p>
              <p>Nunca (1) → Sempre (5)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ClimaSurveyDashboard;
