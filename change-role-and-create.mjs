import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function changeRoleAndCreate() {
  console.log('🔧 Alterando role do usuário e criando assessment...\n');

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
    await page.waitForTimeout(4000);
    console.log('   ✅ Logado!\n');

    // 2. Ir para página de usuários
    console.log('2️⃣ Acessando página de usuários...');
    await page.goto(`${BASE_URL}/dashboard/users`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 3. Mudar role do Test Admin para "admin"
    console.log('3️⃣ Alterando role do Test Admin...');

    // Encontrar a linha do Test Admin e o dropdown de role
    const testAdminRow = page.locator('tr:has-text("Test Admin"), div:has-text("Test Admin")').first();

    // Clicar no dropdown de role do Test Admin
    const roleDropdown = testAdminRow.locator('[role="combobox"], select, button:has-text("Responsável")').first();

    if (await roleDropdown.isVisible({ timeout: 3000 })) {
      await roleDropdown.click();
      await page.waitForTimeout(500);

      // Procurar opção "Admin" ou "Administrador"
      const adminOption = page.locator('[role="option"]:has-text("Admin"), [role="option"]:has-text("admin"), option:has-text("Admin")').first();

      if (await adminOption.isVisible({ timeout: 2000 })) {
        await adminOption.click();
        console.log('   ✅ Role alterada para Admin!');
        await page.waitForTimeout(2000);
      } else {
        // Listar opções disponíveis
        const options = await page.locator('[role="option"]').allTextContents();
        console.log('   Opções disponíveis:', options);

        // Tentar "Gerente" ou "Manager"
        const managerOption = page.locator('[role="option"]:has-text("Gerente"), [role="option"]:has-text("manager")').first();
        if (await managerOption.isVisible({ timeout: 1000 })) {
          await managerOption.click();
          console.log('   ✅ Role alterada para Gerente!');
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('   ⚠️ Dropdown de role não encontrado');
    }

    await page.screenshot({ path: 'after-role-change.png', fullPage: true });

    // 4. Fazer logout e login novamente para aplicar as permissões
    console.log('\n4️⃣ Recarregando sessão...');

    // Clicar em Sair
    const logoutBtn = page.locator('button:has-text("Sair"), a:has-text("Sair")').first();
    if (await logoutBtn.isVisible({ timeout: 2000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }

    // Login novamente
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'admin@sollar.com.br');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('   ✅ Re-logado!\n');

    // 5. Verificar se agora pode criar avaliação
    console.log('5️⃣ Verificando permissão de criar avaliação...');
    await page.goto(`${BASE_URL}/dashboard/assessments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'assessments-after-role.png', fullPage: true });

    const createBtn = page.locator('a[href*="new"], button:has-text("Nova Avaliação"), button:has-text("Criar")').first();
    const btnVisible = await createBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (btnVisible) {
      console.log('   ✅ Botão de criar ENCONTRADO! Criando avaliação...\n');

      await createBtn.click();
      await page.waitForTimeout(2000);

      // Preencher formulário
      console.log('6️⃣ Preenchendo formulário...');

      // Título
      const titleInput = page.locator('input').first();
      if (await titleInput.isVisible({ timeout: 2000 })) {
        await titleInput.fill('Pesquisa de Clima - Dezembro 2024');
        console.log('   ✅ Título preenchido');
      }

      // Questionário
      await page.waitForTimeout(500);
      const questionnaireSelect = page.locator('[role="combobox"]').first();
      if (await questionnaireSelect.isVisible({ timeout: 2000 })) {
        await questionnaireSelect.click();
        await page.waitForTimeout(500);

        const climaOption = page.locator('[role="option"]:has-text("Clima")').first();
        if (await climaOption.isVisible({ timeout: 2000 })) {
          await climaOption.click();
          console.log('   ✅ Questionário selecionado');
        } else {
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
          }
        }
      }

      await page.screenshot({ path: 'form-filled.png', fullPage: true });

      // Submit
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        console.log('   📤 Formulário submetido');
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: 'after-submit.png', fullPage: true });

    } else {
      console.log('   ⚠️ Botão ainda não visível. A role pode não ter sido alterada.\n');
    }

    // 7. Verificar Analytics
    console.log('\n7️⃣ Verificando Analytics...');
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'final-analytics.png', fullPage: true });

    console.log('\n⏳ Aguardando 15 segundos para visualização...');
    await page.waitForTimeout(15000);

    console.log('\n✅ Processo concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

changeRoleAndCreate().catch(console.error);
