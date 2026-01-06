/**
 * Add Test Responses via Playwright Browser
 *
 * Uses browser's DNS resolution to bypass local DNS issues
 */

import { chromium } from 'playwright';

const SUPABASE_URL = 'https://jxpyjbpndssnwuudbuui.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cHlqYnBuZHNzbnd1dWRidXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTY2MjYsImV4cCI6MjA2NTA3MjYyNn0.hH64H5UoVj3GvhfGCMvkjLbhHLp6pDV7zn3Y1fE01gM';

async function main() {
  console.log('🚀 Adicionando respostas de teste via browser...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to a blank page and execute fetch from browser context
    await page.goto('about:blank');

    const result = await page.evaluate(async ({ url, key }) => {
      const headers = {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      const results = { steps: [], errors: [] };

      // Helper functions
      async function supabaseGet(endpoint) {
        const res = await fetch(`${url}/rest/v1/${endpoint}`, { headers });
        if (!res.ok) throw new Error(`GET ${endpoint}: ${res.status}`);
        return res.json();
      }

      async function supabasePost(endpoint, data) {
        const res = await fetch(`${url}/rest/v1/${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`POST ${endpoint}: ${res.status} - ${text}`);
        }
        return res.json();
      }

      function randomLikert() {
        const weights = [0.1, 0.2, 0.3, 0.25, 0.15];
        const rand = Math.random();
        let sum = 0;
        for (let i = 0; i < weights.length; i++) {
          sum += weights[i];
          if (rand < sum) return i + 1;
        }
        return 3;
      }

      function randomNPS() {
        const rand = Math.random();
        if (rand < 0.2) return Math.floor(Math.random() * 7);
        if (rand < 0.5) return 7 + Math.floor(Math.random() * 2);
        return 9 + Math.floor(Math.random() * 2);
      }

      const textResponses = [
        'A comunicação entre departamentos precisa melhorar.',
        'O ambiente de trabalho é bom, mas há estresse com prazos.',
        'Falta reconhecimento pelos esforços da equipe.',
        'A liderança poderia ser mais presente e acessível.',
        'Gostaria de mais oportunidades de desenvolvimento.',
        'O equilíbrio entre vida e trabalho está comprometido.',
        'A empresa tem bons valores, mas nem sempre praticados.',
        'Precisamos de mais ferramentas e recursos.',
        'O clima entre colegas é excelente.',
        'Há muita burocracia nos processos internos.',
      ];

      function randomText() {
        return textResponses[Math.floor(Math.random() * textResponses.length)];
      }

      try {
        // 1. Get assessments
        results.steps.push('Buscando assessments...');
        const assessments = await supabaseGet('assessments?select=id,title,status,questionnaire_id&limit=5');
        results.assessments = assessments.length;

        if (assessments.length === 0) {
          results.errors.push('Nenhum assessment encontrado');
          return results;
        }

        const assessment = assessments[0];
        results.assessmentId = assessment.id;
        results.assessmentTitle = assessment.title;
        results.steps.push(`Usando: ${assessment.title}`);

        // 2. Get questions
        results.steps.push('Buscando perguntas...');
        const questions = await supabaseGet(
          `questions?questionnaire_id=eq.${assessment.questionnaire_id}&select=id,text,type,category&order=order_index`
        );
        results.questions = questions.length;
        results.steps.push(`Encontradas: ${questions.length} perguntas`);

        if (questions.length === 0) {
          results.errors.push('Nenhuma pergunta encontrada');
          return results;
        }

        // 3. Generate responses for 15 participants
        results.steps.push('Gerando respostas para 15 participantes...');
        const NUM_PARTICIPANTS = 15;
        let totalResponses = 0;
        let successfulParticipants = 0;

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

          try {
            await supabasePost('responses', responses);
            totalResponses += responses.length;
            successfulParticipants++;
          } catch (err) {
            results.errors.push(`Participante ${p + 1}: ${err.message}`);
          }
        }

        results.totalResponses = totalResponses;
        results.successfulParticipants = successfulParticipants;
        results.steps.push(`Inseridas ${totalResponses} respostas de ${successfulParticipants} participantes`);

        // 4. Verify
        results.steps.push('Verificando...');
        const count = await supabaseGet(`responses?assessment_id=eq.${assessment.id}&select=anonymous_id`);
        const uniqueParticipants = [...new Set(count.map(r => r.anonymous_id))].length;
        results.verifiedResponses = count.length;
        results.verifiedParticipants = uniqueParticipants;

      } catch (err) {
        results.errors.push(err.message);
      }

      return results;
    }, { url: SUPABASE_URL, key: SUPABASE_ANON_KEY });

    // Print results
    console.log('📋 Resultados:\n');
    result.steps.forEach(step => console.log(`   ✓ ${step}`));

    if (result.errors.length > 0) {
      console.log('\n⚠️ Erros:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    if (result.verifiedResponses) {
      console.log('\n✅ Verificação final:');
      console.log(`   Respostas totais: ${result.verifiedResponses}`);
      console.log(`   Participantes únicos: ${result.verifiedParticipants}`);
      console.log(`\n   Assessment ID: ${result.assessmentId}`);
      console.log(`   URL: https://psicomapa.cloud/dashboard/analytics?assessment=${result.assessmentId}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

main();
