/**
 * Add Test Responses to Production Assessment
 *
 * This script adds realistic test responses to verify report generation
 */

const SUPABASE_URL = 'https://jxpyjbpndssnwuudbuui.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTY2MjYsImV4cCI6MjA2NTA3MjYyNn0.hH64H5UoVj3GvhfGCMvkjLbhHLp6pDV7zn3Y1fE01gM';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function supabaseGet(endpoint) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${endpoint} failed: ${res.status} - ${text}`);
  }
  return res.json();
}

async function supabasePost(endpoint, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${endpoint} failed: ${res.status} - ${text}`);
  }
  return res.json();
}

// Generate random Likert response (1-5)
function randomLikert() {
  // Weighted towards middle values for realistic distribution
  const weights = [0.1, 0.2, 0.3, 0.25, 0.15]; // 1, 2, 3, 4, 5
  const rand = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (rand < sum) return i + 1;
  }
  return 3;
}

// Generate random NPS score (0-10)
function randomNPS() {
  // Weighted: 20% detractors (0-6), 30% passives (7-8), 50% promoters (9-10)
  const rand = Math.random();
  if (rand < 0.2) return Math.floor(Math.random() * 7); // 0-6
  if (rand < 0.5) return 7 + Math.floor(Math.random() * 2); // 7-8
  return 9 + Math.floor(Math.random() * 2); // 9-10
}

// Sample open text responses
const TEXT_RESPONSES = [
  'A comunicação entre departamentos precisa melhorar significativamente.',
  'O ambiente de trabalho é bom, mas há muito estresse com prazos.',
  'Falta reconhecimento pelos esforços da equipe.',
  'A liderança poderia ser mais presente e acessível.',
  'Gostaria de mais oportunidades de desenvolvimento profissional.',
  'O equilíbrio entre vida pessoal e trabalho está comprometido.',
  'A empresa tem bons valores, mas nem sempre são praticados.',
  'Precisamos de mais ferramentas e recursos para trabalhar.',
  'O clima entre colegas é excelente.',
  'Há muita burocracia nos processos internos.',
  'A flexibilidade de horário ajuda muito.',
  'Sinto que meu trabalho faz diferença.',
];

function randomText() {
  return TEXT_RESPONSES[Math.floor(Math.random() * TEXT_RESPONSES.length)];
}

async function main() {
  console.log('🚀 Adicionando respostas de teste...\n');

  try {
    // 1. Get assessments
    console.log('1️⃣ Buscando assessments...');
    const assessments = await supabaseGet('assessments?select=id,title,status,questionnaire_id&limit=5');
    console.log(`   Encontrados: ${assessments.length} assessments`);

    if (assessments.length === 0) {
      console.log('❌ Nenhum assessment encontrado');
      return;
    }

    // Use the first assessment
    const assessment = assessments[0];
    console.log(`   Usando: ${assessment.title} (${assessment.id})`);

    // 2. Get questions for this questionnaire
    console.log('\n2️⃣ Buscando perguntas...');
    const questions = await supabaseGet(
      `questions?questionnaire_id=eq.${assessment.questionnaire_id}&select=id,text,type,category&order=order_index`
    );
    console.log(`   Encontradas: ${questions.length} perguntas`);

    if (questions.length === 0) {
      console.log('❌ Nenhuma pergunta encontrada');
      return;
    }

    // Show question types
    const typeCount = {};
    questions.forEach(q => {
      typeCount[q.type] = (typeCount[q.type] || 0) + 1;
    });
    console.log('   Tipos:', typeCount);

    // 3. Generate responses for 15 participants (enough for correlation report)
    console.log('\n3️⃣ Gerando respostas para 15 participantes...');

    const NUM_PARTICIPANTS = 15;
    let totalResponses = 0;

    for (let p = 0; p < NUM_PARTICIPANTS; p++) {
      const anonymousId = `test-participant-${Date.now()}-${p}`;
      const responses = [];

      for (const question of questions) {
        let value;

        switch (question.type) {
          case 'likert_scale':
            value = String(randomLikert());
            break;
          case 'nps':
            value = String(randomNPS());
            break;
          case 'text':
          case 'long_text':
            value = randomText();
            break;
          case 'single_choice':
            value = Math.random() > 0.5 ? 'Sim' : 'Não';
            break;
          case 'multiple_choice':
            value = JSON.stringify(['Opção A', 'Opção B']);
            break;
          default:
            value = String(randomLikert());
        }

        responses.push({
          assessment_id: assessment.id,
          question_id: question.id,
          anonymous_id: anonymousId,
          value: value,
          created_at: new Date().toISOString()
        });
      }

      // Insert responses for this participant
      try {
        await supabasePost('responses', responses);
        totalResponses += responses.length;
        process.stdout.write(`   Participante ${p + 1}/${NUM_PARTICIPANTS} ✓\r`);
      } catch (err) {
        console.log(`\n   ⚠️ Erro participante ${p + 1}: ${err.message}`);
      }
    }

    console.log(`\n   ✅ Total: ${totalResponses} respostas inseridas`);

    // 4. Verify
    console.log('\n4️⃣ Verificando...');
    const count = await supabaseGet(
      `responses?assessment_id=eq.${assessment.id}&select=anonymous_id`
    );
    const uniqueParticipants = [...new Set(count.map(r => r.anonymous_id))].length;
    console.log(`   Respostas: ${count.length}`);
    console.log(`   Participantes únicos: ${uniqueParticipants}`);

    console.log('\n✅ Pronto! Agora os relatórios podem ser testados.');
    console.log(`   Assessment ID: ${assessment.id}`);
    console.log(`   URL: https://psicomapa.cloud/dashboard/analytics?assessment=${assessment.id}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main();
