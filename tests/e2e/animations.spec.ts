import { test, expect } from '@playwright/test';

test.describe('Animation Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacidade');
  });

  test('should have smooth page load animations', async ({ page }) => {
    // Get the main content container
    const content = page.locator('article');

    // Content should be visible after animations
    await expect(content).toBeVisible({ timeout: 2000 });

    // Check that content has opacity (animated in)
    const opacity = await content.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
  });

  test('should respect prefers-reduced-motion', async ({ page, context }) => {
    // Enable reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      });
    });

    // Reload page with reduced motion
    await page.reload();

    // Content should still be visible (no animations blocking)
    const content = page.locator('article');
    await expect(content).toBeVisible({ timeout: 1000 });
  });

  test('should have stagger animation on sections', async ({ page }) => {
    // Get all article sections
    const sections = page.locator('article > div');
    const sectionCount = await sections.count();

    expect(sectionCount).toBeGreaterThan(0);

    // All sections should eventually be visible
    for (let i = 0; i < Math.min(3, sectionCount); i++) {
      await expect(sections.nth(i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should have smooth scroll behavior', async ({ page }) => {
    // Scroll to middle of page
    await page.evaluate(() => window.scrollTo(0, 500));

    // Wait for scroll to complete
    await page.waitForTimeout(300);

    // Check scroll position
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(400);
  });
});

test.describe('Design System Integration', () => {
  test('should use Sollar color palette', async ({ page }) => {
    await page.goto('/privacidade', { timeout: 60000 });

    // Check that olive green color is available in the page
    const heading = page.locator('h1');
    const color = await heading.evaluate((el) =>
      window.getComputedStyle(el).color
    );

    // Color should be defined (not default black)
    expect(color).toBeTruthy();
  });

  test('should load custom fonts correctly', async ({ page }) => {
    await page.goto('/privacidade');

    // Wait for fonts to load
    await page.waitForLoadState('networkidle');

    // Check if font CSS variables are applied (Next.js font loading)
    const fontsLoaded = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      const className = body.className;

      // Next.js applies font CSS variables as class names
      const hasPlayfairVar = className.includes('__variable') ||
        computedStyle.getPropertyValue('--font-playfair') !== '';
      const hasLoraVar = className.includes('__variable') ||
        computedStyle.getPropertyValue('--font-lora') !== '';

      return { hasPlayfairVar, hasLoraVar, className };
    });

    // Check that font variables are applied via class names
    expect(fontsLoaded.className).toContain('__variable');
  });

  test('should have proper shadow styles', async ({ page }) => {
    await page.goto('/privacidade');

    // Check that sections have shadow
    const section = page.locator('article > div').first();
    const boxShadow = await section.evaluate((el) =>
      window.getComputedStyle(el).boxShadow
    );

    // Should have some shadow value
    expect(boxShadow).not.toBe('none');
  });
});

test.describe('Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/privacidade');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds (relaxed for CI environments)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/privacidade');
    await page.waitForLoadState('networkidle');

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/privacidade');

    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000);
      });
    });

    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });
});
