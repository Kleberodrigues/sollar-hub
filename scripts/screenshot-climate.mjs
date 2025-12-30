import { chromium } from 'playwright';

const EMAIL = 'kleberr.rodriguess@gmail.com';
const PASSWORD = '7020Alve!';
const BASE_URL = 'https://psicomapa.cloud';

async function main() {
  console.log('🚀 Iniciando Playwright...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('📝 Acessando página de login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    console.log('🔑 Preenchendo credenciais...');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    console.log('🖱️ Clicando em Entrar...');
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForURL(/dashboard/, { timeout: 30000, waitUntil: 'domcontentloaded' });
    console.log('✅ Login realizado com sucesso!');
    await page.waitForLoadState('networkidle');

    // Screenshot do dashboard inicial
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './screenshots/dashboard-home.png', fullPage: true });
    console.log('📸 Screenshot do dashboard salvo!');

    // 2. Navegar para Pesquisa de Clima
    console.log('🌡️ Navegando para Pesquisa de Clima...');
    await page.goto(`${BASE_URL}/dashboard/climate`, { waitUntil: 'networkidle' });

    // Aguardar carregamento dos dados
    await page.waitForTimeout(3000);

    // Screenshot da página de clima
    await page.screenshot({ path: './screenshots/climate-dashboard.png', fullPage: true });
    console.log('📸 Screenshot do dashboard de clima salvo!');

    // Screenshot só da área visível (viewport)
    await page.screenshot({ path: './screenshots/climate-dashboard-viewport.png' });
    console.log('📸 Screenshot viewport salvo!');

    // Scroll dentro do main content
    await page.evaluate(() => {
      const main = document.querySelector('main') || document.documentElement;
      main.scrollTop = 500;
      window.scrollTo(0, 500);
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: './screenshots/climate-dashboard-scroll1.png' });
    console.log('📸 Screenshot scroll 1 salvo!');

    // Scroll mais para baixo
    await page.evaluate(() => {
      const main = document.querySelector('main') || document.documentElement;
      main.scrollTop = 1000;
      window.scrollTo(0, 1000);
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: './screenshots/climate-dashboard-scroll2.png' });
    console.log('📸 Screenshot scroll 2 salvo!');

    // Scroll até o final
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: './screenshots/climate-dashboard-bottom.png' });
    console.log('📸 Screenshot bottom salvo!');

    console.log('🎉 Concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: './screenshots/error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

main();
