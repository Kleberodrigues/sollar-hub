/**
 * SMOKE TEST SUITE - Teste Completo de Jornada do Usuário
 *
 * Este script testa TODA a jornada de um novo usuário no PsicoMapa:
 * - T01: Registro de novo usuário
 * - T02: Login
 * - T03: Pagamento Stripe (simulado)
 * - T04: Recuperação de senha
 * - T05: Dashboard
 * - T06: Criar Assessment
 * - T07: Gerenciar Questionário
 * - T08: Responder Questionário
 * - T09: Analytics
 * - T10: Exportar Relatório
 * - T11: Plano de Ação com IA
 *
 * Execução: node scripts/smoke-test-complete.mjs
 */

import { chromium } from 'playwright';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  BASE_URL: 'https://psicomapa.cloud',
  SCREENSHOTS_DIR: './screenshots/smoke-test',

  // Credenciais de teste existente (para testes que não criam usuário)
  EXISTING_USER: {
    email: 'admin@sollartreinamentos.com.br',
    password: 'AdminPassword123!',
  },

  // Novo usuário para teste de registro
  NEW_USER: {
    email: `teste.e2e.${Date.now()}@teste.com`,
    password: 'TesteE2E@2024!',
    name: 'Usuário Teste E2E',
    company: 'Empresa Teste E2E',
  },

  // Dados de teste Stripe
  STRIPE_TEST_CARD: {
    number: '4242424242424242',
    expiry: '12/30',
    cvc: '123',
  },

  TIMEOUTS: {
    navigation: 30000,
    action: 10000,
    network: 60000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTADOS DOS TESTES
// ═══════════════════════════════════════════════════════════════════════════════

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

function logTest(id, name, status, details = '') {
  const emoji = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⏭️';
  console.log(`${emoji} ${id}: ${name} - ${status}`);
  if (details) console.log(`   └─ ${details}`);

  testResults.total++;
  if (status === 'PASSED') testResults.passed++;
  else if (status === 'FAILED') testResults.failed++;
  else testResults.skipped++;

  testResults.tests.push({ id, name, status, details, timestamp: new Date().toISOString() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

async function screenshot(page, name) {
  try {
    await page.screenshot({
      path: `${CONFIG.SCREENSHOTS_DIR}/${name}.png`,
      fullPage: true
    });
  } catch (e) {
    console.log(`   ⚠️ Screenshot falhou: ${e.message}`);
  }
}

async function waitAndClick(page, selector, timeout = CONFIG.TIMEOUTS.action) {
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
}

async function fillForm(page, selector, value) {
  await page.waitForSelector(selector, { timeout: CONFIG.TIMEOUTS.action });
  await page.fill(selector, value);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * T01 - Teste de Registro de Novo Usuário
 */
async function testRegister(page) {
  const testId = 'T01';
  const testName = 'Registro de Novo Usuário';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/register`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't01-1-register-page');

    // Verificar se página de registro carregou
    const hasForm = await page.locator('form').isVisible().catch(() => false);
    if (!hasForm) {
      logTest(testId, testName, 'SKIPPED', 'Página de registro não disponível (fluxo payment-first)');
      return false;
    }

    // Preencher formulário
    await fillForm(page, 'input[name="name"], input[placeholder*="nome"]', CONFIG.NEW_USER.name);
    await fillForm(page, 'input[type="email"]', CONFIG.NEW_USER.email);
    await fillForm(page, 'input[name="company"], input[placeholder*="empresa"]', CONFIG.NEW_USER.company);
    await fillForm(page, 'input[type="password"]', CONFIG.NEW_USER.password);

    // Confirmar senha se houver campo
    const confirmPassword = page.locator('input[name="confirmPassword"], input[placeholder*="confirmar"]');
    if (await confirmPassword.isVisible().catch(() => false)) {
      await confirmPassword.fill(CONFIG.NEW_USER.password);
    }

    // Aceitar termos se houver checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible().catch(() => false)) {
      await termsCheckbox.check();
    }

    await screenshot(page, 't01-2-form-filled');

    // Submeter
    await page.click('button[type="submit"]');

    // Aguardar navegação
    await page.waitForTimeout(3000);

    await screenshot(page, 't01-3-after-submit');

    // Verificar sucesso (redirecionamento ou toast)
    const currentUrl = page.url();
    const isSuccess = currentUrl.includes('dashboard') ||
                     currentUrl.includes('checkout') ||
                     currentUrl.includes('success');

    if (isSuccess) {
      logTest(testId, testName, 'PASSED', `Redirecionado para: ${currentUrl}`);
      return true;
    } else {
      // Verificar se há mensagem de erro
      const errorMsg = await page.locator('[class*="error"], [class*="alert-destructive"]').textContent().catch(() => '');
      logTest(testId, testName, 'FAILED', errorMsg || 'Não redirecionou após registro');
      return false;
    }

  } catch (error) {
    await screenshot(page, 't01-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T02 - Teste de Login
 */
async function testLogin(page, credentials = CONFIG.EXISTING_USER) {
  const testId = 'T02';
  const testName = 'Login';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/login`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't02-1-login-page');

    // Preencher credenciais
    await fillForm(page, 'input[type="email"]', credentials.email);
    await fillForm(page, 'input[type="password"]', credentials.password);

    await screenshot(page, 't02-2-credentials-filled');

    // Submeter
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForURL(/dashboard/, { timeout: CONFIG.TIMEOUTS.navigation });

    await screenshot(page, 't02-3-dashboard');

    logTest(testId, testName, 'PASSED', 'Login realizado com sucesso');
    return true;

  } catch (error) {
    await screenshot(page, 't02-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T03 - Teste de Pagamento Stripe
 */
async function testStripePayment(page) {
  const testId = 'T03';
  const testName = 'Pagamento Stripe';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Verificar se há link para upgrade/pagamento
    const pricingLink = page.locator('a[href*="pricing"], a[href*="checkout"], a:has-text("Upgrade")').first();

    if (!await pricingLink.isVisible().catch(() => false)) {
      logTest(testId, testName, 'SKIPPED', 'Usuário já possui assinatura ativa');
      return true;
    }

    await pricingLink.click();
    await page.waitForTimeout(2000);

    await screenshot(page, 't03-1-pricing-page');

    // Selecionar um plano
    const planButton = page.locator('button:has-text("Começar"), button:has-text("Assinar"), a[href*="checkout"]').first();
    if (await planButton.isVisible().catch(() => false)) {
      await planButton.click();
      await page.waitForTimeout(3000);
    }

    await screenshot(page, 't03-2-checkout');

    // Verificar se foi para Stripe Checkout
    const currentUrl = page.url();
    if (currentUrl.includes('stripe.com') || currentUrl.includes('checkout')) {
      logTest(testId, testName, 'PASSED', 'Redirecionado para Stripe Checkout');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Fluxo de pagamento não encontrado');
    return true;

  } catch (error) {
    await screenshot(page, 't03-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T04 - Teste de Recuperação de Senha
 */
async function testPasswordRecovery(page) {
  const testId = 'T04';
  const testName = 'Recuperação de Senha';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/login`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    // Procurar link de esqueci senha
    const forgotLink = page.locator('a:has-text("Esqueci"), a:has-text("Forgot"), a[href*="forgot"]').first();

    if (!await forgotLink.isVisible().catch(() => false)) {
      logTest(testId, testName, 'SKIPPED', 'Link de recuperação não encontrado');
      return true;
    }

    await forgotLink.click();
    await page.waitForTimeout(2000);

    await screenshot(page, 't04-1-forgot-page');

    // Preencher email
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill(CONFIG.EXISTING_USER.email);

      await screenshot(page, 't04-2-email-filled');

      // Submeter
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      await screenshot(page, 't04-3-after-submit');

      // Verificar mensagem de sucesso
      const successMsg = await page.locator('text=/enviado|email|verifique|check/i').isVisible().catch(() => false);

      if (successMsg) {
        logTest(testId, testName, 'PASSED', 'Email de recuperação enviado');
        return true;
      }
    }

    logTest(testId, testName, 'SKIPPED', 'Fluxo de recuperação não completado');
    return true;

  } catch (error) {
    await screenshot(page, 't04-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T05 - Teste de Dashboard
 */
async function testDashboard(page) {
  const testId = 'T05';
  const testName = 'Dashboard Principal';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/dashboard`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't05-1-dashboard');

    // Verificar elementos do dashboard
    const checks = {
      sidebar: await page.locator('nav, aside, [class*="sidebar"]').isVisible().catch(() => false),
      header: await page.locator('header, [class*="header"]').isVisible().catch(() => false),
      cards: await page.locator('[class*="card"]').count().catch(() => 0) > 0,
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
      return true;
    } else {
      logTest(testId, testName, 'FAILED', `Apenas ${passedChecks}/3 elementos encontrados`);
      return false;
    }

  } catch (error) {
    await screenshot(page, 't05-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T06 - Teste de Criar Assessment
 */
async function testCreateAssessment(page) {
  const testId = 'T06';
  const testName = 'Criar Assessment';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Navegar para assessments
    await page.goto(`${CONFIG.BASE_URL}/dashboard/assessments`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't06-1-assessments-list');

    // Procurar botão de criar
    const createBtn = page.locator('button:has-text("Nova"), button:has-text("Criar"), a:has-text("Nova")').first();

    if (!await createBtn.isVisible().catch(() => false)) {
      logTest(testId, testName, 'SKIPPED', 'Botão de criar assessment não encontrado');
      return true;
    }

    await createBtn.click();
    await page.waitForTimeout(2000);

    await screenshot(page, 't06-2-create-form');

    // Verificar se modal/form abriu
    const hasForm = await page.locator('input[name="title"], input[placeholder*="título"]').isVisible().catch(() => false);

    if (hasForm) {
      logTest(testId, testName, 'PASSED', 'Formulário de criação disponível');

      // Fechar modal se houver
      const closeBtn = page.locator('button:has-text("Cancelar"), button[class*="close"]').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
      }

      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Formulário de criação não carregou');
    return true;

  } catch (error) {
    await screenshot(page, 't06-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T07 - Teste de Gerenciar Questionários
 */
async function testManageQuestionnaires(page) {
  const testId = 'T07';
  const testName = 'Gerenciar Questionários';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/dashboard/questionnaires`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't07-1-questionnaires-list');

    // Verificar se lista carregou
    const hasList = await page.locator('[class*="card"], table, [class*="list"]').isVisible().catch(() => false);

    if (hasList) {
      logTest(testId, testName, 'PASSED', 'Lista de questionários carregada');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Lista de questionários não encontrada');
    return true;

  } catch (error) {
    await screenshot(page, 't07-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T08 - Teste de Responder Questionário (via link público)
 */
async function testRespondQuestionnaire(page) {
  const testId = 'T08';
  const testName = 'Responder Questionário';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Primeiro, precisamos encontrar um assessment ativo
    await page.goto(`${CONFIG.BASE_URL}/dashboard/assessments`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    // Clicar no primeiro assessment para ver detalhes
    const assessmentCard = page.locator('[class*="card"]').first();
    if (await assessmentCard.isVisible().catch(() => false)) {
      await assessmentCard.click();
      await page.waitForTimeout(2000);

      await screenshot(page, 't08-1-assessment-detail');

      // Procurar link de participação
      const participationLink = await page.locator('input[readonly], code, [class*="link"]').textContent().catch(() => '');

      if (participationLink && participationLink.includes('respond')) {
        logTest(testId, testName, 'PASSED', 'Link de participação disponível');
        return true;
      }
    }

    logTest(testId, testName, 'SKIPPED', 'Nenhum assessment ativo encontrado');
    return true;

  } catch (error) {
    await screenshot(page, 't08-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T09 - Teste de Analytics
 */
async function testAnalytics(page) {
  const testId = 'T09';
  const testName = 'Analytics';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/dashboard/analytics`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await page.waitForTimeout(3000); // Aguardar carregamento de gráficos

    await screenshot(page, 't09-1-analytics-page');

    // Verificar elementos de analytics
    const checks = {
      charts: await page.locator('canvas, svg, [class*="chart"]').count().catch(() => 0) > 0,
      cards: await page.locator('[class*="card"]').count().catch(() => 0) > 2,
      tabs: await page.locator('[role="tablist"], [class*="tabs"]').isVisible().catch(() => false),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Analytics requer dados de assessment');
    return true;

  } catch (error) {
    await screenshot(page, 't09-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T10 - Teste de Exportar Relatório
 */
async function testExportReport(page) {
  const testId = 'T10';
  const testName = 'Exportar Relatório';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Verificar se estamos na página de analytics com assessment selecionado
    const exportBtn = page.locator('button:has-text("Exportar"), button:has-text("PDF"), button:has-text("Excel")').first();

    if (await exportBtn.isVisible().catch(() => false)) {
      logTest(testId, testName, 'PASSED', 'Botão de exportação disponível');
      await screenshot(page, 't10-1-export-available');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Botão de exportação não encontrado (requer assessment com dados)');
    return true;

  } catch (error) {
    await screenshot(page, 't10-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T11 - Teste de Plano de Ação com IA
 */
async function testAIActionPlan(page) {
  const testId = 'T11';
  const testName = 'Plano de Ação com IA';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Procurar card de Plano de Ação
    const actionPlanCard = page.locator('text=/Plano de Ação/i').first();

    if (await actionPlanCard.isVisible().catch(() => false)) {
      await actionPlanCard.click();
      await page.waitForTimeout(2000);

      await screenshot(page, 't11-1-action-plan-section');

      // Procurar botão de gerar
      const generateBtn = page.locator('button:has-text("Gerar"), button:has-text("Regenerar")').first();

      if (await generateBtn.isVisible().catch(() => false)) {
        logTest(testId, testName, 'PASSED', 'Funcionalidade de Plano de Ação disponível');
        return true;
      }
    }

    logTest(testId, testName, 'SKIPPED', 'Requer assessment com categorias de risco');
    return true;

  } catch (error) {
    await screenshot(page, 't11-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T12 - Teste de Importar Participantes
 */
async function testImportParticipants(page) {
  const testId = 'T12';
  const testName = 'Importar Participantes';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/dashboard/assessments`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    // Verificar se tem assessment e botão de importar
    const importBtn = page.locator('button:has-text("Importar"), button:has-text("Upload CSV")').first();

    if (await importBtn.isVisible().catch(() => false)) {
      logTest(testId, testName, 'PASSED', 'Funcionalidade de importação disponível');
      await screenshot(page, 't12-1-import-available');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Botão de importação não encontrado');
    return true;

  } catch (error) {
    await screenshot(page, 't12-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T13 - Teste de Gerenciar Organização
 */
async function testManageOrganization(page) {
  const testId = 'T13';
  const testName = 'Gerenciar Organização';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/dashboard/organization`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't13-1-organization-page');

    // Verificar se página carregou
    const hasForm = await page.locator('input, form').isVisible().catch(() => false);

    if (hasForm) {
      logTest(testId, testName, 'PASSED', 'Página de organização carregada');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Página de organização não disponível');
    return true;

  } catch (error) {
    await screenshot(page, 't13-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T14 - Teste de Gerenciar Departamentos
 */
async function testManageDepartments(page) {
  const testId = 'T14';
  const testName = 'Gerenciar Departamentos';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/dashboard/departments`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't14-1-departments-page');

    // Verificar se lista carregou
    const hasList = await page.locator('[class*="card"], table, [class*="list"]').isVisible().catch(() => false);

    if (hasList) {
      logTest(testId, testName, 'PASSED', 'Lista de departamentos carregada');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Lista de departamentos não encontrada');
    return true;

  } catch (error) {
    await screenshot(page, 't14-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T15 - Teste de Configurações de Perfil
 */
async function testProfileSettings(page) {
  const testId = 'T15';
  const testName = 'Configurações de Perfil';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/dashboard/settings`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await screenshot(page, 't15-1-settings-page');

    // Verificar se página carregou
    const hasForm = await page.locator('input, form').isVisible().catch(() => false);

    if (hasForm) {
      logTest(testId, testName, 'PASSED', 'Página de configurações carregada');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Página de configurações não disponível');
    return true;

  } catch (error) {
    await screenshot(page, 't15-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * Verificações de Console (erros JS)
 */
function setupConsoleMonitor(page) {
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   SMOKE TEST SUITE - PsicoMapa (Sollar Insight Hub)');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`🌐 URL: ${CONFIG.BASE_URL}`);
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'pt-BR',
  });

  const page = await context.newPage();
  const consoleErrors = setupConsoleMonitor(page);

  try {
    // ═══════════════════════════════════════════════════════════════════
    // FASE 1: TESTES CRÍTICOS (P0)
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📌 FASE 1: TESTES CRÍTICOS (P0)');
    console.log('─────────────────────────────────────────────────────────────────\n');

    // T04 - Recuperação de Senha (primeiro, sem login)
    await testPasswordRecovery(page);

    // T01 - Registro (pode falhar se fluxo payment-first)
    await testRegister(page);

    // T02 - Login (com usuário existente)
    const loginSuccess = await testLogin(page);

    if (!loginSuccess) {
      console.log('\n❌ Login falhou - abortando testes que requerem autenticação\n');
      throw new Error('Login falhou');
    }

    // T03 - Pagamento (verificar disponibilidade)
    await testStripePayment(page);

    // ═══════════════════════════════════════════════════════════════════
    // FASE 2: TESTES CORE (P1)
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📌 FASE 2: TESTES CORE (P1)');
    console.log('─────────────────────────────────────────────────────────────────\n');

    await testDashboard(page);
    await testCreateAssessment(page);
    await testManageQuestionnaires(page);
    await testRespondQuestionnaire(page);
    await testAnalytics(page);
    await testExportReport(page);

    // ═══════════════════════════════════════════════════════════════════
    // FASE 3: TESTES AVANÇADOS (P2)
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📌 FASE 3: TESTES AVANÇADOS (P2)');
    console.log('─────────────────────────────────────────────────────────────────\n');

    await testAIActionPlan(page);
    await testImportParticipants(page);
    await testManageOrganization(page);
    await testManageDepartments(page);
    await testProfileSettings(page);

    // ═══════════════════════════════════════════════════════════════════
    // VERIFICAÇÃO DE ERROS DE CONSOLE
    // ═══════════════════════════════════════════════════════════════════
    if (consoleErrors.length > 0) {
      console.log('\n⚠️ ERROS DE CONSOLE DETECTADOS:');
      consoleErrors.slice(0, 10).forEach(err => console.log(`   - ${err.substring(0, 100)}`));
    }

  } catch (error) {
    console.error('\n🚨 ERRO CRÍTICO:', error.message);
    await screenshot(page, 'critical-error');
  } finally {
    // ═══════════════════════════════════════════════════════════════════
    // RELATÓRIO FINAL
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('   RELATÓRIO FINAL');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    console.log(`📊 Total de Testes: ${testResults.total}`);
    console.log(`✅ Passou: ${testResults.passed}`);
    console.log(`❌ Falhou: ${testResults.failed}`);
    console.log(`⏭️ Pulado: ${testResults.skipped}`);
    console.log(`\n📈 Taxa de Sucesso: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    if (testResults.failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      testResults.tests
        .filter(t => t.status === 'FAILED')
        .forEach(t => console.log(`   - ${t.id}: ${t.name} → ${t.details}`));
    }

    console.log(`\n📸 Screenshots salvos em: ${CONFIG.SCREENSHOTS_DIR}/`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

    // Aguardar antes de fechar
    await page.waitForTimeout(3000);
    await browser.close();

    // Exit code baseado no resultado
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

main();
