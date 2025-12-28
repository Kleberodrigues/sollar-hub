'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anchor, Heart, Star, ThumbsUp, Shield, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnchorQuestion {
  id: string;
  text: string;
  averageScore: number;
  responseCount: number;
  distribution: { value: string; count: number; percentage: number }[];
}

interface AnchorsTabProps {
  anchors: AnchorQuestion[];
  overallAnchorScore: number;
  compact?: boolean;
}

// Identify question type based on text content
const getQuestionType = (text: string): 'retention' | 'health' | 'satisfaction' | 'default' => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('imagina trabalhando') || lowerText.includes('daqui a 1 ano') || lowerText.includes('permanência')) {
    return 'retention';
  }
  if (lowerText.includes('saúde física') || lowerText.includes('saúde mental') || lowerText.includes('bem-estar')) {
    return 'health';
  }
  if (lowerText.includes('satisfeito') || lowerText.includes('0 a 10') || lowerText.includes('nps') || lowerText.includes('recomendaria')) {
    return 'satisfaction';
  }
  return 'default';
};

// Stacked Bar Chart for Retention Question (Sim/Não tenho certeza/Não)
function RetentionChart({ anchor }: { anchor: AnchorQuestion }) {
  // Calculate distribution for Sim/Não tenho certeza/Não
  // Support both numeric values (5,4 = Sim, 3 = Não tenho certeza, 2,1 = Não)
  // AND text values ("Sim", "Não tenho certeza", "Não")

  let simCount = 0;
  let incertoCount = 0;
  let naoCount = 0;

  anchor.distribution.forEach(d => {
    const val = d.value.toLowerCase().trim();

    // Check for text values first
    if (val === 'sim' || val === 'yes') {
      simCount += d.count;
    } else if (val.includes('não tenho certeza') || val.includes('talvez') || val.includes('maybe') || val.includes('incerto')) {
      incertoCount += d.count;
    } else if (val === 'não' || val === 'nao' || val === 'no') {
      naoCount += d.count;
    }
    // Fallback to numeric values
    else if (['5', '4'].includes(d.value)) {
      simCount += d.count;
    } else if (d.value === '3') {
      incertoCount += d.count;
    } else if (['2', '1'].includes(d.value)) {
      naoCount += d.count;
    }
  });

  const totalCategorized = simCount + incertoCount + naoCount;
  const totalResponses = anchor.distribution.reduce((acc, d) => acc + d.count, 0);

  // If we couldn't categorize any responses, show raw distribution instead
  if (totalCategorized === 0 && totalResponses > 0) {
    // Sort by percentage descending
    const sortedDist = [...anchor.distribution].sort((a, b) => b.count - a.count);
    const maxPct = Math.max(...sortedDist.map(d => d.percentage), 1);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-text-heading">Intenção de Permanência</h4>
          <span className="text-sm text-text-muted">{anchor.responseCount} respostas</span>
        </div>

        {/* Show raw distribution as horizontal bars */}
        <div className="space-y-3">
          {sortedDist.map((dist, i) => {
            const barWidth = (dist.percentage / maxPct) * 100;
            // Assign colors based on index or value keywords
            const val = dist.value.toLowerCase();
            let barColor = 'bg-gray-400';
            if (val.includes('sim') || val === 'yes' || val === '5' || val === '4') {
              barColor = 'bg-emerald-500';
            } else if (val.includes('certeza') || val.includes('talvez') || val === '3') {
              barColor = 'bg-amber-400';
            } else if (val.includes('não') || val.includes('nao') || val === 'no' || val === '2' || val === '1') {
              barColor = 'bg-red-500';
            }

            return (
              <div key={dist.value} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary w-32 text-right truncate" title={dist.value}>
                  {dist.value}
                </span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={cn("h-full rounded-lg flex items-center justify-end pr-2", barColor)}
                  >
                    {dist.percentage >= 5 && (
                      <span className="text-xs font-medium text-white">{dist.percentage.toFixed(0)}%</span>
                    )}
                  </motion.div>
                </div>
                <span className="text-sm font-medium text-text-heading w-10">{dist.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const total = totalCategorized || 1;
  const simPct = Math.round((simCount / total) * 100);
  const incertoPct = Math.round((incertoCount / total) * 100);
  const naoPct = Math.round((naoCount / total) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-text-heading">Intenção de Permanência</h4>
        <span className="text-sm text-text-muted">{anchor.responseCount} respostas</span>
      </div>

      {/* Stacked horizontal bar */}
      <div className="relative h-10 rounded-lg overflow-hidden flex bg-gray-100">
        {simPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${simPct}%` }}
            transition={{ duration: 0.8 }}
            className="bg-emerald-500 h-full flex items-center justify-center"
          >
            {simPct >= 10 && <span className="text-xs font-medium text-white">{simPct}%</span>}
          </motion.div>
        )}
        {incertoPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${incertoPct}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-amber-400 h-full flex items-center justify-center"
          >
            {incertoPct >= 10 && <span className="text-xs font-medium text-white">{incertoPct}%</span>}
          </motion.div>
        )}
        {naoPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${naoPct}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-red-500 h-full flex items-center justify-center"
          >
            {naoPct >= 10 && <span className="text-xs font-medium text-white">{naoPct}%</span>}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-sm text-text-secondary">Sim ({simPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-400" />
          <span className="text-sm text-text-secondary">Não tenho certeza ({incertoPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-text-secondary">Não ({naoPct}%)</span>
        </div>
      </div>
    </div>
  );
}

// Horizontal Bar Chart for Health Question
function HealthBarChart({ anchor }: { anchor: AnchorQuestion }) {
  const labels = ['Muito Ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'];
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

  // Sort distribution by value descending
  const sortedDist = [...anchor.distribution].sort((a, b) => parseInt(b.value) - parseInt(a.value));
  const maxPct = Math.max(...sortedDist.map(d => d.percentage), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-text-heading">Autoavaliação de Saúde</h4>
        <span className="text-sm text-text-muted">{anchor.responseCount} respostas</span>
      </div>

      <div className="space-y-3">
        {sortedDist.map((dist, i) => {
          const valueIndex = parseInt(dist.value) - 1;
          const label = labels[valueIndex] || dist.value;
          const color = colors[valueIndex] || 'bg-gray-400';
          const barWidth = (dist.percentage / maxPct) * 100;

          return (
            <div key={dist.value} className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-24 text-right">{label}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={cn("h-full rounded-lg flex items-center justify-end pr-2", color)}
                >
                  {dist.percentage >= 5 && (
                    <span className="text-xs font-medium text-white">{dist.percentage}%</span>
                  )}
                </motion.div>
              </div>
              <span className="text-sm font-medium text-text-heading w-12">{dist.count}</span>
            </div>
          );
        })}
      </div>

      {/* Average score */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
        <TrendingUp className="w-4 h-4 text-pm-olive" />
        <span className="text-sm text-text-muted">Média:</span>
        <span className="font-bold text-pm-olive">{anchor.averageScore.toFixed(2)}</span>
      </div>
    </div>
  );
}

// Gauge Chart for Satisfaction Question (NPS style, 0-10 scale)
function SatisfactionGauge({ anchor }: { anchor: AnchorQuestion }) {
  // Score is 0-10 (NPS scale)
  const score = anchor.averageScore;
  const maxScore = 10;
  const percentage = (score / maxScore) * 100;

  // Calculate needle angle (-90 to 90 degrees)
  const needleAngle = (percentage / 100) * 180 - 90;

  // Determine color based on score (0-10 scale)
  const getScoreColor = (s: number) => {
    if (s >= 8) return { text: 'text-emerald-600', fill: '#10b981' };
    if (s >= 6) return { text: 'text-emerald-400', fill: '#34d399' };
    if (s >= 4) return { text: 'text-amber-500', fill: '#f59e0b' };
    if (s >= 2) return { text: 'text-orange-500', fill: '#f97316' };
    return { text: 'text-red-500', fill: '#ef4444' };
  };

  const scoreColor = getScoreColor(score);

  // Get color for distribution bar based on value (0-10)
  const getDistributionColor = (value: string) => {
    const numVal = parseInt(value);
    if (numVal >= 9) return 'bg-emerald-600';
    if (numVal >= 7) return 'bg-emerald-400';
    if (numVal >= 5) return 'bg-amber-400';
    if (numVal >= 3) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-text-heading">Satisfação Geral</h4>
        <span className="text-sm text-text-muted">{anchor.responseCount} respostas</span>
      </div>

      {/* Gauge - 0 to 10 scale */}
      <div className="flex flex-col items-center">
        <div className="relative w-72 h-36">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background arc segments - 5 segments for 0-10 scale */}
            {/* Segment 1: 0-2 (Red) */}
            <path
              d="M 20 100 A 80 80 0 0 1 44 44"
              fill="none"
              stroke="#ef4444"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Segment 2: 2-4 (Orange) */}
            <path
              d="M 48 40 A 80 80 0 0 1 82 22"
              fill="none"
              stroke="#f97316"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Segment 3: 4-6 (Yellow) */}
            <path
              d="M 86 21 A 80 80 0 0 1 118 21"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Segment 4: 6-8 (Light Green) */}
            <path
              d="M 122 22 A 80 80 0 0 1 156 40"
              fill="none"
              stroke="#34d399"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Segment 5: 8-10 (Green) */}
            <path
              d="M 160 44 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Needle */}
            <g transform={`rotate(${needleAngle}, 100, 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke="#374151"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="8" fill="#374151" />
              <circle cx="100" cy="100" r="4" fill="#fff" />
            </g>

            {/* Scale labels: 0, 2, 4, 6, 8, 10 */}
            <text x="10" y="105" className="text-[10px] fill-red-500 font-medium">0</text>
            <text x="35" y="50" className="text-[10px] fill-orange-500 font-medium">2</text>
            <text x="70" y="22" className="text-[10px] fill-amber-500 font-medium">4</text>
            <text x="120" y="22" className="text-[10px] fill-emerald-400 font-medium">6</text>
            <text x="155" y="50" className="text-[10px] fill-emerald-500 font-medium">8</text>
            <text x="180" y="105" className="text-[10px] fill-emerald-600 font-medium">10</text>
          </svg>

          {/* Score display */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
            <span className={cn("text-4xl font-bold", scoreColor.text)}>
              {score.toFixed(1)}
            </span>
            <span className="text-lg text-text-muted">/10</span>
          </div>
        </div>

        <p className="text-sm text-text-muted mt-2">Índice de Satisfação Médio</p>
      </div>

      {/* Distribution mini bars - sorted by value */}
      <div className="mt-4">
        <p className="text-xs text-text-muted mb-2">Distribuição das respostas:</p>
        <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
          {[...anchor.distribution]
            .sort((a, b) => parseInt(a.value) - parseInt(b.value))
            .map((dist, i) => (
            <div
              key={i}
              className={cn(
                "transition-all flex items-center justify-center",
                getDistributionColor(dist.value)
              )}
              style={{ width: `${dist.percentage}%` }}
              title={`${dist.value}: ${dist.count} (${dist.percentage}%)`}
            >
              {dist.percentage >= 8 && (
                <span className="text-[10px] font-medium text-white">{dist.value}</span>
              )}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex justify-between text-[10px] text-text-muted mt-1">
          <span>Detratores (0-6)</span>
          <span>Neutros (7-8)</span>
          <span>Promotores (9-10)</span>
        </div>
      </div>
    </div>
  );
}

// Default visualization
function DefaultAnchorChart({ anchor }: { anchor: AnchorQuestion }) {
  const getSatisfactionLevel = (score: number) => {
    if (score >= 4) return { label: "Excelente", color: "text-green-600 bg-green-100" };
    if (score >= 3) return { label: "Bom", color: "text-blue-600 bg-blue-100" };
    if (score >= 2) return { label: "Regular", color: "text-yellow-600 bg-yellow-100" };
    return { label: "Baixo", color: "text-red-600 bg-red-100" };
  };

  const level = getSatisfactionLevel(anchor.averageScore);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">{anchor.responseCount} respostas</span>
            <Badge className={cn("text-xs", level.color)}>{level.label}</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-text-heading">{anchor.averageScore.toFixed(2)}</p>
        </div>
      </div>
      {/* Distribution bars */}
      <div className="flex gap-1 h-2">
        {anchor.distribution.map((dist, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all",
              dist.value === "5" && "bg-green-500",
              dist.value === "4" && "bg-green-400",
              dist.value === "3" && "bg-yellow-400",
              dist.value === "2" && "bg-orange-400",
              dist.value === "1" && "bg-red-400"
            )}
            style={{ width: `${dist.percentage}%` }}
            title={`${dist.value}: ${dist.percentage}%`}
          />
        ))}
      </div>
    </div>
  );
}

export function AnchorsTab({ anchors, overallAnchorScore, compact = false }: AnchorsTabProps) {
  const getSatisfactionLevel = (score: number): { label: string; color: string; icon: typeof Heart } => {
    if (score >= 4) return { label: "Excelente", color: "text-green-600 bg-green-100", icon: Star };
    if (score >= 3) return { label: "Bom", color: "text-blue-600 bg-blue-100", icon: ThumbsUp };
    if (score >= 2) return { label: "Regular", color: "text-yellow-600 bg-yellow-100", icon: Shield };
    return { label: "Baixo", color: "text-red-600 bg-red-100", icon: Heart };
  };

  const overallLevel = getSatisfactionLevel(overallAnchorScore);
  const OverallIcon = overallLevel.icon;

  // Compact view for SectionCard
  if (compact) {
    if (anchors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Anchor className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-text-muted">Nenhuma âncora configurada</p>
          <p className="text-xs text-text-muted mt-1">Adicione perguntas da categoria &quot;anchors&quot;</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Score principal */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" className="stroke-gray-100" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                className="stroke-pm-olive" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${(overallAnchorScore / 5) * 88} 100`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-text-heading">{overallAnchorScore.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-heading">Índice de Satisfação</p>
            <Badge className={cn("mt-1 text-xs", overallLevel.color)}>
              <OverallIcon className="w-3 h-3 mr-1" />
              {overallLevel.label}
            </Badge>
          </div>
        </div>

        {/* Lista de âncoras compacta */}
        <div className="flex-1 space-y-2 overflow-auto">
          {anchors.slice(0, 4).map((anchor) => {
            const level = getSatisfactionLevel(anchor.averageScore);
            return (
              <div key={anchor.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="text-xs text-text-secondary line-clamp-1 flex-1">
                  {anchor.text.length > 40 ? anchor.text.substring(0, 40) + '...' : anchor.text}
                </span>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full",
                    level.label === "Excelente" && "bg-green-500",
                    level.label === "Bom" && "bg-blue-500",
                    level.label === "Regular" && "bg-yellow-500",
                    level.label === "Baixo" && "bg-red-500"
                  )} />
                  <span className="text-xs font-medium text-text-heading w-6 text-right">
                    {anchor.averageScore.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
          {anchors.length > 4 && (
            <p className="text-xs text-text-muted text-center pt-2">
              +{anchors.length - 4} mais
            </p>
          )}
        </div>
      </div>
    );
  }

  if (anchors.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <Anchor className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Âncoras de Satisfação
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              As âncoras medem fatores de proteção e satisfação.
              Adicione perguntas da categoria &quot;anchors&quot; ao questionário.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render the appropriate visualization based on question type
  const renderAnchorVisualization = (anchor: AnchorQuestion) => {
    const questionType = getQuestionType(anchor.text);

    switch (questionType) {
      case 'retention':
        return <RetentionChart anchor={anchor} />;
      case 'health':
        return <HealthBarChart anchor={anchor} />;
      case 'satisfaction':
        return <SatisfactionGauge anchor={anchor} />;
      default:
        return <DefaultAnchorChart anchor={anchor} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-pm-olive/10 via-white to-pm-sage-light/20 border-l-4 border-l-pm-olive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-pm-olive/20 flex items-center justify-center">
                  <Anchor className="w-8 h-8 text-pm-olive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Índice Geral de Satisfação
                  </h3>
                  <p className="text-sm text-text-muted">
                    Baseado em {anchors.length} indicadores de âncoras
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-pm-olive">
                    {overallAnchorScore.toFixed(1)}
                  </p>
                  <div className="text-sm text-text-muted">/5.0</div>
                </div>
                <Badge className={cn("mt-2", overallLevel.color)}>
                  <overallLevel.icon className="w-3 h-3 mr-1" />
                  {overallLevel.label}
                </Badge>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(overallAnchorScore / 5) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-pm-olive to-pm-olive-light rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Anchors with specific visualizations */}
      <Card className="border-l-4 border-l-pm-terracotta">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pm-terracotta" />
          </div>
          <div>
            <CardTitle className="font-display text-xl text-text-heading">
              Detalhamento das Âncoras
            </CardTitle>
            <p className="text-sm text-text-muted">
              Fatores de proteção e satisfação no trabalho
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {anchors.map((anchor, index) => {
              return (
                <motion.div
                  key={anchor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-bg-secondary hover:bg-bg-sage/50 transition-all"
                >
                  {/* Question text */}
                  <p className="font-medium text-text-heading mb-4 text-lg">
                    {anchor.text}
                  </p>

                  {/* Render specific visualization */}
                  {renderAnchorVisualization(anchor)}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
