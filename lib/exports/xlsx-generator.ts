/**
 * XLSX Generator for Analytics Reports
 *
 * Gera planilhas Excel com múltiplas abas para relatórios de analytics
 * Requer plano Enterprise
 */

import ExcelJS from 'exceljs';

export interface AnalyticsXLSXData {
  assessmentTitle: string;
  organizationName: string;
  totalParticipants: number;
  totalQuestions: number;
  completionRate: number;
  lastResponseDate: string;
  generatedAt: string;
  categoryScores: Array<{
    category: string;
    categoryName: string;
    avgScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskLabel: string;
    responseCount: number;
    questionCount: number;
  }>;
  responses?: Array<{
    id: string;
    anonymous_id: string;
    question_text: string;
    category: string;
    type: string;
    response: string;
    created_at: string;
  }>;
}

// Cores da marca Sollar
const COLORS = {
  terracotta: 'FFD4644A',
  olive: 'FF7A8450',
  sage: 'FFBEC5AD',
  cream: 'FFF8F5F0',
  heading: 'FF333333',
  muted: 'FF666666',
  riskHigh: 'FFEF4444',
  riskMedium: 'FFF59E0B',
  riskLow: 'FF22C55E',
};

/**
 * Gera arquivo XLSX com múltiplas abas
 */
export async function generateAnalyticsXLSX(data: AnalyticsXLSXData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Sollar Insight Hub';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ========================================
  // Sheet 1: Resumo Executivo
  // ========================================
  const summarySheet = workbook.addWorksheet('Resumo Executivo', {
    properties: { tabColor: { argb: COLORS.terracotta.slice(2) } },
  });

  // Header com logo (texto)
  summarySheet.mergeCells('A1:E1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'SOLLAR INSIGHT HUB';
  titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: COLORS.terracotta } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 35;

  // Subtítulo
  summarySheet.mergeCells('A2:E2');
  const subtitleCell = summarySheet.getCell('A2');
  subtitleCell.value = 'Relatório de Análise de Riscos Psicossociais';
  subtitleCell.font = { name: 'Arial', size: 12, italic: true, color: { argb: COLORS.muted } };
  subtitleCell.alignment = { horizontal: 'center' };

  // Informações do assessment
  summarySheet.addRow([]);
  summarySheet.addRow(['Assessment:', data.assessmentTitle]);
  summarySheet.addRow(['Organização:', data.organizationName]);
  summarySheet.addRow(['Gerado em:', data.generatedAt]);
  summarySheet.addRow([]);

  // Métricas
  summarySheet.addRow(['MÉTRICAS GERAIS']);
  const metricsHeaderRow = summarySheet.lastRow!;
  metricsHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  metricsHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.olive } };

  summarySheet.addRow(['Total de Participantes', data.totalParticipants]);
  summarySheet.addRow(['Total de Perguntas', data.totalQuestions]);
  summarySheet.addRow(['Taxa de Conclusão', `${data.completionRate}%`]);
  summarySheet.addRow(['Última Resposta', data.lastResponseDate]);

  // Estilo das colunas
  summarySheet.getColumn(1).width = 25;
  summarySheet.getColumn(2).width = 40;

  // ========================================
  // Sheet 2: Análise por Categoria
  // ========================================
  const categorySheet = workbook.addWorksheet('Análise por Categoria', {
    properties: { tabColor: { argb: COLORS.olive.slice(2) } },
  });

  // Header
  const categoryHeaders = ['Categoria', 'Pontuação Média', 'Nível de Risco', 'Respostas', 'Perguntas'];
  const categoryHeaderRow = categorySheet.addRow(categoryHeaders);
  categoryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  categoryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.olive } };
  categoryHeaderRow.alignment = { horizontal: 'center' };

  // Dados
  data.categoryScores.forEach((cat) => {
    const row = categorySheet.addRow([
      cat.categoryName,
      cat.avgScore,
      cat.riskLabel,
      cat.responseCount,
      cat.questionCount,
    ]);

    // Colorir célula de risco
    const riskCell = row.getCell(3);
    const riskColor = cat.riskLevel === 'high' ? COLORS.riskHigh
      : cat.riskLevel === 'medium' ? COLORS.riskMedium
      : COLORS.riskLow;
    riskCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: riskColor } };
    riskCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    riskCell.alignment = { horizontal: 'center' };
  });

  // Auto-width
  categorySheet.columns.forEach((column, i) => {
    column.width = [40, 18, 15, 12, 12][i] || 15;
  });

  // Adicionar bordas
  categorySheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });
  });

  // ========================================
  // Sheet 3: Respostas Detalhadas (se disponível)
  // ========================================
  if (data.responses && data.responses.length > 0) {
    const responsesSheet = workbook.addWorksheet('Respostas Detalhadas', {
      properties: { tabColor: { argb: COLORS.sage.slice(2) } },
    });

    // Header
    const responseHeaders = ['ID', 'Participante', 'Pergunta', 'Categoria', 'Tipo', 'Resposta', 'Data/Hora'];
    const responseHeaderRow = responsesSheet.addRow(responseHeaders);
    responseHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    responseHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.olive } };

    // Dados
    data.responses.forEach((r) => {
      responsesSheet.addRow([
        r.id,
        r.anonymous_id,
        r.question_text,
        r.category,
        r.type,
        r.response,
        r.created_at,
      ]);
    });

    // Auto-width
    responsesSheet.columns.forEach((column, i) => {
      column.width = [15, 15, 50, 25, 15, 30, 20][i] || 15;
    });

    // Wrap text na coluna de perguntas
    responsesSheet.getColumn(3).alignment = { wrapText: true };
  }

  // ========================================
  // Sheet 4: Gráfico de Resumo (dados para gráfico)
  // ========================================
  const chartDataSheet = workbook.addWorksheet('Dados para Gráfico', {
    properties: { tabColor: { argb: COLORS.cream.slice(2) } },
  });

  chartDataSheet.addRow(['Categoria', 'Score']);
  data.categoryScores.forEach((cat) => {
    chartDataSheet.addRow([cat.categoryName, cat.avgScore]);
  });

  chartDataSheet.getColumn(1).width = 40;
  chartDataSheet.getColumn(2).width = 15;

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Tipo de retorno simplificado para o cliente
 */
export interface XLSXExportResult {
  success: boolean;
  data?: string; // Base64 encoded
  filename?: string;
  error?: string;
}
