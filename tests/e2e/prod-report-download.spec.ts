/**
 * Production Report Download Test
 *
 * Tests report download functionality on production environment
 */

import { test, expect } from '@playwright/test';

const PROD_URL = 'https://psicomapa.cloud';

test.describe('Production Report Download Test', () => {
  // Skip this entire suite in CI - it tests production server
  test.skip(!!process.env.CI, 'Production tests skipped in CI');

  test.setTimeout(120000); // 2 minutes timeout

  test('should login and test report functionality', async ({ page }) => {
    // Navigate to login
    await page.goto(`${PROD_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Check login page loaded
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });

    // Login with production credentials
    await page.fill('input[type="email"]', '***REMOVED_EMAIL***');
    await page.fill('input[type="password"]', '***REMOVED***');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    console.log('✅ Login successful');

    // Navigate to analytics
    await page.goto(`${PROD_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Analytics page loaded');

    // Take screenshot of analytics page
    await page.screenshot({ path: 'tests/screenshots/prod-analytics.png', fullPage: true });

    // Click on first assessment card with responses (Janeiro 2026 has 583 responses)
    const assessmentCard = page.locator('text=Janeiro 2026').first();
    if (await assessmentCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await assessmentCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('✅ Assessment card clicked');
    } else {
      // Try clicking any card with responses
      const anyCard = page.locator('[class*="card"]').filter({ hasText: 'respostas' }).first();
      if (await anyCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        await anyCard.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        console.log('✅ Assessment card clicked (fallback)');
      }
    }

    // Take screenshot after clicking assessment
    await page.screenshot({ path: 'tests/screenshots/prod-assessment-detail.png', fullPage: true });
    console.log('Current URL:', page.url());

    // Look for report tab
    const reportTab = page.locator('button:has-text("Relatório"), [role="tab"]:has-text("Relatório"), text=Relatório').first();
    if (await reportTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reportTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ Report tab clicked');
    } else {
      console.log('⚠️ Report tab not found, checking page content...');
      const pageText = await page.textContent('body');
      console.log('Page contains "Relatório":', pageText?.includes('Relatório'));
      console.log('Page contains "PDF":', pageText?.includes('PDF'));
    }

    // Take screenshot of report section
    await page.screenshot({ path: 'tests/screenshots/prod-report-section.png', fullPage: true });

    // Click on "Relatório Executivo" card to open report page
    const relatorioExec = page.locator('text=Relatório Executivo').first();
    if (await relatorioExec.isVisible({ timeout: 5000 }).catch(() => false)) {
      await relatorioExec.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('✅ Relatório Executivo clicked');

      // Take screenshot of report page
      await page.screenshot({ path: 'tests/screenshots/prod-relatorio-executivo.png', fullPage: true });
      console.log('Current URL after click:', page.url());
    } else {
      console.log('⚠️ Relatório Executivo not found');
    }

    // Now look for PDF download button
    const pdfButton = page.locator('button:has-text("PDF"), button:has-text("Exportar PDF"), button:has-text("Gerar PDF")').first();
    if (await pdfButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ PDF button found');

      // Setup download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);

      // Click PDF button
      await pdfButton.click();
      console.log('✅ PDF button clicked');

      // Wait a moment for processing
      await page.waitForTimeout(5000);

      // Take screenshot after clicking
      await page.screenshot({ path: 'tests/screenshots/prod-after-pdf-click.png', fullPage: true });

      // Wait for download or error
      const download = await downloadPromise;

      if (download) {
        console.log(`✅ Download started: ${download.suggestedFilename()}`);
        const path = await download.path();
        console.log(`✅ Downloaded to: ${path}`);
      } else {
        console.log('⚠️ No download triggered - checking for error messages');

        // Check for error toasts or messages
        const errorToast = page.locator('[role="alert"], [data-sonner-toast], .toast-error');
        if (await errorToast.isVisible({ timeout: 3000 }).catch(() => false)) {
          const errorText = await errorToast.textContent();
          console.log(`❌ Error/Toast message: ${errorText}`);
        }

        // Check for any visible error text
        const errorText = page.locator('text=/erro|error|falha|failed/i').first();
        if (await errorText.isVisible({ timeout: 2000 }).catch(() => false)) {
          const text = await errorText.textContent();
          console.log(`❌ Error text found: ${text}`);
        }
      }
    } else {
      console.log('⚠️ PDF button not found on page');
      // List all buttons on page for debugging
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      console.log(`Found ${buttonCount} buttons on page`);
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const btnText = await buttons.nth(i).textContent();
        console.log(`  Button ${i}: ${btnText?.trim()}`);
      }
    }

    // Look for CSV download button
    const csvButton = page.locator('button:has-text("CSV"), button:has-text("Exportar CSV")').first();
    if (await csvButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ CSV button found');

      // Setup download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);

      // Click CSV button
      await csvButton.click();
      console.log('✅ CSV button clicked');

      // Wait for download or error
      const download = await downloadPromise;

      if (download) {
        console.log(`✅ CSV Download started: ${download.suggestedFilename()}`);
      } else {
        console.log('⚠️ No CSV download triggered');
      }
    }

    // Final screenshot
    await page.screenshot({ path: 'tests/screenshots/prod-final-state.png', fullPage: true });

    console.log('✅ Test completed');
  });

  test('should check console for errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    // Navigate to analytics
    await page.goto(`${PROD_URL}/login`);
    await page.fill('input[type="email"]', '***REMOVED_EMAIL***');
    await page.fill('input[type="password"]', '***REMOVED***');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });

    await page.goto(`${PROD_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console errors found:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('✅ No console errors found');
    }
  });
});
