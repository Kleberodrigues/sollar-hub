/**
 * Production Forgot Password Test
 */

import { test, expect } from '@playwright/test';

const PROD_URL = 'https://psicomapa.cloud';

test.describe('Forgot Password Test', () => {
  test.setTimeout(60000);

  test('should test forgot password flow', async ({ page }) => {
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to forgot password
    await page.goto(`${PROD_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Forgot password page loaded');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/prod-forgot-password.png', fullPage: true });

    // Check page elements
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 })) {
      console.log('✅ Email input found');

      // Fill email
      await emailInput.fill('***REMOVED_EMAIL***');
      console.log('✅ Email filled');

      // Find submit button
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible({ timeout: 5000 })) {
        console.log('✅ Submit button found');
        console.log('Button text:', await submitBtn.textContent());

        // Click submit
        await submitBtn.click();
        console.log('✅ Submit button clicked');

        // Wait for response
        await page.waitForTimeout(5000);

        // Take screenshot after submit
        await page.screenshot({ path: 'tests/screenshots/prod-forgot-password-after.png', fullPage: true });

        // Check for success or error message
        const successMsg = page.locator('text=/enviado|sucesso|verifique|email|check/i').first();
        const errorMsg = page.locator('text=/erro|error|falha|failed|invalid/i').first();

        if (await successMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
          const text = await successMsg.textContent();
          console.log(`✅ Success message: ${text}`);
        } else if (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
          const text = await errorMsg.textContent();
          console.log(`❌ Error message: ${text}`);
        } else {
          console.log('⚠️ No success/error message found');
          // Check page content
          const bodyText = await page.textContent('body');
          console.log('Page contains "sucesso":', bodyText?.toLowerCase().includes('sucesso'));
          console.log('Page contains "erro":', bodyText?.toLowerCase().includes('erro'));
          console.log('Page contains "email":', bodyText?.toLowerCase().includes('email'));
        }

        // Check for toast notifications
        const toast = page.locator('[data-sonner-toast], [role="alert"], .toast');
        if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
          const toastText = await toast.textContent();
          console.log(`Toast message: ${toastText}`);
        }
      } else {
        console.log('❌ Submit button not found');
      }
    } else {
      console.log('❌ Email input not found');
    }

    // Log console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('✅ Test completed');
  });
});
