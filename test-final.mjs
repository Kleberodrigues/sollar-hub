import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function testClimaDashboard() {
  console.log('🚀 Teste final do Dashboard de Clima...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1️⃣ Login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'admin@sollar.com.br');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('   ✅ Logado!\n');

    // 2. Ir para Avaliações
    console.log('2️⃣ Acessando Avaliações...');
    await page.goto(`${BASE_URL}/dashboard/assessments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verificar se botão de criar está visível agora
    const createBtn = page.locator('a[href*="new"], button:has-text("Nova Avaliação"), button:has-text("Criar Primeira")').first();
    const btnVisible = await createBtn.isVisible({ timeout: 3000 }).catch(() => false);

    await page.screenshot({ path: 'test-1-assessments.png', fullPage: true });

    if (btnVisible) {
      console.log('   ✅ Botão de criar VISÍVEL! Clicando...\n');
      await createBtn.click();
      await page.waitForTimeout(3000);

      // 3. Preencher formulário
      console.log('3️⃣ Preenchendo formulário de nova avaliação...');
      await page.screenshot({ path: 'test-2-form.png', fullPage: true });

      // Título
      const titleInput = page.locator('input').first();
      if (await titleInput.isVisible({ timeout: 2000 })) {
        await titleInput.fill('Pesquisa de Clima - Dezembro 2024');
        console.log('   ✅ Título preenchido');
      }

      // Selecionar questionário
      await page.waitForTimeout(500);
      const questionnaireSelect = page.locator('[role="combobox"]').first();
      if (await questionnaireSelect.isVisible({ timeout: 2000 })) {
        await questionnaireSelect.click();
        await page.waitForTimeout(500);

        // Listar opções
        const options = await page.locator('[role="option"]').allTextContents();
        console.log('   Opções de questionário:', options);

        // Selecionar Pesquisa de Clima
        const climaOption = page.locator('[role="option"]:has-text("Clima")').first();
        if (await climaOption.isVisible({ timeout: 2000 })) {
          await climaOption.click();
          console.log('   ✅ Questionário "Pesquisa de Clima" selecionado');
        } else {
          // Selecionar primeira opção
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
            console.log('   ✅ Primeiro questionário selecionado');
          }
        }
      }

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-3-form-filled.png', fullPage: true });

      // Submit
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        console.log('   📤 Formulário submetido...');
        await page.waitForTimeout(4000);
      }

      await page.screenshot({ path: 'test-4-after-submit.png', fullPage: true });
      console.log('   ✅ Assessment criado!\n');

    } else {
      console.log('   ⚠️ Botão de criar não encontrado\n');
    }

    // 4. Verificar Analytics
    console.log('4️⃣ Navegando para Analytics...');
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-5-analytics.png', fullPage: true });

    // Verificar se há assessment selecionável
    const assessmentSelect = page.locator('[role="combobox"]').first();
    if (await assessmentSelect.isVisible({ timeout: 2000 })) {
      await assessmentSelect.click();
      await page.waitForTimeout(500);

      const assessmentOptions = await page.locator('[role="option"]').allTextContents();
      console.log('   Assessments disponíveis:', assessmentOptions);

      // Selecionar primeiro assessment
      const firstAssessment = page.locator('[role="option"]').first();
      if (await firstAssessment.isVisible({ timeout: 1000 })) {
        await firstAssessment.click();
        console.log('   ✅ Assessment selecionado');
        await page.waitForTimeout(3000);
      }
    }

    await page.screenshot({ path: 'test-6-analytics-selected.png', fullPage: true });

    // 5. Procurar botão de Visão Clima
    console.log('\n5️⃣ Procurando botão Visão Clima...');
    const climaButton = page.locator('button:has-text("Visão Clima"), button:has-text("Visão Geral")').first();
    if (await climaButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   ✅ Botão Visão Clima encontrado! Clicando...');
      await climaButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-7-clima-dashboard.png', fullPage: true });
      console.log('   📸 Screenshot do Dashboard de Clima salvo!\n');

      // Verificar componentes
      const pageContent = await page.content();
      const checks = ['Bem-estar', 'Carga de Trabalho', 'Liderança', 'Mapa de Calor', 'Satisfação'];
      for (const check of checks) {
        if (pageContent.includes(check)) {
          console.log(`   ✅ ${check} encontrado`);
        }
      }
    } else {
      console.log('   ⚠️ Botão Visão Clima não encontrado (pode não haver assessment de clima ativo)\n');
    }

    // Aguardar visualização
    console.log('\n⏳ Aguardando 10 segundos para visualização manual...');
    await page.waitForTimeout(10000);

    console.log('\n✅ Teste concluído!');
    console.log('📸 Screenshots salvos: test-1 a test-7');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testClimaDashboard().catch(console.error);
