/**
 * Test script for participant import functionality
 * Run with: node scripts/test-participant-import.mjs
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3000';

// Test CSV content
const csvContent = `email,nome,departamento,cargo
joao.silva@teste.com,João Silva,TI,Desenvolvedor
maria.santos@teste.com,Maria Santos,RH,Analista
pedro.oliveira@teste.com,Pedro Oliveira,Financeiro,Gerente
ana.costa@teste.com,Ana Costa,Marketing,Coordenadora
carlos.lima@teste.com,Carlos Lima,Operações,Supervisor
`;

async function main() {
  console.log('🚀 Iniciando teste de import de participantes...\n');

  // Create temp CSV file
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const csvPath = path.join(tempDir, 'participantes-teste.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log(`📄 CSV de teste criado: ${csvPath}`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('\n1️⃣ Fazendo login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Check if already logged in
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', '***REMOVED_EMAIL***');
      await page.fill('input[type="password"]', '***REMOVED***');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      console.log('✅ Login realizado');
    } else {
      console.log('✅ Já estava logado');
    }

    // 2. Navigate to Assessments
    console.log('\n2️⃣ Navegando para Assessments...');
    await page.goto(`${BASE_URL}/dashboard/assessments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 3. Find an active assessment and click on it
    console.log('\n3️⃣ Buscando assessment...');

    // Look for "Ver Detalhes" button on an assessment
    let viewButtons = page.locator('button:has-text("Ver Detalhes"), a:has-text("Ver Detalhes")');
    let count = await viewButtons.count();
    console.log(`   Encontrados ${count} assessments`);

    if (count === 0) {
      console.log('   Criando novo assessment...');

      // Click "Novo Assessment" button
      const newAssessmentBtn = page.locator('a:has-text("Novo Assessment"), button:has-text("Novo Assessment")');
      if (await newAssessmentBtn.isVisible({ timeout: 5000 })) {
        await newAssessmentBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Fill basic info
        await page.fill('#title', 'Teste Import Participantes');
        await page.waitForTimeout(500);

        // Select questionnaire from dropdown
        const questionnaireSelect = page.locator('select, [role="combobox"]').first();
        if (await questionnaireSelect.isVisible({ timeout: 3000 })) {
          await questionnaireSelect.click();
          await page.waitForTimeout(500);
          // Try to select first option
          const firstOption = page.locator('[role="option"], option').first();
          if (await firstOption.isVisible({ timeout: 2000 })) {
            await firstOption.click();
          } else {
            // If using native select, just select by index
            await questionnaireSelect.selectOption({ index: 1 });
          }
        }
        await page.waitForTimeout(500);

        // Set end date if available
        const endDateInput = page.locator('input[type="date"]').last();
        if (await endDateInput.isVisible({ timeout: 2000 })) {
          // Set end date to 30 days from now
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          await endDateInput.fill(endDate.toISOString().split('T')[0]);
        }
        await page.waitForTimeout(500);

        // Scroll to bottom and find submit button
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        // Create assessment
        const createButton = page.locator('button[type="submit"], button:has-text("Criar Assessment"), button:has-text("Criar")');
        if (await createButton.isVisible({ timeout: 3000 })) {
          await createButton.click();
          await page.waitForTimeout(5000);
        }

        console.log('✅ Assessment criado');

        // Go back to assessments list
        await page.goto(`${BASE_URL}/dashboard/assessments`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Find the newly created assessment
        viewButtons = page.locator('button:has-text("Ver Detalhes"), a:has-text("Ver Detalhes")');
        count = await viewButtons.count();
      }
    }

    if (count === 0) {
      console.log('❌ Nenhum assessment encontrado e não foi possível criar um');
      await page.screenshot({ path: path.join(tempDir, 'no-assessments.png') });
      await browser.close();
      return;
    }

    // Click first assessment
    console.log('   Clicando em Ver Detalhes...');
    await viewButtons.first().click();

    // Wait for navigation to assessment detail page
    await page.waitForURL('**/assessments/**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log(`   URL atual: ${page.url()}`);
    console.log('✅ Assessment aberto');

    // 4. Look for "Importar Participantes" button
    console.log('\n4️⃣ Procurando botão "Importar Participantes"...');

    const importButton = page.locator('button:has-text("Importar Participantes")');

    if (await importButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Botão encontrado!');

      // Click to open dialog
      await importButton.click();
      await page.waitForTimeout(1000);

      console.log('\n5️⃣ Dialog aberto, fazendo upload do CSV...');

      // Find file input and upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(csvPath);

      await page.waitForTimeout(2000);

      // Check if preview is shown
      const previewVisible = await page.locator('text=participantes prontos').isVisible({ timeout: 5000 });

      if (previewVisible) {
        console.log('✅ Preview exibido!');

        // Take screenshot
        await page.screenshot({ path: path.join(tempDir, 'import-preview.png') });
        console.log('📸 Screenshot salvo: import-preview.png');

        // Click import button
        const confirmButton = page.locator('button:has-text("Importar")').last();
        if (await confirmButton.isEnabled()) {
          await confirmButton.click();
          console.log('   Importando...');
          await page.waitForTimeout(5000);

          // Check for success
          const success = await page.locator('text=importado').isVisible({ timeout: 5000 });
          if (success) {
            console.log('\n✅ ✅ ✅ SUCESSO! Participantes importados! ✅ ✅ ✅');
            await page.screenshot({ path: path.join(tempDir, 'import-success.png') });
          } else {
            console.log('⚠️ Verificando resultado...');
            await page.screenshot({ path: path.join(tempDir, 'import-result.png') });
          }
        }
      } else {
        console.log('⚠️ Preview não apareceu, verificando erros...');
        await page.screenshot({ path: path.join(tempDir, 'import-error.png') });
      }

      // Close dialog
      const closeButton = page.locator('button:has-text("Fechar")');
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }

    } else {
      console.log('❌ Botão "Importar Participantes" não encontrado');
      console.log('   Verifique se você tem permissão de admin/manager');
      await page.screenshot({ path: path.join(tempDir, 'no-import-button.png') });
    }

    // 6. Check if participants are shown on page
    console.log('\n6️⃣ Verificando participantes na página...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const participantsSection = page.locator('text=Participantes Importados');
    if (await participantsSection.isVisible({ timeout: 3000 })) {
      console.log('✅ Seção de participantes visível!');
      await page.screenshot({ path: path.join(tempDir, 'participants-list.png') });
    } else {
      console.log('⚠️ Seção de participantes não encontrada na página');
    }

    console.log('\n✅ Teste concluído!');
    console.log(`📁 Screenshots salvos em: ${tempDir}`);

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    await page.screenshot({ path: path.join(tempDir, 'error.png') });
  } finally {
    // Cleanup CSV
    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath);
    }

    await page.waitForTimeout(3000);
    await browser.close();
  }
}

main().catch(console.error);
