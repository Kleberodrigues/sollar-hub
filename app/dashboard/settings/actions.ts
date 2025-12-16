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

  if (profile.role !== "admin") {
    return { success: false, error: "Only admins can update organization settings" };
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
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
