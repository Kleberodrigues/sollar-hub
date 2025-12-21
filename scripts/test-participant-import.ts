/**
 * Test script for participant import functionality
 * Run with: npx ts-node scripts/test-participant-import.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

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
      await page.fill('input[type="email"]', 'kleber@sollarsaude.com.br');
      await page.fill('input[type="password"]', 'Campogrande2025!');
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
    console.log('\n3️⃣ Buscando assessment ativo...');

    // Look for "Visualizar" button on an active assessment
    const viewButtons = page.locator('a:has-text("Visualizar"), button:has-text("Visualizar")');
    const count = await viewButtons.count();

    if (count === 0) {
      console.log('❌ Nenhum assessment encontrado. Criando um novo...');

      // Click "Novo Assessment" button
      await page.click('a:has-text("Novo Assessment")');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Fill basic info
      await page.fill('input[name="title"]', 'Teste Import Participantes');

      // Select questionnaire
      const questionnaireSelect = page.locator('button:has-text("Selecione")').first();
      if (await questionnaireSelect.isVisible()) {
        await questionnaireSelect.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }

      // Continue through wizard
      await page.click('button:has-text("Próximo")');
      await page.waitForTimeout(1000);

      // Skip audience step
      await page.click('button:has-text("Próximo")');
      await page.waitForTimeout(1000);

      // Skip configurations
      await page.click('button:has-text("Próximo")');
      await page.waitForTimeout(1000);

      // Create assessment
      await page.click('button:has-text("Criar Assessment")');
      await page.waitForTimeout(3000);

      console.log('✅ Assessment criado');
    } else {
      // Click first assessment
      await viewButtons.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('✅ Assessment encontrado');
    }

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
          await page.waitForTimeout(3000);

          // Check for success
          const success = await page.locator('text=importado').isVisible({ timeout: 5000 });
          if (success) {
            console.log('\n✅ ✅ ✅ SUCESSO! Participantes importados! ✅ ✅ ✅');
            await page.screenshot({ path: path.join(tempDir, 'import-success.png') });
          } else {
            console.log('⚠️ Import pode ter falhado');
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
      }

    } else {
      console.log('❌ Botão "Importar Participantes" não encontrado');
      console.log('   Verifique se você tem permissão de admin/manager');
      await page.screenshot({ path: path.join(tempDir, 'no-import-button.png') });
    }

    // 5. Check if participants are shown on page
    console.log('\n6️⃣ Verificando participantes na página...');
    await page.waitForTimeout(2000);

    const participantsSection = page.locator('text=Participantes Importados');
    if (await participantsSection.isVisible({ timeout: 3000 })) {
      console.log('✅ Seção de participantes visível!');
      await page.screenshot({ path: path.join(tempDir, 'participants-list.png') });
    }

    console.log('\n✅ Teste concluído!');
    console.log(`📁 Screenshots salvos em: ${tempDir}`);

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    await page.screenshot({ path: path.join(tempDir, 'error.png') });
  } finally {
    // Cleanup
    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath);
    }

    await page.waitForTimeout(3000);
    await browser.close();
  }
}

main().catch(console.error);
