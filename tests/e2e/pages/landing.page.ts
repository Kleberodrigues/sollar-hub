/**
 * Landing Page Object
 *
 * Encapsula interações com a página inicial pública
 * Padrão: Sollar Testing Skill
 */

import { Page, Locator, expect } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly header: Locator;
  readonly logo: Locator;
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly ctaButton: Locator;
  readonly loginButton: Locator;
  readonly featuresSection: Locator;
  readonly footer: Locator;

  // Navigation
  readonly navLinks: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header').first();
    this.logo = page.locator('[data-testid="logo"], header img, header svg').first();
    this.heroSection = page.locator('[data-testid="hero"], section').first();
    this.heroTitle = page.getByRole('heading', { level: 1 });
    this.heroSubtitle = page.locator('[data-testid="hero-subtitle"], h1 + p, .hero p').first();
    this.ctaButton = page.getByRole('link', { name: /começar|start|experimente|demo/i });
    this.loginButton = page.getByRole('link', { name: /entrar|login|acessar/i });
    this.featuresSection = page.locator('[data-testid="features"], #features, section:has(h2)');
    this.footer = page.locator('footer');

    // Navigation
    this.navLinks = page.locator('nav a, header a');
    this.mobileMenuButton = page.getByRole('button', { name: /menu/i });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.header).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
  }

  async goToLogin() {
    await this.loginButton.click();
    await this.page.waitForURL(/login/);
  }

  async clickCTA() {
    await this.ctaButton.click();
  }

  async getNavLinksCount(): Promise<number> {
    return await this.navLinks.count();
  }

  async checkResponsive(viewport: { width: number; height: number }) {
    await this.page.setViewportSize(viewport);
    await expect(this.header).toBeVisible();
  }

  async hasFooter(): Promise<boolean> {
    return (await this.footer.count()) > 0;
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getMetaDescription(): Promise<string | null> {
    return await this.page.locator('meta[name="description"]').getAttribute('content');
  }
}
