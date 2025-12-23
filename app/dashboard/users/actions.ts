"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";
import { inviteUserSchema, userIdSchema, validateFormData } from "@/lib/validations";
import { checkRateLimit, getClientIP, rateLimitConfigs } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { z } from "zod";

// Helper function para rate limiting
async function checkUserManagementRateLimit(): Promise<{ error?: string }> {
  const headersList = await headers();
  const clientIP = getClientIP(headersList);
  const result = checkRateLimit(clientIP, rateLimitConfigs.userManagement);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return { error: `Muitas requisições. Aguarde ${retryAfter} segundos.` };
  }

  return {};
}

/**
 * Listar usuários da organização do usuário atual
 */
export async function listOrganizationUsers() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Buscar perfil do usuário atual
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentProfile } = await (supabase
    .from("user_profiles")
    .select("organization_id, role, is_super_admin")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = currentProfile as any;
  const isAuthorized = profile && (
    profile.role === "responsavel_empresa" ||
    profile.role === "admin" ||
    profile.is_super_admin
  );
  if (!isAuthorized) {
    return { error: "Apenas responsáveis podem gerenciar usuários" };
  }

  // Listar usuários da organização (RLS garante isolamento)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: users, error } = await (supabase
    .from("user_profiles")
    .select("*, organizations(name)")
    .eq("organization_id", currentProfile.organization_id)
    .order("created_at", { ascending: false }) as any);

  if (error) {
    return { error: error.message };
  }

  return { users };
}

/**
 * Convidar novo usuário para a organização
 */
export async function inviteUser(formData: FormData) {
  // Rate limiting
  const rateLimitCheck = await checkUserManagementRateLimit();
  if (rateLimitCheck.error) {
    return rateLimitCheck;
  }

  // Validar dados de entrada
  const validation = validateFormData(inviteUserSchema, formData);
  if (!validation.success) {
    return { error: validation.error };
  }

  const { email, fullName, role } = validation.data;

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Buscar perfil do usuário atual (deve ser admin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentProfile } = await (supabase
    .from("user_profiles")
    .select("organization_id, role, is_super_admin")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inviteProfile = currentProfile as any;
  const canInvite = inviteProfile && (
    inviteProfile.role === "responsavel_empresa" ||
    inviteProfile.role === "admin" ||
    inviteProfile.is_super_admin
  );
  if (!canInvite) {
    return { error: "Apenas responsáveis podem convidar usuários" };
  }

  try {
    // 1. Tentar criar novo usuário no Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    let userId: string;
    let isNewUser = true;

    if (authError) {
      // Verificar se o erro é porque o usuário já existe
      if (authError.message.includes("already been registered") ||
          authError.message.includes("already exists")) {
        // Buscar usuário existente por email (com paginação)
        let foundUserId: string | null = null;
        let page = 1;

        while (!foundUserId) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 100
          });

          if (!users?.users?.length) break;

          const foundUser = users.users.find(u => u.email === email);
          if (foundUser) {
            foundUserId = foundUser.id;
            break;
          }
          if (users.users.length < 100) break;
          page++;
        }

        if (!foundUserId) {
          return { error: "Usuário existe mas não foi encontrado. Tente novamente." };
        }

        // Verificar se já tem perfil
        const { data: existingProfile } = await supabaseAdmin
          .from("user_profiles")
          .select("id, organization_id")
          .eq("id", foundUserId)
          .single();

        if (existingProfile) {
          if (existingProfile.organization_id === currentProfile.organization_id) {
            return { error: "Este usuário já faz parte da sua organização" };
          } else {
            return { error: "Este email já está cadastrado em outra organização" };
          }
        }

        // Auth user existe mas sem perfil - usar o ID existente
        userId = foundUserId;
        isNewUser = false;
      } else {
        return { error: authError.message };
      }
    } else {
      if (!authData.user) {
        return { error: "Falha ao criar usuário" };
      }
      userId = authData.user.id;
    }

    // 2. Criar ou atualizar perfil do usuário usando ADMIN CLIENT (bypass RLS)
    // Usando upsert para evitar problemas de race condition
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .upsert({
        id: userId,
        organization_id: currentProfile.organization_id,
        role: role,
        full_name: fullName,
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      // Se criamos um novo usuário e o perfil falhou, deletar o usuário
      if (isNewUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      return { error: "Erro ao criar perfil: " + profileError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao convidar usuário";
    return { error: message };
  }
}

/**
 * Alterar role de um usuário
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  // Rate limiting
  const rateLimitCheck = await checkUserManagementRateLimit();
  if (rateLimitCheck.error) {
    return rateLimitCheck;
  }

  // Validar dados de entrada
  const userIdResult = userIdSchema.safeParse(userId);
  if (!userIdResult.success) {
    return { error: "ID de usuário inválido" };
  }

  const roleResult = z.enum(["responsavel_empresa", "membro"]).safeParse(newRole);
  if (!roleResult.success) {
    return { error: "Role inválido. Use 'responsavel_empresa' ou 'membro'" };
  }

  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se é responsavel_empresa ou admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentProfile } = await (supabase
    .from("user_profiles")
    .select("role, is_super_admin")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleProfile = currentProfile as any;
  const canUpdateRole = roleProfile && (
    roleProfile.role === "responsavel_empresa" ||
    roleProfile.role === "admin" ||
    roleProfile.is_super_admin
  );
  if (!canUpdateRole) {
    return { error: "Apenas responsáveis podem alterar roles" };
  }

  // Não permitir alterar próprio role
  if (userId === user.id) {
    return { error: "Você não pode alterar seu próprio role" };
  }

  // Atualizar role (RLS garante que só pode alterar users da própria org)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Desativar usuário (soft delete)
 */
export async function deactivateUser(userId: string) {
  // Rate limiting
  const rateLimitCheck = await checkUserManagementRateLimit();
  if (rateLimitCheck.error) {
    return rateLimitCheck;
  }

  // Validar dados de entrada
  const userIdResult = userIdSchema.safeParse(userId);
  if (!userIdResult.success) {
    return { error: "ID de usuário inválido" };
  }

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se é responsavel_empresa ou admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentProfile } = await (supabase
    .from("user_profiles")
    .select("role, is_super_admin")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deactivateProfile = currentProfile as any;
  const canDeactivate = deactivateProfile && (
    deactivateProfile.role === "responsavel_empresa" ||
    deactivateProfile.role === "admin" ||
    deactivateProfile.is_super_admin
  );
  if (!canDeactivate) {
    return { error: "Apenas responsáveis podem desativar usuários" };
  }

  // Não permitir desativar a si mesmo
  if (userId === user.id) {
    return { error: "Você não pode desativar sua própria conta" };
  }

  try {
    // Desabilitar no Auth usando admin client
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ban_duration: "876000h", // ~100 anos = permanente
      }
    );

    if (authError) {
      return { error: "Erro ao desativar usuário: " + authError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao desativar usuário";
    return { error: message };
  }
}

/**
 * Reativar usuário
 */
export async function reactivateUser(userId: string) {
  // Rate limiting
  const rateLimitCheck = await checkUserManagementRateLimit();
  if (rateLimitCheck.error) {
    return rateLimitCheck;
  }

  // Validar dados de entrada
  const userIdResult = userIdSchema.safeParse(userId);
  if (!userIdResult.success) {
    return { error: "ID de usuário inválido" };
  }

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se é responsavel_empresa ou admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentProfile } = await (supabase
    .from("user_profiles")
    .select("role, is_super_admin")
    .eq("id", user.id)
    .single() as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactivateProfile = currentProfile as any;
  const canReactivate = reactivateProfile && (
    reactivateProfile.role === "responsavel_empresa" ||
    reactivateProfile.role === "admin" ||
    reactivateProfile.is_super_admin
  );
  if (!canReactivate) {
    return { error: "Apenas responsáveis podem reativar usuários" };
  }

  try {
    // Reabilitar no Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ban_duration: "none",
      }
    );

    if (authError) {
      return { error: "Erro ao reativar usuário: " + authError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao reativar usuário";
    return { error: message };
  }
}
