/**
 * Dashboard Page Object
 *
 * Encapsula interações com o dashboard principal
 * Padrão: Sollar Testing Skill
 */

import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly sidebar: Locator;
  readonly mainContent: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  // Navigation links
  readonly homeLink: Locator;
  readonly assessmentsLink: Locator;
  readonly questionnairesLink: Locator;
  readonly analyticsLink: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByRole('heading', { level: 1 });
    this.sidebar = page.locator('[data-testid="sidebar"], aside, nav').first();
    this.mainContent = page.locator('main, [role="main"]').first();
    this.userMenu = page.getByTestId('user-menu').or(page.locator('[data-testid="user-avatar"]'));
    this.logoutButton = page.getByRole('button', { name: /sair|logout/i });

    // Navigation
    this.homeLink = page.getByRole('link', { name: /início|home|dashboard/i });
    this.assessmentsLink = page.getByRole('link', { name: /diagnóstico|assessment/i });
    this.questionnairesLink = page.getByRole('link', { name: /questionário/i });
    this.analyticsLink = page.getByRole('link', { name: /análise|analytics|relatório/i });
    this.settingsLink = page.getByRole('link', { name: /config|settings/i });
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.mainContent).toBeVisible();
  }

  async expectAuthenticated() {
    // Se chegou no dashboard, está autenticado
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async expectRedirectToLogin() {
    await expect(this.page).toHaveURL(/login/);
  }

  async navigateToAssessments() {
    await this.assessmentsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToQuestionnaires() {
    await this.questionnairesLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToAnalytics() {
    await this.analyticsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToSettings() {
    await this.settingsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}
