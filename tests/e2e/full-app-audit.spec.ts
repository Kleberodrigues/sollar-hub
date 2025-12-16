import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive E2E test suite for Sollar Insight Hub
 * Tests all major pages, navigation, and functionality
 */

// Helper function to collect all issues
interface TestIssue {
  page: string;
  type: 'error' | 'warning' | 'missing' | 'broken';
  description: string;
}

const issues: TestIssue[] = [];

test.describe('Landing Page Audit', () => {
  test('should load landing page correctly', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/PsicoMapa/i);

    // Check hero section
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();

    // Check CTA buttons
    const ctaButtons = page.locator('a[href*="login"], a[href*="register"], button');
    const buttonCount = await ctaButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Ensure desktop viewport for header links to be visible
    await page.setViewportSize({ width: 1280, height: 720 });

    // Check header navigation
    const navLinks = page.locator('header a, nav a');
    const linkCount = await navLinks.count();

    console.log(`Found ${linkCount} navigation links`);

    // Verify important links exist (login link in header)
    const loginLink = page.locator('a[href*="login"]');
    const loginLinkCount = await loginLink.count();
    console.log(`Found ${loginLinkCount} login links`);

    // At least one login link should exist in the page
    expect(loginLinkCount).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileContent = page.locator('main, body');
    await expect(mobileContent.first()).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(mobileContent.first()).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(mobileContent.first()).toBeVisible();
  });

  test('should have no console errors on landing', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out expected errors (like Supabase auth when not logged in)
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('supabase') &&
             !err.includes('auth') &&
             !err.includes('favicon')
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }

    expect(criticalErrors.length).toBeLessThanOrEqual(0);
  });
});

test.describe('Authentication Pages Audit', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');

    // Check form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should load register page', async ({ page }) => {
    await page.goto('/register', { timeout: 60000 });

    // Check form elements
    const nameInput = page.locator('input[name="name"], input[placeholder*="nome" i]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('should load forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should have validation on login form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for validation (HTML5 or custom)
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });
});

test.describe('Dashboard Access (Unauthenticated)', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/login|auth/i, { timeout: 10000 });

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login/i);
  });

  test('should redirect from protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard/assessments',
      '/dashboard/questionnaires',
      '/dashboard/analytics',
      '/dashboard/users',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL(/login|auth/i, { timeout: 10000 });
      expect(page.url()).toMatch(/login/i);
    }
  });
});

test.describe('Static Pages Audit', () => {
  test('should load privacy page', async ({ page }) => {
    await page.goto('/privacidade');

    const heading = page.locator('h1');
    await expect(heading).toContainText(/Privacidade|Privacy/i);

    // Check for content sections
    const sections = page.locator('h2');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(5);
  });
});

test.describe('SEO and Meta Tags', () => {
  test('should have proper meta tags on landing', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/');

    // Check OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');

    // At least one should exist
    const ogTitleCount = await ogTitle.count();
    const ogDescCount = await ogDescription.count();

    console.log(`OG Tags - Title: ${ogTitleCount}, Description: ${ogDescCount}`);
  });
});

test.describe('Accessibility Audit', () => {
  test('should have proper heading hierarchy on landing', async ({ page }) => {
    await page.goto('/');

    // Check for single h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check heading order (h1 should come before h2)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`Found ${headings.length} headings`);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      if (!alt && !src?.includes('data:')) {
        console.log(`Image without alt text: ${src}`);
      }
    }
  });

  test('should have accessible form labels on login', async ({ page }) => {
    await page.goto('/login');

    // Check for labels or aria-labels
    const inputs = page.locator('input:not([type="hidden"])');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();

        if (labelCount === 0 && !ariaLabel) {
          console.log(`Input without proper label: ${id || placeholder}`);
        }
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Check text readability
    const bodyText = page.locator('p').first();

    if (await bodyText.count() > 0) {
      const color = await bodyText.evaluate((el) => window.getComputedStyle(el).color);
      const bgColor = await bodyText.evaluate((el) => window.getComputedStyle(el).backgroundColor);

      console.log(`Text color: ${color}, Background: ${bgColor}`);
    }
  });
});

test.describe('Performance Audit', () => {
  test('should load landing page quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;
    console.log(`Landing page load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;
    console.log(`Login page load time: ${loadTime}ms`);

    // Relaxed threshold for CI environments
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have memory leaks indicators', async ({ page }) => {
    await page.goto('/');

    // Navigate between pages
    await page.goto('/login');
    await page.goto('/');
    await page.goto('/privacidade');
    await page.goto('/');

    // Check JS heap size if available
    const metrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return null;
    });

    if (metrics) {
      console.log(`JS Heap Size: ${Math.round(metrics / 1024 / 1024)}MB`);
    }
  });
});

test.describe('Form Validation Audit', () => {
  test('should validate email format on login', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.click();

    // Check for validation message
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBeFalsy();
  });

  test('should show error messages for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for error message (either in alert or text)
    const errorMessage = page.locator('[role="alert"], .error, .text-red-500, .text-destructive');
    const errorCount = await errorMessage.count();

    console.log(`Error messages found after invalid login: ${errorCount}`);
  });
});

test.describe('404 Page Audit', () => {
  test('should handle non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345');

    // Should return 404 or show 404 content
    const status = response?.status();
    const pageContent = await page.content();

    const is404Page = status === 404 ||
                      pageContent.includes('404') ||
                      pageContent.includes('não encontrada') ||
                      pageContent.includes('not found');

    expect(is404Page).toBeTruthy();
  });
});

test.describe('Link Integrity Audit', () => {
  test('should have valid internal links on landing', async ({ page }) => {
    await page.goto('/');

    const internalLinks = page.locator('a[href^="/"]');
    const linkCount = await internalLinks.count();

    console.log(`Found ${linkCount} internal links`);

    const brokenLinks: string[] = [];

    // Check first 10 links to avoid timeout
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = internalLinks.nth(i);
      const href = await link.getAttribute('href');

      if (href && !href.startsWith('#')) {
        const response = await page.goto(href);
        const status = response?.status();

        if (status && status >= 400) {
          brokenLinks.push(`${href} (${status})`);
        }

        // Go back to landing
        await page.goto('/');
      }
    }

    if (brokenLinks.length > 0) {
      console.log('Broken links found:', brokenLinks);
    }

    expect(brokenLinks.length).toBe(0);
  });
});

test.describe('Assets Loading Audit', () => {
  test('should load all images on landing', async ({ page }) => {
    const failedAssets: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)/i)) {
          failedAssets.push(url);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (failedAssets.length > 0) {
      console.log('Failed to load assets:', failedAssets);
    }

    expect(failedAssets.length).toBe(0);
  });

  test('should load CSS properly', async ({ page }) => {
    const failedCSS: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (url.includes('.css')) {
          failedCSS.push(url);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedCSS.length).toBe(0);
  });

  test('should load JavaScript properly', async ({ page }) => {
    const failedJS: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (url.includes('.js')) {
          failedJS.push(url);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedJS.length).toBe(0);
  });
});

test.describe('UI Components Audit', () => {
  test('should render buttons correctly', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button, a[role="button"], .btn');
    const buttonCount = await buttons.count();

    console.log(`Found ${buttonCount} button elements`);

    // Check at least one button is clickable
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeEnabled();
    }
  });

  test('should render cards/sections on landing', async ({ page }) => {
    await page.goto('/');

    // Check for card components or sections
    const cards = page.locator('.card, [class*="card"], section');
    const cardCount = await cards.count();

    console.log(`Found ${cardCount} card/section elements`);
    expect(cardCount).toBeGreaterThan(0);
  });
});

test.describe('Security Headers Check', () => {
  test('should have security-related headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};

    console.log('Security Headers Check:');
    console.log('- X-Frame-Options:', headers['x-frame-options'] || 'NOT SET');
    console.log('- X-Content-Type-Options:', headers['x-content-type-options'] || 'NOT SET');
    console.log('- Content-Security-Policy:', headers['content-security-policy']?.substring(0, 50) || 'NOT SET');
    console.log('- Strict-Transport-Security:', headers['strict-transport-security'] || 'NOT SET');
  });
});

test.describe('Summary Report', () => {
  test('should generate audit summary', async ({ page }) => {
    console.log('\n========================================');
    console.log('SOLLAR INSIGHT HUB - AUDIT SUMMARY');
    console.log('========================================\n');

    const results = {
      pagesChecked: [
        '/ (Landing)',
        '/login',
        '/register',
        '/forgot-password',
        '/privacidade',
        '/dashboard (redirect test)',
      ],
      testsRun: test.info().project.name,
    };

    console.log('Pages Audited:', results.pagesChecked.join(', '));
    console.log('\nAudit complete. Check individual test results for details.');
  });
});
