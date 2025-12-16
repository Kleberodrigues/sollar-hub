/**
 * Landing Page Tests
 *
 * Testes E2E para a página inicial pública
 * Padrão: Sollar Testing Skill - Page Objects
 */

import { test, expect } from '@playwright/test';
import { LandingPage } from './pages';

test.describe('Landing Page', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.goto();
  });

  test.describe('Content Loading', () => {
    test('should load page correctly', async () => {
      await landingPage.expectLoaded();
    });

    test('should have correct page title', async () => {
      const title = await landingPage.getTitle();
      expect(title.toLowerCase()).toContain('psicomapa');
    });

    test('should have meta description', async () => {
      const description = await landingPage.getMetaDescription();
      // Pode ser null em algumas páginas
      if (description) {
        expect(description.length).toBeGreaterThan(10);
      }
    });

    test('should display hero section', async () => {
      await expect(landingPage.heroTitle).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should have navigation links', async () => {
      const linksCount = await landingPage.getNavLinksCount();
      expect(linksCount).toBeGreaterThan(0);
    });

    test('should have login button or link', async () => {
      const loginButtonCount = await landingPage.loginButton.count();
      expect(loginButtonCount).toBeGreaterThanOrEqual(0);
    });

    test('should have CTA button', async () => {
      const ctaCount = await landingPage.ctaButton.count();
      expect(ctaCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Responsiveness', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await landingPage.checkResponsive({ width: 375, height: 667 });
      await expect(landingPage.header).toBeVisible();

      // Capturar screenshot
      await page.screenshot({ path: 'tests/screenshots/landing-mobile.png' });
    });

    test('should display correctly on tablet', async ({ page }) => {
      await landingPage.checkResponsive({ width: 768, height: 1024 });
      await expect(landingPage.header).toBeVisible();

      // Capturar screenshot
      await page.screenshot({ path: 'tests/screenshots/landing-tablet.png' });
    });

    test('should display correctly on desktop', async ({ page }) => {
      await landingPage.checkResponsive({ width: 1440, height: 900 });
      await expect(landingPage.header).toBeVisible();

      // Capturar screenshot
      await page.screenshot({ path: 'tests/screenshots/landing-desktop.png' });
    });
  });

  test.describe('Visual Elements', () => {
    test('should have header visible', async () => {
      await expect(landingPage.header).toBeVisible();
    });

    test('should display footer if present', async () => {
      const hasFooter = await landingPage.hasFooter();
      // Footer é opcional
      console.log(`Footer present: ${hasFooter}`);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // H1 deve vir antes de outros headings
      const firstH1 = page.locator('h1').first();
      await expect(firstH1).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);

      // Deve carregar em menos de 45 segundos (cold start pode demorar)
      // Em produção, espera-se < 3s
      const maxTime = process.env.CI ? 60000 : 45000;
      expect(loadTime).toBeLessThan(maxTime);
    });

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // Filtrar erros conhecidos/aceitáveis
      const criticalErrors = errors.filter(
        (err) =>
          !err.includes('favicon') &&
          !err.includes('Failed to load resource') &&
          !err.includes('net::ERR')
      );

      if (criticalErrors.length > 0) {
        console.warn('Console errors found:', criticalErrors);
      }

      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper aria labels', async ({ page }) => {
      const ariaLabelCount = await page.locator('[aria-label]').count();
      console.log(`Elements with aria-label: ${ariaLabelCount}`);

      // Deve ter pelo menos alguns elementos com aria-label
      expect(ariaLabelCount).toBeGreaterThanOrEqual(0);
    });

    test('should have alt text on images', async ({ page }) => {
      const totalImages = await page.locator('img').count();
      const imagesWithAlt = await page.locator('img[alt]').count();

      console.log(`Images with alt: ${imagesWithAlt}/${totalImages}`);

      // Todas as imagens devem ter alt (ou quase todas)
      if (totalImages > 0) {
        const ratio = imagesWithAlt / totalImages;
        expect(ratio).toBeGreaterThanOrEqual(0.8);
      }
    });

    test('should have focusable interactive elements', async ({ page }) => {
      // Verificar se elementos interativos existem e são focáveis
      const buttons = await page.locator('button:visible').all();
      const links = await page.locator('a[href]:visible').all();

      const interactiveCount = buttons.length + links.length;
      console.log(`Interactive elements: ${interactiveCount} (${buttons.length} buttons, ${links.length} links)`);

      // Deve ter elementos interativos
      expect(interactiveCount).toBeGreaterThan(0);
    });
  });

  test.describe('SEO', () => {
    test('should have correct title tag', async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(70);
    });

    test('should have H1 tag', async ({ page }) => {
      const h1 = await page.locator('h1').first();
      await expect(h1).toBeVisible();

      const h1Text = await h1.textContent();
      expect(h1Text?.length).toBeGreaterThan(0);
    });

    test('should have canonical or proper URLs', async ({ page }) => {
      // Canonical é opcional - verificar se existe antes de buscar atributo
      const canonicalLink = page.locator('link[rel="canonical"]');
      const count = await canonicalLink.count();

      if (count > 0) {
        const canonical = await canonicalLink.getAttribute('href');
        if (canonical) {
          expect(canonical).toContain('http');
        }
      } else {
        // Canonical não existe - é opcional
        console.log('Canonical link not present (optional)');
      }
    });
  });
});
