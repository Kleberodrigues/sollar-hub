"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema, validateFormData } from "@/lib/validations";
import { checkRateLimit, getClientIP, rateLimitConfigs } from "@/lib/rate-limit";
import { headers } from "next/headers";

// Departamentos padrão criados automaticamente para novas organizações
const DEFAULT_DEPARTMENTS = [
  { name: "Recursos Humanos", description: "Gestão de pessoas e desenvolvimento organizacional" },
  { name: "Administrativo", description: "Suporte administrativo e facilities" },
  { name: "Financeiro", description: "Gestão financeira e contabilidade" },
  { name: "Comercial", description: "Vendas e relacionamento com clientes" },
  { name: "Operações", description: "Processos operacionais e produção" },
  { name: "TI", description: "Tecnologia da informação e sistemas" },
  { name: "Marketing", description: "Marketing e comunicação" },
  { name: "Jurídico", description: "Assessoria jurídica e compliance" },
  { name: "Logística", description: "Logística e cadeia de suprimentos" },
  { name: "Qualidade", description: "Gestão da qualidade e processos" },
];

export async function registerUser(formData: FormData) {
  // Rate limiting para prevenir brute force
  const headersList = await headers();
  const clientIP = getClientIP(headersList);
  const rateLimitResult = checkRateLimit(clientIP, rateLimitConfigs.auth);

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    return { error: `Muitas tentativas. Aguarde ${retryAfter} segundos.` };
  }
  // Validar dados de entrada
  const validation = validateFormData(registerSchema, formData);
  if (!validation.success) {
    return { error: validation.error };
  }

  const { fullName, email, password, organizationName, industry, size } = validation.data;

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  try {
    // Determinar URL base para redirecionamento
    // Prioridade: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || "http://localhost:3000";

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Falha ao criar usuário" };
    }

    // 2. Criar organização usando ADMIN CLIENT (bypass RLS)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: organizationName,
        industry: industry || undefined,
        size: size || undefined,
      })
      .select()
      .single();

    if (orgError) {
      return { error: "Erro ao criar organização: " + orgError.message };
    }

    // 3. Criar departamentos padrão (fire and forget - não bloqueia registro)
    const departmentsToInsert = DEFAULT_DEPARTMENTS.map(dept => ({
      organization_id: (orgData as { id: string }).id,
      name: dept.name,
      description: dept.description,
    }));

    supabaseAdmin
      .from("departments")
      .insert(departmentsToInsert)
      .then(({ error: deptError }) => {
        if (deptError) {
          console.error("[Register] Erro ao criar departamentos padrão:", deptError.message);
        }
      });

    // 4. Atualizar perfil do usuário usando ADMIN CLIENT (bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .update({
        organization_id: (orgData as { id: string }).id,
        role: "admin" as const,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      return { error: "Erro ao atualizar perfil: " + profileError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar conta";
    return { error: message };
  }
}
