/**
 * Script para inserir os questionários Sollar e Pulse no banco de produção
 * Execute com: npx tsx scripts/seed-questionnaires.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carregar .env.local manualmente
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// IDs fixos para os questionários template
const SOLLAR_QUESTIONNAIRE_ID = 'a1111111-1111-1111-1111-111111111111';
const PULSE_QUESTIONNAIRE_ID = 'b2222222-2222-2222-2222-222222222222';

interface Question {
  text: string;
  type: 'likert_scale' | 'multiple_choice' | 'text';
  category: string;
  order_number: number;
  required: boolean;
  scale_labels?: Record<string, string>;
  options?: string[];
  risk_inverted?: boolean;
  is_strategic_open?: boolean;
  allow_skip?: boolean;
  min_value?: number;
  max_value?: number;
}

// Diagnóstico de Riscos Psicossociais - 30 perguntas
const sollarQuestions: Question[] = [
  // BLOCO 1: Demandas e Ritmo de Trabalho (4 perguntas)
  {
    text: 'Sinto que tenho mais tarefas do que consigo fazer dentro do meu horário de trabalho.',
    type: 'likert_scale',
    category: 'demands_and_pace',
    order_number: 1,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'Preciso trabalhar em um ritmo acelerado para dar conta de tudo.',
    type: 'likert_scale',
    category: 'demands_and_pace',
    order_number: 2,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'Meu trabalho costuma ser muito repetitivo ou parado, com pouca variação e pouco desafio.',
    type: 'likert_scale',
    category: 'demands_and_pace',
    order_number: 3,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'Se você pudesse mudar UMA coisa na sua rotina de trabalho para reduzir o estresse, o que seria?',
    type: 'text',
    category: 'demands_and_pace',
    order_number: 4,
    required: false,
    is_strategic_open: true,
  },

  // BLOCO 2: Autonomia, Clareza e Mudanças (4 perguntas)
  {
    text: 'Tenho liberdade para decidir como fazer minhas tarefas e organizar minha rotina.',
    type: 'likert_scale',
    category: 'autonomy_clarity_change',
    order_number: 5,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: false, // Inverso: mais autonomia = menos risco
    is_strategic_open: false,
  },
  {
    text: 'Sei claramente quais são minhas prioridades e o que é esperado de mim.',
    type: 'likert_scale',
    category: 'autonomy_clarity_change',
    order_number: 6,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
  },
  {
    text: 'Mudanças importantes são comunicadas de última hora, sem tempo para me preparar.',
    type: 'likert_scale',
    category: 'autonomy_clarity_change',
    order_number: 7,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'O que mais atrapalha sua organização e planejamento no trabalho?',
    type: 'text',
    category: 'autonomy_clarity_change',
    order_number: 8,
    required: false,
    is_strategic_open: true,
  },

  // BLOCO 3: Liderança e Reconhecimento (4 perguntas)
  {
    text: 'Sinto que sou tratado(a) com respeito pela minha liderança direta.',
    type: 'likert_scale',
    category: 'leadership_recognition',
    order_number: 9,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
  },
  {
    text: 'Meu trabalho é reconhecido e valorizado.',
    type: 'likert_scale',
    category: 'leadership_recognition',
    order_number: 10,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
  },
  {
    text: 'Tenho medo de falar abertamente com minha liderança sobre problemas ou dificuldades.',
    type: 'likert_scale',
    category: 'leadership_recognition',
    order_number: 11,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'Se você pudesse pedir UMA mudança à sua liderança, qual seria?',
    type: 'text',
    category: 'leadership_recognition',
    order_number: 12,
    required: false,
    is_strategic_open: true,
  },

  // BLOCO 4: Relações, Clima, Justiça e Comunicação (4 perguntas)
  {
    text: 'Posso contar com a ajuda dos meus colegas quando preciso.',
    type: 'likert_scale',
    category: 'relationships_communication',
    order_number: 13,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
  },
  {
    text: 'Existe desrespeito, fofoca ou conflito frequente na minha equipe.',
    type: 'likert_scale',
    category: 'relationships_communication',
    order_number: 14,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'Sinto que as decisões da empresa são justas e transparentes.',
    type: 'likert_scale',
    category: 'relationships_communication',
    order_number: 15,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
  },
  {
    text: 'Que tipo de injustiça ou dificuldade de comunicação você percebe no seu ambiente de trabalho?',
    type: 'text',
    category: 'relationships_communication',
    order_number: 16,
    required: false,
    is_strategic_open: true,
  },

  // BLOCO 5: Equilíbrio Trabalho-Vida e Saúde (4 perguntas)
  {
    text: 'O trabalho interfere no meu descanso, sono ou tempo com família/amigos.',
    type: 'likert_scale',
    category: 'work_life_health',
    order_number: 17,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'Fico preocupado(a) com o trabalho mesmo fora do expediente.',
    type: 'likert_scale',
    category: 'work_life_health',
    order_number: 18,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'Sinto-me esgotado(a) física ou emocionalmente por causa do trabalho.',
    type: 'likert_scale',
    category: 'work_life_health',
    order_number: 19,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
  },
  {
    text: 'O trabalho já impactou sua saúde física ou mental? Se sim, como?',
    type: 'text',
    category: 'work_life_health',
    order_number: 20,
    required: false,
    is_strategic_open: true,
  },

  // BLOCO 6: Violência, Assédio e Medo de Represália (4 perguntas)
  {
    text: 'Já presenciei ou sofri tratamento humilhante, gritos ou ameaças no trabalho.',
    type: 'likert_scale',
    category: 'violence_harassment',
    order_number: 21,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
    allow_skip: true,
  },
  {
    text: 'Já presenciei ou sofri assédio moral ou sexual no ambiente de trabalho.',
    type: 'likert_scale',
    category: 'violence_harassment',
    order_number: 22,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
    allow_skip: true,
  },
  {
    text: 'Tenho medo de sofrer represália se fizer uma denúncia ou reclamação.',
    type: 'likert_scale',
    category: 'violence_harassment',
    order_number: 23,
    required: true,
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Frequentemente', '5': 'Sempre' },
    risk_inverted: true,
    is_strategic_open: false,
    allow_skip: true,
  },
  {
    text: 'Caso queira descrever alguma situação grave que vivenciou ou presenciou, utilize este espaço (opcional e sigiloso):',
    type: 'text',
    category: 'violence_harassment',
    order_number: 24,
    required: false,
    is_strategic_open: true,
    allow_skip: true,
  },

  // BLOCO 7: Âncoras (3 perguntas)
  {
    text: 'De 0 a 10, qual o seu nível de satisfação geral com o trabalho?',
    type: 'likert_scale',
    category: 'anchors',
    order_number: 25,
    required: true,
    scale_labels: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 0,
    max_value: 10,
  },
  {
    text: 'Se pudesse, você continuaria trabalhando nesta empresa pelos próximos 2 anos?',
    type: 'multiple_choice',
    category: 'anchors',
    order_number: 26,
    required: true,
    options: ['Sim, com certeza', 'Provavelmente sim', 'Não sei', 'Provavelmente não', 'Não, com certeza'],
    is_strategic_open: false,
  },
  {
    text: 'Como você avalia sua saúde física e mental atualmente?',
    type: 'multiple_choice',
    category: 'anchors',
    order_number: 27,
    required: true,
    options: ['Excelente', 'Boa', 'Regular', 'Ruim', 'Muito ruim'],
    is_strategic_open: false,
  },

  // BLOCO 8: Sugestões Diretas (3 perguntas)
  {
    text: 'Cite até 3 coisas que te ajudam a se sentir bem no trabalho:',
    type: 'text',
    category: 'suggestions',
    order_number: 28,
    required: false,
    is_strategic_open: true,
  },
  {
    text: 'Cite até 3 coisas que mais te atrapalham ou causam desconforto no trabalho:',
    type: 'text',
    category: 'suggestions',
    order_number: 29,
    required: false,
    is_strategic_open: true,
  },
  {
    text: 'Se você pudesse sugerir UMA ação prática que a empresa deveria implementar para melhorar o ambiente de trabalho, qual seria?',
    type: 'text',
    category: 'suggestions',
    order_number: 30,
    required: false,
    is_strategic_open: true,
  },
];

// Questionário Pesquisa de Clima - 10 perguntas mensais
const pulseQuestions: Question[] = [
  {
    text: 'Como você está se sentindo no trabalho este mês?',
    type: 'multiple_choice',
    category: 'bem_estar',
    order_number: 1,
    required: true,
    options: ['Muito mal', 'Mal', 'Mais ou menos', 'Bem', 'Muito bem'],
    scale_labels: { '1': 'Muito mal', '2': 'Mal', '3': 'Mais ou menos', '4': 'Bem', '5': 'Muito bem' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'Neste mês, consegui dar conta do meu trabalho sem me sentir sobrecarregado(a).',
    type: 'likert_scale',
    category: 'carga_trabalho',
    order_number: 2,
    required: true,
    options: ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'],
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Quase sempre', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'Neste mês, consegui concluir minhas principais tarefas dentro do meu horário normal de trabalho.',
    type: 'likert_scale',
    category: 'carga_trabalho',
    order_number: 3,
    required: true,
    options: ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'],
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Quase sempre', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'Neste mês, senti que minha liderança me apoiou quando precisei.',
    type: 'likert_scale',
    category: 'lideranca',
    order_number: 4,
    required: true,
    options: ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'],
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Quase sempre', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'Neste mês, recebi orientações claras sobre prioridades e expectativas do meu trabalho.',
    type: 'likert_scale',
    category: 'lideranca',
    order_number: 5,
    required: true,
    options: ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'],
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Quase sempre', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'Neste mês, senti que pude falar abertamente com minha liderança.',
    type: 'likert_scale',
    category: 'lideranca',
    order_number: 6,
    required: true,
    options: ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'],
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Quase sempre', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'Neste mês, percebi um ambiente respeitoso e colaborativo no dia a dia.',
    type: 'likert_scale',
    category: 'clima',
    order_number: 7,
    required: true,
    options: ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'],
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Quase sempre', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'Neste mês, senti segurança para trazer dúvidas, problemas ou erros sem medo de consequências injustas.',
    type: 'likert_scale',
    category: 'clima',
    order_number: 8,
    required: true,
    options: ['Nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'],
    scale_labels: { '1': 'Nunca', '2': 'Raramente', '3': 'Às vezes', '4': 'Quase sempre', '5': 'Sempre' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 1,
    max_value: 5,
  },
  {
    text: 'De 0 a 10, quão satisfeito(a) você está hoje com seu trabalho nesta empresa?',
    type: 'likert_scale',
    category: 'satisfacao',
    order_number: 9,
    required: true,
    scale_labels: { '0': 'Totalmente insatisfeito(a)', '10': 'Totalmente satisfeito(a)' },
    risk_inverted: false,
    is_strategic_open: false,
    min_value: 0,
    max_value: 10,
  },
  {
    text: 'Se quiser, explique o motivo da sua nota.',
    type: 'text',
    category: 'satisfacao',
    order_number: 10,
    required: false,
    is_strategic_open: true,
  },
];

async function main() {
  console.log('🌻 Iniciando seed dos questionários Sollar (GLOBAIS)...\n');

  // Questionários padrão NR-1/NR-17 são GLOBAIS (organization_id = NULL)
  // Isso permite que todas as organizações vejam e usem esses templates
  console.log('📋 Questionários serão criados como GLOBAIS (sem organization_id)\n');
  console.log('   Isso permite que TODAS as organizações vejam os templates padrão.\n');

  // 2. Verificar se os questionários já existem
  const { data: existingQuestionnaires } = await supabase
    .from('questionnaires')
    .select('id, title, organization_id')
    .in('id', [SOLLAR_QUESTIONNAIRE_ID, PULSE_QUESTIONNAIRE_ID]);

  if (existingQuestionnaires && existingQuestionnaires.length > 0) {
    console.log('⚠️  Questionários encontrados:');
    existingQuestionnaires.forEach(q => console.log(`   - ${q.title} (org: ${q.organization_id || 'GLOBAL'})`));
    console.log('\n');
  }

  // 3. Atualizar Questionário Sollar para ser GLOBAL (organization_id = NULL)
  console.log('📝 Atualizando Questionário Sollar para ser GLOBAL...');

  const { data: sollarQ, error: sollarError } = await supabase
    .from('questionnaires')
    .upsert({
      id: SOLLAR_QUESTIONNAIRE_ID,
      organization_id: null, // GLOBAL - visível para todas as organizações
      title: 'Diagnóstico de Riscos Psicossociais',
      description: 'Questionário completo para mapeamento de fatores de risco psicossocial relacionados ao trabalho, baseado em NR-1 e NR-17.',
      is_active: true,
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (sollarError) {
    console.error('❌ Erro ao inserir questionário Sollar:', sollarError);
  } else {
    console.log(`✅ Questionário Sollar criado/atualizado: ${sollarQ.id}\n`);

    // Inserir perguntas do Sollar
    console.log('📝 Inserindo 30 perguntas do Sollar...');
    for (const q of sollarQuestions) {
      const { error: qError } = await supabase
        .from('questions')
        .upsert({
          questionnaire_id: SOLLAR_QUESTIONNAIRE_ID,
          text: q.text,
          type: q.type,
          order_number: q.order_number,
          required: q.required,
          options: q.options || null,
        }, { onConflict: 'questionnaire_id,order_number', ignoreDuplicates: false });

      if (qError) {
        console.error(`   ❌ Erro na pergunta ${q.order_number}:`, qError.message);
      } else {
        console.log(`   ✅ Pergunta ${q.order_number}: ${q.text.substring(0, 50)}...`);
      }
    }
  }

  // 4. Atualizar Questionário Pulse para ser GLOBAL
  console.log('\n📝 Atualizando Questionário Pulse para ser GLOBAL...');

  const { data: pulseQ, error: pulseError } = await supabase
    .from('questionnaires')
    .upsert({
      id: PULSE_QUESTIONNAIRE_ID,
      organization_id: null, // GLOBAL - visível para todas as organizações
      title: 'Pesquisa de Clima',
      description: 'Pesquisa rápida mensal (1 minuto) para acompanhamento contínuo do clima organizacional.',
      is_active: true,
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (pulseError) {
    console.error('❌ Erro ao inserir questionário Pulse:', pulseError);
  } else {
    console.log(`✅ Questionário Pulse criado/atualizado: ${pulseQ.id}\n`);

    // Inserir perguntas do Pulse
    console.log('📝 Inserindo 5 perguntas do Pulse...');
    for (const q of pulseQuestions) {
      const { error: qError } = await supabase
        .from('questions')
        .upsert({
          questionnaire_id: PULSE_QUESTIONNAIRE_ID,
          text: q.text,
          type: q.type,
          order_number: q.order_number,
          required: q.required,
          options: q.options || null,
        }, { onConflict: 'questionnaire_id,order_number', ignoreDuplicates: false });

      if (qError) {
        console.error(`   ❌ Erro na pergunta ${q.order_number}:`, qError.message);
      } else {
        console.log(`   ✅ Pergunta ${q.order_number}: ${q.text.substring(0, 50)}...`);
      }
    }
  }

  // 5. Verificar resultado
  console.log('\n📊 Verificando resultado...');

  const { data: finalQuestionnaires } = await supabase
    .from('questionnaires')
    .select('id, title, organization_id, questions(count)')
    .in('id', [SOLLAR_QUESTIONNAIRE_ID, PULSE_QUESTIONNAIRE_ID]);

  console.log('\n✅ Questionários GLOBAIS no banco:');
  finalQuestionnaires?.forEach(q => {
    const count = (q.questions as any)?.[0]?.count || 0;
    const orgStatus = q.organization_id ? `org: ${q.organization_id}` : '🌍 GLOBAL';
    console.log(`   - ${q.title}: ${count} perguntas (${orgStatus})`);
  });

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📌 Próximo passo: Ajustar a query de questionários para incluir globais.');
}

main().catch(console.error);
