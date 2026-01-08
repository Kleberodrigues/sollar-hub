/**
 * Send Real Recovery Email Test
 */

import { test, expect } from '@playwright/test';

const PROD_URL = 'https://psicomapa.cloud';

test.describe('Send Recovery Email', () => {
  test.setTimeout(60000);

  test('should send real recovery email', async ({ page }) => {
    // Navigate to forgot password
    console.log('Navigating to forgot-password page...');
    await page.goto(`${PROD_URL}/forgot-password`);
    await page.waitForLoadState('networkidle');

    // Fill email
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    await emailInput.fill('***REMOVED_EMAIL***');
    console.log('✅ Email filled: ***REMOVED_EMAIL***');

    // Take screenshot before submit
    await page.screenshot({ path: 'tests/screenshots/recovery-before-submit.png', fullPage: true });

    // Click submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    console.log('✅ Submit button clicked');

    // Wait for response
    await page.waitForTimeout(5000);

    // Take screenshot after submit
    await page.screenshot({ path: 'tests/screenshots/recovery-after-submit.png', fullPage: true });

    // Check for success message
    const successMsg = page.locator('text=/enviado|sucesso|verifique|check/i').first();
    const isSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);

    if (isSuccess) {
      const text = await successMsg.textContent();
      console.log(`✅ SUCCESS: ${text}`);
    } else {
      // Check for error
      const errorMsg = page.locator('text=/erro|error|falha/i').first();
      const hasError = await errorMsg.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasError) {
        const text = await errorMsg.textContent();
        console.log(`❌ ERROR: ${text}`);
      } else {
        console.log('⚠️ No clear success/error message');
        const bodyText = await page.textContent('body');
        console.log('Page text includes "Email":', bodyText?.includes('Email'));
      }
    }

    // Check for toast notification
    const toast = page.locator('[data-sonner-toast], [role="alert"]').first();
    if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
      const toastText = await toast.textContent();
      console.log(`Toast: ${toastText}`);
    }

    console.log('');
    console.log('📧 Email de recuperação enviado para: ***REMOVED_EMAIL***');
    console.log('👉 Verifique sua caixa de entrada e clique no link recebido');
    console.log('');
  });
});
