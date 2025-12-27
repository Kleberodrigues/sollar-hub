import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function createAssessmentViaBrowser() {
  console.log('🚀 Criando assessment via navegador...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'admin@sollar.com.br');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');

    // Aguardar mais tempo
    await page.waitForTimeout(5000);
    console.log('   URL atual:', page.url());

    if (page.url().includes('/dashboard')) {
      console.log('   ✅ Login realizado!\n');
    }

    // 2. Ir para página de criar avaliação
    console.log('2️⃣ Navegando para criar avaliação...');
    await page.goto(`${BASE_URL}/dashboard/assessments/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Se redirecionar para lista, clicar no botão
    if (page.url().includes('/assessments') && !page.url().includes('/new')) {
      console.log('   Procurando botão de criar...');
      const createBtn = page.locator('button:has-text("Nova"), button:has-text("Criar"), a:has-text("Nova")').first();
      if (await createBtn.isVisible({ timeout: 3000 })) {
        await createBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: 'assessment-form.png', fullPage: true });
    console.log('   📸 Screenshot salvo: assessment-form.png\n');

    // 3. Preencher formulário
    console.log('3️⃣ Preenchendo formulário...');

    // Título
    const titleInput = page.locator('input[name="title"], input#title, input[placeholder*="ítulo"]').first();
    if (await titleInput.isVisible({ timeout: 3000 })) {
      await titleInput.fill('Pesquisa de Clima - Dezembro 2024');
      console.log('   ✅ Título: Pesquisa de Clima - Dezembro 2024');
    } else {
      console.log('   ⚠️ Campo de título não encontrado');
    }

    // Questionário - clicar no select/combobox
    const selectTrigger = page.locator('[role="combobox"], select, button:has-text("Selecione")').first();
    if (await selectTrigger.isVisible({ timeout: 3000 })) {
      await selectTrigger.click();
      await page.waitForTimeout(1000);

      // Procurar Pesquisa de Clima ou Pulso
      const options = page.locator('[role="option"], option');
      const optionTexts = await options.allTextContents();
      console.log('   Opções disponíveis:', optionTexts);

      const climaOption = page.locator('[role="option"]:has-text("Clima"), [role="option"]:has-text("Pulso"), option:has-text("Clima")').first();
      if (await climaOption.isVisible({ timeout: 2000 })) {
        await climaOption.click();
        console.log('   ✅ Questionário selecionado');
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'assessment-filled.png', fullPage: true });

    // 4. Submeter formulário
    console.log('\n4️⃣ Submetendo formulário...');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Criar"), button:has-text("Salvar")').first();
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      console.log('   ✅ Formulário submetido');
    }

    await page.screenshot({ path: 'assessment-result.png', fullPage: true });
    console.log('   📸 Screenshot do resultado salvo\n');

    // 5. Verificar se foi criado e ir para Analytics
    console.log('5️⃣ Navegando para Analytics para verificar...');
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'analytics-after.png', fullPage: true });
    console.log('   📸 Screenshot de Analytics salvo\n');

    // Aguardar para visualização
    console.log('⏳ Aguardando 10 segundos para visualização...');
    await page.waitForTimeout(10000);

    console.log('\n✅ Processo concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'assessment-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

createAssessmentViaBrowser().catch(console.error);
