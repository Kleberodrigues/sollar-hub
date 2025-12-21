"use server";

/**
 * Bulk Import Actions
 *
 * Server actions para importação em massa de usuários
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { dispatchEvent } from "@/lib/events";
import {
  type BulkImportRow,
  type BulkImportResult,
  type BulkImportOptions,
  BULK_IMPORT_LIMITS,
} from "@/lib/validations/bulk-import";
import {
  parseUserImportCSV,
  parseUserImportXLSX,
  validateUserImportData,
  generateUserImportCSVTemplate,
  generateUserImportXLSXTemplate,
  type Department,
} from "@/lib/imports/user-import-parser";

// ============================================
// Rate Limiting
// ============================================

// Custom rate limit for bulk import (5 per 10 minutes)
const bulkImportRateLimit = {
  interval: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5,
};

async function checkBulkImportRateLimit(): Promise<{ error?: string }> {
  const headersList = await headers();
  const clientIP = getClientIP(headersList);
  const result = checkRateLimit(clientIP, bulkImportRateLimit);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return { error: `Muitas importações. Aguarde ${retryAfter} segundos.` };
  }

  return {};
}

// ============================================
// Helper Functions
// ============================================

/**
 * Verifica se usuário é admin e retorna dados necessários
 */
async function verifyAdminAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("user_profiles")
    .select("organization_id, role, full_name")
    .eq("id", user.id)
    .single()) as any;

  if (!profile || profile.role !== "admin") {
    return { error: "Apenas administradores podem importar usuários" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = (await supabase
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .single()) as any;

  return {
    user,
    profile: profile as {
      organization_id: string;
      role: string;
      full_name: string;
    },
    organizationName: org?.name || "Organização",
  };
}

/**
 * Busca departamentos da organização
 */
export async function getOrganizationDepartments(): Promise<{
  departments?: Department[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()) as any;

  if (!profile) {
    return { error: "Perfil não encontrado" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: departments, error } = (await supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", profile.organization_id)
    .order("name")) as any;

  if (error) {
    return { error: error.message };
  }

  return { departments: departments || [] };
}

// ============================================
// Parse & Validate Actions
// ============================================

/**
 * Parseia e valida arquivo de importação
 */
export async function parseAndValidateImportFile(
  fileContent: string,
  fileType: "csv" | "xlsx"
): Promise<{
  success: boolean;
  validation?: ReturnType<typeof validateUserImportData>;
  error?: string;
}> {
  try {
    // Get departments for validation
    const { departments, error: deptError } = await getOrganizationDepartments();
    if (deptError) {
      return { success: false, error: deptError };
    }

    // Parse file
    let parseResult;
    if (fileType === "csv") {
      parseResult = parseUserImportCSV(fileContent);
    } else {
      // For XLSX, fileContent should be base64 encoded
      const buffer = Buffer.from(fileContent, "base64");
      parseResult = await parseUserImportXLSX(buffer.buffer);
    }

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.errors.join("; "),
      };
    }

    // Validate
    const validation = validateUserImportData(parseResult.data, departments || []);

    return {
      success: true,
      validation,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao processar arquivo",
    };
  }
}

// ============================================
// Bulk Import Action
// ============================================

/**
 * Importa usuários em massa
 */
export async function bulkImportUsers(
  rows: BulkImportRow[],
  options: BulkImportOptions
): Promise<BulkImportResult> {
  // Rate limiting
  const rateLimitCheck = await checkBulkImportRateLimit();
  if (rateLimitCheck.error) {
    return {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: rows.length,
      invitesSent: 0,
      createdUserIds: [],
      errors: [{ row: 0, email: "", error: rateLimitCheck.error }],
    };
  }

  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if ("error" in adminCheck && adminCheck.error) {
    return {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: rows.length,
      invitesSent: 0,
      createdUserIds: [],
      errors: [{ row: 0, email: "", error: adminCheck.error }],
    };
  }

  const { user, profile, organizationName } = adminCheck as {
    user: NonNullable<typeof adminCheck>["user"];
    profile: { organization_id: string; role: string; full_name: string };
    organizationName: string;
  };

  // Validate row count
  if (rows.length > BULK_IMPORT_LIMITS.MAX_ROWS) {
    return {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: rows.length,
      invitesSent: 0,
      createdUserIds: [],
      errors: [
        {
          row: 0,
          email: "",
          error: `Limite de ${BULK_IMPORT_LIMITS.MAX_ROWS} usuários excedido`,
        },
      ],
    };
  }

  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();

  // Get departments map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: departments } = (await supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", profile.organization_id)) as any;

  const deptMap = new Map<string, string>();
  (departments || []).forEach((d: { id: string; name: string }) => {
    deptMap.set(d.name.toLowerCase().trim(), d.id);
  });

  // Check existing emails
  const _emails = rows.map((r) => r.email.toLowerCase());
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingEmails = new Set(
    existingUsers?.users?.map((u) => u.email?.toLowerCase()) || []
  );

  // Process users
  const errors: BulkImportResult["errors"] = [];
  const createdUserIds: string[] = [];
  let successful = 0;
  let invitesSent = 0;

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    for (const row of batch) {
      const rowIndex = rows.indexOf(row) + 2; // +2 for header and 0-index

      try {
        // Check if email already exists
        if (existingEmails.has(row.email.toLowerCase())) {
          errors.push({
            row: rowIndex,
            email: row.email,
            error: "Usuário já existe",
          });
          continue;
        }

        // Create auth user
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: row.email,
            email_confirm: true,
            user_metadata: {
              full_name: row.fullName,
            },
          });

        if (authError) {
          errors.push({
            row: rowIndex,
            email: row.email,
            error: authError.message,
          });
          continue;
        }

        if (!authData.user) {
          errors.push({
            row: rowIndex,
            email: row.email,
            error: "Falha ao criar usuário",
          });
          continue;
        }

        // Create user profile
        const { error: profileError } = await supabaseAdmin
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            organization_id: profile.organization_id,
            role: row.role,
            full_name: row.fullName,
          });

        if (profileError) {
          // Rollback: delete auth user
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          errors.push({
            row: rowIndex,
            email: row.email,
            error: "Erro ao criar perfil: " + profileError.message,
          });
          continue;
        }

        // Associate with department if provided
        if (row.department) {
          const deptId = deptMap.get(row.department.toLowerCase().trim());
          if (deptId) {
            await supabaseAdmin.from("department_members").insert({
              department_id: deptId,
              user_id: authData.user.id,
            });
          }
        }

        createdUserIds.push(authData.user.id);
        existingEmails.add(row.email.toLowerCase()); // Prevent duplicates in same batch
        successful++;

        // Send invite if requested
        if (options.sendInvites) {
          try {
            await dispatchEvent({
              organizationId: profile.organization_id,
              eventType: "user.invited",
              data: {
                email: row.email,
                organization_name: organizationName,
                organization_id: profile.organization_id,
                role: row.role,
                invited_by: {
                  id: user!.id,
                  name: profile.full_name || "Admin",
                  email: user!.email || "",
                },
                invite_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://psicomapa.cloud"}/login`,
              },
              metadata: {
                triggered_by: user!.id,
                source: "bulk_import",
              },
            });
            invitesSent++;
          } catch (eventError) {
            console.error(
              `[BulkImport] Failed to dispatch invite event for ${row.email}:`,
              eventError
            );
          }
        }
      } catch (error) {
        errors.push({
          row: rowIndex,
          email: row.email,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    // Small delay between batches to avoid overwhelming the system
    if (i + batchSize < rows.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return {
    success: errors.length === 0,
    totalProcessed: rows.length,
    successful,
    failed: errors.length,
    invitesSent,
    createdUserIds,
    errors,
  };
}

// ============================================
// Send Bulk Invites Action
// ============================================

/**
 * Envia convites para usuários já importados
 */
export async function sendBulkInvites(userIds: string[]): Promise<{
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: string[];
}> {
  // Rate limiting (use same as bulk import)
  const rateLimitCheck = await checkBulkImportRateLimit();
  if (rateLimitCheck.error) {
    return {
      success: false,
      sentCount: 0,
      failedCount: userIds.length,
      errors: [rateLimitCheck.error],
    };
  }

  // Verify admin access
  const adminCheck = await verifyAdminAccess();
  if ("error" in adminCheck && adminCheck.error) {
    return {
      success: false,
      sentCount: 0,
      failedCount: userIds.length,
      errors: [adminCheck.error],
    };
  }

  const { user, profile, organizationName } = adminCheck as {
    user: NonNullable<typeof adminCheck>["user"];
    profile: { organization_id: string; role: string; full_name: string };
    organizationName: string;
  };
  const supabaseAdmin = createAdminClient();

  // Get user details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: users, error: usersError } = (await supabaseAdmin
    .from("user_profiles")
    .select("id, full_name, role")
    .in("id", userIds)
    .eq("organization_id", profile.organization_id)) as any;

  if (usersError) {
    return {
      success: false,
      sentCount: 0,
      failedCount: userIds.length,
      errors: [usersError.message],
    };
  }

  // Get auth emails
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  const emailMap = new Map<string, string>();
  authData?.users?.forEach((u) => {
    if (u.email) emailMap.set(u.id, u.email);
  });

  let sentCount = 0;
  const errors: string[] = [];

  // Send invites
  for (const userProfile of users || []) {
    const email = emailMap.get(userProfile.id);
    if (!email) {
      errors.push(`Email não encontrado para usuário ${userProfile.id}`);
      continue;
    }

    try {
      await dispatchEvent({
        organizationId: profile.organization_id,
        eventType: "user.invited",
        data: {
          email,
          organization_name: organizationName,
          organization_id: profile.organization_id,
          role: userProfile.role,
          invited_by: {
            id: user!.id,
            name: profile.full_name || "Admin",
            email: user!.email || "",
          },
          invite_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://psicomapa.cloud"}/login`,
        },
        metadata: {
          triggered_by: user!.id,
          source: "bulk_invite",
        },
      });
      sentCount++;
    } catch (error) {
      errors.push(
        `Falha ao enviar convite para ${email}: ${error instanceof Error ? error.message : "Erro"}`
      );
    }

    // Small delay between sends
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    success: errors.length === 0,
    sentCount,
    failedCount: (users?.length || 0) - sentCount,
    errors,
  };
}

// ============================================
// Template Generation Actions
// ============================================

/**
 * Gera template CSV para download
 */
export async function generateBulkImportTemplate(
  format: "csv" | "xlsx"
): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const { departments, error } = await getOrganizationDepartments();
    if (error) {
      return { success: false, error };
    }

    if (format === "csv") {
      const csvContent = generateUserImportCSVTemplate(departments || []);
      return {
        success: true,
        data: csvContent,
        filename: "template-importacao-usuarios.csv",
      };
    } else {
      const xlsxBuffer = await generateUserImportXLSXTemplate(departments || []);
      return {
        success: true,
        data: xlsxBuffer.toString("base64"),
        filename: "template-importacao-usuarios.xlsx",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao gerar template",
    };
  }
}
