'use client';

/**
 * Export Buttons Component
 *
 * Botões para exportação de dados do analytics em PDF e CSV
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, FileText, Table } from 'lucide-react';
import {
  exportResponsesCSV,
  exportAnalyticsSummaryCSV,
  getReportData,
} from '@/app/dashboard/analytics/export-actions';

interface ExportButtonsProps {
  assessmentId: string;
}

export function ExportButtons({ assessmentId }: ExportButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  /**
   * Download de arquivo
   */
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Exportar relatório em PDF
   */
  const handleExportPDF = async () => {
    try {
      setLoading('pdf');

      // Buscar dados do servidor
      const data = await getReportData(assessmentId);

      // Importar dinamicamente o gerador de PDF (client-side only)
      const { generateAssessmentPDF } = await import('@/lib/pdf/assessment-report');

      // Gerar PDF
      const pdfBlob = await generateAssessmentPDF(data);

      // Download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-assessment-${assessmentId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar relatório PDF. Verifique o console para mais detalhes.');
    } finally {
      setLoading(null);
    }
  };

  /**
   * Exportar respostas detalhadas em CSV
   */
  const handleExportResponsesCSV = async () => {
    try {
      setLoading('csv-responses');

      const csvContent = await exportResponsesCSV(assessmentId);

      downloadFile(
        csvContent,
        `respostas-assessment-${assessmentId}-${Date.now()}.csv`,
        'text/csv;charset=utf-8;'
      );
    } catch (error) {
      console.error('Erro ao exportar CSV de respostas:', error);
      alert('Erro ao exportar respostas. Verifique o console para mais detalhes.');
    } finally {
      setLoading(null);
    }
  };

  /**
   * Exportar sumário de análise em CSV
   */
  const handleExportSummaryCSV = async () => {
    try {
      setLoading('csv-summary');

      const csvContent = await exportAnalyticsSummaryCSV(assessmentId);

      downloadFile(
        csvContent,
        `sumario-assessment-${assessmentId}-${Date.now()}.csv`,
        'text/csv;charset=utf-8;'
      );
    } catch (error) {
      console.error('Erro ao exportar CSV de sumário:', error);
      alert('Erro ao exportar sumário. Verifique o console para mais detalhes.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Exportar PDF */}
      <Button
        onClick={handleExportPDF}
        disabled={loading !== null}
        variant="outline"
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        {loading === 'pdf' ? 'Gerando PDF...' : 'Exportar Relatório (PDF)'}
      </Button>

      {/* Exportar Respostas CSV */}
      <Button
        onClick={handleExportResponsesCSV}
        disabled={loading !== null}
        variant="outline"
        className="gap-2"
      >
        <Table className="h-4 w-4" />
        {loading === 'csv-responses' ? 'Exportando...' : 'Exportar Respostas (CSV)'}
      </Button>

      {/* Exportar Sumário CSV */}
      <Button
        onClick={handleExportSummaryCSV}
        disabled={loading !== null}
        variant="outline"
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        {loading === 'csv-summary' ? 'Exportando...' : 'Exportar Sumário (CSV)'}
      </Button>
    </div>
  );
}
