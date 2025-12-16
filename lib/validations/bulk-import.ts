/**
 * Bulk Import Validation Schemas
 *
 * Schemas para validação de importação em massa de usuários
 */

import { z } from "zod";

/**
 * Roles válidos para usuários
 */
export const validRoles = ["admin", "manager", "member", "viewer"] as const;
export type ValidRole = (typeof validRoles)[number];

/**
 * Schema para uma linha de importação de usuário
 */
export const bulkImportRowSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .transform((v) => v.toLowerCase().trim()),
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras")
    .transform((v) => v.trim()),
  department: z
    .string()
    .max(100, "Departamento deve ter no máximo 100 caracteres")
    .optional()
    .transform((v) => v?.trim() || undefined),
  role: z
    .enum(validRoles, {
      errorMap: () => ({
        message: `Cargo inválido. Use: ${validRoles.join(", ")}`,
      }),
    })
    .default("member"),
});

export type BulkImportRow = z.infer<typeof bulkImportRowSchema>;

/**
 * Schema para opções de importação
 */
export const bulkImportOptionsSchema = z.object({
  sendInvites: z.boolean().default(false),
});

export type BulkImportOptions = z.infer<typeof bulkImportOptionsSchema>;

/**
 * Schema para linha raw (antes de validação)
 */
export const rawImportRowSchema = z.object({
  email: z.string().optional(),
  nome: z.string().optional(),
  departamento: z.string().optional(),
  cargo: z.string().optional(),
});

export type RawImportRow = z.infer<typeof rawImportRowSchema>;

/**
 * Resultado de validação de uma linha
 */
export interface RowValidationResult {
  row: number;
  valid: boolean;
  data?: BulkImportRow;
  errors: string[];
  warnings: string[];
}

/**
 * Resultado completo de validação
 */
export interface BulkImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: RowValidationResult[];
  errors: string[];
  warnings: string[];
}

/**
 * Resultado da importação
 */
export interface BulkImportResult {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  invitesSent: number;
  createdUserIds: string[];
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

/**
 * Constantes de limites
 */
export const BULK_IMPORT_LIMITS = {
  MAX_ROWS: 500,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: [".csv", ".xlsx"],
  ALLOWED_MIME_TYPES: [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
} as const;

/**
 * Valida uma linha de importação
 */
export function validateImportRow(
  rawRow: RawImportRow,
  rowNumber: number
): RowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Mapear campos (suporta português e inglês)
  const normalizedRow = {
    email: rawRow.email?.trim() || "",
    fullName: rawRow.nome?.trim() || "",
    department: rawRow.departamento?.trim() || undefined,
    role: normalizeRole(rawRow.cargo?.trim() || "member"),
  };

  // Validar com Zod
  const result = bulkImportRowSchema.safeParse(normalizedRow);

  if (!result.success) {
    result.error.errors.forEach((err) => {
      errors.push(`Linha ${rowNumber}: ${err.message}`);
    });
    return { row: rowNumber, valid: false, errors, warnings };
  }

  // Warning se departamento vazio
  if (!result.data.department) {
    warnings.push(
      `Linha ${rowNumber}: Departamento vazio. Usuário será criado sem departamento.`
    );
  }

  return {
    row: rowNumber,
    valid: true,
    data: result.data,
    errors,
    warnings,
  };
}

/**
 * Normaliza o valor do cargo para o enum válido
 */
function normalizeRole(role: string): ValidRole {
  const normalized = role.toLowerCase().trim();
  const roleMap: Record<string, ValidRole> = {
    admin: "admin",
    administrador: "admin",
    manager: "manager",
    gerente: "manager",
    gestor: "manager",
    member: "member",
    membro: "member",
    colaborador: "member",
    viewer: "viewer",
    visualizador: "viewer",
    leitor: "viewer",
  };
  return roleMap[normalized] || "member";
}

/**
 * Valida tamanho do arquivo
 */
export function validateFileSize(size: number): boolean {
  return size <= BULK_IMPORT_LIMITS.MAX_FILE_SIZE;
}

/**
 * Valida tipo do arquivo
 */
export function validateFileType(
  filename: string,
  mimeType?: string
): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  const validExt = BULK_IMPORT_LIMITS.ALLOWED_EXTENSIONS.includes(
    ext as ".csv" | ".xlsx"
  );

  if (mimeType) {
    return (
      validExt &&
      BULK_IMPORT_LIMITS.ALLOWED_MIME_TYPES.includes(
        mimeType as typeof BULK_IMPORT_LIMITS.ALLOWED_MIME_TYPES[number]
      )
    );
  }

  return validExt;
}
