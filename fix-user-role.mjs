import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function fixUserAndCreateAssessment() {
  console.log('🔧 Verificando usuário e criando assessment...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
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
    console.log('   ✅ Logado!\n');

    // 2. Verificar menu de usuário para ver a role
    console.log('2️⃣ Verificando perfil do usuário...');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // O perfil no canto inferior esquerdo mostra "Responsável"
    const profileBadge = await page.locator('text=/Responsável|Admin|Manager|Membro/i').first().textContent().catch(() => 'N/A');
    console.log(`   Role atual: ${profileBadge}\n`);

    // 3. Ir para configurações para ver/mudar role
    console.log('3️⃣ Acessando configurações...');
    await page.goto(`${BASE_URL}/dashboard/users`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'users-page.png', fullPage: true });
    console.log('   📸 Screenshot de usuários salvo\n');

    // 4. Verificar se há opção de criar avaliação agora
    console.log('4️⃣ Tentando criar avaliação...');
    await page.goto(`${BASE_URL}/dashboard/assessments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Procurar botões de criar
    const createBtn = page.locator('a[href*="new"], button:has-text("Nova"), button:has-text("Criar")').first();
    const btnVisible = await createBtn.isVisible({ timeout: 2000 }).catch(() => false);

    if (btnVisible) {
      console.log('   ✅ Botão de criar encontrado!');
      await createBtn.click();
      await page.waitForTimeout(3000);

      // Preencher formulário
      console.log('\n5️⃣ Preenchendo formulário de avaliação...');

      // Título
      const titleInput = page.locator('input').first();
      await titleInput.fill('Pesquisa de Clima - Dezembro 2024');
      console.log('   ✅ Título preenchido');

      // Selecionar questionário
      await page.waitForTimeout(500);
      const questionnaireSelect = page.locator('[role="combobox"]').first();
      if (await questionnaireSelect.isVisible({ timeout: 2000 })) {
        await questionnaireSelect.click();
        await page.waitForTimeout(500);

        // Clicar em Pesquisa de Clima
        const climaOption = page.locator('[role="option"]:has-text("Clima")').first();
        if (await climaOption.isVisible({ timeout: 2000 })) {
          await climaOption.click();
          console.log('   ✅ Questionário "Pesquisa de Clima" selecionado');
        } else {
          // Selecionar primeira opção disponível
          const firstOption = page.locator('[role="option"]').first();
          await firstOption.click();
          console.log('   ✅ Primeiro questionário selecionado');
        }
      }

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'assessment-form-filled.png', fullPage: true });

      // Submeter
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        console.log('   📤 Formulário submetido...');
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: 'after-create.png', fullPage: true });

    } else {
      console.log('   ⚠️ Botão de criar NÃO encontrado');
      console.log('   Isso significa que o usuário não tem permissão (role != admin/manager)\n');

      // Mostrar página atual
      await page.screenshot({ path: 'no-create-button.png', fullPage: true });
    }

    // 6. Ir para Analytics
    console.log('\n6️⃣ Verificando Analytics...');
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'final-analytics.png', fullPage: true });

    // Aguardar para visualização
    console.log('\n⏳ Aguardando 10 segundos para visualização...');
    await page.waitForTimeout(10000);

    console.log('\n✅ Processo concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

fixUserAndCreateAssessment().catch(console.error);
