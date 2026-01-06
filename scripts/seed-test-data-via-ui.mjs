/**
 * Seed Test Data via Production UI
 *
 * Uses Playwright to submit survey responses through the production website
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://psicomapa.cloud';

async function main() {
  console.log('🚀 Adicionando respostas de teste via UI...\n');

  const browser = await chromium.launch({ headless: false }); // Show browser
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. Login as admin
    console.log('1️⃣ Fazendo login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@sollar.com.br');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    console.log('   ✅ Login realizado');

    // 2. Go to assessments
    console.log('\n2️⃣ Navegando para avaliações...');
    await page.goto(`${BASE_URL}/dashboard/assessments`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 3. Get the public link for the first assessment
    console.log('\n3️⃣ Buscando link público do assessment...');

    // Click on first assessment to get details
    const assessmentLink = page.locator('a[href*="/dashboard/assessments/"][href*="-"]').first();
    if (await assessmentLink.isVisible({ timeout: 5000 })) {
      await assessmentLink.click();
      await page.waitForTimeout(2000);

      // Get assessment URL from page
      const currentUrl = page.url();
      const assessmentId = currentUrl.split('/assessments/')[1]?.split('/')[0];
      console.log(`   Assessment ID: ${assessmentId}`);

      // The public survey URL pattern
      const surveyUrl = `${BASE_URL}/survey/${assessmentId}`;
      console.log(`   Survey URL: ${surveyUrl}`);

      // 4. Submit responses as multiple participants
      console.log('\n4️⃣ Submetendo respostas de 15 participantes...');

      for (let p = 0; p < 15; p++) {
        console.log(`   Participante ${p + 1}/15...`);

        // Open survey in new context (fresh session = new participant)
        const surveyContext = await browser.newContext();
        const surveyPage = await surveyContext.newPage();

        try {
          await surveyPage.goto(surveyUrl, { waitUntil: 'networkidle', timeout: 30000 });
          await surveyPage.waitForTimeout(1000);

          // Check if survey is accessible
          const pageContent = await surveyPage.content();
          if (pageContent.includes('encerrado') || pageContent.includes('não encontrada')) {
            console.log('   ⚠️ Survey não acessível, pulando...');
            await surveyContext.close();
            continue;
          }

          // Fill out the survey
          // Look for likert scale buttons (1-5)
          let questionCount = 0;
          while (true) {
            // Try to find and click a scale option
            const scaleOptions = surveyPage.locator('button[data-value], input[type="radio"], .likert-option, [role="radio"]');
            const optionCount = await scaleOptions.count();

            if (optionCount > 0) {
              // Click a random option (prefer middle values)
              const optionIndex = Math.floor(Math.random() * Math.min(5, optionCount));
              await scaleOptions.nth(optionIndex).click().catch(() => {});
              questionCount++;
            }

            // Look for text inputs
            const textInputs = surveyPage.locator('textarea, input[type="text"]');
            const textCount = await textInputs.count();
            if (textCount > 0) {
              const responses = [
                'Precisa melhorar comunicação',
                'Ambiente de trabalho bom',
                'Falta reconhecimento',
                'Liderança presente',
                'Mais oportunidades'
              ];
              for (let i = 0; i < textCount; i++) {
                await textInputs.nth(i).fill(responses[i % responses.length]).catch(() => {});
              }
            }

            // Try to find next/submit button
            const nextBtn = surveyPage.locator('button:has-text("Próximo"), button:has-text("Próxima"), button:has-text("Continuar"), button[type="submit"]:has-text("Enviar")').first();
            if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
              await nextBtn.click();
              await surveyPage.waitForTimeout(500);
            } else {
              // Check if we're done
              const submitBtn = surveyPage.locator('button:has-text("Enviar"), button:has-text("Finalizar")').first();
              if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await submitBtn.click();
                await surveyPage.waitForTimeout(1000);
                break;
              } else {
                // No more questions
                break;
              }
            }

            if (questionCount > 50) break; // Safety limit
          }

          console.log(`   ✓ Participante ${p + 1} - ${questionCount} perguntas`);
        } catch (err) {
          console.log(`   ⚠️ Erro participante ${p + 1}: ${err.message}`);
        }

        await surveyContext.close();
      }

      // 5. Verify in analytics
      console.log('\n5️⃣ Verificando no analytics...');
      await page.goto(`${BASE_URL}/dashboard/analytics`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/after-responses.png', fullPage: true });
      console.log('   Screenshot salvo: tests/screenshots/after-responses.png');

    } else {
      console.log('   ⚠️ Nenhum assessment encontrado');
    }

    console.log('\n✅ Concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'tests/screenshots/error-seed.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

main();
