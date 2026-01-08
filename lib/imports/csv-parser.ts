/**
 * CSV/XLSX Parser for Data Import
 *
 * Parseia e valida arquivos CSV/XLSX para importação de respostas
 */

import Papa from 'papaparse';

// ============================================
// Types
// ============================================

export interface ImportRow {
  anonymous_id: string;
  question_id: string;
  response_text: string;
  value?: string;
  created_at?: string;
}

export interface ParseResult {
  success: boolean;
  data: ImportRow[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  validRows: number;
}

export interface ValidationOptions {
  questionIds: string[];
  maxRows?: number;
  allowEmptyResponses?: boolean;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Gera ID anônimo único
 */
export function generateAnonymousId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `import-${timestamp}-${randomPart}`;
}

/**
 * Sanitiza string para prevenir injection
 */
function sanitizeString(value: string): string {
  if (!value) return '';

  // Remove caracteres potencialmente perigosos
  return value
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 10000); // Limita tamanho
}

/**
 * Valida formato de UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// ============================================
// CSV Parser
// ============================================

/**
 * Parseia conteúdo CSV para array de ImportRow
 */
export function parseCSV(content: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: ImportRow[] = [];

  try {
    // Remove BOM se presente
    const cleanContent = content.replace(/^\uFEFF/, '');

    // Detectar separador (ponto-e-vírgula ou vírgula)
    const firstDataLine = cleanContent.split(/\r?\n/).find(line => !line.startsWith('#') && line.trim());
    const delimiter = firstDataLine?.includes(';') ? ';' : ',';

    const result = Papa.parse(cleanContent, {
      header: true,
      skipEmptyLines: true,
      delimiter, // Usar separador detectado
      transformHeader: (header) => header.toLowerCase().trim(),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((err) => {
        errors.push(`Linha ${err.row}: ${err.message}`);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.data.forEach((row: any, index: number) => {
      const lineNum = index + 2; // +2 porque começa em 0 e tem header

      // Mapear campos (suporta múltiplos nomes de coluna)
      const questionId = row.question_id || row.questionid || row.pergunta_id || '';
      const responseText = row.response_text || row.responsetext || row.resposta || row.response || '';
      const value = row.value || row.valor || '';
      const anonymousId = row.anonymous_id || row.anonymousid || row.participante || '';
      const createdAt = row.created_at || row.createdat || row.data || '';

      // Validações básicas
      if (!questionId) {
        warnings.push(`Linha ${lineNum}: question_id vazio, linha será ignorada`);
        return;
      }

      if (!responseText && !value) {
        warnings.push(`Linha ${lineNum}: resposta vazia`);
      }

      data.push({
        question_id: sanitizeString(questionId),
        response_text: sanitizeString(responseText || value),
        value: sanitizeString(value),
        anonymous_id: sanitizeString(anonymousId) || generateAnonymousId(),
        created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      });
    });

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
      totalRows: result.data.length,
      validRows: data.length,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Erro ao parsear CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
      warnings: [],
      totalRows: 0,
      validRows: 0,
    };
  }
}

// ============================================
// Validation
// ============================================

/**
 * Valida dados de import contra lista de question_ids válidos
 */
export function validateImportData(
  rows: ImportRow[],
  options: ValidationOptions
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { questionIds, maxRows = 10000, allowEmptyResponses = false } = options;

  // Verificar limite de linhas
  if (rows.length > maxRows) {
    errors.push(`Arquivo excede o limite de ${maxRows} linhas (${rows.length} linhas encontradas)`);
  }

  // Validar cada linha
  rows.forEach((row, index) => {
    const lineNum = index + 1;

    // Verificar question_id
    if (!row.question_id) {
      errors.push(`Linha ${lineNum}: question_id é obrigatório`);
    } else if (!isValidUUID(row.question_id)) {
      errors.push(`Linha ${lineNum}: question_id inválido (deve ser UUID)`);
    } else if (!questionIds.includes(row.question_id)) {
      errors.push(`Linha ${lineNum}: question_id não existe neste assessment`);
    }

    // Verificar resposta
    if (!row.response_text && !row.value && !allowEmptyResponses) {
      warnings.push(`Linha ${lineNum}: resposta vazia`);
    }

    // Verificar data
    if (row.created_at) {
      const date = new Date(row.created_at);
      if (isNaN(date.getTime())) {
        warnings.push(`Linha ${lineNum}: data inválida, usando data atual`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// Template Generation
// ============================================

/**
 * Gera template CSV para download
 */
export function generateCSVTemplate(questions: Array<{ id: string; text: string; category: string }>): string {
  // Usar ponto-e-vírgula para Excel em português
  const headers = ['question_id', 'response_text', 'anonymous_id', 'created_at'];
  const exampleRows = questions.slice(0, 3).map((q, i) => [
    q.id,
    'Exemplo de resposta',
    `participante-${i + 1}`,
    new Date().toISOString(),
  ]);

  // Adicionar comentários com instruções
  const instructions = [
    '# INSTRUÇÕES DE IMPORTAÇÃO',
    '# - question_id: ID da pergunta (obrigatório, UUID)',
    '# - response_text: Texto da resposta (obrigatório)',
    '# - anonymous_id: ID do participante (opcional, será gerado se vazio)',
    '# - created_at: Data da resposta (opcional, formato ISO)',
    '#',
    '# Perguntas disponíveis neste assessment:',
    ...questions.map((q) => `# ${q.id} - ${q.text.substring(0, 60)}...`),
    '#',
  ];

  const BOM = '\uFEFF';
  // Usar ponto-e-vírgula como separador para Excel em português
  const csvContent = [
    ...instructions,
    headers.join(';'),
    ...exampleRows.map((row) => row.join(';')),
  ].join('\n');

  return BOM + csvContent;
}

// ============================================
// File Size Validation
// ============================================

/**
 * Valida tamanho do arquivo (max 10MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Valida tipo de arquivo
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado. Use CSV ou XLSX.',
    };
  }

  return { valid: true };
}
