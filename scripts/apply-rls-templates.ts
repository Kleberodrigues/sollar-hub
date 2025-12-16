/**
 * Script para aplicar política RLS de templates globais
 * Executa SQL diretamente via Supabase Management API
 */

import * as fs from 'fs';
import * as path from 'path';

// Carregar variáveis de ambiente do .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Extrair project ref da URL
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

async function applyRLSPolicy() {
  console.log('🔧 Aplicando política RLS para templates globais...');
  console.log(`📍 Projeto: ${projectRef}`);

  const sql = `
    -- Verificar se a política já existe
    DO $$
    BEGIN
      -- Criar política para questionários templates se não existir
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'questionnaires'
        AND policyname = 'questionnaires_select_templates'
      ) THEN
        CREATE POLICY "questionnaires_select_templates" ON public.questionnaires
          FOR SELECT
          USING (
            id IN (
              'a1111111-1111-1111-1111-111111111111'::uuid,
              'b2222222-2222-2222-2222-222222222222'::uuid
            )
          );
        RAISE NOTICE 'Política questionnaires_select_templates criada com sucesso';
      ELSE
        RAISE NOTICE 'Política questionnaires_select_templates já existe';
      END IF;

      -- Criar política para perguntas dos templates se não existir
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'questions'
        AND policyname = 'questions_select_templates'
      ) THEN
        CREATE POLICY "questions_select_templates" ON public.questions
          FOR SELECT
          USING (
            questionnaire_id IN (
              'a1111111-1111-1111-1111-111111111111'::uuid,
              'b2222222-2222-2222-2222-222222222222'::uuid
            )
          );
        RAISE NOTICE 'Política questions_select_templates criada com sucesso';
      ELSE
        RAISE NOTICE 'Política questions_select_templates já existe';
      END IF;
    END
    $$;
  `;

  try {
    // Usar a API REST do PostgREST para executar SQL via função RPC
    // Como não temos uma função RPC, vamos usar uma abordagem alternativa

    // Primeiro, vamos verificar se podemos usar a API de Management
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({})
    });

    console.log('\n⚠️  A API REST do Supabase não permite executar DDL diretamente.');
    console.log('\n📋 Por favor, execute o seguinte SQL no Supabase Dashboard:');
    console.log('   Dashboard > SQL Editor > New Query\n');
    console.log('━'.repeat(60));
    console.log(`
-- Política para permitir acesso aos templates globais NR-1/NR-17
CREATE POLICY "questionnaires_select_templates" ON public.questionnaires
  FOR SELECT
  USING (
    id IN (
      'a1111111-1111-1111-1111-111111111111'::uuid,
      'b2222222-2222-2222-2222-222222222222'::uuid
    )
  );

-- Política para permitir acesso às perguntas dos templates
CREATE POLICY "questions_select_templates" ON public.questions
  FOR SELECT
  USING (
    questionnaire_id IN (
      'a1111111-1111-1111-1111-111111111111'::uuid,
      'b2222222-2222-2222-2222-222222222222'::uuid
    )
  );
`);
    console.log('━'.repeat(60));
    console.log('\n🔗 Link direto: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');

  } catch (error) {
    console.error('Erro:', error);
  }
}

applyRLSPolicy();
