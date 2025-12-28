import { chromium } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';

async function testProduction() {
  console.log('🚀 Teste de produção com cache limpo...\n');
  console.log('   Timestamp:', new Date().toISOString());

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-cache', '--disable-application-cache']
  });

  // Context with cache disabled
  const context = await browser.newContext({
    bypassCSP: true,
    javaScriptEnabled: true,
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });

  // Clear all storage
  await context.clearCookies();

  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const loginUrl = `${BASE_URL}/login?_=${Date.now()}`;
    console.log('   URL:', loginUrl);

    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@sollar.com.br');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    console.log('   ✅ Logado! URL:', page.url());

    // 2. Go to assessments with cache busting
    console.log('\n2️⃣ Acessando Avaliações (cache bust)...');
    const assessmentsUrl = `${BASE_URL}/dashboard/assessments?_nocache=${Date.now()}&_v=2`;
    console.log('   URL:', assessmentsUrl);

    await page.goto(assessmentsUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Check page source for canManage
    const pageContent = await page.content();

    // Check for create button
    const hasNovaAvaliacao = pageContent.includes('Nova Avaliação');
    const hasCriarPrimeira = pageContent.includes('Criar Primeira');
    const hasHref = pageContent.includes('href="/dashboard/assessments/new"');

    console.log('   Contém "Nova Avaliação":', hasNovaAvaliacao);
    console.log('   Contém "Criar Primeira":', hasCriarPrimeira);
    console.log('   Contém href="/dashboard/assessments/new":', hasHref);

    // List all links
    const links = await page.locator('a').evaluateAll(els =>
      els.map(el => ({ href: el.getAttribute('href'), text: el.textContent?.trim() }))
        .filter(l => l.href && l.href.includes('assessment'))
    );
    console.log('   Links de assessment:', links);

    // List all buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('   Botões:', buttons.filter(b => b.trim()));

    // Check user role display
    const roleElements = await page.locator('[class*="role"], [class*="profile"], .text-text-secondary').allTextContents();
    console.log('   Role elements:', roleElements.filter(r => r.trim()));

    await page.screenshot({ path: 'test-production.png', fullPage: true });
    console.log('   📸 Screenshot salvo: test-production.png');

    // 3. Try clicking the create link directly
    console.log('\n3️⃣ Tentando acessar página de criação diretamente...');
    const newUrl = `${BASE_URL}/dashboard/assessments/new?_=${Date.now()}`;
    await page.goto(newUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('   URL atual:', page.url());

    const isOnNewPage = page.url().includes('/new');
    const pageTitle = await page.title();
    console.log('   Título:', pageTitle);

    if (isOnNewPage) {
      console.log('   ✅ Acesso à página de criação permitido!');

      // Check form fields
      const inputs = await page.locator('input, select, [role="combobox"]').count();
      console.log('   Campos de formulário:', inputs);

      await page.screenshot({ path: 'test-production-new.png', fullPage: true });
    } else {
      console.log('   ❌ Redirecionado - acesso negado');
    }

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'test-production-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testProduction().catch(console.error);
