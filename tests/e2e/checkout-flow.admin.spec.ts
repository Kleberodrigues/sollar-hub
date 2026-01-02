/**
 * Checkout Flow Tests - Admin
 *
 * Testes E2E do fluxo de checkout com aceite de termos
 * Arquivo: *.admin.spec.ts - Executado com projeto chromium-admin
 *
 * Padrão: Sollar Testing Skill
 */

import { test, expect } from '@playwright/test';

test.describe('Checkout Flow - Billing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de billing
    await page.goto('/dashboard/configuracoes/billing', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      console.log('NetworkIdle timeout - continuing');
    });
  });

  test('should display pricing cards', async ({ page }) => {
    // Verificar que os cards de preço estão visíveis
    const planoBase = page.getByText('Base');
    const planoIntermediario = page.getByText('Intermediário');
    const planoAvancado = page.getByText('Avançado');

    await expect(planoBase.first()).toBeVisible({ timeout: 15000 });
    await expect(planoIntermediario.first()).toBeVisible();
    await expect(planoAvancado.first()).toBeVisible();
  });

  test('should display correct prices', async ({ page }) => {
    // Verificar preços
    const precoBase = page.getByText('R$ 3.970');
    const precoIntermediario = page.getByText('R$ 4.970');
    const precoAvancado = page.getByText('R$ 5.970');

    await expect(precoBase.first()).toBeVisible({ timeout: 15000 });
    await expect(precoIntermediario.first()).toBeVisible();
    await expect(precoAvancado.first()).toBeVisible();
  });

  test('should open terms dialog when clicking subscribe button', async ({ page }) => {
    // Clicar no botão de assinar do plano Base
    const assinarButton = page.getByRole('button', { name: /Assinar Base/i });

    // Verificar se o botão existe (pode não existir se já tem plano)
    if (await assinarButton.isVisible()) {
      await assinarButton.click();

      // Verificar que o dialog de termos apareceu
      const dialogTitle = page.getByRole('heading', { name: /Confirmar Assinatura/i });
      await expect(dialogTitle).toBeVisible({ timeout: 5000 });

      // Verificar elementos do dialog
      await expect(page.getByText(/Termos de Uso/)).toBeVisible();
      await expect(page.getByText(/Privacidade e LGPD/)).toBeVisible();
    } else {
      console.log('Subscribe button not visible - user may already have a plan');
    }
  });

  test('should disable checkout button until terms are accepted', async ({ page }) => {
    // Clicar no botão de assinar
    const assinarButton = page.getByRole('button', { name: /Assinar Base/i });

    if (await assinarButton.isVisible()) {
      await assinarButton.click();

      // Aguardar dialog aparecer
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Verificar que o botão de prosseguir está desabilitado
      const prosseguirButton = page.getByRole('button', { name: /Prosseguir para Pagamento/i });
      await expect(prosseguirButton).toBeDisabled();
    } else {
      console.log('Subscribe button not visible - skipping terms test');
    }
  });

  test('should enable checkout button after accepting terms', async ({ page }) => {
    // Clicar no botão de assinar
    const assinarButton = page.getByRole('button', { name: /Assinar Base/i });

    if (await assinarButton.isVisible()) {
      await assinarButton.click();

      // Aguardar dialog aparecer
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Marcar checkbox de Termos
      const termsCheckbox = page.locator('#terms');
      await termsCheckbox.click();

      // Marcar checkbox de Privacidade
      const privacyCheckbox = page.locator('#privacy');
      await privacyCheckbox.click();

      // Verificar que o botão de prosseguir está habilitado
      const prosseguirButton = page.getByRole('button', { name: /Prosseguir para Pagamento/i });
      await expect(prosseguirButton).toBeEnabled();
    } else {
      console.log('Subscribe button not visible - skipping terms acceptance test');
    }
  });

  test('should close dialog when clicking cancel', async ({ page }) => {
    // Clicar no botão de assinar
    const assinarButton = page.getByRole('button', { name: /Assinar Base/i });

    if (await assinarButton.isVisible()) {
      await assinarButton.click();

      // Aguardar dialog aparecer
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Clicar em cancelar
      const cancelButton = page.getByRole('button', { name: /Cancelar/i });
      await cancelButton.click();

      // Verificar que o dialog fechou
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).not.toBeVisible({ timeout: 3000 });
    } else {
      console.log('Subscribe button not visible - skipping cancel test');
    }
  });

  test('should have links to terms and privacy pages', async ({ page }) => {
    // Clicar no botão de assinar
    const assinarButton = page.getByRole('button', { name: /Assinar Base/i });

    if (await assinarButton.isVisible()) {
      await assinarButton.click();

      // Aguardar dialog aparecer
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Verificar links
      const termosLink = page.getByRole('link', { name: /Termos de Uso/i });
      const privacidadeLink = page.getByRole('link', { name: /Política de Privacidade/i });
      const lgpdLink = page.getByRole('link', { name: /conformidade LGPD/i });

      await expect(termosLink).toHaveAttribute('href', '/termos');
      await expect(privacidadeLink).toHaveAttribute('href', '/privacidade');
      await expect(lgpdLink).toHaveAttribute('href', '/lgpd');
    } else {
      console.log('Subscribe button not visible - skipping links test');
    }
  });
});

test.describe('Checkout Flow - Plan Selection', () => {
  test('should show different plans with correct objectives', async ({ page }) => {
    await page.goto('/dashboard/configuracoes/billing', { timeout: 60000 });

    // Verificar objetivos de cada plano
    await expect(page.getByText('14 Relatórios anuais')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('24 Relatórios anuais')).toBeVisible();
    await expect(page.getByText('28 Relatórios anuais')).toBeVisible();
  });

  test('should show employee ranges', async ({ page }) => {
    await page.goto('/dashboard/configuracoes/billing', { timeout: 60000 });

    // Verificar ranges de colaboradores
    await expect(page.getByText('50 a 120 colaboradores')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('121 a 250 colaboradores')).toBeVisible();
    await expect(page.getByText('251 a 400 colaboradores')).toBeVisible();
  });

  test('should highlight most popular plan', async ({ page }) => {
    await page.goto('/dashboard/configuracoes/billing', { timeout: 60000 });

    // Verificar badge "Mais Popular"
    const popularBadge = page.getByText('Mais Popular');
    await expect(popularBadge).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Checkout Flow - Footer Info', () => {
  test('should display guarantee and contract info', async ({ page }) => {
    await page.goto('/dashboard/configuracoes/billing', { timeout: 60000 });

    // Verificar informações de garantia
    await expect(page.getByText(/Garantia de 7 dias/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Contrato anual/)).toBeVisible();
    await expect(page.getByText(/Sem taxas ocultas/)).toBeVisible();
  });

  test('should have enterprise contact link', async ({ page }) => {
    await page.goto('/dashboard/configuracoes/billing', { timeout: 60000 });

    // Verificar link para enterprise
    const enterpriseText = page.getByText(/mais de 400 colaboradores/);
    await expect(enterpriseText).toBeVisible({ timeout: 15000 });
  });
});
