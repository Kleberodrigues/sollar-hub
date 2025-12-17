import { chromium, devices } from 'playwright';

const BASE_URL = 'https://sollar-hub-yurq.vercel.app';
const iPhone = devices['iPhone 14'];

async function testMobileLayout() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...iPhone,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`📱 Testando em: ${iPhone.viewport.width}x${iPhone.viewport.height} (${iPhone.userAgent.includes('iPhone') ? 'iPhone 14' : 'Mobile'})`);

  console.log('\n🔐 Fazendo login...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', '***REMOVED_EMAIL***');
  await page.fill('input[type="password"]', '***REMOVED***');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});

  console.log(`📍 Logado em: ${page.url()}`);

  // Test pages
  const pages = [
    { path: '/admin', name: 'Dashboard Admin' },
    { path: '/admin/users', name: 'Usuários' },
    { path: '/admin/billing', name: 'Faturamento' },
    { path: '/admin/metrics', name: 'Métricas' },
    { path: '/admin/settings', name: 'Configurações' },
  ];

  for (const { path, name } of pages) {
    console.log(`\n📄 ${name} (${path})`);
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Check for common mobile issues
    const viewport = page.viewportSize();

    // Check horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Check if sidebar is visible or hidden (mobile menu)
    const sidebarVisible = await page.locator('nav, aside, [class*="sidebar"]').first().isVisible().catch(() => false);

    // Check for mobile menu button
    const hasMobileMenu = await page.locator('button[class*="menu"], [class*="hamburger"], button svg[class*="menu"]').count() > 0;

    console.log(`   Viewport: ${viewport.width}x${viewport.height}`);
    console.log(`   Scroll horizontal: ${hasHorizontalScroll ? '⚠️ SIM (problema)' : '✅ NÃO'}`);
    console.log(`   Menu mobile: ${hasMobileMenu ? '✅ Presente' : '⚠️ Ausente'}`);

    // Take screenshot
    await page.screenshot({
      path: `./test-mobile-screenshots/${path.replace(/\//g, '-').slice(1) || 'home'}.png`,
      fullPage: true
    });
  }

  await browser.close();
  console.log('\n✅ Testes mobile concluídos!');
}

// Create screenshots directory
import { mkdirSync } from 'fs';
try { mkdirSync('./test-mobile-screenshots', { recursive: true }); } catch {}

testMobileLayout().catch(console.error);
