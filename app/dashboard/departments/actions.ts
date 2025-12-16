"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface Department {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  organization_id: string;
  created_at: string;
  member_count?: number;
}

interface DepartmentInput {
  name: string;
  description?: string;
  parent_id?: string | null;
}

export async function listDepartments(): Promise<{
  departments: Department[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { departments: [], error: "Unauthorized" };
  }

  // Get user profile to get organization_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return { departments: [], error: "Organization not found" };
  }

  // Get departments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: departments, error } = await (supabase as any)
    .from("departments")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("name");

  if (error) {
    console.error("[listDepartments] Error:", error);
    return { departments: [], error: error.message };
  }

  // Get member counts for each department
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: memberCounts } = await (supabase as any)
    .from("department_members")
    .select("department_id");

  const countMap = new Map<string, number>();
  if (memberCounts) {
    for (const m of memberCounts) {
      const current = countMap.get(m.department_id) || 0;
      countMap.set(m.department_id, current + 1);
    }
  }

  const departmentsWithCounts = (departments || []).map((d: Department) => ({
    ...d,
    member_count: countMap.get(d.id) || 0,
  }));

  return { departments: departmentsWithCounts };
}

export async function createDepartment(input: DepartmentInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user profile to verify admin/manager role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return { success: false, error: "Organization not found" };
  }

  if (!["admin", "manager"].includes(profile.role)) {
    return { success: false, error: "Permission denied" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("departments").insert({
    organization_id: profile.organization_id,
    name: input.name,
    description: input.description || null,
    parent_id: input.parent_id || null,
  });

  if (error) {
    console.error("[createDepartment] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/departments");
  return { success: true };
}

export async function updateDepartment(
  id: string,
  input: DepartmentInput
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user profile to verify admin/manager role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return { success: false, error: "Organization not found" };
  }

  if (!["admin", "manager"].includes(profile.role)) {
    return { success: false, error: "Permission denied" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("departments")
    .update({
      name: input.name,
      description: input.description || null,
      parent_id: input.parent_id || null,
    })
    .eq("id", id)
    .eq("organization_id", profile.organization_id);

  if (error) {
    console.error("[updateDepartment] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/departments");
  return { success: true };
}

export async function seedDepartments(): Promise<{
  success: boolean;
  created: number;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, created: 0, error: "Unauthorized" };
  }

  // Get user profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return { success: false, created: 0, error: "Organization not found" };
  }

  if (!["admin", "manager"].includes(profile.role)) {
    return { success: false, created: 0, error: "Permission denied" };
  }

  // Sample departments for a typical organization
  const sampleDepartments = [
    { name: "Diretoria Executiva", description: "Alta gestão e decisões estratégicas" },
    { name: "Financeiro", description: "Controle financeiro, contabilidade e tesouraria" },
    { name: "Comercial", description: "Vendas, relacionamento com clientes e novos negócios" },
    { name: "Marketing", description: "Comunicação, branding e campanhas" },
    { name: "Tecnologia da Informação", description: "Desenvolvimento, infraestrutura e suporte técnico" },
    { name: "Operações", description: "Produção, logística e processos operacionais" },
    { name: "Jurídico", description: "Assessoria legal, contratos e compliance" },
    { name: "Qualidade", description: "Controle de qualidade e melhoria contínua" },
    { name: "Compras", description: "Aquisições, fornecedores e suprimentos" },
    { name: "Atendimento ao Cliente", description: "Suporte, SAC e pós-venda" },
  ];

  let created = 0;

  for (const dept of sampleDepartments) {
    // Check if department already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("departments")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("name", dept.name)
      .single();

    if (!existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("departments").insert({
        organization_id: profile.organization_id,
        name: dept.name,
        description: dept.description,
        parent_id: null,
      });

      if (!error) {
        created++;
      }
    }
  }

  revalidatePath("/dashboard/departments");
  return { success: true, created };
}

export async function deleteDepartment(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user profile to verify admin/manager role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return { success: false, error: "Organization not found" };
  }

  if (!["admin", "manager"].includes(profile.role)) {
    return { success: false, error: "Permission denied" };
  }

  // Check if department has child departments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: children } = await (supabase as any)
    .from("departments")
    .select("id")
    .eq("parent_id", id);

  if (children && children.length > 0) {
    return {
      success: false,
      error: "Cannot delete department with sub-departments",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("departments")
    .delete()
    .eq("id", id)
    .eq("organization_id", profile.organization_id);

  if (error) {
    console.error("[deleteDepartment] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/departments");
  return { success: true };
}
