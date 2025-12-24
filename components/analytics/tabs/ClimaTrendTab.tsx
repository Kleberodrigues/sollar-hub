'use client';

/**
 * ClimaTrendTab - Análise de Tendência para Pesquisas de Clima
 *
 * Mostra evolução histórica dos indicadores de clima organizacional
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Users,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendDataPoint {
  date: string;
  label: string;
  satisfactionScore: number;
  npsScore: number;
  engagementScore: number;
  participantCount: number;
  responseRate: number;
}

interface ClimaTrendTabProps {
  trendData?: TrendDataPoint[];
  currentScore?: number;
  previousScore?: number;
  assessmentType?: string;
}

// Mock data for demonstration - in production this would come from the backend
const generateMockTrendData = (): TrendDataPoint[] => {
  const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map((month, index) => ({
    date: `2024-${(7 + index).toString().padStart(2, '0')}-01`,
    label: month,
    satisfactionScore: 65 + Math.random() * 20 + index * 2,
    npsScore: 30 + Math.random() * 30 + index * 3,
    engagementScore: 60 + Math.random() * 25 + index * 1.5,
    participantCount: 45 + Math.floor(Math.random() * 20),
    responseRate: 70 + Math.floor(Math.random() * 20),
  }));
};

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const percentChange = previous > 0 ? ((diff / previous) * 100).toFixed(1) : '0';

  if (Math.abs(diff) < 1) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Minus className="w-3 h-3" />
        <span className="text-xs">Estável</span>
      </div>
    );
  }

  if (diff > 0) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp className="w-3 h-3" />
        <span className="text-xs">+{percentChange}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-600">
      <TrendingDown className="w-3 h-3" />
      <span className="text-xs">{percentChange}%</span>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  previousScore,
  icon: Icon,
  color,
}: {
  title: string;
  score: number;
  previousScore: number;
  icon: React.ElementType;
  color: 'terracotta' | 'olive' | 'green';
}) {
  const colorClasses = {
    terracotta: {
      bg: 'bg-pm-terracotta/5',
      text: 'text-pm-terracotta',
      iconBg: 'bg-pm-terracotta/10',
    },
    olive: {
      bg: 'bg-pm-olive/5',
      text: 'text-pm-olive',
      iconBg: 'bg-pm-olive/10',
    },
    green: {
      bg: 'bg-pm-green-dark/5',
      text: 'text-pm-green-dark',
      iconBg: 'bg-pm-green-dark/10',
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className={cn('border-none shadow-sm', colors.bg)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.iconBg)}>
            <Icon className={cn('w-4 h-4', colors.text)} />
          </div>
          <TrendIndicator current={score} previous={previousScore} />
        </div>
        <p className="text-xs text-text-muted mb-1">{title}</p>
        <p className={cn('text-2xl font-display font-bold', colors.text)}>
          {score.toFixed(0)}
        </p>
      </CardContent>
    </Card>
  );
}

export function ClimaTrendTab({
  trendData,
  currentScore,
  previousScore,
  assessmentType = 'pulse',
}: ClimaTrendTabProps) {
  // Use mock data if no trend data is provided
  const data = useMemo(() => trendData || generateMockTrendData(), [trendData]);

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2] || data[0];

  const current = {
    satisfaction: currentScore || latestData?.satisfactionScore || 0,
    nps: latestData?.npsScore || 0,
    engagement: latestData?.engagementScore || 0,
  };

  const previous = {
    satisfaction: previousScore || previousData?.satisfactionScore || 0,
    nps: previousData?.npsScore || 0,
    engagement: previousData?.engagementScore || 0,
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
        <p className="font-medium text-text-heading mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  };

  if (assessmentType !== 'pulse') {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tendências disponíveis apenas para Pesquisas de Clima</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-text-heading">
            Evolução do Clima Organizacional
          </h3>
          <p className="text-sm text-text-muted">
            Acompanhe as tendências ao longo do tempo
          </p>
        </div>
        <Badge variant="outline" className="text-pm-olive border-pm-olive">
          Últimos 6 meses
        </Badge>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard
          title="Satisfação Geral"
          score={current.satisfaction}
          previousScore={previous.satisfaction}
          icon={Heart}
          color="terracotta"
        />
        <ScoreCard
          title="NPS Interno"
          score={current.nps}
          previousScore={previous.nps}
          icon={Target}
          color="olive"
        />
        <ScoreCard
          title="Engajamento"
          score={current.engagement}
          previousScore={previous.engagement}
          icon={Users}
          color="green"
        />
      </div>

      {/* Main Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-text-heading">
            Tendência de Indicadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#666', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#666', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="satisfactionScore"
                  name="Satisfação"
                  stroke="#B14A2B"
                  strokeWidth={2}
                  dot={{ fill: '#B14A2B', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="npsScore"
                  name="NPS"
                  stroke="#517A06"
                  strokeWidth={2}
                  dot={{ fill: '#517A06', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="engagementScore"
                  name="Engajamento"
                  stroke="#3D5C05"
                  strokeWidth={2}
                  dot={{ fill: '#3D5C05', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Participation Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-text-heading">
            Taxa de Participação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#666', fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="responseRate"
                  name="Taxa de Resposta"
                  stroke="#517A06"
                  fill="#517A06"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Dica:</strong> Realize pesquisas de clima mensalmente para
          acompanhar a evolução dos indicadores e identificar tendências. Comparações
          regulares ajudam a medir o impacto das ações implementadas.
        </p>
      </div>
    </div>
  );
}
