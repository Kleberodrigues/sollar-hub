import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function createClimaAssessment() {
  console.log('🚀 Criando Assessment de Pesquisa de Clima...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
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

    // 2. Navigate to new assessment
    console.log('2️⃣ Acessando formulário de nova avaliação...');
    await page.goto(`${BASE_URL}/dashboard/assessments/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('   URL:', page.url());

    await page.screenshot({ path: 'clima-1-form.png', fullPage: true });

    // 3. Fill form
    console.log('\n3️⃣ Preenchendo formulário...');

    // Title
    const titleInput = page.locator('#title');
    if (await titleInput.isVisible({ timeout: 3000 })) {
      await titleInput.fill('Pesquisa de Clima - Dezembro 2024');
      console.log('   ✅ Título preenchido');
    }

    await page.waitForTimeout(500);

    // Select questionnaire (native select element)
    console.log('   Selecionando questionário...');
    const questionnaireSelect = page.locator('#questionnaire');
    if (await questionnaireSelect.isVisible({ timeout: 3000 })) {
      // List available options
      const options = await questionnaireSelect.locator('option').allTextContents();
      console.log('   Opções de questionário:', options);

      // Find the Clima option value
      const climaOption = questionnaireSelect.locator('option:has-text("Clima")');
      if (await climaOption.count() > 0) {
        const climaValue = await climaOption.first().getAttribute('value');
        console.log('   Valor do questionário de Clima:', climaValue);
        await questionnaireSelect.selectOption({ value: climaValue });
        console.log('   ✅ Questionário "Pesquisa de Clima" selecionado');
      } else {
        // Select first non-empty option
        const firstOption = questionnaireSelect.locator('option[value]:not([value=""])').first();
        if (await firstOption.isVisible()) {
          const firstValue = await firstOption.getAttribute('value');
          await questionnaireSelect.selectOption({ value: firstValue });
          console.log('   ✅ Primeiro questionário selecionado:', await firstOption.textContent());
        }
      }
    } else {
      console.log('   ⚠️ Select de questionário não encontrado');
    }

    await page.waitForTimeout(500);

    // Set status to active
    const statusSelect = page.locator('#status');
    if (await statusSelect.isVisible({ timeout: 2000 })) {
      await statusSelect.selectOption({ value: 'active' });
      console.log('   ✅ Status definido como "Ativo"');
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'clima-2-filled.png', fullPage: true });

    // 4. Submit form
    console.log('\n4️⃣ Submetendo formulário...');
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible({ timeout: 2000 })) {
      await submitBtn.click();
      console.log('   📤 Formulário submetido...');
      await page.waitForTimeout(5000);
    }

    console.log('   URL após submit:', page.url());
    await page.screenshot({ path: 'clima-3-after-submit.png', fullPage: true });

    // Check if created successfully
    if (page.url().includes('/dashboard/assessments') && !page.url().includes('/new')) {
      console.log('   ✅ Assessment criado com sucesso!\n');
    } else {
      // Check for error message
      const errorMsg = await page.locator('.text-red-600').textContent().catch(() => null);
      if (errorMsg) {
        console.log('   ❌ Erro:', errorMsg);
      } else {
        console.log('   ⚠️ Ainda na página de criação\n');
      }
    }

    // 5. Go to Analytics
    console.log('5️⃣ Navegando para Analytics...');
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'clima-4-analytics.png', fullPage: true });

    // 6. Check for assessment selector
    console.log('\n6️⃣ Verificando assessments disponíveis...');
    const pageContent = await page.content();

    // Check if there's an assessment selector or empty state
    const hasAssessments = !pageContent.includes('Nenhuma avaliação') && !pageContent.includes('Nenhum assessment');
    console.log('   Há assessments:', hasAssessments);

    // List all buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('   Botões na página:', buttons.filter(b => b.trim()));

    // List all selects
    const selects = await page.locator('select').all();
    console.log('   Selects encontrados:', selects.length);

    for (let i = 0; i < selects.length; i++) {
      const options = await selects[i].locator('option').allTextContents();
      console.log(`   Select ${i + 1} opções:`, options);
    }

    // 7. Look for Clima Dashboard toggle
    console.log('\n7️⃣ Procurando toggle de Visão Clima...');
    const hasClimaText = pageContent.includes('Clima') || pageContent.includes('clima');
    console.log('   Contém "Clima" no conteúdo:', hasClimaText);

    // Wait for visualization
    console.log('\n⏳ Aguardando 10 segundos para visualização...');
    await page.waitForTimeout(10000);

    await page.screenshot({ path: 'clima-5-final.png', fullPage: true });

    console.log('\n✅ Teste concluído!');
    console.log('📸 Screenshots salvos: clima-1 a clima-5');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'clima-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

createClimaAssessment().catch(console.error);
