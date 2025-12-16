/**
 * Authentication Setup
 *
 * Script de setup para criar storage states autenticados
 * Executar antes dos testes E2E que requerem autenticação
 *
 * Padrão: Sollar Testing Skill
 */

import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import path from 'path';
import fs from 'fs';

// Diretório para armazenar estados de autenticação
const AUTH_DIR = path.join(__dirname, '.auth');

// Arquivos de storage state
const USER_STATE = path.join(AUTH_DIR, 'user.json');
const ADMIN_STATE = path.join(AUTH_DIR, 'admin.json');
const MANAGER_STATE = path.join(AUTH_DIR, 'manager.json');

// Credenciais de teste (definir via variáveis de ambiente)
const USERS = {
  user: {
    email: process.env.TEST_USER_EMAIL || 'test@sollar.com.br',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    statePath: USER_STATE,
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@sollar.com.br',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!',
    statePath: ADMIN_STATE,
  },
  manager: {
    email: process.env.TEST_MANAGER_EMAIL || 'manager@sollar.com.br',
    password: process.env.TEST_MANAGER_PASSWORD || 'ManagerPassword123!',
    statePath: MANAGER_STATE,
  },
};

/**
 * Setup de autenticação para um usuário específico
 */
async function authenticateUser(
  baseURL: string,
  email: string,
  password: string,
  statePath: string
): Promise<boolean> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Authenticating ${email}...`);

    // Navegar para login
    await page.goto(`${baseURL}/login`);
    await page.waitForLoadState('networkidle');

    // Preencher formulário
    const loginPage = new LoginPage(page);
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.submit();

    // Aguardar redirecionamento para dashboard
    await page.waitForURL(/dashboard/, { timeout: 30000 });

    // Salvar storage state
    await context.storageState({ path: statePath });
    console.log(`✅ Authentication saved to ${statePath}`);

    return true;
  } catch (error) {
    console.error(`❌ Authentication failed for ${email}:`, error);
    return false;
  } finally {
    await browser.close();
  }
}

/**
 * Criar storage state mock para testes sem autenticação real
 */
function createMockStorageState(statePath: string, email: string): void {
  const mockState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3000',
        localStorage: [
          {
            name: 'mock-user',
            value: JSON.stringify({ email, role: email.includes('admin') ? 'admin' : 'user' }),
          },
        ],
      },
    ],
  };
  fs.writeFileSync(statePath, JSON.stringify(mockState, null, 2));
  console.log(`📝 Created mock storage state: ${statePath}`);
}

/**
 * Global setup - executado antes de todos os testes
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  const skipAuth = process.env.SKIP_AUTH_SETUP === 'true';

  // Criar diretório de autenticação
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  console.log('\n🔐 Setting up authentication states...\n');

  // Se SKIP_AUTH_SETUP=true, criar storage states mock
  if (skipAuth) {
    console.log('⚡ SKIP_AUTH_SETUP=true - Creating mock storage states...\n');
    createMockStorageState(USERS.user.statePath, USERS.user.email);
    createMockStorageState(USERS.admin.statePath, USERS.admin.email);
    createMockStorageState(USERS.manager.statePath, USERS.manager.email);
    console.log('\n✅ Mock authentication setup complete: 3/3 users\n');
    return;
  }

  // Autenticar cada tipo de usuário
  const results = await Promise.allSettled([
    authenticateUser(baseURL, USERS.user.email, USERS.user.password, USERS.user.statePath),
    authenticateUser(baseURL, USERS.admin.email, USERS.admin.password, USERS.admin.statePath),
    authenticateUser(baseURL, USERS.manager.email, USERS.manager.password, USERS.manager.statePath),
  ]);

  // Reportar resultados
  const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`\n✅ Authentication setup complete: ${success}/${results.length} users\n`);

  // Se nenhum usuário autenticou, ainda podemos continuar (testes públicos)
  if (success === 0) {
    console.warn('⚠️ No users authenticated - only public tests will work');
  }
}

export default globalSetup;

/**
 * Exportar caminhos para uso nos testes
 */
export { USER_STATE, ADMIN_STATE, MANAGER_STATE, USERS };
