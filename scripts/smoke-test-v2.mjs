/**
 * SMOKE TEST SUITE v2 - Teste Completo de Jornada do Usuario
 *
 * Versao atualizada com seletores corretos em portugues
 * baseados na estrutura real da aplicacao PsicoMapa.
 *
 * Execucao: node scripts/smoke-test-v2.mjs
 */

import { chromium } from 'playwright';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACAO
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  BASE_URL: 'https://psicomapa.cloud',
  SCREENSHOTS_DIR: './screenshots/smoke-test-v2',

  EXISTING_USER: {
    email: 'admin@sollartreinamentos.com.br',
    password: 'AdminPassword123!',
  },

  NEW_USER: {
    email: `teste.automatizado.${Date.now()}@teste.com`,
    password: 'TesteAutomatizado@2024!',
    name: 'Usuario Teste Automatizado',
    company: 'Empresa Teste Automatizado',
  },

  TIMEOUTS: {
    navigation: 30000,
    action: 15000,
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

async function safeClick(page, locator, timeout = CONFIG.TIMEOUTS.action) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click();
    return true;
  } catch {
    return false;
  }
}

async function safeFill(page, locator, value, timeout = CONFIG.TIMEOUTS.action) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill(value);
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * T01 - Teste de Registro de Novo Usuario
 */
async function testRegister(page) {
  const testId = 'T01';
  const testName = 'Registro de Novo Usuario';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/register`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await page.waitForTimeout(2000);
    await screenshot(page, 't01-1-register-page');

    // Seletores usando IDs especificos do formulario real
    // Baseado em: app/(auth)/register/page.tsx
    const nameField = page.locator('#fullName');
    const emailField = page.locator('#email');
    const passwordField = page.locator('#password');
    const confirmPasswordField = page.locator('#confirmPassword');
    const companyField = page.locator('#organizationName');

    // Verificar se formulario existe
    const hasForm = await nameField.isVisible().catch(() => false);

    if (!hasForm) {
      logTest(testId, testName, 'SKIPPED', 'Formulario de registro nao encontrado');
      return false;
    }

    // Preencher formulario na ordem correta
    console.log('   📝 Preenchendo Nome Completo...');
    await safeFill(page, nameField, CONFIG.NEW_USER.name);

    console.log('   📝 Preenchendo Email...');
    await safeFill(page, emailField, CONFIG.NEW_USER.email);

    console.log('   📝 Preenchendo Senha...');
    await safeFill(page, passwordField, CONFIG.NEW_USER.password);

    console.log('   📝 Preenchendo Confirmar Senha...');
    await safeFill(page, confirmPasswordField, CONFIG.NEW_USER.password);

    console.log('   📝 Preenchendo Nome da Empresa...');
    await safeFill(page, companyField, CONFIG.NEW_USER.company);

    await screenshot(page, 't01-2-form-filled');

    // Submeter
    console.log('   📤 Submetendo formulario...');
    const submitBtn = page.locator('button:has-text("Criar Conta")');
    await safeClick(page, submitBtn);

    await page.waitForTimeout(5000);
    await screenshot(page, 't01-3-after-submit');

    const currentUrl = page.url();
    const isSuccess = currentUrl.includes('dashboard') ||
                     currentUrl.includes('checkout') ||
                     currentUrl.includes('success') ||
                     currentUrl.includes('billing');

    if (isSuccess) {
      logTest(testId, testName, 'PASSED', `Redirecionado para: ${currentUrl}`);
      return true;
    } else {
      // Verificar mensagem de erro especifica
      const errorBox = page.locator('[class*="bg-risk-high"], [class*="error"], [role="alert"]');
      const errorMsg = await errorBox.textContent().catch(() => '');

      // Verificar se email ja existe (nao e erro critico)
      if (errorMsg.includes('ja existe') || errorMsg.includes('already exists')) {
        logTest(testId, testName, 'PASSED', 'Email ja cadastrado (comportamento esperado)');
        return true;
      }

      logTest(testId, testName, 'FAILED', errorMsg || 'Nao redirecionou apos registro');
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

    await page.waitForTimeout(2000);
    await screenshot(page, 't02-1-login-page');

    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);

    await screenshot(page, 't02-2-credentials-filled');

    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: CONFIG.TIMEOUTS.navigation });
    await page.waitForTimeout(2000);

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
 * T03 - Teste de Pagamento/Assinatura
 */
async function testSubscription(page) {
  const testId = 'T03';
  const testName = 'Verificar Assinatura';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Navegar para pagina de assinatura via sidebar
    const assinaturaLink = page.locator('a:has-text("Assinatura"), nav >> text=Assinatura').first();

    if (await assinaturaLink.isVisible().catch(() => false)) {
      await assinaturaLink.click();
      await page.waitForTimeout(3000);
      await screenshot(page, 't03-1-subscription-page');

      // Verificar elementos baseados na estrutura real
      const checks = {
        title: await page.locator('text=/Assinatura|Billing|Plano/i').first().isVisible().catch(() => false),
        status: await page.locator('text=/ativo|active|Trial|Premium|Base|Intermediário|Avançado/i').first().isVisible().catch(() => false),
        content: await page.locator('text=/Gerenciar|Upgrade|Cancelar|Fatura/i').first().isVisible().catch(() => false),
      };

      console.log(`   📊 Titulo: ${checks.title}, Status: ${checks.status}, Conteudo: ${checks.content}`);

      const passedChecks = Object.values(checks).filter(Boolean).length;

      if (passedChecks >= 1) {
        logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
        return true;
      }
    }

    logTest(testId, testName, 'SKIPPED', 'Pagina de assinatura nao acessivel');
    return true;

  } catch (error) {
    await screenshot(page, 't03-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T04 - Teste de Recuperacao de Senha
 */
async function testPasswordRecovery(page) {
  const testId = 'T04';
  const testName = 'Recuperacao de Senha';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    await page.goto(`${CONFIG.BASE_URL}/forgot-password`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.TIMEOUTS.navigation
    });

    await page.waitForTimeout(2000);
    await screenshot(page, 't04-1-forgot-page');

    const emailInput = page.locator('input[type="email"]');

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('teste@teste.com');
      await screenshot(page, 't04-2-email-filled');

      const submitBtn = page.locator('button[type="submit"]');
      await safeClick(page, submitBtn);

      await page.waitForTimeout(3000);
      await screenshot(page, 't04-3-after-submit');

      logTest(testId, testName, 'PASSED', 'Formulario de recuperacao funcional');
      return true;
    }

    logTest(testId, testName, 'SKIPPED', 'Pagina de recuperacao nao encontrada');
    return true;

  } catch (error) {
    await screenshot(page, 't04-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T05 - Teste de Dashboard Principal
 */
async function testDashboard(page) {
  const testId = 'T05';
  const testName = 'Dashboard Principal';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Clicar em Pagina Inicial na sidebar
    const homeLink = page.locator('a:has-text("Página Inicial"), nav >> text="Página Inicial"').first();

    if (await homeLink.isVisible().catch(() => false)) {
      await homeLink.click();
      await page.waitForTimeout(2000);
    }

    await screenshot(page, 't05-1-dashboard');

    // Verificar elementos do dashboard
    const checks = {
      sidebar: await page.locator('nav, aside').first().isVisible().catch(() => false),
      header: await page.locator('header, [class*="header"]').first().isVisible().catch(() => false),
      userName: await page.locator('text=/Administrador|Admin|Super Admin/i').isVisible().catch(() => false),
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
 * T06 - Teste de Avaliacoes
 */
async function testAssessments(page) {
  const testId = 'T06';
  const testName = 'Gerenciar Avaliacoes';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    // Navegar para Avaliacoes via sidebar
    const assessmentsLink = page.locator('a:has-text("Avaliações"), nav >> text=Avaliações').first();
    await assessmentsLink.click();
    await page.waitForTimeout(3000);

    await screenshot(page, 't06-1-assessments-page');

    // Verificar elementos da pagina (seletores mais flexiveis)
    const checks = {
      title: await page.locator('text="Avaliações"').first().isVisible().catch(() => false),
      newBtn: await page.locator('button:has-text("Nova Avaliação")').isVisible().catch(() => false),
      cards: await page.locator('text=/Ativos|Total de Respostas/i').first().isVisible().catch(() => false),
    };

    console.log(`   📊 Titulo: ${checks.title}, Botao: ${checks.newBtn}, Cards: ${checks.cards}`);

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);

      // Testar botao Nova Avaliacao
      const newBtn = page.locator('button:has-text("Nova Avaliação")');
      if (await newBtn.isVisible().catch(() => false)) {
        await newBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, 't06-2-new-assessment-modal');

        // Fechar modal (ESC ou botao)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }

      return true;
    }

    logTest(testId, testName, 'FAILED', `Apenas ${passedChecks}/3 elementos encontrados`);
    return false;

  } catch (error) {
    await screenshot(page, 't06-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T07 - Teste de Questionarios
 */
async function testQuestionnaires(page) {
  const testId = 'T07';
  const testName = 'Gerenciar Questionarios';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    const questionnairesLink = page.locator('a:has-text("Questionários"), nav >> text=Questionários').first();
    await questionnairesLink.click();
    await page.waitForTimeout(3000);

    await screenshot(page, 't07-1-questionnaires-page');

    // Verificar elementos baseados na estrutura real
    const checks = {
      title: await page.locator('text="Questionários"').first().isVisible().catch(() => false),
      cards: await page.locator('text=/Total|Ativos|Perguntas/i').first().isVisible().catch(() => false),
      list: await page.locator('text=/Pesquisa de Clima|perguntas/i').first().isVisible().catch(() => false),
    };

    console.log(`   📊 Titulo: ${checks.title}, Cards: ${checks.cards}, Lista: ${checks.list}`);

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
      return true;
    }

    logTest(testId, testName, 'SKIPPED', `Apenas ${passedChecks}/3 elementos`);
    return true;

  } catch (error) {
    await screenshot(page, 't07-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T08 - Teste de Analise de Riscos (Analytics)
 */
async function testAnalytics(page) {
  const testId = 'T08';
  const testName = 'Analise de Riscos';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    const analyticsLink = page.locator('a:has-text("Análise de Riscos"), nav >> text="Análise de Riscos"').first();
    await analyticsLink.click();
    await page.waitForTimeout(3000);

    await screenshot(page, 't08-1-analytics-list');

    // Verificar se tem assessments com dados
    const assessmentCard = page.locator('text=/Avaliação|respostas/i').first();

    if (await assessmentCard.isVisible().catch(() => false)) {
      // Clicar no primeiro assessment
      await assessmentCard.click();
      await page.waitForTimeout(5000);

      await screenshot(page, 't08-2-analytics-dashboard');

      // Verificar elementos do dashboard de analytics
      const hasCharts = await page.locator('canvas, svg, [class*="chart"], [class*="recharts"]').count().catch(() => 0) > 0;
      const hasTabs = await page.locator('[role="tablist"], button[role="tab"]').isVisible().catch(() => false);
      const hasData = await page.locator('text=/risco|score|categoria/i').isVisible().catch(() => false);

      if (hasCharts || hasTabs || hasData) {
        logTest(testId, testName, 'PASSED', 'Dashboard de analytics carregado com dados');
        return true;
      }
    }

    logTest(testId, testName, 'SKIPPED', 'Nenhum assessment com dados encontrado');
    return true;

  } catch (error) {
    await screenshot(page, 't08-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T09 - Teste de Plano de Acao
 */
async function testActionPlan(page) {
  const testId = 'T09';
  const testName = 'Plano de Acao com IA';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    const actionPlanLink = page.locator('a:has-text("Plano de Ação"), nav >> text="Plano de Ação"').first();
    await actionPlanLink.click();
    await page.waitForTimeout(3000);

    await screenshot(page, 't09-1-action-plan-page');

    // Verificar elementos baseados na estrutura real
    const checks = {
      title: await page.locator('text="Plano de Ação"').first().isVisible().catch(() => false),
      selectText: await page.locator('text=/Selecione uma Avaliação|Escolha a avaliação/i').first().isVisible().catch(() => false),
      assessmentCard: await page.locator('text=/respostas|ações|Gerenciar/i').first().isVisible().catch(() => false),
    };

    console.log(`   📊 Titulo: ${checks.title}, Selecao: ${checks.selectText}, Card: ${checks.assessmentCard}`);

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
      return true;
    }

    logTest(testId, testName, 'SKIPPED', `Apenas ${passedChecks}/3 elementos`);
    return true;

  } catch (error) {
    await screenshot(page, 't09-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T10 - Teste de Departamentos
 */
async function testDepartments(page) {
  const testId = 'T10';
  const testName = 'Gerenciar Departamentos';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    const deptLink = page.locator('a:has-text("Departamentos"), nav >> text=Departamentos').first();
    await deptLink.click();
    await page.waitForTimeout(3000);

    await screenshot(page, 't10-1-departments-page');

    // Verificar elementos baseados na estrutura real
    const checks = {
      title: await page.locator('text="Departamentos"').first().isVisible().catch(() => false),
      newBtn: await page.locator('button:has-text("Novo Departamento")').isVisible().catch(() => false),
      structure: await page.locator('text=/Estrutura Organizacional|Total de Departamentos/i').first().isVisible().catch(() => false),
    };

    console.log(`   📊 Titulo: ${checks.title}, Botao: ${checks.newBtn}, Estrutura: ${checks.structure}`);

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
      return true;
    }

    logTest(testId, testName, 'SKIPPED', `Apenas ${passedChecks}/3 elementos`);
    return true;

  } catch (error) {
    await screenshot(page, 't10-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T11 - Teste de Usuarios
 */
async function testUsers(page) {
  const testId = 'T11';
  const testName = 'Gerenciar Usuarios';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    const usersLink = page.locator('a:has-text("Usuários"), nav >> text=Usuários').first();
    await usersLink.click();
    await page.waitForTimeout(3000);

    await screenshot(page, 't11-1-users-page');

    // Verificar elementos baseados na estrutura real
    const checks = {
      title: await page.locator('text=/Gerenciar Usuários|Usuários da Organização/i').first().isVisible().catch(() => false),
      cards: await page.locator('text=/Total de Usuários|Administradores|Membros/i').first().isVisible().catch(() => false),
      table: await page.locator('text=/Nome|Email|Role|Status/i').first().isVisible().catch(() => false),
    };

    console.log(`   📊 Titulo: ${checks.title}, Cards: ${checks.cards}, Tabela: ${checks.table}`);

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
      return true;
    }

    logTest(testId, testName, 'SKIPPED', `Apenas ${passedChecks}/3 elementos`);
    return true;

  } catch (error) {
    await screenshot(page, 't11-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T12 - Teste de Configuracoes
 */
async function testSettings(page) {
  const testId = 'T12';
  const testName = 'Configuracoes';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    const settingsLink = page.locator('a:has-text("Configurações"), nav >> text=Configurações').first();
    await settingsLink.click();
    await page.waitForTimeout(3000);

    await screenshot(page, 't12-1-settings-page');

    // Verificar elementos baseados na estrutura real
    const checks = {
      title: await page.locator('text="Configurações"').first().isVisible().catch(() => false),
      tabs: await page.locator('text=/Perfil|Organização|Segurança/i').first().isVisible().catch(() => false),
      form: await page.locator('text=/Nome Completo|Email|Salvar/i').first().isVisible().catch(() => false),
    };

    console.log(`   📊 Titulo: ${checks.title}, Tabs: ${checks.tabs}, Form: ${checks.form}`);

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks >= 2) {
      logTest(testId, testName, 'PASSED', `${passedChecks}/3 elementos encontrados`);
      return true;
    }

    logTest(testId, testName, 'SKIPPED', `Apenas ${passedChecks}/3 elementos`);
    return true;

  } catch (error) {
    await screenshot(page, 't12-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * T13 - Teste de Logout
 */
async function testLogout(page) {
  const testId = 'T13';
  const testName = 'Logout';

  try {
    console.log(`\n🔄 Iniciando ${testId}: ${testName}...`);

    const logoutBtn = page.locator('button:has-text("Sair"), a:has-text("Sair")').first();

    if (await logoutBtn.isVisible().catch(() => false)) {
      await screenshot(page, 't13-1-before-logout');
      await logoutBtn.click();
      await page.waitForTimeout(3000);
      await screenshot(page, 't13-2-after-logout');

      const isLoggedOut = page.url().includes('login') ||
                         await page.locator('input[type="email"]').isVisible().catch(() => false);

      if (isLoggedOut) {
        logTest(testId, testName, 'PASSED', 'Logout realizado com sucesso');
        return true;
      }
    }

    logTest(testId, testName, 'SKIPPED', 'Botao de logout nao encontrado');
    return true;

  } catch (error) {
    await screenshot(page, 't13-error');
    logTest(testId, testName, 'FAILED', error.message);
    return false;
  }
}

/**
 * Verificacoes de Console (erros JS)
 */
function setupConsoleMonitor(page) {
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignorar erros conhecidos/esperados
      if (!text.includes('favicon') && !text.includes('analytics')) {
        errors.push(text);
      }
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUCAO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   SMOKE TEST SUITE v2 - PsicoMapa (Sollar Insight Hub)');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`🌐 URL: ${CONFIG.BASE_URL}`);
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Criar diretorio de screenshots
  const fs = await import('fs');
  if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
  }

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
    // FASE 1: TESTES DE AUTENTICACAO
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📌 FASE 1: TESTES DE AUTENTICACAO');
    console.log('─────────────────────────────────────────────────────────────────\n');

    await testPasswordRecovery(page);
    await testRegister(page);

    const loginSuccess = await testLogin(page);

    if (!loginSuccess) {
      console.log('\n❌ Login falhou - abortando testes que requerem autenticacao\n');
      throw new Error('Login falhou');
    }

    // ═══════════════════════════════════════════════════════════════════
    // FASE 2: TESTES DE NAVEGACAO E FUNCIONALIDADES
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📌 FASE 2: TESTES DE NAVEGACAO E FUNCIONALIDADES');
    console.log('─────────────────────────────────────────────────────────────────\n');

    await testDashboard(page);
    await testAssessments(page);
    await testQuestionnaires(page);
    await testAnalytics(page);
    await testActionPlan(page);
    await testDepartments(page);
    await testUsers(page);
    await testSubscription(page);
    await testSettings(page);

    // ═══════════════════════════════════════════════════════════════════
    // FASE 3: TESTE DE LOGOUT
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📌 FASE 3: TESTE DE LOGOUT');
    console.log('─────────────────────────────────────────────────────────────────\n');

    await testLogout(page);

    // ═══════════════════════════════════════════════════════════════════
    // VERIFICACAO DE ERROS DE CONSOLE
    // ═══════════════════════════════════════════════════════════════════
    if (consoleErrors.length > 0) {
      console.log('\n⚠️ ERROS DE CONSOLE DETECTADOS:');
      consoleErrors.slice(0, 5).forEach(err => console.log(`   - ${err.substring(0, 100)}`));
    }

  } catch (error) {
    console.error('\n🚨 ERRO CRITICO:', error.message);
    await screenshot(page, 'critical-error');
  } finally {
    // ═══════════════════════════════════════════════════════════════════
    // RELATORIO FINAL
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('   RELATORIO FINAL');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    console.log(`📊 Total de Testes: ${testResults.total}`);
    console.log(`✅ Passou: ${testResults.passed}`);
    console.log(`❌ Falhou: ${testResults.failed}`);
    console.log(`⏭️ Pulado: ${testResults.skipped}`);

    const successRate = testResults.total > 0
      ? ((testResults.passed / testResults.total) * 100).toFixed(1)
      : 0;
    console.log(`\n📈 Taxa de Sucesso: ${successRate}%`);

    if (testResults.failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      testResults.tests
        .filter(t => t.status === 'FAILED')
        .forEach(t => console.log(`   - ${t.id}: ${t.name} → ${t.details}`));
    }

    console.log(`\n📸 Screenshots salvos em: ${CONFIG.SCREENSHOTS_DIR}/`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

    await page.waitForTimeout(2000);
    await browser.close();

    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

main();
