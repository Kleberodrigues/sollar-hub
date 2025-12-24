'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, TrendingDown, Minus, Lock, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuppressionTooltipContent } from "../SuppressedDataCard";
import { ANONYMITY_THRESHOLDS } from "@/lib/constants/anonymity-thresholds";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DepartmentData {
  id: string;
  name: string;
  participantCount: number;
  responseCount: number;
  averageScore: number;
  riskLevel: "low" | "medium" | "high";
  trend?: "up" | "down" | "stable";
  employeeCount?: number;
  isSuppressed?: boolean;
}

interface DepartmentAnalysisTabProps {
  departments: DepartmentData[];
  totalParticipants: number;
  compact?: boolean;
}

export function DepartmentAnalysisTab({
  departments,
  totalParticipants,
  compact = false
}: DepartmentAnalysisTabProps) {
  const getRiskDotColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-red-500";
    }
  };

  // Compact empty state
  if (compact && departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Building2 className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm text-text-muted">Nenhum departamento configurado</p>
        <p className="text-xs text-text-muted mt-1">Configure departamentos no assessment</p>
      </div>
    );
  }

  // Compact view for SectionCard
  if (compact) {
    const highRiskCount = departments.filter(d => d.riskLevel === "high").length;
    const avgScore = departments.length > 0
      ? departments.reduce((sum, d) => sum + d.averageScore, 0) / departments.length
      : 0;

    return (
      <div className="flex flex-col h-full">
        {/* Resumo */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex-1 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-pm-olive">{departments.length}</p>
              <p className="text-[10px] text-text-muted">Deptos</p>
            </div>
            <div>
              <p className="text-xl font-bold text-text-heading">{avgScore.toFixed(1)}</p>
              <p className="text-[10px] text-text-muted">Score</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{highRiskCount}</p>
              <p className="text-[10px] text-text-muted">Alto Risco</p>
            </div>
          </div>
        </div>

        {/* Lista de departamentos compacta */}
        <div className="flex-1 space-y-2 overflow-auto">
          {departments.slice(0, 5).map((dept) => (
            <div key={dept.id} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-pm-olive/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-pm-olive">
                  {dept.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-text-secondary flex-1 truncate">
                {dept.name}
              </span>
              <div className={cn("w-2 h-2 rounded-full", getRiskDotColor(dept.riskLevel))} />
              <span className="text-xs font-medium text-text-heading w-8 text-right">
                {dept.averageScore.toFixed(1)}
              </span>
            </div>
          ))}
          {departments.length > 5 && (
            <p className="text-xs text-text-muted text-center pt-2">
              +{departments.length - 5} mais
            </p>
          )}
        </div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Análise por Departamento
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Para visualizar análises por departamento, configure os departamentos
              no assessment e certifique-se de que os participantes estão vinculados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low": return "bg-green-100 text-green-700 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high": return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // Count suppressed departments
  const suppressedCount = departments.filter(d => d.isSuppressed === true).length;

  return (
    <div className="space-y-6">
      {/* Anonymity Notice */}
      {suppressedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
        >
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              {suppressedCount} {suppressedCount === 1 ? 'departamento protegido' : 'departamentos protegidos'} por anonimato
            </p>
            <p className="text-xs text-amber-700">
              Departamentos com menos de {ANONYMITY_THRESHOLDS.DEPARTMENT_MINIMUM} funcionários não exibem análises detalhadas.
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-pm-olive/10 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pm-olive/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-pm-olive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pm-olive">{departments.length}</p>
                  <p className="text-sm text-text-muted">Departamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-pm-terracotta/10 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pm-terracotta/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-pm-terracotta" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pm-terracotta">{totalParticipants}</p>
                  <p className="text-sm text-text-muted">Total Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {departments.filter(d => d.riskLevel === "high").length}
                  </p>
                  <p className="text-sm text-text-muted">Alto Risco</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Departments List */}
      <Card className="border-l-4 border-l-pm-olive">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-pm-olive" />
          </div>
          <CardTitle className="font-display text-xl text-text-heading">
            Risco por Departamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departments.map((dept, index) => {
              const isSuppressed = dept.isSuppressed === true;

              if (isSuppressed) {
                return (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-900">{dept.name}</h4>
                        <p className="text-sm text-amber-700">
                          {dept.employeeCount || 0} funcionários no departamento
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm">
                              <Shield className="w-4 h-4" />
                              <span>Protegido</span>
                              <Info className="w-3.5 h-3.5 opacity-70" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <SuppressionTooltipContent
                              currentCount={dept.employeeCount || 0}
                              minimumRequired={ANONYMITY_THRESHOLDS.DEPARTMENT_MINIMUM}
                              countType="employees"
                            />
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary hover:bg-bg-sage transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-pm-olive/20 flex items-center justify-center">
                      <span className="text-pm-olive font-semibold">
                        {dept.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-heading">{dept.name}</h4>
                      <p className="text-sm text-text-muted">
                        {dept.participantCount} participantes • {dept.responseCount} respostas
                        {dept.employeeCount ? ` • ${dept.employeeCount} funcionários` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-text-heading">
                        {dept.averageScore.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        {getTrendIcon(dept.trend)}
                        <span className="text-xs text-text-muted">vs anterior</span>
                      </div>
                    </div>
                    <Badge className={cn("border", getRiskColor(dept.riskLevel))}>
                      {dept.riskLevel === "low" ? "Baixo" : dept.riskLevel === "medium" ? "Médio" : "Alto"}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
