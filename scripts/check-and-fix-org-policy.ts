/**
 * Script para verificar e corrigir acesso à organização
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar variáveis de ambiente
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});
process.env = { ...process.env, ...envVars };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const serviceClient = createClient(supabaseUrl, serviceKey);
const anonClient = createClient(supabaseUrl, anonKey);

const ORG_ID = 'cddff5ee-12d0-40b9-b8e9-57c350b0239e';

async function checkOrgAccess() {
  console.log('🔍 Verificando acesso à organização...\n');

  // 1. Verificar se organização existe (com service role)
  console.log('1️⃣ Verificando existência da organização (service role)...');
  const { data: orgService, error: serviceError } = await serviceClient
    .from('organizations')
    .select('id, name')
    .eq('id', ORG_ID)
    .single();

  if (serviceError) {
    console.log(`   ❌ ERRO: ${serviceError.message}`);
    console.log('   A organização não existe no banco de dados!\n');
    return;
  }

  console.log(`   ✅ Organização encontrada: ${orgService.name}\n`);

  // 2. Verificar acesso anônimo
  console.log('2️⃣ Verificando acesso anônimo (anon key)...');
  const { data: orgAnon, error: anonError } = await anonClient
    .from('organizations')
    .select('id, name')
    .eq('id', ORG_ID)
    .single();

  if (anonError) {
    console.log(`   ❌ ERRO: ${anonError.message}`);
    console.log(`   Code: ${anonError.code}`);

    if (anonError.message.includes('permission denied') || anonError.code === 'PGRST301') {
      console.log('\n   ⚠️ Política RLS não permite acesso anônimo à organização.');
      console.log('   A política "organizations_select_via_active_assessment" precisa ser aplicada.\n');
    } else if (anonError.message.includes('Cannot coerce') || anonError.code === 'PGRST116') {
      console.log('\n   ℹ️ Query retornou 0 resultados.');
      console.log('   Pode ser que a política não permite ou a organização não está vinculada a um assessment ativo.\n');
    }
  } else {
    console.log(`   ✅ Acesso anônimo funcionando!`);
    console.log(`      - Nome: ${orgAnon.name}\n`);
  }

  // 3. Verificar policies existentes
  console.log('3️⃣ Verificando políticas RLS existentes...');
  const { data: policies, error: polError } = await serviceClient
    .rpc('get_policies_for_table', { table_name: 'organizations' });

  if (polError) {
    // Tentar query direta ao pg_policies
    const { data: pgPolicies } = await serviceClient
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'organizations');

    if (pgPolicies) {
      console.log(`   Políticas encontradas: ${pgPolicies.length}`);
      pgPolicies.forEach(p => console.log(`      - ${p.policyname}`));
    } else {
      console.log('   ℹ️ Não foi possível listar políticas via RPC\n');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SQL PARA APLICAR A POLÍTICA DE ORGANIZATIONS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`-- Remover política existente (se houver)
DROP POLICY IF EXISTS "organizations_select_via_active_assessment" ON public.organizations;

-- Criar nova política
CREATE POLICY "organizations_select_via_active_assessment" ON public.organizations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.organization_id = organizations.id
      AND a.status = 'active'
    )
  );

COMMENT ON POLICY "organizations_select_via_active_assessment" ON public.organizations IS
  'Qualquer pessoa pode visualizar nome da organização quando vinculada a assessment ativo';
`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Execute no: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkOrgAccess().catch(console.error);
