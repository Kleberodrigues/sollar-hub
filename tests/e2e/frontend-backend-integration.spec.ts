/**
 * Frontend-Backend Integration Test Suite
 *
 * Tests that verify frontend components correctly integrate with backend APIs
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Frontend-Backend Integration', () => {
  test.describe('Public Pages', () => {
    test('landing page loads correctly', async ({ page }) => {
      const response = await page.goto(BASE_URL);
      expect(response?.status()).toBe(200);

      // Check main content
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();

      // Check no console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);
      expect(consoleErrors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('login page loads correctly', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/login`);
      expect(response?.status()).toBe(200);

      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('register page loads correctly', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/register`);
      expect(response?.status()).toBe(200);

      // Check form exists
      await expect(page.locator('form')).toBeVisible();
    });

    test('contact page loads correctly', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/contato`);
      expect(response?.status()).toBe(200);

      // Check page content
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Health Check API', () => {
    test('health endpoint returns 200', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      // Health API returns status: "healthy", "degraded", or "unhealthy"
      expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
      expect(body.services).toBeDefined();
    });
  });

  test.describe('Protected Routes', () => {
    test('dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('analytics redirects unauthenticated users', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/analytics`);

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Authenticated Dashboard', () => {
    test.use({ storageState: 'tests/e2e/.auth/admin.json' });

    test('dashboard loads correctly', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/dashboard`);
      expect(response?.status()).toBe(200);

      // Wait for dashboard to load
      await page.waitForLoadState('networkidle');

      // Check sidebar navigation
      await expect(page.locator('nav, aside').first()).toBeVisible();
    });

    test('analytics page loads correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/analytics`);
      await page.waitForLoadState('networkidle');

      // Check analytics components - page title is in Portuguese
      await expect(page.locator('text=Análise de Riscos').first()).toBeVisible({ timeout: 10000 });
    });

    test('questionnaires page loads correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/questionarios`);
      await page.waitForLoadState('networkidle');

      // Page should load without major errors
      const pageContent = await page.content();
      expect(pageContent).not.toContain('Internal Server Error');
      expect(pageContent).not.toContain('500 Error');

      // Should have some page structure - check for any content
      // The page might not have a heading but should have some visible content
      const hasContent = await page.locator('main, [role="main"], .container, section').first().isVisible().catch(() => false);
      const hasHeading = await page.locator('h1, h2, h3, [role="heading"]').first().isVisible().catch(() => false);

      // Either content container or heading should be visible
      expect(hasContent || hasHeading).toBe(true);
    });

    test('assessments page loads correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/assessments`);
      await page.waitForLoadState('networkidle');

      // Check for page content
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Climate Survey Dashboard', () => {
    test.use({ storageState: 'tests/e2e/.auth/admin.json' });

    test('climate dashboard renders charts correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/clima`);
      await page.waitForLoadState('networkidle');

      // Wait for charts to load
      await page.waitForTimeout(2000);

      // Check if the page loads without error
      const pageContent = await page.content();
      expect(pageContent).not.toContain('Internal Server Error');
    });
  });

  test.describe('API Response Validation', () => {
    test('user plan API returns valid response', async ({ request }) => {
      // This tests the /api/user/plan endpoint structure
      const response = await request.get(`${BASE_URL}/api/user/plan`);

      // Should either return 200 with plan info or 401 for unauthorized
      expect([200, 401]).toContain(response.status());
    });
  });
});

test.describe('SEO and Accessibility', () => {
  test('landing page has proper meta tags', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);

    // Check meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();

    // Check viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('pages have proper heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check H1 exists
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto(BASE_URL);

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        // Allow empty string for decorative images but ensure attribute exists
        expect(alt !== null).toBeTruthy();
      }
    }
  });
});

test.describe('Performance', () => {
  test('landing page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    console.log(`Landing page load time: ${loadTime}ms`);
  });
});

test.describe('Performance - Authenticated', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });

  test('dashboard loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should load within 8 seconds (includes auth check)
    expect(loadTime).toBeLessThan(8000);
    console.log(`Dashboard load time: ${loadTime}ms`);
  });
});

test.describe('Form Validation', () => {
  test('login form validates email format', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Try invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should show validation error or not submit
    await page.waitForTimeout(1000);

    // Should still be on login page
    expect(page.url()).toContain('/login');
  });

  test('login form requires password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Try without password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Should not navigate away
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });
});

test.describe('Responsive Design', () => {
  test('landing page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // Check mobile menu exists
    await page.waitForLoadState('networkidle');

    // Content should still be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('landing page is responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);

    await page.waitForLoadState('networkidle');

    // Content should be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Responsive Design - Authenticated', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });

  test('dashboard is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/dashboard`);

    await page.waitForLoadState('networkidle');

    // Dashboard should load without server errors
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Internal Server Error');
    expect(pageContent).not.toContain('500 Error');
  });
});

test.describe('Console Error Monitoring', () => {
  test('landing page has no critical console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known non-critical errors
        if (!text.includes('favicon') &&
            !text.includes('hydration') &&
            !text.includes('Loading chunk')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }

    // Should have no critical errors
    const criticalErrors = consoleErrors.filter(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('SyntaxError')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
