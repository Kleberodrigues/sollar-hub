/**
 * Script para aplicar políticas RLS de acesso público
 *
 * Executa as políticas de acesso público para assessments ativos
 * Usar: npx tsx scripts/apply-public-access-policies.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar variáveis de ambiente manualmente
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessários');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const policies = [
  {
    name: 'assessments_select_public_active',
    table: 'assessments',
    sql: `
      CREATE POLICY "assessments_select_public_active" ON public.assessments
        FOR SELECT
        TO anon, authenticated
        USING (status = 'active');
    `
  },
  {
    name: 'questionnaires_select_via_active_assessment',
    table: 'questionnaires',
    sql: `
      CREATE POLICY "questionnaires_select_via_active_assessment" ON public.questionnaires
        FOR SELECT
        TO anon, authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.assessments a
            WHERE a.questionnaire_id = questionnaires.id
            AND a.status = 'active'
          )
        );
    `
  },
  {
    name: 'questions_select_via_active_assessment',
    table: 'questions',
    sql: `
      CREATE POLICY "questions_select_via_active_assessment" ON public.questions
        FOR SELECT
        TO anon, authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.assessments a
            WHERE a.questionnaire_id = questions.questionnaire_id
            AND a.status = 'active'
          )
        );
    `
  },
  {
    name: 'organizations_select_via_active_assessment',
    table: 'organizations',
    sql: `
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
    `
  }
];

async function applyPolicies() {
  console.log('🔧 Aplicando políticas RLS para acesso público...\n');

  for (const policy of policies) {
    console.log(`📋 Aplicando: ${policy.name} em ${policy.table}...`);

    try {
      // Primeiro, tentar remover a policy se existir
      const dropResult = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy.name}" ON public.${policy.table};`
      });

      if (dropResult.error && !dropResult.error.message.includes('function') && !dropResult.error.message.includes('does not exist')) {
        console.log(`   ⚠️ Drop: ${dropResult.error.message}`);
      }

      // Criar a nova policy
      const createResult = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });

      if (createResult.error) {
        // Se rpc não existe, tentar via REST
        if (createResult.error.message.includes('function') || createResult.error.message.includes('does not exist')) {
          console.log('   ℹ️ RPC não disponível, policy precisa ser aplicada via SQL Editor no dashboard');
        } else if (createResult.error.message.includes('already exists')) {
          console.log(`   ✅ Policy já existe`);
        } else {
          console.log(`   ❌ Erro: ${createResult.error.message}`);
        }
      } else {
        console.log(`   ✅ Sucesso!`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error}`);
    }
  }

  console.log('\n📝 Se as policies não foram aplicadas automaticamente,');
  console.log('   copie o SQL do arquivo migration e execute no Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new\n');
}

// Verificar se as policies já existem
async function checkPolicies() {
  console.log('🔍 Verificando políticas existentes...\n');

  const { data, error } = await supabase
    .from('assessments')
    .select('id')
    .eq('status', 'active')
    .limit(1);

  if (error) {
    console.log(`❌ Erro ao consultar assessments: ${error.message}`);
    console.log('   Isso indica que as políticas ainda precisam ser aplicadas.\n');
    return false;
  }

  console.log(`✅ Consulta de assessments ativos funcionou!`);
  console.log(`   Encontrados: ${data?.length || 0} assessment(s)\n`);
  return true;
}

async function main() {
  await checkPolicies();
  await applyPolicies();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('INSTRUÇÕES PARA APLICAR MANUALMENTE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new');
  console.log('2. Cole o conteúdo do arquivo:');
  console.log('   supabase/migrations/20251211000001_add_public_assessment_access.sql');
  console.log('3. Execute o SQL');
  console.log('4. Teste o link público do assessment');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
