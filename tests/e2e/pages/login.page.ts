/**
 * Login Page Object
 *
 * Encapsula interações com a página de login
 * Padrão: Sollar Testing Skill
 */

import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly googleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/senha|password/i);
    // Multiple selectors for submit button to handle different implementations
    this.submitButton = page.getByRole('button', { name: /entrar|login|acessar|submit|enviar/i })
      .or(page.locator('button[type="submit"]'));
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: /esquec|forgot/i });
    this.registerLink = page.getByRole('link', { name: /criar conta|cadastr|register/i });
    this.googleButton = page.getByRole('button', { name: /google/i });
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectLoaded() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async goToRegister() {
    await this.registerLink.click();
  }
}
