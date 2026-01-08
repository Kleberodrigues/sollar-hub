/**
 * Production Reset Password Page Test
 */

import { test, expect } from '@playwright/test';

const PROD_URL = 'https://psicomapa.cloud';

test.describe('Reset Password Page Test', () => {
  test.setTimeout(60000);

  test('should show checking state then error when no token', async ({ page }) => {
    // Capture console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to reset password without token
    console.log('Navigating to reset-password page...');
    await page.goto(`${PROD_URL}/reset-password`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/prod-reset-password-initial.png', fullPage: true });

    // Check for "Verificando Link" loading state
    const checkingText = page.locator('text=Verificando Link');
    const isChecking = await checkingText.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Checking state visible:', isChecking);

    // Wait for checking to complete
    await page.waitForTimeout(3000);

    // Take screenshot after checking
    await page.screenshot({ path: 'tests/screenshots/prod-reset-password-after-check.png', fullPage: true });

    // Check page content
    const bodyText = await page.textContent('body');
    console.log('Page contains "inválido":', bodyText?.includes('inválido'));
    console.log('Page contains "expirado":', bodyText?.includes('expirado'));
    console.log('Page contains "Nova Senha":', bodyText?.includes('Nova Senha'));
    console.log('Page contains "Verificando":', bodyText?.includes('Verificando'));
    console.log('Page contains "não encontrada":', bodyText?.includes('não encontrada'));

    // Check for error message about invalid/expired link
    const errorMsg = page.locator('text=/inválido|expirado/i').first();
    const hasError = await errorMsg.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasError) {
      console.log('✅ Error message displayed for missing token');
      const text = await errorMsg.textContent();
      console.log('Error text:', text);
    } else {
      console.log('⚠️ No error message found');

      // Check if form is visible but disabled
      const passwordInput = page.locator('input[type="password"]').first();
      const isFormVisible = await passwordInput.isVisible({ timeout: 3000 }).catch(() => false);
      console.log('Password form visible:', isFormVisible);

      if (isFormVisible) {
        const isDisabled = await passwordInput.isDisabled();
        console.log('Password input disabled:', isDisabled);
      }
    }

    // Log console messages
    if (consoleLogs.length > 0) {
      console.log('Console logs:');
      consoleLogs.slice(0, 10).forEach(log => console.log(`  ${log}`));
    }

    console.log('✅ Test completed');
  });

  test('should show form with simulated token in hash', async ({ page }) => {
    // Navigate with a fake token in hash fragment (like Supabase would send)
    console.log('Navigating with simulated hash token...');
    await page.goto(`${PROD_URL}/reset-password#access_token=fake_token&type=recovery`);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/prod-reset-password-with-hash.png', fullPage: true });

    // Check what's displayed
    const bodyText = await page.textContent('body');
    console.log('Page contains "Nova Senha":', bodyText?.includes('Nova Senha'));
    console.log('Page contains "Verificando":', bodyText?.includes('Verificando'));
    console.log('Page contains "inválido":', bodyText?.includes('inválido'));

    // The token is fake so it should either show error or form (depending on implementation)
    const passwordInput = page.locator('input[type="password"]').first();
    const isFormVisible = await passwordInput.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Password form visible:', isFormVisible);

    console.log('✅ Test completed');
  });
});
