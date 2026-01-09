"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface OrganizationSettings {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export async function getSettings(): Promise<{
  organization: OrganizationSettings | null;
  profile: UserProfile | null;
  email: string | null;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { organization: null, profile: null, email: null, error: "Unauthorized" };
  }

  // Get user profile with organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileError } = await (supabase as any)
    .from("user_profiles")
    .select("id, full_name, avatar_url, role, organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { organization: null, profile: null, email: null, error: "Profile not found" };
  }

  // Get organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: organization, error: orgError } = await (supabase as any)
    .from("organizations")
    .select("id, name, industry, size")
    .eq("id", profile.organization_id)
    .single();

  if (orgError) {
    console.error("[getSettings] Org error:", orgError);
  }

  return {
    organization: organization || null,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
    },
    email: user.email || null,
  };
}

export async function updateProfile(data: {
  full_name: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_profiles")
    .update({
      full_name: data.full_name,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[updateProfile] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateOrganization(data: {
  name: string;
  industry?: string;
  size?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user profile to check role and get org_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return { success: false, error: "Organization not found" };
  }

  const allowedRoles = ["admin", "responsavel_empresa"];
  if (!allowedRoles.includes(profile.role)) {
    return { success: false, error: "Apenas administradores podem atualizar configurações da organização" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("organizations")
    .update({
      name: data.name,
      industry: data.industry || null,
      size: data.size || null,
    })
    .eq("id", profile.organization_id);

  if (error) {
    console.error("[updateOrganization] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: data.currentPassword,
  });

  if (signInError) {
    return { success: false, error: "Senha atual incorreta" };
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: data.newPassword,
  });

  if (updateError) {
    console.error("[changePassword] Error:", updateError);
    // Traduzir mensagens de erro do Supabase para português
    const translatedError = translatePasswordError(updateError.message);
    return { success: false, error: translatedError };
  }

  return { success: true };
}

/**
 * Traduz mensagens de erro de senha do Supabase para português
 */
function translatePasswordError(message: string): string {
  // Mensagem de complexidade de senha
  if (message.includes("Password should contain")) {
    return "A senha deve conter pelo menos: uma letra minúscula, uma letra maiúscula, um número e um caractere especial (!@#$%^&*).";
  }

  // Senha muito curta
  if (message.includes("at least") && message.includes("characters")) {
    const match = message.match(/at least (\d+) characters/);
    const minLength = match ? match[1] : "8";
    return `A senha deve ter pelo menos ${minLength} caracteres.`;
  }

  // Senha muito fraca
  if (message.toLowerCase().includes("weak") || message.toLowerCase().includes("strength")) {
    return "A senha é muito fraca. Use uma combinação de letras, números e caracteres especiais.";
  }

  // Senha igual à anterior
  if (message.toLowerCase().includes("same") || message.toLowerCase().includes("previous")) {
    return "A nova senha não pode ser igual à senha anterior.";
  }

  // Outras mensagens comuns
  if (message.toLowerCase().includes("invalid")) {
    return "Senha inválida. Verifique os requisitos de segurança.";
  }

  // Se não reconhecer, retornar uma mensagem genérica
  return "Erro ao alterar senha. Verifique se a nova senha atende aos requisitos de segurança.";
}
