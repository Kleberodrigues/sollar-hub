'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, AlertTriangle, CheckCircle, AlertCircle, Info, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RiskData {
  category: string;
  categoryLabel: string;
  leadership: number | null;
  nonLeadership: number | null;
  overall: number;
  responseCount: number;
}

interface ProfessionalHeatMapProps {
  data: RiskData[];
  title?: string;
  showLegend?: boolean;
}

// Category labels in Portuguese
const CATEGORY_LABELS: Record<string, string> = {
  demands_and_pace: "Demanda/Ritmo de Trabalho",
  autonomy_clarity_change: "Autonomia/Clareza",
  leadership_recognition: "Liderança/Reconhecimento",
  relationships_communication: "Relações/Clima",
  work_life_health: "Equilíbrio/Saúde",
  violence_harassment: "Violência/Assédio",
};

// Risk level calculation - aligned with backend thresholds (actions.ts)
// Higher score = higher risk (after normalization)
function getRiskLevel(score: number | null): 'low' | 'medium' | 'high' | 'na' {
  if (score === null) return 'na';
  if (score >= 3.5) return 'high';
  if (score >= 2.5) return 'medium';
  return 'low';
}

// Risk colors following enterprise design
const riskColors = {
  low: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    label: "Baixo Risco",
    icon: CheckCircle,
  },
  medium: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Médio Risco",
    icon: AlertTriangle,
  },
  high: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    label: "Alto Risco",
    icon: AlertCircle,
  },
  na: {
    bg: "bg-gray-50",
    text: "text-gray-400",
    border: "border-gray-200",
    label: "Sem dados",
    icon: Info,
  },
};

function RiskCell({ value, responseCount }: { value: number | null; responseCount?: number }) {
  const risk = getRiskLevel(value);
  const config = riskColors[risk];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center justify-center py-4 px-2 transition-all hover:scale-105 cursor-default",
              config.bg,
              config.border,
              "border-l"
            )}
          >
            {value !== null ? (
              <span className={cn("text-lg font-bold tabular-nums", config.text)}>
                {value.toFixed(1)}
              </span>
            ) : (
              <span className="text-sm text-gray-400">—</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white shadow-lg border">
          <div className="space-y-1">
            <p className={cn("font-semibold text-sm", config.text)}>{config.label}</p>
            {value !== null && (
              <>
                <p className="text-xs text-gray-600">Média: {value.toFixed(2)}</p>
                {responseCount && (
                  <p className="text-xs text-gray-500">{responseCount} respostas</p>
                )}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ProfessionalHeatMap({
  data,
  title = "Mapa de Calor de Riscos",
  showLegend = true
}: ProfessionalHeatMapProps) {
  // Calculate summary stats
  const stats = useMemo(() => {
    const validData = data.filter(d => d.overall !== null);
    const highRisk = validData.filter(d => getRiskLevel(d.overall) === 'high').length;
    const mediumRisk = validData.filter(d => getRiskLevel(d.overall) === 'medium').length;
    const lowRisk = validData.filter(d => getRiskLevel(d.overall) === 'low').length;
    const avgScore = validData.length > 0
      ? validData.reduce((sum, d) => sum + d.overall, 0) / validData.length
      : 0;
    return { highRisk, mediumRisk, lowRisk, avgScore, total: validData.length };
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Mapa de Calor
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              O mapa de calor será gerado quando houver respostas suficientes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">
                {title}
              </CardTitle>
              <p className="text-sm text-slate-500">
                Comparativo por perfil de cargo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              <Users className="w-3 h-3 mr-1" />
              {stats.total} categorias
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Heat Map Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b w-1/2">
                  Bloco NR-1
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 border-b border-l w-1/4">
                  <div className="flex flex-col items-center gap-1">
                    <span>Liderança</span>
                    <span className="text-xs font-normal text-slate-500">Gestores</span>
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700 border-b border-l w-1/4">
                  <div className="flex flex-col items-center gap-1">
                    <span>Não Liderança</span>
                    <span className="text-xs font-normal text-slate-500">Colaboradores</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={row.category}
                  className={cn(
                    "transition-colors hover:bg-slate-50/50",
                    index % 2 === 0 ? "bg-white" : "bg-slate-25"
                  )}
                >
                  <td className="py-0 px-4 border-b">
                    <div className="flex items-center gap-3 py-3">
                      <div className={cn(
                        "w-2 h-8 rounded-full",
                        getRiskLevel(row.overall) === 'low' && "bg-emerald-500",
                        getRiskLevel(row.overall) === 'medium' && "bg-amber-500",
                        getRiskLevel(row.overall) === 'high' && "bg-red-500",
                        getRiskLevel(row.overall) === 'na' && "bg-gray-300"
                      )} />
                      <div>
                        <p className="font-medium text-slate-800">
                          {row.categoryLabel || CATEGORY_LABELS[row.category] || row.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          Média geral: {row.overall.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-0 border-b">
                    <RiskCell value={row.leadership} responseCount={row.responseCount} />
                  </td>
                  <td className="py-0 border-b">
                    <RiskCell value={row.nonLeadership} responseCount={row.responseCount} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="px-4 py-4 bg-slate-50 border-t">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm text-slate-600">Baixo Risco (&lt;2.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm text-slate-600">Médio Risco (2.5-3.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-slate-600">Alto Risco (≥3.5)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard cards
export function CompactHeatMapTable({ data }: { data: RiskData[] }) {
  return (
    <div className="space-y-2">
      {data.slice(0, 6).map((row) => (
        <div key={row.category} className="flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-6 rounded-full flex-shrink-0",
            getRiskLevel(row.overall) === 'low' && "bg-emerald-500",
            getRiskLevel(row.overall) === 'medium' && "bg-amber-500",
            getRiskLevel(row.overall) === 'high' && "bg-red-500",
            getRiskLevel(row.overall) === 'na' && "bg-gray-300"
          )} />
          <span className="text-xs text-slate-600 flex-1 truncate">
            {CATEGORY_LABELS[row.category]?.split('/')[0] || row.category}
          </span>
          <div className="flex gap-1">
            <span className={cn(
              "text-xs font-medium w-8 text-center px-1 py-0.5 rounded",
              riskColors[getRiskLevel(row.leadership)].bg,
              riskColors[getRiskLevel(row.leadership)].text
            )}>
              {row.leadership?.toFixed(1) || '—'}
            </span>
            <span className={cn(
              "text-xs font-medium w-8 text-center px-1 py-0.5 rounded",
              riskColors[getRiskLevel(row.nonLeadership)].bg,
              riskColors[getRiskLevel(row.nonLeadership)].text
            )}>
              {row.nonLeadership?.toFixed(1) || '—'}
            </span>
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-2 text-[10px] text-slate-400 pt-1">
        <span>Lid.</span>
        <span>Não Lid.</span>
      </div>
    </div>
  );
}
