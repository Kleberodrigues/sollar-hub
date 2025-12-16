/**
 * User Import Parser
 *
 * Parseia e valida arquivos CSV/XLSX para importação em massa de usuários
 */

import Papa from "papaparse";
import ExcelJS from "exceljs";
import {
  type BulkImportRow,
  type RawImportRow,
  type BulkImportValidationResult,
  type RowValidationResult,
  validateImportRow,
  validRoles,
  BULK_IMPORT_LIMITS,
} from "@/lib/validations/bulk-import";

// ============================================
// Types
// ============================================

export interface UserParseResult {
  success: boolean;
  data: RawImportRow[];
  errors: string[];
  warnings: string[];
  totalRows: number;
}

export interface Department {
  id: string;
  name: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Sanitiza string para prevenir injection
 */
function sanitizeString(value: string | undefined | null): string {
  if (!value) return "";

  return value
    .toString()
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .substring(0, 1000);
}

/**
 * Normaliza nome de coluna (remove acentos, lowercase)
 */
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Mapeia headers para campos esperados
 */
function mapColumnToField(
  column: string
): "email" | "nome" | "departamento" | "cargo" | null {
  const normalized = normalizeColumnName(column);

  const emailVariants = ["email", "emailaddress", "mail", "correio"];
  const nameVariants = ["nome", "name", "fullname", "nomecompleto", "usuario"];
  const deptVariants = [
    "departamento",
    "department",
    "dept",
    "setor",
    "area",
    "equipe",
  ];
  const roleVariants = [
    "cargo",
    "role",
    "funcao",
    "perfil",
    "tipo",
    "permissao",
  ];

  if (emailVariants.includes(normalized)) return "email";
  if (nameVariants.includes(normalized)) return "nome";
  if (deptVariants.includes(normalized)) return "departamento";
  if (roleVariants.includes(normalized)) return "cargo";

  return null;
}

// ============================================
// CSV Parser
// ============================================

/**
 * Parseia conteúdo CSV para array de RawImportRow
 */
export function parseUserImportCSV(content: string): UserParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: RawImportRow[] = [];

  try {
    // Remove BOM se presente
    const cleanContent = content.replace(/^\uFEFF/, "");

    const result = Papa.parse(cleanContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((err) => {
        if (err.row !== undefined) {
          errors.push(`Linha ${err.row + 2}: ${err.message}`);
        } else {
          errors.push(`Erro de parsing: ${err.message}`);
        }
      });
    }

    // Mapear colunas encontradas
    const headers = result.meta.fields || [];
    const columnMap: Record<string, string> = {};

    headers.forEach((header) => {
      const field = mapColumnToField(header);
      if (field) {
        columnMap[header] = field;
      }
    });

    // Verificar colunas obrigatórias
    const mappedFields = Object.values(columnMap);
    if (!mappedFields.includes("email")) {
      errors.push('Coluna "email" não encontrada no arquivo');
    }
    if (!mappedFields.includes("nome")) {
      errors.push('Coluna "nome" não encontrada no arquivo');
    }

    if (errors.length > 0) {
      return { success: false, data: [], errors, warnings, totalRows: 0 };
    }

    // Processar linhas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.data.forEach((row: any, index: number) => {
      const lineNum = index + 2;

      // Ignorar linhas de comentário (começam com #)
      const firstValue = Object.values(row)[0];
      if (typeof firstValue === "string" && firstValue.startsWith("#")) {
        return;
      }

      // Mapear valores para campos
      const mappedRow: RawImportRow = {
        email: "",
        nome: "",
        departamento: "",
        cargo: "",
      };

      Object.entries(row).forEach(([key, value]) => {
        const field = columnMap[key];
        if (field) {
          mappedRow[field as keyof RawImportRow] = sanitizeString(
            value as string
          );
        }
      });

      // Verificar se tem dados mínimos
      if (!mappedRow.email && !mappedRow.nome) {
        warnings.push(`Linha ${lineNum}: Linha vazia, ignorada`);
        return;
      }

      data.push(mappedRow);
    });

    return {
      success: true,
      data,
      errors,
      warnings,
      totalRows: data.length,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [
        `Erro ao parsear CSV: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      ],
      warnings: [],
      totalRows: 0,
    };
  }
}

// ============================================
// Excel Parser
// ============================================

/**
 * Parseia arquivo XLSX para array de RawImportRow
 */
export async function parseUserImportXLSX(
  buffer: ArrayBuffer
): Promise<UserParseResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: RawImportRow[] = [];

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Pegar primeira planilha
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return {
        success: false,
        data: [],
        errors: ["Arquivo Excel vazio ou sem planilhas"],
        warnings: [],
        totalRows: 0,
      };
    }

    // Ler cabeçalhos (primeira linha)
    const headerRow = worksheet.getRow(1);
    const columnMap: Record<number, string> = {};
    const headers: string[] = [];

    headerRow.eachCell((cell, colNumber) => {
      const header = cell.value?.toString() || "";
      headers.push(header);
      const field = mapColumnToField(header);
      if (field) {
        columnMap[colNumber] = field;
      }
    });

    // Verificar colunas obrigatórias
    const mappedFields = Object.values(columnMap);
    if (!mappedFields.includes("email")) {
      errors.push('Coluna "email" não encontrada no arquivo');
    }
    if (!mappedFields.includes("nome")) {
      errors.push('Coluna "nome" não encontrada no arquivo');
    }

    if (errors.length > 0) {
      return { success: false, data: [], errors, warnings, totalRows: 0 };
    }

    // Processar linhas (começando da linha 2)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const mappedRow: RawImportRow = {
        email: "",
        nome: "",
        departamento: "",
        cargo: "",
      };

      let hasData = false;

      row.eachCell((cell, colNumber) => {
        const field = columnMap[colNumber];
        if (field) {
          const value = sanitizeString(cell.value?.toString());
          mappedRow[field as keyof RawImportRow] = value;
          if (value) hasData = true;
        }
      });

      // Ignorar linhas vazias
      if (!hasData) {
        return;
      }

      // Ignorar linhas de comentário
      if (mappedRow.email?.startsWith("#")) {
        return;
      }

      data.push(mappedRow);
    });

    return {
      success: true,
      data,
      errors,
      warnings,
      totalRows: data.length,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [
        `Erro ao parsear Excel: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      ],
      warnings: [],
      totalRows: 0,
    };
  }
}

// ============================================
// Validation
// ============================================

/**
 * Valida dados de importação contra departamentos existentes
 */
export function validateUserImportData(
  rows: RawImportRow[],
  departments: Department[]
): BulkImportValidationResult {
  const rowResults: RowValidationResult[] = [];
  const globalErrors: string[] = [];
  const globalWarnings: string[] = [];
  const seenEmails = new Set<string>();

  // Verificar limite de linhas
  if (rows.length > BULK_IMPORT_LIMITS.MAX_ROWS) {
    globalErrors.push(
      `Limite de ${BULK_IMPORT_LIMITS.MAX_ROWS} usuários excedido (${rows.length} linhas)`
    );
  }

  // Criar mapa de departamentos (normalizado para comparação)
  const deptMap = new Map<string, string>();
  departments.forEach((d) => {
    deptMap.set(d.name.toLowerCase().trim(), d.id);
  });

  // Validar cada linha
  rows.forEach((row, index) => {
    const lineNum = index + 2; // +1 para índice, +1 para header
    const result = validateImportRow(row, lineNum);

    // Verificar duplicatas no arquivo
    if (result.data?.email) {
      const email = result.data.email.toLowerCase();
      if (seenEmails.has(email)) {
        result.valid = false;
        result.errors.push(
          `Linha ${lineNum}: Email "${email}" duplicado no arquivo`
        );
      } else {
        seenEmails.add(email);
      }
    }

    // Verificar departamento
    if (result.data?.department) {
      const deptKey = result.data.department.toLowerCase().trim();
      if (!deptMap.has(deptKey)) {
        result.warnings.push(
          `Linha ${lineNum}: Departamento "${result.data.department}" não encontrado. Usuário será criado sem departamento.`
        );
        // Remover departamento inválido
        result.data.department = undefined;
      }
    }

    rowResults.push(result);
  });

  const validRows = rowResults.filter((r) => r.valid);
  const invalidRows = rowResults.filter((r) => !r.valid);

  return {
    valid: invalidRows.length === 0 && globalErrors.length === 0,
    totalRows: rows.length,
    validRows: validRows.length,
    invalidRows: invalidRows.length,
    rows: rowResults,
    errors: [
      ...globalErrors,
      ...rowResults.flatMap((r) => r.errors),
    ],
    warnings: [
      ...globalWarnings,
      ...rowResults.flatMap((r) => r.warnings),
    ],
  };
}

// ============================================
// Template Generation
// ============================================

/**
 * Gera template CSV para download
 */
export function generateUserImportCSVTemplate(
  departments: Department[]
): string {
  const BOM = "\uFEFF";

  const instructions = [
    "# INSTRUÇÕES DE IMPORTAÇÃO DE USUÁRIOS",
    "#",
    "# Colunas obrigatórias:",
    "#   email - Email válido do usuário",
    "#   nome - Nome completo (apenas letras, 2-100 caracteres)",
    "#   cargo - admin | manager | member | viewer",
    "#",
    "# Colunas opcionais:",
    "#   departamento - Nome exato do departamento (deve existir)",
    "#",
    "# Cargos disponíveis:",
    "#   admin - Acesso total, gerencia usuários",
    "#   manager - Gerencia diagnósticos e visualiza relatórios",
    "#   member - Visualiza e responde diagnósticos",
    "#   viewer - Apenas visualização",
    "#",
    `# Departamentos disponíveis: ${departments.map((d) => d.name).join(", ") || "Nenhum cadastrado"}`,
    "#",
    "# Limite: 500 usuários por importação",
    "#",
  ];

  const headers = ["email", "nome", "departamento", "cargo"];

  const exampleRows = [
    ["joao.silva@empresa.com", "João Silva", departments[0]?.name || "TI", "member"],
    ["maria.santos@empresa.com", "Maria Santos", departments[1]?.name || "RH", "admin"],
    ["carlos.oliveira@empresa.com", "Carlos Oliveira", "", "viewer"],
  ];

  const csvContent = [
    ...instructions,
    headers.join(","),
    ...exampleRows.map((row) =>
      row.map((cell) => (cell.includes(",") ? `"${cell}"` : cell)).join(",")
    ),
  ].join("\n");

  return BOM + csvContent;
}

/**
 * Gera template XLSX para download
 */
export async function generateUserImportXLSXTemplate(
  departments: Department[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PsicoMapa";
  workbook.created = new Date();

  // Planilha de dados
  const dataSheet = workbook.addWorksheet("Dados");

  // Headers com estilo
  const headers = ["email", "nome", "departamento", "cargo"];
  const headerRow = dataSheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F5A3D" }, // Verde PsicoMapa
  };

  // Larguras das colunas
  dataSheet.columns = [
    { width: 35 },
    { width: 30 },
    { width: 25 },
    { width: 15 },
  ];

  // Dados de exemplo
  const exampleRows = [
    ["joao.silva@empresa.com", "João Silva", departments[0]?.name || "TI", "member"],
    ["maria.santos@empresa.com", "Maria Santos", departments[1]?.name || "RH", "admin"],
    ["carlos.oliveira@empresa.com", "Carlos Oliveira", "", "viewer"],
  ];

  exampleRows.forEach((row) => {
    dataSheet.addRow(row);
  });

  // Validação de dados para cargo
  const cargoColumn = dataSheet.getColumn(4);
  cargoColumn.eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      cell.dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`"${validRoles.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Cargo Inválido",
        error: "Selecione um cargo válido: admin, manager, member, viewer",
      };
    }
  });

  // Validação de dados para departamento (se houver departamentos)
  if (departments.length > 0) {
    const deptColumn = dataSheet.getColumn(3);
    deptColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${departments.map((d) => d.name).join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Departamento Inválido",
          error: "Selecione um departamento válido ou deixe em branco",
        };
      }
    });
  }

  // Planilha de instruções
  const instructionsSheet = workbook.addWorksheet("Instruções");
  instructionsSheet.columns = [{ width: 80 }];

  const instructions = [
    "INSTRUÇÕES DE IMPORTAÇÃO DE USUÁRIOS",
    "",
    "Colunas obrigatórias:",
    "  • email - Email válido do usuário",
    "  • nome - Nome completo (apenas letras, 2-100 caracteres)",
    "  • cargo - admin | manager | member | viewer",
    "",
    "Colunas opcionais:",
    "  • departamento - Nome exato do departamento (deve existir na organização)",
    "",
    "Cargos disponíveis:",
    "  • admin - Acesso total, gerencia usuários e configurações",
    "  • manager - Gerencia diagnósticos, visualiza relatórios completos",
    "  • member - Visualiza diagnósticos e responde questionários",
    "  • viewer - Apenas visualização de resultados",
    "",
    "Departamentos disponíveis:",
    departments.length > 0
      ? departments.map((d) => `  • ${d.name}`).join("\n")
      : "  • Nenhum departamento cadastrado",
    "",
    "Limite: 500 usuários por importação",
    "",
    "Dicas:",
    "  • Use a aba 'Dados' para preencher os usuários",
    "  • As colunas 'cargo' e 'departamento' possuem listas de seleção",
    "  • Emails duplicados serão ignorados",
    "  • Se o departamento não existir, o usuário será criado sem departamento",
  ];

  instructions.forEach((text, index) => {
    const row = instructionsSheet.addRow([text]);
    if (index === 0) {
      row.font = { bold: true, size: 14 };
    }
  });

  // Retornar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
