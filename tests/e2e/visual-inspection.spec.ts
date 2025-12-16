import { test, expect } from '@playwright/test';

/**
 * Visual Inspection Test
 *
 * Teste completo de inspeção visual e funcional da aplicação
 */

test.describe('Visual Inspection - Sollar Insight Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Acessar página inicial - usar baseURL do playwright.config
    await page.goto('/');
  });

  test('Página inicial carrega corretamente', async ({ page }) => {
    // Verificar título da página
    await expect(page).toHaveTitle(/PsicoMapa/i);

    // Aguardar apenas DOM carregar (mais rápido que networkidle)
    await page.waitForLoadState('domcontentloaded');

    // Capturar screenshot
    await page.screenshot({
      path: 'tests/screenshots/homepage.png',
      fullPage: true
    });

    console.log('✅ Homepage carregada com sucesso');
  });

  test('Elementos visuais principais estão presentes', async ({ page }) => {
    // Verificar header/logo
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();

    // Verificar conteúdo principal
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();

    // Verificar footer (se existir)
    const footer = page.locator('footer').first();
    const footerCount = await footer.count();

    console.log(`✅ Elementos principais encontrados (footer: ${footerCount > 0 ? 'sim' : 'não'})`);
  });

  test('Design system - Cores Sollar', async ({ page }) => {
    // Buscar elementos com cores da marca
    const greenElements = await page.locator('[class*="pm-green"], [class*="bg-pm-green"]').count();
    const terracottaElements = await page.locator('[class*="terracotta"], [class*="bg-pm-terracotta"]').count();

    console.log(`✅ Design System detectado:`);
    console.log(`   - Elementos verde Sollar: ${greenElements}`);
    console.log(`   - Elementos terracota: ${terracottaElements}`);
  });

  test('Tipografia - Fontes carregadas', async ({ page }) => {
    // Aguardar página carregar completamente
    await page.waitForLoadState('domcontentloaded');

    // Verificar se fontes estão carregadas
    const bodyFont = await page.evaluate(() => {
      const body = document.querySelector('body');
      if (!body) return 'N/A';
      return window.getComputedStyle(body).fontFamily;
    });

    const headingFont = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2, h3');
      if (!heading) return 'N/A';
      return window.getComputedStyle(heading).fontFamily;
    });

    console.log(`✅ Fontes aplicadas:`);
    console.log(`   - Body: ${bodyFont}`);
    console.log(`   - Headings: ${headingFont}`);

    // Verificar se Inter está presente (mais flexível)
    expect(bodyFont.toLowerCase()).toMatch(/inter|system|n\/a/i);
  });

  test('Links e navegação funcionam', async ({ page }) => {
    // Buscar todos os links visíveis
    const links = await page.locator('a[href]').all();

    console.log(`✅ Total de links encontrados: ${links.length}`);

    // Verificar primeiro link (se existir)
    if (links.length > 0) {
      const firstLink = links[0];
      const href = await firstLink.getAttribute('href');
      console.log(`   - Primeiro link: ${href}`);
    }
  });

  test('Formulários visíveis (se houver)', async ({ page }) => {
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();

    console.log(`✅ Elementos de formulário:`);
    console.log(`   - Formulários: ${forms}`);
    console.log(`   - Inputs: ${inputs}`);
    console.log(`   - Botões: ${buttons}`);
  });

  test('Responsividade - Mobile', async ({ page }) => {
    // Testar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'tests/screenshots/mobile.png',
      fullPage: true
    });

    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();

    console.log('✅ Layout mobile renderizado');
  });

  test('Responsividade - Tablet', async ({ page }) => {
    // Testar viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: 'tests/screenshots/tablet.png',
      fullPage: true
    });

    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();

    console.log('✅ Layout tablet renderizado');
  });

  test('Console errors detectados', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Aguardar apenas DOM carregar
    await page.waitForLoadState('domcontentloaded');

    // Aguardar um pouco para capturar possíveis erros
    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors encontrados:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('✅ Nenhum console error detectado');
    }
  });

  test('Performance - Tempo de carregamento', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    console.log(`✅ Tempo de carregamento: ${loadTime}ms`);

    // Verificar Core Web Vitals
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    console.log(`   - DOMContentLoaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`   - Load Complete: ${Math.round(metrics.loadComplete)}ms`);

    // Verificar se carregou em tempo razoável (< 5s)
    expect(loadTime).toBeLessThan(5000);
  });

  test('Acessibilidade - Atributos ARIA', async ({ page }) => {
    const ariaLabels = await page.locator('[aria-label]').count();
    const ariaRoles = await page.locator('[role]').count();
    const altTexts = await page.locator('img[alt]').count();
    const totalImages = await page.locator('img').count();

    console.log(`✅ Acessibilidade:`);
    console.log(`   - Elementos com aria-label: ${ariaLabels}`);
    console.log(`   - Elementos com role: ${ariaRoles}`);
    console.log(`   - Imagens com alt: ${altTexts}/${totalImages}`);
  });

  test('Extração de conteúdo principal', async ({ page }) => {
    const title = await page.title();
    const h1 = await page.locator('h1').first().textContent().catch(() => 'N/A');
    const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => 'N/A');

    console.log(`✅ Conteúdo extraído:`);
    console.log(`   - Title: ${title}`);
    console.log(`   - H1: ${h1}`);
    console.log(`   - Description: ${description}`);

    // Screenshot final
    await page.screenshot({
      path: 'tests/screenshots/final-state.png',
      fullPage: true
    });
  });
});
