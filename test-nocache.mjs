import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function testWithNoCache() {
  console.log('🚀 Teste com cache desabilitado...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  // Criar contexto com cache desabilitado
  const context = await browser.newContext({
    bypassCSP: true,
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    }
  });

  const page = await context.newPage();

  // Interceptar requests para adicionar timestamp
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    // Não modificar URLs estáticas
    if (url.includes('_next/static') || url.includes('.js') || url.includes('.css')) {
      return route.continue();
    }
    return route.continue();
  });

  try {
    // 1. Login com timestamp para evitar cache
    console.log('1️⃣ Login...');
    await page.goto(`${BASE_URL}/login?t=${Date.now()}`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'admin@sollar.com.br');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    console.log('   ✅ Logado! URL:', page.url(), '\n');

    // 2. Ir para Avaliações com timestamp
    console.log('2️⃣ Acessando Avaliações...');
    await page.goto(`${BASE_URL}/dashboard/assessments?nocache=${Date.now()}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verificar HTML da página
    const pageHTML = await page.content();
    const hasCreateButton = pageHTML.includes('Nova Avaliação') || pageHTML.includes('Criar Primeira');
    console.log('   Contém botão de criar:', hasCreateButton);

    await page.screenshot({ path: 'nocache-assessments.png', fullPage: true });

    // Tentar encontrar qualquer botão ou link
    const allButtons = await page.locator('button').allTextContents();
    const allLinks = await page.locator('a').allTextContents();
    console.log('   Todos os botões:', allButtons);
    console.log('   Todos os links:', allLinks.filter(l => l.trim()).slice(0, 10));

    // 3. Verificar role do usuário
    console.log('\n3️⃣ Verificando perfil do usuário...');
    const profileText = await page.locator('.text-pm-olive, [class*="profile"], [class*="role"]').allTextContents();
    console.log('   Textos de perfil encontrados:', profileText);

    // Aguardar para visualização
    console.log('\n⏳ Aguardando 20 segundos para análise manual...');
    await page.waitForTimeout(20000);

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'nocache-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testWithNoCache().catch(console.error);
