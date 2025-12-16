/**
 * Script para testar exatamente a query que a página faz
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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Usar ANON KEY (simula acesso público)
const supabase = createClient(supabaseUrl, anonKey);

const ASSESSMENT_ID = '863bda7c-ad8f-44f4-802c-ce9cec72a6fd';

async function testPageQuery() {
  console.log('🔍 Testando query exata da página /assess/[id]...\n');
  console.log(`   Assessment ID: ${ASSESSMENT_ID}\n`);

  // Query exata da página
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select(
      `
      *,
      questionnaires (
        id,
        title,
        description,
        introduction_text,
        lgpd_consent_text,
        questionnaire_type,
        questions (
          id,
          text,
          question_text,
          type,
          question_type,
          options,
          is_required,
          order_index,
          scale_labels,
          allow_skip,
          risk_inverted,
          is_strategic_open,
          min_value,
          max_value,
          category
        )
      ),
      organizations (
        name
      )
    `
    )
    .eq("id", ASSESSMENT_ID)
    .eq("status", "active")
    .single();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('RESULTADO DA QUERY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (error) {
    console.log(`❌ ERRO: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Details: ${error.details}`);
    console.log(`   Hint: ${error.hint}\n`);

    if (error.code === 'PGRST116') {
      console.log('⚠️ PGRST116 = Query retornou 0 resultados');
      console.log('   Possíveis causas:');
      console.log('   1. Assessment não existe ou não está ativo');
      console.log('   2. Política RLS bloqueou o acesso');
      console.log('   3. JOIN com organizations falhou\n');
    }
  } else {
    console.log('✅ Query executada com sucesso!\n');
    console.log(`   Assessment: ${assessment.title}`);
    console.log(`   Questionnaire: ${assessment.questionnaires?.title || assessment.questionnaires?.description?.substring(0, 50)}`);
    console.log(`   Questions: ${assessment.questionnaires?.questions?.length || 0}`);
    console.log(`   Organization: ${assessment.organizations?.name || 'NULL'}\n`);
  }

  // Teste sem organizations
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE SEM ORGANIZATIONS (para diagnóstico):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { data: assessmentNoOrg, error: errorNoOrg } = await supabase
    .from("assessments")
    .select(
      `
      *,
      questionnaires (
        id,
        title,
        description,
        questions (
          id,
          text,
          type,
          order_index
        )
      )
    `
    )
    .eq("id", ASSESSMENT_ID)
    .eq("status", "active")
    .single();

  if (errorNoOrg) {
    console.log(`❌ ERRO (sem organizations): ${errorNoOrg.message}\n`);
  } else {
    console.log('✅ Query SEM organizations funcionou!\n');
    console.log(`   Assessment: ${assessmentNoOrg.title}`);
    console.log(`   Questions: ${assessmentNoOrg.questionnaires?.questions?.length || 0}\n`);

    if (error && !errorNoOrg) {
      console.log('🎯 DIAGNÓSTICO: O problema está no JOIN com organizations!');
      console.log('   A política "organizations_select_via_active_assessment" precisa ser aplicada.\n');
    }
  }
}

testPageQuery().catch(console.error);
