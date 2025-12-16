/**
 * Script para testar acesso público aos assessments
 *
 * Simula o acesso anônimo que a página /assess/[id] faz
 * Usar: npx tsx scripts/test-public-access.ts
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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessários');
  process.exit(1);
}

// Criar cliente ANÔNIMO (simula acesso público)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ASSESSMENT_ID = '863bda7c-ad8f-44f4-802c-ce9cec72a6fd';

async function testPublicAccess() {
  console.log('🔍 Testando acesso ANÔNIMO ao assessment...\n');
  console.log(`   Assessment ID: ${ASSESSMENT_ID}\n`);

  // Teste 1: Buscar assessment
  console.log('1️⃣ Buscando assessment...');
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', ASSESSMENT_ID)
    .eq('status', 'active')
    .single();

  if (assessmentError) {
    console.log(`   ❌ ERRO: ${assessmentError.message}`);
    console.log(`   📋 Code: ${assessmentError.code}`);
    console.log('   ⚠️ Política "assessments_select_public_active" não está ativa\n');
    return;
  }

  console.log(`   ✅ Assessment encontrado!`);
  console.log(`      - Título: ${assessment.title}`);
  console.log(`      - Status: ${assessment.status}`);
  console.log(`      - Questionnaire ID: ${assessment.questionnaire_id}`);
  console.log(`      - Organization ID: ${assessment.organization_id}\n`);

  // Teste 2: Buscar questionnaire
  console.log('2️⃣ Buscando questionnaire...');
  const { data: questionnaire, error: questionnaireError } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('id', assessment.questionnaire_id)
    .single();

  if (questionnaireError) {
    console.log(`   ❌ ERRO: ${questionnaireError.message}`);
    console.log('   ⚠️ Política "questionnaires_select_via_active_assessment" não está ativa\n');
  } else {
    console.log(`   ✅ Questionnaire encontrado!`);
    console.log(`      - Nome: ${questionnaire.name}`);
    console.log(`      - Descrição: ${questionnaire.description?.substring(0, 50)}...\n`);
  }

  // Teste 3: Buscar questions
  console.log('3️⃣ Buscando questions...');
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('questionnaire_id', assessment.questionnaire_id)
    .order('order_index', { ascending: true });

  if (questionsError) {
    console.log(`   ❌ ERRO: ${questionsError.message}`);
    console.log('   ⚠️ Política "questions_select_via_active_assessment" não está ativa\n');
  } else {
    console.log(`   ✅ Questions encontradas: ${questions?.length || 0}`);
    if (questions && questions.length > 0) {
      console.log(`      - Primeira: ${questions[0].text?.substring(0, 50)}...`);
    }
    console.log('');
  }

  // Teste 4: Buscar organization
  console.log('4️⃣ Buscando organization...');
  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', assessment.organization_id)
    .single();

  if (organizationError) {
    console.log(`   ❌ ERRO: ${organizationError.message}`);
    console.log('   ⚠️ Política "organizations_select_via_active_assessment" não está ativa\n');
  } else {
    console.log(`   ✅ Organization encontrada!`);
    console.log(`      - Nome: ${organization.name}\n`);
  }

  // Resumo
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('RESUMO DO TESTE DE ACESSO PÚBLICO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Assessments:    ${assessmentError ? '❌' : '✅'}`);
  console.log(`   Questionnaires: ${questionnaireError ? '❌' : '✅'}`);
  console.log(`   Questions:      ${questionsError ? '❌' : '✅'}`);
  console.log(`   Organizations:  ${organizationError ? '❌' : '✅'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const hasErrors = assessmentError || questionnaireError || questionsError || organizationError;
  if (hasErrors) {
    console.log('⚠️ Algumas políticas RLS precisam ser aplicadas.');
    console.log('   Execute o SQL no Supabase Dashboard:\n');
    console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new\n');
  } else {
    console.log('✅ Todas as políticas estão funcionando!');
    console.log('   O link público deve funcionar corretamente agora.\n');
  }
}

testPublicAccess().catch(console.error);
