'use client';

/**
 * ClimaSurveyDashboard - Dashboard específico para Pesquisa de Clima
 *
 * Estrutura:
 * - Painel principal: Q1-Q8 (escalas 1-5)
 * - Cards de resumo por tema
 * - Heatmap mensal
 * - Seção separada para Satisfação (Q9, 0-10)
 * - Seção separada para Pergunta Aberta (Q10)
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import {
  Heart,
  Briefcase,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  MessageSquare,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Tipos
interface ClimaSurveyResponse {
  questionId: string;
  questionNumber: number; // Q1-Q10
  questionText: string;
  questionType: 'sentiment' | 'frequency' | 'satisfaction' | 'open_text';
  responses: Array<{
    value: string;
    count: number;
    percentage: number;
  }>;
  averageScore?: number;
  month: string; // YYYY-MM
}

interface MonthlyData {
  month: string;
  label: string; // "Jan", "Fev", etc.
  Q1?: number; // Bem-estar
  Q2?: number; // Carga de trabalho
  Q3?: number; // Carga de trabalho
  Q4?: number; // Liderança
  Q5?: number; // Liderança
  Q6?: number; // Liderança
  Q7?: number; // Clima
  Q8?: number; // Clima
  Q9?: number; // Satisfação (0-10)
  participantCount?: number;
}

interface ClimaSurveyDashboardProps {
  assessmentId: string;
  currentMonth?: string;
  previousMonth?: string;
  monthlyData?: MonthlyData[];
  questionDistributions?: ClimaSurveyResponse[];
  textResponses?: Array<{ text: string; theme?: string }>;
}

// Constantes de pontuação
const SENTIMENT_SCALE: Record<string, number> = {
  'Muito mal': 1,
  'Mal': 2,
  'Mais ou menos': 3,
  'Bem': 4,
  'Muito bem': 5,
};

const FREQUENCY_SCALE: Record<string, number> = {
  'Nunca': 1,
  'Raramente': 2,
  'Às vezes': 3,
  'Frequentemente': 4,
  'Sempre': 5,
};

// Mock data para demonstração
const generateMockMonthlyData = (): MonthlyData[] => {
  const months = [
    { month: '2024-07', label: 'Jul' },
    { month: '2024-08', label: 'Ago' },
    { month: '2024-09', label: 'Set' },
    { month: '2024-10', label: 'Out' },
    { month: '2024-11', label: 'Nov' },
    { month: '2024-12', label: 'Dez' },
  ];

  return months.map((m, i) => ({
    ...m,
    Q1: 3.2 + Math.random() * 1.2 + i * 0.1,
    Q2: 3.0 + Math.random() * 1.0 + i * 0.05,
    Q3: 2.8 + Math.random() * 1.2 + i * 0.08,
    Q4: 3.5 + Math.random() * 1.0 + i * 0.1,
    Q5: 3.3 + Math.random() * 1.1 + i * 0.07,
    Q6: 3.4 + Math.random() * 1.0 + i * 0.09,
    Q7: 3.6 + Math.random() * 0.9 + i * 0.1,
    Q8: 3.2 + Math.random() * 1.1 + i * 0.08,
    Q9: 6.5 + Math.random() * 2.0 + i * 0.2,
    participantCount: 45 + Math.floor(Math.random() * 20),
  }));
};

const mockTextResponses = [
  { text: 'A comunicação entre equipes poderia melhorar', theme: 'Comunicação' },
  { text: 'Reconhecimento por parte da liderança é muito bom', theme: 'Liderança' },
  { text: 'Sobrecarga de trabalho nos últimos meses', theme: 'Carga de Trabalho' },
  { text: 'Ambiente colaborativo e respeitoso', theme: 'Clima' },
  { text: 'Falta de feedback mais frequente', theme: 'Comunicação' },
  { text: 'Muitas reuniões desnecessárias', theme: 'Carga de Trabalho' },
  { text: 'Bom ambiente de trabalho', theme: 'Clima' },
  { text: 'Precisamos de mais autonomia', theme: 'Liderança' },
];

// Componentes auxiliares
function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const percentChange = previous > 0 ? ((diff / previous) * 100).toFixed(1) : '0';

  if (Math.abs(diff) < 0.1) {
    return (
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <Minus className="w-3 h-3" />
        <span>Estável</span>
      </div>
    );
  }

  if (diff > 0) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs">
        <TrendingUp className="w-3 h-3" />
        <span>+{percentChange}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-600 text-xs">
      <TrendingDown className="w-3 h-3" />
      <span>{percentChange}%</span>
    </div>
  );
}

function ThemeCard({
  title,
  score,
  previousScore,
  icon: Icon,
  description,
  color,
}: {
  title: string;
  score: number;
  previousScore: number;
  icon: React.ElementType;
  description: string;
  color: 'terracotta' | 'olive' | 'green' | 'blue';
}) {
  const colorClasses = {
    terracotta: {
      bg: 'bg-pm-terracotta/5',
      iconBg: 'bg-pm-terracotta/10',
      iconColor: 'text-pm-terracotta',
      text: 'text-pm-terracotta',
    },
    olive: {
      bg: 'bg-pm-olive/5',
      iconBg: 'bg-pm-olive/10',
      iconColor: 'text-pm-olive',
      text: 'text-pm-olive',
    },
    green: {
      bg: 'bg-pm-green-dark/5',
      iconBg: 'bg-pm-green-dark/10',
      iconColor: 'text-pm-green-dark',
      text: 'text-pm-green-dark',
    },
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      text: 'text-blue-600',
    },
  };

  const colors = colorClasses[color];
  const scoreDisplay = score.toFixed(1);

  // Determinar nível de risco
  const getRiskLevel = (s: number) => {
    if (s >= 4) return { label: 'Ótimo', color: 'bg-green-100 text-green-700' };
    if (s >= 3) return { label: 'Bom', color: 'bg-blue-100 text-blue-700' };
    if (s >= 2) return { label: 'Atenção', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Crítico', color: 'bg-red-100 text-red-700' };
  };

  const risk = getRiskLevel(score);

  return (
    <Card className={cn('border-none shadow-sm hover:shadow-md transition-shadow', colors.bg)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.iconBg)}>
            <Icon className={cn('w-5 h-5', colors.iconColor)} />
          </div>
          <TrendBadge current={score} previous={previousScore} />
        </div>
        <p className="text-xs text-text-muted mb-1">{title}</p>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={cn('text-2xl font-display font-bold', colors.text)}>
            {scoreDisplay}
          </span>
          <span className="text-xs text-text-muted">/5</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted truncate mr-2">{description}</p>
          <Badge className={cn('text-xs px-2 py-0.5', risk.color)}>{risk.label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Heatmap
function ClimaHeatmap({ monthlyData }: { monthlyData: MonthlyData[] }) {
  const questions = [
    { key: 'Q1', label: 'Bem-estar' },
    { key: 'Q2', label: 'Carga trabalho 1' },
    { key: 'Q3', label: 'Carga trabalho 2' },
    { key: 'Q4', label: 'Liderança 1' },
    { key: 'Q5', label: 'Liderança 2' },
    { key: 'Q6', label: 'Liderança 3' },
    { key: 'Q7', label: 'Clima 1' },
    { key: 'Q8', label: 'Clima 2' },
  ];

  const getColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-600 text-white';
    if (score >= 4) return 'bg-green-500 text-white';
    if (score >= 3.5) return 'bg-green-400 text-white';
    if (score >= 3) return 'bg-yellow-400 text-gray-900';
    if (score >= 2.5) return 'bg-orange-400 text-white';
    if (score >= 2) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-text-muted font-medium">Pergunta</th>
            {monthlyData.map((m) => (
              <th key={m.month} className="text-center py-2 px-2 text-text-muted font-medium">
                {m.label}
              </th>
            ))}
            <th className="text-center py-2 px-2 text-text-muted font-medium">Δ</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => {
            const values = monthlyData.map((m) => m[q.key as keyof MonthlyData] as number || 0);
            const lastValue = values[values.length - 1] || 0;
            const prevValue = values[values.length - 2] || lastValue;
            const delta = lastValue - prevValue;

            return (
              <tr key={q.key} className="border-t border-border-light">
                <td className="py-2 px-3 font-medium text-text-heading">{q.label}</td>
                {monthlyData.map((m, i) => {
                  const value = m[q.key as keyof MonthlyData] as number || 0;
                  return (
                    <td key={m.month} className="text-center py-2 px-2">
                      <span className={cn(
                        'inline-block w-10 py-1 rounded text-xs font-medium',
                        getColor(value)
                      )}>
                        {value.toFixed(1)}
                      </span>
                    </td>
                  );
                })}
                <td className="text-center py-2 px-2">
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium',
                    delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-500'
                  )}>
                    {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Componente de Satisfação (Q9)
function SatisfactionSection({ monthlyData }: { monthlyData: MonthlyData[] }) {
  const latestData = monthlyData[monthlyData.length - 1];
  const previousData = monthlyData[monthlyData.length - 2] || latestData;
  const currentScore = latestData?.Q9 || 0;
  const previousScore = previousData?.Q9 || 0;
  const delta = currentScore - previousScore;

  // Classificar NPS
  const getNPSCategory = (score: number) => {
    if (score >= 9) return { label: 'Promotores', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 7) return { label: 'Neutros', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Detratores', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const category = getNPSCategory(currentScore);

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
                Satisfação Geral (Q9)
              </CardTitle>
              <p className="text-xs text-text-muted">Escala 0-10</p>
            </div>
          </div>
          <Badge className={cn('text-xs', category.bg, category.color)}>{category.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Score atual */}
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pm-olive/5 to-pm-olive/10">
            <p className="text-xs text-text-muted mb-1">Nota do Mês</p>
            <p className="text-4xl font-display font-bold text-pm-olive">
              {currentScore.toFixed(1)}
            </p>
            <p className="text-xs text-text-muted mt-1">de 10</p>
          </div>

          {/* Variação */}
          <div className="text-center p-4 rounded-xl bg-bg-secondary">
            <p className="text-xs text-text-muted mb-1">Δ vs Mês Anterior</p>
            <div className={cn(
              'flex items-center justify-center gap-2 text-2xl font-display font-bold',
              delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-500'
            )}>
              {delta > 0 ? <TrendingUp className="w-5 h-5" /> : delta < 0 ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}
            </div>
          </div>

          {/* Mini gráfico */}
          <div className="p-2">
            <p className="text-xs text-text-muted mb-2 text-center">Evolução</p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <Line
                    type="monotone"
                    dataKey="Q9"
                    stroke="#517A06"
                    strokeWidth={2}
                    dot={{ fill: '#517A06', r: 3 }}
                  />
                  <YAxis domain={[0, 10]} hide />
                  <XAxis dataKey="label" hide />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Timeline completa */}
        <div className="mt-4 pt-4 border-t border-border-light">
          <p className="text-xs text-text-muted mb-3">Linha do Tempo</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border-light" />
                <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    const value = Number(payload[0]?.value) || 0;
                    return (
                      <div className="bg-white p-2 rounded shadow-lg border text-xs">
                        <p className="font-medium">{label}</p>
                        <p className="text-pm-olive">Satisfação: {value.toFixed(1)}</p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Q9"
                  stroke="#517A06"
                  strokeWidth={2}
                  dot={{ fill: '#517A06', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Pergunta Aberta (Q10)
function OpenQuestionSection({
  textResponses
}: {
  textResponses: Array<{ text: string; theme?: string }>
}) {
  // Agrupar por temas
  const themes = useMemo(() => {
    const themeMap = new Map<string, string[]>();
    textResponses.forEach((r) => {
      const theme = r.theme || 'Outros';
      if (!themeMap.has(theme)) {
        themeMap.set(theme, []);
      }
      themeMap.get(theme)!.push(r.text);
    });
    return Array.from(themeMap.entries())
      .map(([theme, texts]) => ({ theme, texts, count: texts.length }))
      .sort((a, b) => b.count - a.count);
  }, [textResponses]);

  const topThemes = themes.slice(0, 5);

  return (
    <Card className="border-pm-terracotta/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-pm-terracotta" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-text-heading">
              Pergunta Aberta (Q10)
            </CardTitle>
            <p className="text-xs text-text-muted">{textResponses.length} respostas coletadas</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Top Temas (Tags) */}
        <div className="mb-4">
          <p className="text-xs text-text-muted mb-2">Top Temas</p>
          <div className="flex flex-wrap gap-2">
            {topThemes.map((t) => (
              <Badge
                key={t.theme}
                variant="outline"
                className="text-xs px-3 py-1 bg-bg-secondary border-border-light"
              >
                {t.theme}
                <span className="ml-1 text-text-muted">({t.count})</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Exemplos de Frases */}
        <div>
          <p className="text-xs text-text-muted mb-2">Exemplos de Respostas</p>
          <div className="space-y-2">
            {topThemes.slice(0, 3).map((t, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg-secondary">
                <div className="flex items-start gap-2">
                  <Badge className="text-xs bg-pm-terracotta/10 text-pm-terracotta border-0 shrink-0">
                    {t.theme}
                  </Badge>
                  <p className="text-sm text-text-secondary italic">
                    "{t.texts[0]}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> As respostas abertas não possuem nota ou média.
            Os temas são extraídos automaticamente para análise qualitativa.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Principal
export function ClimaSurveyDashboard({
  assessmentId,
  currentMonth,
  previousMonth,
  monthlyData: propMonthlyData,
  questionDistributions,
  textResponses: propTextResponses,
}: ClimaSurveyDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('latest');

  // Usar dados mock se não houver dados reais
  const monthlyData = useMemo(() => propMonthlyData || generateMockMonthlyData(), [propMonthlyData]);
  const textResponses = useMemo(() => propTextResponses || mockTextResponses, [propTextResponses]);

  const latestData = monthlyData[monthlyData.length - 1];
  const previousData = monthlyData[monthlyData.length - 2] || latestData;

  // Calcular médias por tema
  const themeScores = useMemo(() => {
    const latest = latestData;
    const prev = previousData;

    return {
      bemEstar: {
        current: latest?.Q1 || 0,
        previous: prev?.Q1 || 0,
      },
      cargaTrabalho: {
        current: ((latest?.Q2 || 0) + (latest?.Q3 || 0)) / 2,
        previous: ((prev?.Q2 || 0) + (prev?.Q3 || 0)) / 2,
      },
      lideranca: {
        current: ((latest?.Q4 || 0) + (latest?.Q5 || 0) + (latest?.Q6 || 0)) / 3,
        previous: ((prev?.Q4 || 0) + (prev?.Q5 || 0) + (prev?.Q6 || 0)) / 3,
      },
      climaSeguranca: {
        current: ((latest?.Q7 || 0) + (latest?.Q8 || 0)) / 2,
        previous: ((prev?.Q7 || 0) + (prev?.Q8 || 0)) / 2,
      },
    };
  }, [latestData, previousData]);

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
            Visualização mês a mês com comparação de indicadores
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Selecionar mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Último mês</SelectItem>
            {monthlyData.map((m) => (
              <SelectItem key={m.month} value={m.month}>
                {m.label} {m.month.split('-')[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThemeCard
          title="Bem-estar"
          description="Q1 - Sentimento geral"
          score={themeScores.bemEstar.current}
          previousScore={themeScores.bemEstar.previous}
          icon={Heart}
          color="terracotta"
        />
        <ThemeCard
          title="Carga de Trabalho"
          description="Média Q2 + Q3"
          score={themeScores.cargaTrabalho.current}
          previousScore={themeScores.cargaTrabalho.previous}
          icon={Briefcase}
          color="olive"
        />
        <ThemeCard
          title="Liderança & Comunicação"
          description="Média Q4 + Q5 + Q6"
          score={themeScores.lideranca.current}
          previousScore={themeScores.lideranca.previous}
          icon={Users}
          color="green"
        />
        <ThemeCard
          title="Clima & Segurança Psicológica"
          description="Média Q7 + Q8"
          score={themeScores.climaSeguranca.current}
          previousScore={themeScores.climaSeguranca.previous}
          icon={Shield}
          color="blue"
        />
      </div>

      {/* Heatmap Q1-Q8 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <BarChart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-text-heading">
                  Mapa de Calor Q1-Q8
                </CardTitle>
                <p className="text-xs text-text-muted">Evolução mensal por pergunta (escala 1-5)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-red-500" /> 1-2
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-yellow-400" /> 3
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-green-500" /> 4-5
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ClimaHeatmap monthlyData={monthlyData} />
        </CardContent>
      </Card>

      {/* Seção 2: Satisfação (Q9) - Separada */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">Seção 2</Badge>
          <span className="text-sm text-text-muted">Satisfação (escala 0-10)</span>
        </div>
        <SatisfactionSection monthlyData={monthlyData} />
      </div>

      {/* Seção 3: Pergunta Aberta (Q10) - Separada */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">Seção 3</Badge>
          <span className="text-sm text-text-muted">Respostas Qualitativas</span>
        </div>
        <OpenQuestionSection textResponses={textResponses} />
      </div>

      {/* Regras de Pontuação (Legenda) */}
      <Card className="bg-bg-secondary border-border-light">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-text-heading mb-2">Regras de Pontuação</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-text-muted">
            <div>
              <p className="font-medium text-text-secondary">Q1 (Sentimento):</p>
              <p>Muito mal=1, Mal=2, Mais ou menos=3, Bem=4, Muito bem=5</p>
            </div>
            <div>
              <p className="font-medium text-text-secondary">Q2-Q8 (Frequência):</p>
              <p>Nunca=1, Raramente=2, Às vezes=3, Frequentemente=4, Sempre=5</p>
            </div>
            <div>
              <p className="font-medium text-text-secondary">Índices por Tema:</p>
              <p>Média simples das perguntas do tema (escala contínua 1-5)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ClimaSurveyDashboard;
