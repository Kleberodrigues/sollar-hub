import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jxpyjbpndssnwuudbuui.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ5NjYyNiwiZXhwIjoyMDY1MDcyNjI2fQ.9e6rmG2O69Y3D1hfIkd_FMhRNKNnuclzzGYqzRuOiYU';

// Questionário Pesquisa de Clima (ID fixo do seed)
const CLIMA_QUESTIONNAIRE_ID = 'b2222222-2222-2222-2222-222222222222';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createTestAssessment() {
  console.log('🚀 Criando assessment de teste para Pesquisa de Clima...\n');

  try {
    // 1. Buscar organização
    console.log('1️⃣ Buscando organização...');
    const { data: orgs, error: orgErr } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1);

    if (orgErr) throw new Error(`Erro ao buscar org: ${orgErr.message}`);
    if (!orgs || orgs.length === 0) {
      console.log('   ⚠️ Nenhuma organização encontrada. Criando...');

      // Criar organização
      const { data: newOrg, error: createOrgErr } = await supabase
        .from('organizations')
        .insert({
          name: 'Organização Demo',
          slug: 'org-demo',
          industry: 'technology',
          size: '11-50'
        })
        .select()
        .single();

      if (createOrgErr) throw new Error(`Erro ao criar org: ${createOrgErr.message}`);
      orgs.push(newOrg);
    }

    const org = orgs[0];
    console.log(`   ✅ Organização: ${org.name} (${org.id})\n`);

    // 2. Verificar se questionário existe
    console.log('2️⃣ Verificando questionário Pesquisa de Clima...');
    const { data: questionnaire, error: qErr } = await supabase
      .from('questionnaires')
      .select('id, title')
      .eq('id', CLIMA_QUESTIONNAIRE_ID)
      .single();

    if (qErr || !questionnaire) {
      console.log('   ⚠️ Questionário não encontrado. Verificando lista completa...');

      const { data: allQ } = await supabase
        .from('questionnaires')
        .select('id, title, is_default');

      console.log('   Questionários disponíveis:', allQ?.length || 0);
      allQ?.forEach(q => console.log(`      - ${q.title} (${q.id})`));

      if (!allQ || allQ.length === 0) {
        throw new Error('Nenhum questionário disponível. Execute as migrations primeiro.');
      }

      // Usar o primeiro questionário disponível
      const firstQ = allQ[0];
      console.log(`   📋 Usando: ${firstQ.title}\n`);

      return await createAssessment(org.id, firstQ.id, firstQ.title);
    }

    console.log(`   ✅ Questionário: ${questionnaire.title}\n`);

    // 3. Criar assessment
    return await createAssessment(org.id, questionnaire.id, questionnaire.title);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

async function createAssessment(orgId, questionnaireId, questionnaireName) {
  console.log('3️⃣ Criando assessment...');

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const { data: assessment, error: aErr } = await supabase
    .from('assessments')
    .insert({
      organization_id: orgId,
      questionnaire_id: questionnaireId,
      title: `${questionnaireName} - Dezembro 2024`,
      description: 'Assessment de teste para validação do dashboard de clima',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      is_anonymous: true,
    })
    .select()
    .single();

  if (aErr) throw new Error(`Erro ao criar assessment: ${aErr.message}`);

  console.log(`   ✅ Assessment criado: ${assessment.title}`);
  console.log(`   📎 ID: ${assessment.id}`);
  console.log(`   📅 Período: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
  console.log(`   🔗 Status: ${assessment.status}\n`);

  // 4. Criar algumas respostas mock
  console.log('4️⃣ Criando respostas de teste...');

  // Buscar perguntas do questionário
  const { data: questions } = await supabase
    .from('questions')
    .select('id, text, type, order_index')
    .eq('questionnaire_id', questionnaireId)
    .order('order_index');

  if (!questions || questions.length === 0) {
    console.log('   ⚠️ Nenhuma pergunta encontrada no questionário');
    return assessment;
  }

  console.log(`   📝 ${questions.length} perguntas encontradas`);

  // Criar 5 respostas de teste
  const mockResponses = [];
  for (let i = 0; i < 5; i++) {
    const anonymousId = `test-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`;

    for (const question of questions) {
      let value;
      if (question.type === 'sentiment') {
        value = ['Muito mal', 'Mal', 'Mais ou menos', 'Bem', 'Muito bem'][Math.floor(Math.random() * 5)];
      } else if (question.type === 'frequency') {
        value = ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'][Math.floor(Math.random() * 5)];
      } else if (question.type === 'satisfaction' || question.type === 'nps') {
        value = String(Math.floor(Math.random() * 11)); // 0-10
      } else if (question.type === 'open_text') {
        const texts = [
          'Comunicação poderia melhorar',
          'Ambiente de trabalho muito bom',
          'Sobrecarga de tarefas recentemente',
          'Liderança presente e acessível',
          'Precisamos de mais feedback'
        ];
        value = texts[i];
      } else {
        value = String(Math.floor(Math.random() * 5) + 1);
      }

      mockResponses.push({
        assessment_id: assessment.id,
        question_id: question.id,
        anonymous_id: anonymousId,
        value: value,
      });
    }
  }

  const { error: rErr } = await supabase
    .from('responses')
    .insert(mockResponses);

  if (rErr) {
    console.log(`   ⚠️ Erro ao criar respostas: ${rErr.message}`);
  } else {
    console.log(`   ✅ ${mockResponses.length} respostas criadas (5 participantes)\n`);
  }

  console.log('✅ Setup completo!\n');
  console.log('📌 Próximos passos:');
  console.log('   1. Acesse: https://sollar-hub-yurq.vercel.app/dashboard/analytics');
  console.log('   2. Selecione o assessment criado');
  console.log('   3. Clique em "Visão Clima" para ver o dashboard\n');

  return assessment;
}

createTestAssessment();
