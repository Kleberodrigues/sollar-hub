'use client';

/**
 * Export Buttons Component
 *
 * Botões para exportação de dados do analytics em PDF, CSV e XLSX
 * Com verificação de plano e estados de upgrade
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileDown, FileText, Table, FileSpreadsheet, ChevronDown, Loader2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  exportResponsesCSV,
  exportAnalyticsSummaryCSV,
  exportAnalyticsXLSX,
  getReportData,
  type ExportResult,
} from '@/app/dashboard/analytics/export-actions';
import {  type PlanType } from '@/lib/stripe/config';

interface ExportButtonsProps {
  assessmentId: string;
  currentPlan?: PlanType;
}

// Plan hierarchy for access checks
const PLAN_HIERARCHY: Record<PlanType, number> = {
  base: 1,
  intermediario: 2,
  avancado: 3,
};

// Check if user's plan can access XLSX (requires avançado)
function canAccessXLSX(userPlan: PlanType): boolean {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY['avancado'];
}

export function ExportButtons({ assessmentId, currentPlan = 'base' }: ExportButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const xlsxAvailable = canAccessXLSX(currentPlan);

  // Download de arquivo com suporte a UTF-8 BOM
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    // Usar Uint8Array para garantir encoding UTF-8 correto
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(content);
    const blob = new Blob([uint8Array], { type: `${mimeType.replace(/;$/, '')};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download de arquivo base64
  const downloadBase64File = (base64: string, filename: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler para resultados de export - verifica se é um ExportResult com erro
  const handleExportResult = (result: unknown, format: string): boolean => {
    // Se for um objeto com success=false, é um erro de export
    if (typeof result === 'object' && result !== null && 'success' in result) {
      const exportResult = result as ExportResult;
      if (!exportResult.success) {
        if (exportResult.upgradeRequired) {
          toast.error(exportResult.error, {
            action: {
              label: 'Ver planos',
              onClick: () => window.location.href = '/dashboard/configuracoes/billing',
            },
          });
        } else {
          toast.error(exportResult.error || `Erro ao exportar ${format}`);
        }
        return false;
      }
    }
    return true;
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    try {
      setLoading('pdf');
      const data = await getReportData(assessmentId);

      if (!handleExportResult(data, 'PDF')) return;

      // Importar dinamicamente o gerador de PDF
      const { generateAssessmentPDF } = await import('@/lib/pdf/assessment-report');
      const pdfBlob = await generateAssessmentPDF(data as Exclude<typeof data, ExportResult>);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-assessment-${assessmentId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('[Export PDF] Error:', error);
      toast.error('Erro ao gerar relatório PDF. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  // Exportar Respostas CSV
  const handleExportResponsesCSV = async () => {
    try {
      setLoading('csv-responses');
      const result = await exportResponsesCSV(assessmentId);

      if (!handleExportResult(result, 'CSV')) return;

      if (typeof result === 'string') {
        downloadFile(
          result,
          `respostas-assessment-${assessmentId}-${Date.now()}.csv`,
          'text/csv;charset=utf-8;'
        );
        toast.success('Respostas exportadas com sucesso!');
      }
    } catch (error) {
      console.error('[Export CSV] Error:', error);
      toast.error('Erro ao exportar respostas. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  // Exportar Sumário CSV
  const handleExportSummaryCSV = async () => {
    try {
      setLoading('csv-summary');
      const result = await exportAnalyticsSummaryCSV(assessmentId);

      if (!handleExportResult(result, 'CSV')) return;

      if (typeof result === 'string') {
        downloadFile(
          result,
          `sumario-assessment-${assessmentId}-${Date.now()}.csv`,
          'text/csv;charset=utf-8;'
        );
        toast.success('Sumário exportado com sucesso!');
      }
    } catch (error) {
      console.error('[Export Summary] Error:', error);
      toast.error('Erro ao exportar sumário. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  // Exportar XLSX
  const handleExportXLSX = async () => {
    try {
      setLoading('xlsx');
      const result = await exportAnalyticsXLSX(assessmentId);

      if (!result.success) {
        handleExportResult(result, 'XLSX');
        return;
      }

      if (result.data && result.filename) {
        downloadBase64File(
          result.data,
          result.filename,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        toast.success('Planilha XLSX gerada com sucesso!');
      }
    } catch (error) {
      console.error('[Export XLSX] Error:', error);
      toast.error('Erro ao gerar planilha XLSX. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2" data-testid="export-buttons">
      {/* Dropdown de Export */}
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2"
              disabled={loading !== null}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Exportar
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* PDF */}
            <DropdownMenuItem
              onClick={handleExportPDF}
              disabled={loading !== null}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="flex-1">Relatório PDF</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* CSV - Respostas */}
            <DropdownMenuItem
              onClick={handleExportResponsesCSV}
              disabled={loading !== null}
              className="gap-2"
            >
              <Table className="h-4 w-4" />
              <span className="flex-1">Respostas (CSV)</span>
            </DropdownMenuItem>

            {/* CSV - Sumário */}
            <DropdownMenuItem
              onClick={handleExportSummaryCSV}
              disabled={loading !== null}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              <span className="flex-1">Sumário (CSV)</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* XLSX - Requires Avançado plan */}
            <DropdownMenuItem
              onClick={xlsxAvailable ? handleExportXLSX : undefined}
              disabled={loading !== null || !xlsxAvailable}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="flex-1">Relatório Completo (XLSX)</span>
              {!xlsxAvailable && (
                <Badge variant="outline" className="gap-1 text-xs ml-auto">
                  <Lock className="h-3 w-3" />
                  Avançado
                </Badge>
              )}
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
