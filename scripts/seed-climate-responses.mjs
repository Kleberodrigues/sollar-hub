// Script para gerar respostas de teste para Pesquisa de Clima
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxpyjbpndssnwuudbuui.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ5NjYyNiwiZXhwIjoyMDY1MDcyNjI2fQ.pLSnMKoF4nlNFw3tBN-AK5j0xboRh_qfTf7GWDmhfCM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CLIMA_QUESTIONNAIRE_ID = 'b2222222-2222-2222-2222-222222222222';

// Opções de resposta
const Q1_OPTIONS = ['Muito mal', 'Mal', 'Mais ou menos', 'Bem', 'Muito bem'];
const LIKERT_OPTIONS = ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'];
const Q10_COMMENTS = [
  'Excesso de trabalho está me sobrecarregando muito.',
  'Falta de reconhecimento por parte da liderança.',
  'A equipe é muito colaborativa e o ambiente é ótimo.',
  'Precisamos de mais flexibilidade nos horários.',
  'O crescimento profissional aqui é excelente.',
  'A comunicação entre os times precisa melhorar.',
  'Estresse constante com prazos apertados.',
  'Os benefícios são muito bons, estou satisfeito.',
  'A liderança poderia ser mais presente.',
  'Ambiente de trabalho muito agradável.',
  'Sobrecarga de tarefas está afetando minha saúde.',
  'Reconhecimento pelo trabalho realizado é muito bom.',
  'Pressão excessiva para entregar resultados.',
  'Equipe unida e colaborativa.',
  'Salário abaixo do mercado.',
];

// Função para gerar resposta aleatória ponderada
function weightedRandom(options, weights) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < options.length; i++) {
    random -= weights[i];
    if (random <= 0) return options[i];
  }
  return options[options.length - 1];
}

// Gerar score NPS (0-10) com distribuição realista
function generateNPSScore() {
  // Distribuição: mais respostas entre 6-9
  const weights = [2, 2, 3, 4, 5, 8, 12, 18, 22, 15, 9]; // 0-10
  return weightedRandom([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], weights);
}

async function main() {
  console.log('🌡️  Iniciando geração de respostas de Pesquisa de Clima...\n');

  // 1. Verificar se o questionário existe
  console.log('📋 Verificando questionário de clima...');
  const { data: questionnaire, error: qError } = await supabase
    .from('questionnaires')
    .select('id, title')
    .eq('id', CLIMA_QUESTIONNAIRE_ID)
    .single();

  if (qError || !questionnaire) {
    console.log('❌ Questionário de Pesquisa de Clima não encontrado!');
    console.log('   Criando questionário...');

    // Criar questionário se não existir
    const { error: createQError } = await supabase
      .from('questionnaires')
      .insert({
        id: CLIMA_QUESTIONNAIRE_ID,
        title: 'Pesquisa de Clima Organizacional',
        description: 'Questionário para avaliar o clima organizacional e bem-estar dos colaboradores',
        category: 'climate',
        is_template: true,
        is_active: true,
      });

    if (createQError) {
      console.log('❌ Erro ao criar questionário:', createQError.message);
      return;
    }
    console.log('✅ Questionário criado!');
  } else {
    console.log(`✅ Questionário encontrado: ${questionnaire.title}`);
  }

  // 2. Buscar perguntas do questionário
  console.log('\n📝 Buscando perguntas...');
  let { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, text, type, order_index')
    .eq('questionnaire_id', CLIMA_QUESTIONNAIRE_ID)
    .order('order_index');

  if (questionsError || !questions || questions.length === 0) {
    console.log('❌ Perguntas não encontradas. Criando perguntas padrão...');

    const defaultQuestions = [
      { order_index: 1, text: 'Como você está se sentindo no trabalho este mês?', type: 'multiple_choice', options: Q1_OPTIONS },
      { order_index: 2, text: 'Você se sente respeitado(a) pelos seus colegas de trabalho?', type: 'likert', options: LIKERT_OPTIONS },
      { order_index: 3, text: 'Sua liderança oferece suporte quando você precisa?', type: 'likert', options: LIKERT_OPTIONS },
      { order_index: 4, text: 'Você consegue equilibrar sua vida pessoal e profissional?', type: 'likert', options: LIKERT_OPTIONS },
      { order_index: 5, text: 'Você se sente motivado(a) para realizar suas tarefas?', type: 'likert', options: LIKERT_OPTIONS },
      { order_index: 6, text: 'A comunicação na empresa é clara e eficiente?', type: 'likert', options: LIKERT_OPTIONS },
      { order_index: 7, text: 'Você tem as ferramentas necessárias para fazer seu trabalho?', type: 'likert', options: LIKERT_OPTIONS },
      { order_index: 8, text: 'Você se sente valorizado(a) pelo seu trabalho?', type: 'likert', options: LIKERT_OPTIONS },
      { order_index: 9, text: 'De 0 a 10, quão satisfeito(a) você está trabalhando aqui?', type: 'nps', options: null },
      { order_index: 10, text: 'O que mais influencia sua nota? (opcional)', type: 'text', options: null },
    ];

    const questionsToInsert = defaultQuestions.map(q => ({
      questionnaire_id: CLIMA_QUESTIONNAIRE_ID,
      text: q.text,
      type: q.type,
      order_index: q.order_index,
      options: q.options,
      is_required: q.order_index !== 10,
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.log('❌ Erro ao criar perguntas:', insertError.message);
      return;
    }

    questions = insertedQuestions;
    console.log(`✅ ${questions.length} perguntas criadas!`);
  } else {
    console.log(`✅ ${questions.length} perguntas encontradas`);
  }

  // 3. Buscar ou criar uma organização de teste
  console.log('\n🏢 Verificando organização...');
  let { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(1);

  let organizationId;
  if (!orgs || orgs.length === 0) {
    console.log('   Criando organização de teste...');
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: 'Empresa Teste', slug: 'empresa-teste' })
      .select()
      .single();

    if (orgError) {
      console.log('❌ Erro ao criar organização:', orgError.message);
      return;
    }
    organizationId = newOrg.id;
    console.log(`✅ Organização criada: ${newOrg.name}`);
  } else {
    organizationId = orgs[0].id;
    console.log(`✅ Usando organização: ${orgs[0].name}`);
  }

  // 4. Criar avaliação para o mês atual
  console.log('\n📊 Criando avaliação de clima para este mês...');
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .insert({
      title: `Pesquisa de Clima - ${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      questionnaire_id: CLIMA_QUESTIONNAIRE_ID,
      organization_id: organizationId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
    })
    .select()
    .single();

  if (assessmentError) {
    console.log('⚠️  Avaliação já pode existir, buscando...', assessmentError.message);

    const { data: existingAssessment } = await supabase
      .from('assessments')
      .select('id, title')
      .eq('questionnaire_id', CLIMA_QUESTIONNAIRE_ID)
      .eq('organization_id', organizationId)
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString())
      .single();

    if (existingAssessment) {
      console.log(`✅ Usando avaliação existente: ${existingAssessment.title}`);

      // Gerar respostas para esta avaliação
      await generateResponses(existingAssessment.id, questions, 25);
    } else {
      console.log('❌ Não foi possível criar ou encontrar avaliação');
      return;
    }
  } else {
    console.log(`✅ Avaliação criada: ${assessment.title}`);
    await generateResponses(assessment.id, questions, 25);
  }

  console.log('\n🎉 Processo concluído! Acesse o dashboard para ver os resultados.');
  console.log('   https://psicomapa.cloud/dashboard/climate');
}

async function generateResponses(assessmentId, questions, count) {
  console.log(`\n📤 Gerando ${count} respostas...`);

  const responses = [];

  for (let i = 0; i < count; i++) {
    const answers = {};

    for (const q of questions) {
      if (q.order_index === 1) {
        // Q1 - Sentimento (distribuição realista)
        answers[q.id] = weightedRandom(Q1_OPTIONS, [5, 10, 25, 40, 20]);
      } else if (q.order_index >= 2 && q.order_index <= 8) {
        // Q2-Q8 - Likert (distribuição variada)
        answers[q.id] = weightedRandom(LIKERT_OPTIONS, [5, 10, 30, 35, 20]);
      } else if (q.order_index === 9) {
        // Q9 - NPS (0-10)
        answers[q.id] = generateNPSScore();
      } else if (q.order_index === 10) {
        // Q10 - Comentário (70% respondem)
        if (Math.random() < 0.7) {
          answers[q.id] = Q10_COMMENTS[Math.floor(Math.random() * Q10_COMMENTS.length)];
        }
      }
    }

    responses.push({
      assessment_id: assessmentId,
      answers,
      is_anonymous: true,
      completed_at: new Date().toISOString(),
    });

    process.stdout.write(`\r   Preparando resposta ${i + 1}/${count}...`);
  }

  console.log('\n   Salvando respostas no banco de dados...');

  // Inserir em lotes de 10
  const batchSize = 10;
  for (let i = 0; i < responses.length; i += batchSize) {
    const batch = responses.slice(i, i + batchSize);
    const { error } = await supabase.from('responses').insert(batch);

    if (error) {
      console.log(`\n❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1}:`, error.message);
    } else {
      process.stdout.write(`\r   Inseridos ${Math.min(i + batchSize, responses.length)}/${responses.length} respostas...`);
    }
  }

  console.log(`\n✅ ${count} respostas inseridas com sucesso!`);
}

main().catch(console.error);
