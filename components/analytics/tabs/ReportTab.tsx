'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  FileSpreadsheet,
  File,
  Loader2,
  CheckCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/lib/stripe/config";

interface ReportSection {
  id: string;
  label: string;
  description: string;
  included: boolean;
}

interface ReportTabProps {
  assessmentId: string;
  assessmentTitle: string;
  currentPlan: PlanType;
  onExportCSV?: () => Promise<void>;
  onExportPDF?: () => Promise<void>;
}

const defaultSections: ReportSection[] = [
  { id: "summary", label: "Resumo Executivo", description: "Visão geral dos principais indicadores", included: true },
  { id: "blocks", label: "Análise por Blocos NR-1", description: "Detalhamento das 6 categorias de risco", included: true },
  { id: "departments", label: "Análise por Departamento", description: "Comparativo entre departamentos", included: true },
  { id: "anchors", label: "Âncoras de Satisfação", description: "Fatores de proteção identificados", included: true },
  { id: "heatmap", label: "Mapa de Calor", description: "Visualização por pergunta", included: false },
  { id: "wordcloud", label: "Nuvem de Palavras", description: "Análise de respostas abertas", included: false },
  { id: "detailed", label: "Respostas Detalhadas", description: "Listagem completa de respostas", included: false },
  { id: "recommendations", label: "Recomendações", description: "Sugestões baseadas nos resultados", included: true },
];

export function ReportTab({
  assessmentId: _assessmentId,
  assessmentTitle,
  currentPlan: _currentPlan,
  onExportCSV,
  onExportPDF,
}: ReportTabProps) {
  const [sections, setSections] = useState<ReportSection[]>(defaultSections);
  const [isGenerating, setIsGenerating] = useState<"csv" | "pdf" | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  // All plans have access to export features
  const canExport = true;
  const canExportPDF = true;

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, included: !s.included } : s)
    );
  };

  const handleExportCSV = async () => {
    if (!onExportCSV) return;
    setIsGenerating("csv");
    try {
      await onExportCSV();
      setLastGenerated(new Date().toLocaleTimeString("pt-BR"));
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExportPDF = async () => {
    if (!onExportPDF) return;
    setIsGenerating("pdf");
    try {
      await onExportPDF();
      setLastGenerated(new Date().toLocaleTimeString("pt-BR"));
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-pm-olive/10 via-white to-pm-terracotta/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-pm-olive/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-pm-olive" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-heading">
                    Relatório de Análise
                  </h2>
                  <p className="text-text-muted">{assessmentTitle}</p>
                  {lastGenerated && (
                    <p className="text-xs text-pm-olive mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Último export: {lastGenerated}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  disabled={!canExport || isGenerating !== null}
                >
                  {isGenerating === "csv" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                  )}
                  CSV
                </Button>
                <Button
                  onClick={handleExportPDF}
                  disabled={!canExportPDF || isGenerating !== null}
                  className="bg-pm-terracotta hover:bg-pm-terracotta-hover"
                >
                  {isGenerating === "pdf" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <File className="w-4 h-4 mr-2" />
                  )}
                  PDF
                </Button>
              </div>
            </div>
            {!canExport && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Faça upgrade do seu plano para exportar relatórios.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-l-4 border-l-pm-olive">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-pm-olive" />
            </div>
            <div>
              <CardTitle className="font-display text-xl text-text-heading">
                Seções do Relatório
              </CardTitle>
              <p className="text-sm text-text-muted">
                Selecione as seções a incluir no relatório
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all",
                    section.included
                      ? "border-pm-olive bg-pm-olive/5"
                      : "border-border-light hover:border-border"
                  )}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={section.included}
                      onCheckedChange={() => toggleSection(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-text-heading">
                          {section.label}
                        </h4>
                        {section.included && (
                          <Badge className="bg-pm-olive/20 text-pm-olive text-xs">
                            Incluído
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-l-4 border-l-pm-terracotta">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-pm-terracotta" />
            </div>
            <CardTitle className="font-display text-xl text-text-heading">
              Prévia do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-xl p-6 space-y-4">
              {/* Report header preview */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold text-pm-terracotta">
                  Relatório de Riscos Psicossociais NR-1
                </h3>
                <p className="text-sm text-text-muted">{assessmentTitle}</p>
                <p className="text-xs text-text-muted">
                  Gerado em: {new Date().toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Table of contents */}
              <div>
                <h4 className="text-sm font-semibold text-text-heading mb-2">
                  Índice
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-text-muted">
                  {sections
                    .filter(s => s.included)
                    .map((section, _i) => (
                      <li key={section.id}>
                        {section.label}
                      </li>
                    ))}
                </ol>
              </div>

              <div className="text-center py-8 text-text-muted">
                <p className="text-sm">
                  O relatório completo será gerado com as seções selecionadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
