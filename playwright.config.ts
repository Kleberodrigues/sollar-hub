import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Sollar Insight Hub
 *
 * Projects:
 * - setup: Cria storage states de autenticação
 * - chromium: Testes públicos (sem autenticação)
 * - chromium-auth: Testes autenticados (usuário comum)
 * - chromium-admin: Testes autenticados (admin)
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI - Reduzido para 4 workers
  workers: process.env.CI ? 1 : 4,

  // Reporter to use
  reporter: 'html',

  // Timeout aumentado para 60s
  timeout: 60000,

  // Global setup para autenticação
  globalSetup: process.env.SKIP_AUTH_SETUP ? undefined : './tests/e2e/auth.setup.ts',

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Timeout de navegação aumentado para queries Supabase remotas
    navigationTimeout: 45000,
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - cria estados de autenticação
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      teardown: 'cleanup',
    },

    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /auth\.cleanup\.ts/,
    },

    // Testes públicos (sem autenticação)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/.*\.auth\.spec\.ts/, /.*\.admin\.spec\.ts/],
    },

    // Testes autenticados como usuário comum
    {
      name: 'chromium-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/e2e/.auth/user.json',
      },
      testMatch: /.*\.auth\.spec\.ts/,
      dependencies: ['setup'],
    },

    // Testes autenticados como admin
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/e2e/.auth/admin.json',
      },
      testMatch: /.*\.admin\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
