import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function checkAndCreate() {
  console.log('🔍 Verificando estado do sistema e criando dados necessários...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 250
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
    await page.waitForTimeout(4000);
    console.log('   ✅ Logado em:', page.url(), '\n');

    // 2. Verificar Questionários
    console.log('2️⃣ Verificando questionários...');
    await page.goto(`${BASE_URL}/dashboard/questionnaires`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'step1-questionnaires.png', fullPage: true });

    // Verificar se há questionários ou estado vazio
    const emptyQuestionnaires = await page.locator('text=/Nenhum questionário|sem questionários/i').isVisible({ timeout: 2000 }).catch(() => false);

    if (emptyQuestionnaires) {
      console.log('   ⚠️ Sem questionários! Procurando botão de criar...');

      // Procurar botão de criar
      const createQBtn = page.locator('button:has-text("Novo"), button:has-text("Criar"), a:has-text("Novo")').first();
      if (await createQBtn.isVisible({ timeout: 2000 })) {
        await createQBtn.click();
        await page.waitForTimeout(2000);
        console.log('   📝 Formulário de questionário aberto');
      }
    } else {
      console.log('   ✅ Questionários encontrados!\n');

      // Listar questionários visíveis
      const questionnaireCards = page.locator('[class*="card"], tr, [data-testid*="questionnaire"]');
      const count = await questionnaireCards.count();
      console.log(`   📋 ${count} itens encontrados na lista\n`);
    }

    // 3. Ir para Avaliações e criar uma nova
    console.log('3️⃣ Navegando para Avaliações...');
    await page.goto(`${BASE_URL}/dashboard/assessments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'step2-assessments.png', fullPage: true });

    // Procurar qualquer botão ou link para criar
    console.log('   Procurando opções para criar avaliação...');

    // Tentar encontrar elementos clicáveis
    const allButtons = await page.locator('button').allTextContents();
    const allLinks = await page.locator('a').allTextContents();

    console.log('   Botões visíveis:', allButtons.filter(b => b.trim()).slice(0, 8));
    console.log('   Links visíveis:', allLinks.filter(l => l.trim()).slice(0, 8));

    // Procurar botão específico
    const createBtnSelectors = [
      'button:has-text("Nova Avaliação")',
      'button:has-text("Criar Avaliação")',
      'button:has-text("+")',
      'a[href*="new"]',
      'a[href*="create"]',
      '[data-testid="create-assessment"]',
      'button:has-text("Nova")',
    ];

    for (const selector of createBtnSelectors) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log(`   ✅ Encontrado: ${selector}`);
        await btn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'step3-create-form.png', fullPage: true });
        break;
      }
    }

    // 4. Verificar se há um link ou botão na área principal
    console.log('\n4️⃣ Verificando área de conteúdo vazia...');

    // Às vezes o botão está dentro do empty state
    const emptyStateBtn = page.locator('.empty-state button, [class*="empty"] button, main button').first();
    if (await emptyStateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   ✅ Botão no empty state encontrado!');
      await emptyStateBtn.click();
      await page.waitForTimeout(2000);
    }

    // 5. Tentar URL direta para criar
    console.log('\n5️⃣ Tentando URL direta /assessments/new...');
    await page.goto(`${BASE_URL}/dashboard/assessments/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'step4-direct-new.png', fullPage: true });
    console.log('   URL final:', page.url());

    // Verificar se estamos no formulário
    const formVisible = await page.locator('form, input[name="title"], [role="form"]').isVisible({ timeout: 2000 }).catch(() => false);
    if (formVisible) {
      console.log('   ✅ Formulário de criação encontrado!\n');

      // Preencher
      console.log('6️⃣ Preenchendo formulário...');

      // Esperar inputs carregarem
      await page.waitForTimeout(1000);

      // Título
      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        console.log(`   Input: name=${name}, placeholder=${placeholder}`);
      }

      // Tentar preencher título
      await page.locator('input').first().fill('Pesquisa de Clima - Teste');

      // Selects
      const selects = await page.locator('select, [role="combobox"]').all();
      console.log(`   ${selects.length} selects/combobox encontrados`);

      if (selects.length > 0) {
        await selects[0].click();
        await page.waitForTimeout(500);

        // Listar opções
        const options = await page.locator('[role="option"]').allTextContents();
        console.log('   Opções:', options);
      }
    } else {
      console.log('   ⚠️ Formulário não encontrado\n');
    }

    // Aguardar para visualização manual
    console.log('\n⏳ Aguardando 15 segundos para você visualizar e interagir...');
    await page.waitForTimeout(15000);

    console.log('\n✅ Verificação concluída!');
    console.log('📸 Screenshots salvos: step1-questionnaires.png, step2-assessments.png, etc.');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

checkAndCreate().catch(console.error);
