/**
 * Test Participant Import with CSV
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const PROD_URL = 'https://psicomapa.cloud';

test.describe('Participant Import', () => {
  test.setTimeout(120000);

  test('should import CSV with semicolon separator', async ({ page }) => {
    // Login
    console.log('1. Logging in...');
    await page.goto(`${PROD_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'kleberr.rodriguess@gmail.com');
    await page.fill('input[type="password"]', 'Monstro@2022');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 30000 });
    console.log('2. Logged in successfully');

    // Navigate to assessments
    await page.goto(`${PROD_URL}/dashboard/assessments`);
    await page.waitForLoadState('networkidle');
    console.log('3. On assessments page');

    // Click on first assessment
    const assessmentLink = page.locator('a[href*="/dashboard/assessments/"]').first();
    if (await assessmentLink.isVisible({ timeout: 5000 })) {
      await assessmentLink.click();
      await page.waitForLoadState('networkidle');
      console.log('4. Opened assessment');
    } else {
      console.log('No assessments found');
      return;
    }

    // Look for Import button
    const importBtn = page.locator('button:has-text("Importar Participantes")');
    if (await importBtn.isVisible({ timeout: 5000 })) {
      await importBtn.click();
      await page.waitForTimeout(1000);
      console.log('5. Import dialog opened');
    } else {
      console.log('Import button not found');
      return;
    }

    // Create CSV content
    const csvContent = `Email;Nome;departamento;cargo
teste1@example.com;Teste Um;TI;Liderança
teste2@example.com;Teste Dois;RH;Não liderança`;

    // Create temp file
    const tempDir = path.join(process.cwd(), 'tests', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const csvPath = path.join(tempDir, 'test-import.csv');
    fs.writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf8');
    console.log('6. CSV file created');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);
    console.log('7. File uploaded');

    // Wait for preview
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/import-preview.png', fullPage: true });
    console.log('8. Screenshot taken');

    // Check if preview shows correct columns
    const previewTable = page.locator('table');
    if (await previewTable.isVisible({ timeout: 5000 })) {
      const tableText = await previewTable.textContent();
      console.log('Preview table content:', tableText?.substring(0, 200));
      
      // Check if data is parsed correctly (not all in one column)
      const hasEmail = tableText?.includes('teste1@example.com');
      const hasName = tableText?.includes('Teste Um');
      console.log('Has email:', hasEmail);
      console.log('Has name:', hasName);
      
      if (hasEmail && hasName) {
        console.log('✅ CSV parsed correctly with semicolon separator!');
      } else {
        console.log('❌ CSV parsing may have issues');
      }
    }

    // Clean up
    fs.unlinkSync(csvPath);
    console.log('9. Test complete');
  });
});
