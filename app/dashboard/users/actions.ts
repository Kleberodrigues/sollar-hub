"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

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
  const { data: currentProfile } = await supabase
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    return { error: "Apenas administradores podem gerenciar usuários" };
  }

  // Listar usuários da organização (RLS garante isolamento)
  const { data: users, error } = await supabase
    .from("user_profiles")
    .select("*, organizations(name)")
    .eq("organization_id", currentProfile.organization_id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { users };
}

/**
 * Convidar novo usuário para a organização
 */
export async function inviteUser(formData: FormData) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const role = (formData.get("role") as UserRole) || "member";

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Buscar perfil do usuário atual (deve ser admin)
  const { data: currentProfile } = await supabase
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    return { error: "Apenas administradores podem convidar usuários" };
  }

  try {
    // 1. Criar usuário no Supabase Auth usando ADMIN CLIENT
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // Skip confirmação de email
        user_metadata: {
          full_name: fullName,
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Falha ao criar usuário" };
    }

    console.log("User invited successfully:", authData.user.id);

    // 2. Criar perfil do usuário usando ADMIN CLIENT (bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        organization_id: currentProfile.organization_id,
        role: role,
        full_name: fullName,
      });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Tentar deletar o usuário criado se o perfil falhar
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: "Erro ao criar perfil: " + profileError.message };
    }

    console.log("Profile created successfully");

    return { success: true };
  } catch (error: any) {
    console.error("Invite user error:", error);
    return { error: error.message || "Erro ao convidar usuário" };
  }
}

/**
 * Alterar role de um usuário
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se é admin
  const { data: currentProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    return { error: "Apenas administradores podem alterar roles" };
  }

  // Não permitir alterar próprio role
  if (userId === user.id) {
    return { error: "Você não pode alterar seu próprio role" };
  }

  // Atualizar role (RLS garante que só pode alterar users da própria org)
  const { error } = await supabase
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
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se é admin
  const { data: currentProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    return { error: "Apenas administradores podem desativar usuários" };
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
      console.error("Auth ban error:", authError);
      return { error: "Erro ao desativar usuário: " + authError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Deactivate user error:", error);
    return { error: error.message || "Erro ao desativar usuário" };
  }
}

/**
 * Reativar usuário
 */
export async function reactivateUser(userId: string) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  // Verificar se é admin
  const { data: currentProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    return { error: "Apenas administradores podem reativar usuários" };
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
      console.error("Auth unban error:", authError);
      return { error: "Erro ao reativar usuário: " + authError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Reactivate user error:", error);
    return { error: error.message || "Erro ao reativar usuário" };
  }
}
