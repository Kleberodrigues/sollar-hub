"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function registerUser(formData: FormData) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const organizationName = formData.get("organizationName") as string;
  const industry = formData.get("industry") as string;
  const size = formData.get("size") as string;

  try {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Falha ao criar usuário" };
    }

    console.log("User created successfully:", authData.user.id);

    // 2. Criar organização usando ADMIN CLIENT (bypass RLS)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: organizationName,
        industry: industry || null,
        size: size || null,
      })
      .select()
      .single();

    if (orgError) {
      console.error("Organization error:", orgError);
      return { error: "Erro ao criar organização: " + orgError.message };
    }

    console.log("Organization created:", orgData.id);

    // 3. Atualizar perfil do usuário usando ADMIN CLIENT (bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .update({
        organization_id: orgData.id,
        role: "admin",
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: "Erro ao atualizar perfil: " + profileError.message };
    }

    console.log("Profile updated successfully");

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: error.message || "Erro ao criar conta" };
  }
}
