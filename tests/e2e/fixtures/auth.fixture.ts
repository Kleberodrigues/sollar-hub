/**
 * Authentication Fixtures
 *
 * Fixtures para autenticação nos testes E2E
 * Padrão: Sollar Testing Skill
 */

import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

// Credenciais de teste (usar variáveis de ambiente em produção)
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@sollar.com.br',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@sollar.com.br',
  password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!',
};

// Tipos para fixtures customizados
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

/**
 * Função auxiliar para fazer login
 */
async function performLogin(page: Page, email: string, password: string): Promise<boolean> {
  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    // Aguardar redirecionamento para dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    return true;
  } catch {
    console.warn(`Login failed for ${email}`);
    return false;
  }
}

/**
 * Extended test com fixtures de autenticação
 */
export const test = base.extend<AuthFixtures>({
  // Página já autenticada como usuário comum
  authenticatedPage: async ({ page }, use) => {
    const success = await performLogin(page, TEST_USER.email, TEST_USER.password);

    if (!success) {
      // Se login falhar, ainda podemos usar a página mas marcar como skip
      console.warn('User authentication failed - test may be skipped');
    }

    await use(page);
  },

  // Página já autenticada como admin
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const success = await performLogin(page, TEST_ADMIN.email, TEST_ADMIN.password);

    if (!success) {
      console.warn('Admin authentication failed - test may be skipped');
    }

    await use(page);
    await context.close();
  },

  // LoginPage fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // DashboardPage fixture
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper para verificar se autenticação está disponível
 */
export function isAuthAvailable(): boolean {
  return !!(TEST_USER.email && TEST_USER.password);
}

/**
 * Helper para pular teste se autenticação não estiver disponível
 */
export function skipIfNoAuth(testFn: typeof test) {
  if (!isAuthAvailable()) {
    return testFn.skip;
  }
  return testFn;
}

/**
 * Storage state para reutilizar sessão
 */
export const STORAGE_STATE_PATH = 'tests/e2e/.auth/user.json';
export const ADMIN_STORAGE_STATE_PATH = 'tests/e2e/.auth/admin.json';

/**
 * Setup de autenticação para usar com storageState
 */
export async function setupAuthState(page: Page, email: string, password: string, statePath: string) {
  await performLogin(page, email, password);
  await page.context().storageState({ path: statePath });
}
