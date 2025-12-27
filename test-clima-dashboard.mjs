import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function testClimaDashboard() {
  console.log('🚀 Iniciando teste do Dashboard de Clima...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1️⃣ Acessando página de login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    console.log('   URL atual:', page.url());

    // Verificar se já está logado
    if (page.url().includes('/dashboard')) {
      console.log('   ✅ Já está logado!\n');
    } else {
      console.log('   Preenchendo credenciais...');

      // Esperar pelo formulário
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      await page.fill('input[type="email"]', 'admin@sollar.com.br');
      await page.fill('input[type="password"]', 'AdminPassword123!');

      console.log('   Clicando no botão de login...');
      await page.click('button[type="submit"]');

      // Aguardar um pouco mais
      await page.waitForTimeout(3000);
      console.log('   URL após login:', page.url());

      // Verificar mensagens de erro
      const errorMessage = page.locator('.text-red-500, .text-destructive, [role="alert"]');
      if (await errorMessage.isVisible({ timeout: 1000 })) {
        const text = await errorMessage.textContent();
        console.log('   ⚠️ Mensagem de erro:', text);
      }

      // Se ainda não redirecionou, tentar navegar diretamente
      if (!page.url().includes('/dashboard')) {
        console.log('   Tentando navegar diretamente para dashboard...');
        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForTimeout(3000);
        console.log('   URL após navegação:', page.url());
      }
    }

    // 2. Screenshot da página atual
    console.log('\n2️⃣ Capturando estado atual...');
    await page.screenshot({ path: 'test-clima-step1.png', fullPage: true });
    console.log('   ✅ Screenshot salvo: test-clima-step1.png');

    // 3. Navegar para Analytics
    console.log('\n3️⃣ Navegando para Analytics...');
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('   URL:', page.url());

    await page.screenshot({ path: 'test-clima-step2.png', fullPage: true });
    console.log('   ✅ Screenshot salvo: test-clima-step2.png');

    // 4. Verificar conteúdo da página
    console.log('\n4️⃣ Verificando conteúdo da página...');
    const pageContent = await page.content();

    // Verificar elementos
    const checks = [
      { name: 'Botão Visão Clima', pattern: /Visão Clima|Visão Geral/i },
      { name: 'Pesquisa de Clima', pattern: /Pesquisa de Clima/i },
      { name: 'Bem-estar', pattern: /Bem-estar/i },
      { name: 'Carga de Trabalho', pattern: /Carga de Trabalho/i },
      { name: 'Liderança', pattern: /Liderança/i },
      { name: 'Mapa de Calor', pattern: /Mapa de Calor|Heatmap/i },
      { name: 'Satisfação', pattern: /Satisfação.*Q9|Q9.*Satisfação/i },
    ];

    for (const check of checks) {
      if (check.pattern.test(pageContent)) {
        console.log(`   ✅ ${check.name} encontrado no HTML`);
      } else {
        console.log(`   ❌ ${check.name} não encontrado`);
      }
    }

    // 5. Aguardar para visualização
    console.log('\n⏳ Aguardando 10 segundos para visualização manual...');
    await page.waitForTimeout(10000);

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    await page.screenshot({ path: 'test-clima-error.png', fullPage: true });
    console.log('   Screenshot de erro salvo: test-clima-error.png');
  } finally {
    await browser.close();
  }
}

testClimaDashboard().catch(console.error);
