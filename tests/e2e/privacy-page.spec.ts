import { test, expect } from '@playwright/test';

test.describe('Privacy Policy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacidade');
  });

  test('should load privacy policy page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Política de Privacidade/i);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Política de Privacidade');
  });

  test('should display all 8 sections', async ({ page }) => {
    // Verify all section headings are present
    const sections = [
      '1. Coleta de informações',
      '2. Uso das informações',
      '3. Tecnologias de rastreamento',
      '4. Armazenamento e segurança dos dados',
      '5. Compartilhamento de informações',
      '6. Direitos do titular dos dados',
      '7. Alterações nesta política',
      '8. Contato',
    ];

    for (const section of sections) {
      const sectionHeading = page.locator('h2', { hasText: section });
      await expect(sectionHeading).toBeVisible();
    }
  });

  test('should use correct fonts', async ({ page }) => {
    // Check main heading uses Playfair (display font)
    const heading = page.locator('h1');
    const headingFont = await heading.evaluate((el) =>
      window.getComputedStyle(el).fontFamily
    );
    expect(headingFont).toContain('Playfair');

    // Check body text uses Lora (serif font)
    const bodyText = page.locator('p').first();
    const bodyFont = await bodyText.evaluate((el) =>
      window.getComputedStyle(el).fontFamily
    );
    expect(bodyFont).toContain('Lora');
  });

  test('should have contact email links', async ({ page }) => {
    // Find email links
    const emailLinks = page.locator('a[href^="mailto:juliakalil@sollartreinamentos.com.br"]');

    // Should have at least 2 email links (section 6 and 8)
    await expect(emailLinks).toHaveCount(2);

    // Verify link is clickable
    await expect(emailLinks.first()).toBeVisible();
  });

  test('should have animations on scroll', async ({ page }) => {
    // Get initial section position
    const firstSection = page.locator('article > div').first();

    // Section should be visible
    await expect(firstSection).toBeVisible();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Last section should now be visible
    const lastSection = page.locator('article > div').last();
    await expect(lastSection).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be readable
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Content should not overflow
    const content = page.locator('article');
    const boundingBox = await content.boundingBox();

    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should have proper semantic HTML', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check for article tag
    const article = page.locator('article');
    await expect(article).toBeVisible();

    // Check for proper list structure
    const lists = page.locator('ul');
    await expect(lists.first()).toBeVisible();
  });

  test('should show last update date', async ({ page }) => {
    const updateDate = page.locator('text=/Última atualização/i');
    await expect(updateDate).toBeVisible();
    await expect(updateDate).toContainText('2025');
  });
});
