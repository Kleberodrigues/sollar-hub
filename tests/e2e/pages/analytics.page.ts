/**
 * Analytics Page Object
 *
 * Encapsula interações com a página de analytics
 * Padrão: Sollar Testing Skill
 */

import { Page, Locator, expect } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly dashboard: Locator;
  readonly metricsGrid: Locator;
  readonly riskLevelsCard: Locator;
  readonly categoryChartCard: Locator;
  readonly questionDistributionCard: Locator;
  readonly emptyState: Locator;
  readonly exportButtons: Locator;

  // Metric cards
  readonly participantsCard: Locator;
  readonly questionsCard: Locator;
  readonly completionRateCard: Locator;
  readonly lastResponseCard: Locator;

  // Export buttons
  readonly exportPdfButton: Locator;
  readonly exportCsvResponsesButton: Locator;
  readonly exportCsvSummaryButton: Locator;

  // Assessment selector
  readonly assessmentSelector: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main containers
    this.dashboard = page.getByTestId('analytics-dashboard');
    this.metricsGrid = page.getByTestId('analytics-metrics-grid');
    this.riskLevelsCard = page.getByTestId('analytics-risk-levels');
    this.categoryChartCard = page.getByTestId('analytics-category-chart');
    this.questionDistributionCard = page.getByTestId('analytics-question-distribution');
    this.emptyState = page.getByTestId('analytics-empty-state');
    this.exportButtons = page.getByTestId('export-buttons');

    // Metric cards
    this.participantsCard = page.getByTestId('metric-card-participantes');
    this.questionsCard = page.getByTestId('metric-card-perguntas');
    this.completionRateCard = page.getByTestId('metric-card-taxa-de-conclusão');
    this.lastResponseCard = page.getByTestId('metric-card-última-resposta');

    // Export buttons
    this.exportPdfButton = page.getByTestId('export-pdf-button');
    this.exportCsvResponsesButton = page.getByTestId('export-responses-csv-button');
    this.exportCsvSummaryButton = page.getByTestId('export-summary-csv-button');

    // Selector
    this.assessmentSelector = page.getByRole('combobox').or(page.locator('select'));
  }

  async goto(assessmentId?: string) {
    const url = assessmentId
      ? `/dashboard/analytics?assessment=${assessmentId}`
      : '/dashboard/analytics';
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    // Aguarda dashboard ou empty state
    const isDashboardVisible = await this.dashboard.isVisible().catch(() => false);
    const isEmptyStateVisible = await this.emptyState.isVisible().catch(() => false);

    expect(isDashboardVisible || isEmptyStateVisible).toBeTruthy();
  }

  async expectHasData() {
    await expect(this.metricsGrid).toBeVisible();
    await expect(this.riskLevelsCard).toBeVisible();
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async selectAssessment(index: number) {
    await this.assessmentSelector.selectOption({ index });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async exportPdf() {
    await this.exportPdfButton.click();
  }

  async exportCsvResponses() {
    await this.exportCsvResponsesButton.click();
  }

  async exportCsvSummary() {
    await this.exportCsvSummaryButton.click();
  }

  async getParticipantsCount(): Promise<string> {
    const text = await this.participantsCard.textContent();
    return text || '0';
  }

  async getCompletionRate(): Promise<string> {
    const text = await this.completionRateCard.textContent();
    return text || '0%';
  }

  async getRiskCategoriesCount(): Promise<number> {
    const categories = await this.riskLevelsCard.locator('[data-testid^="risk-category-"]').count();
    return categories;
  }
}
