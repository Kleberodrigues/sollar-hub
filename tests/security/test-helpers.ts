/**
 * Helpers para Testes de Segurança
 *
 * Utiliza service_role_key para bypass de validações de email
 * e criação de usuários de teste
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export interface TestUser {
  id: string;
  email: string;
  password: string;
}

export interface TestOrganization {
  id: string;
  name: string;
  slug: string;
}

export interface TestDepartment {
  id: string;
  name: string;
  organization_id: string;
}

/**
 * Cria um cliente Supabase Admin (service_role_key)
 * Permite criar usuários sem confirmação de email
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Cria um cliente Supabase normal (anon_key)
 */
export function createAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<Database>(supabaseUrl, anonKey);
}

/**
 * Cria uma organização de teste
 */
export async function createTestOrganization(
  adminClient: ReturnType<typeof createAdminClient>,
  name?: string
): Promise<TestOrganization> {
  const timestamp = Date.now();
  const orgName = name || `Test Org ${timestamp}`;

  const { data, error } = await adminClient
    .from('organizations')
    .insert({
      name: orgName
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar organização: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    slug: orgName.toLowerCase().replace(/\s+/g, '-') // Slug virtual para compatibilidade
  };
}

/**
 * Cria um usuário de teste usando Admin API
 * Bypass de validação de email
 */
export async function createTestUser(
  adminClient: ReturnType<typeof createAdminClient>,
  organizationId: string,
  role: 'admin' | 'manager' | 'member' | 'viewer' = 'member',
  emailPrefix?: string
): Promise<TestUser> {
  const timestamp = Date.now();
  const prefix = emailPrefix || role;
  const email = `test-${prefix}-${timestamp}@pm-test.local`;
  const password = 'Test@123456';

  // Criar usuário usando Admin API (sem confirmação de email)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirma email automaticamente
    user_metadata: {
      full_name: `Test User ${role.toUpperCase()}`
    }
  });

  if (authError || !authData.user) {
    throw new Error(`Erro ao criar usuário: ${authError?.message}`);
  }

  // Atualizar perfil do usuário (pode já existir via trigger)
  const { error: profileError } = await adminClient
    .from('user_profiles')
    .upsert({
      id: authData.user.id,
      organization_id: organizationId,
      full_name: `Test User ${role.toUpperCase()}`,
      role
    }, {
      onConflict: 'id'
    });

  if (profileError) {
    // Cleanup: deletar usuário se perfil falhar
    await adminClient.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Erro ao criar perfil: ${profileError.message}`);
  }

  return {
    id: authData.user.id,
    email,
    password
  };
}

/**
 * Cria um departamento de teste
 */
export async function createTestDepartment(
  adminClient: ReturnType<typeof createAdminClient>,
  organizationId: string,
  name?: string
): Promise<TestDepartment> {
  const timestamp = Date.now();
  const deptName = name || `Test Department ${timestamp}`;

  const { data, error } = await adminClient
    .from('departments')
    .insert({
      name: deptName,
      organization_id: organizationId
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar departamento: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    organization_id: data.organization_id
  };
}

/**
 * Autentica um usuário e retorna o cliente autenticado
 */
export async function signInTestUser(
  email: string,
  password: string
): Promise<ReturnType<typeof createAnonClient>> {
  const client = createAnonClient();

  const { error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(`Erro ao autenticar: ${error.message}`);
  }

  return client;
}

/**
 * Limpa usuários de teste
 */
export async function cleanupTestUsers(
  adminClient: ReturnType<typeof createAdminClient>,
  userIds: string[]
): Promise<void> {
  for (const userId of userIds) {
    try {
      await adminClient.auth.admin.deleteUser(userId);
    } catch (error) {
      console.warn(`Aviso: Não foi possível deletar usuário ${userId}`);
    }
  }
}

/**
 * Limpa organizações de teste
 */
export async function cleanupTestOrganizations(
  adminClient: ReturnType<typeof createAdminClient>,
  organizationIds: string[]
): Promise<void> {
  // RLS e CASCADE devem lidar com a remoção automática de dados relacionados
  const { error } = await adminClient
    .from('organizations')
    .delete()
    .in('id', organizationIds);

  if (error) {
    console.warn(`Aviso: Erro ao deletar organizações: ${error.message}`);
  }
}

/**
 * Limpa departamentos de teste
 */
export async function cleanupTestDepartments(
  adminClient: ReturnType<typeof createAdminClient>,
  departmentIds: string[]
): Promise<void> {
  const { error } = await adminClient
    .from('departments')
    .delete()
    .in('id', departmentIds);

  if (error) {
    console.warn(`Aviso: Erro ao deletar departamentos: ${error.message}`);
  }
}
