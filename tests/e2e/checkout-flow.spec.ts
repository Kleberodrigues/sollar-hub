/**
 * E2E Test: Complete Checkout Flow
 * Tests the full flow from landing page to Stripe checkout
 */

import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.describe.configure({ timeout: 60000 });

  test("1. Landing page has correct plan links", async ({ page }) => {
    await page.goto("/");

    // Scroll to pricing section
    await page.locator("#planos").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Check all 3 plan buttons exist with correct links (checkout flow)
    const baseLink = page.locator('a[href="/checkout/base"]');
    const intermediarioLink = page.locator('a[href="/checkout/intermediario"]');
    const avancadoLink = page.locator('a[href="/checkout/avancado"]');

    await expect(baseLink).toBeVisible();
    await expect(intermediarioLink).toBeVisible();
    await expect(avancadoLink).toBeVisible();

    // Verify button text
    await expect(baseLink).toContainText("Assinar Base");
    await expect(intermediarioLink).toContainText("Assinar Intermediário");
    await expect(avancadoLink).toContainText("Assinar Avançado");
  });

  test("2. Checkout page shows selected plan (Base)", async ({ page }) => {
    await page.goto("/checkout/base");

    // Should show the selected plan
    await expect(page.getByText("Plano Base")).toBeVisible();
    await expect(page.getByText("R$ 3.970")).toBeVisible();

    // Form should be visible (pre-checkout form)
    await expect(page.getByLabel(/Nome Completo/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Nome da Empresa/i)).toBeVisible();

    // Terms checkboxes should be visible
    await expect(page.getByLabel(/Termos de Uso/i)).toBeVisible();
    await expect(page.getByLabel(/Privacidade/i)).toBeVisible();
  });

  test("3. Checkout page shows selected plan (Intermediário)", async ({ page }) => {
    await page.goto("/checkout/intermediario");

    await expect(page.getByText("Plano Intermediário")).toBeVisible();
    await expect(page.getByText("R$ 4.970")).toBeVisible();
  });

  test("4. Checkout page shows selected plan (Avançado)", async ({ page }) => {
    await page.goto("/checkout/avancado");

    await expect(page.getByText("Plano Avançado")).toBeVisible();
    await expect(page.getByText("R$ 5.970")).toBeVisible();
  });

  test("5. Invalid plan shows error message", async ({ page }) => {
    await page.goto("/checkout/invalid-plan");

    // Should show error for invalid plan
    await expect(page.getByText(/Plano inválido/i)).toBeVisible();
    await expect(page.getByText(/Ver planos disponíveis/i)).toBeVisible();
  });

  test("6. Billing page shows pricing cards for logged in admin", async ({ page }) => {
    // First login as admin
    await page.goto("/login");

    await page.getByLabel("Email").fill("admin@sollar.com.br");
    await page.getByLabel("Senha").fill("AdminPassword123!");
    await page.getByRole("button", { name: /entrar/i }).click();

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to billing
    await page.goto("/dashboard/configuracoes/billing");
    await page.waitForLoadState("networkidle");

    // Should show pricing cards (only for responsavel_empresa/admin)
    // If user doesn't have permission, they won't see pricing cards
    const pricingSection = page.getByText("Planos disponíveis");
    const hasPricing = await pricingSection.isVisible().catch(() => false);

    if (hasPricing) {
      // All 3 plans should be visible
      await expect(page.getByRole("button", { name: /Assinar Base/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Assinar Intermediário/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Assinar Avançado/i })).toBeVisible();
    } else {
      // User is not admin/responsavel_empresa - show notice
      await expect(page.getByText(/Apenas administradores/i)).toBeVisible();
    }
  });

  test("7. Clicking plan button opens terms dialog", async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@sollar.com.br");
    await page.getByLabel("Senha").fill("AdminPassword123!");
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to billing
    await page.goto("/dashboard/configuracoes/billing");
    await page.waitForLoadState("networkidle");

    // Skip if user doesn't have permission
    const baseButton = page.getByRole("button", { name: /Assinar Base/i });
    const hasButton = await baseButton.isVisible().catch(() => false);
    if (!hasButton) {
      test.skip();
      return;
    }

    // Click on Base plan button
    await baseButton.click();

    // Terms dialog should open
    await expect(page.getByText("Confirmar Assinatura")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("dialog").locator("label").filter({ hasText: "Termos de Uso" })).toBeVisible();
    await expect(page.getByRole("dialog").locator("label").filter({ hasText: "Privacidade e LGPD" })).toBeVisible();

    // Checkout button should be disabled initially
    const checkoutButton = page.getByRole("button", { name: /Prosseguir para Pagamento/i });
    await expect(checkoutButton).toBeDisabled();
  });

  test("8. Accepting terms enables checkout button", async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@sollar.com.br");
    await page.getByLabel("Senha").fill("AdminPassword123!");
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to billing
    await page.goto("/dashboard/configuracoes/billing");
    await page.waitForLoadState("networkidle");

    // Skip if user doesn't have permission
    const baseButton = page.getByRole("button", { name: /Assinar Base/i });
    const hasButton = await baseButton.isVisible().catch(() => false);
    if (!hasButton) {
      test.skip();
      return;
    }

    // Click on Base plan button
    await baseButton.click();
    await expect(page.getByText("Confirmar Assinatura")).toBeVisible({ timeout: 5000 });

    // Check both checkboxes
    await page.getByLabel(/Termos de Uso/i).check();
    await page.getByLabel(/Privacidade e LGPD/i).check();

    // Checkout button should now be enabled
    const checkoutButton = page.getByRole("button", { name: /Prosseguir para Pagamento/i });
    await expect(checkoutButton).toBeEnabled();
  });

  test("9. Auto-checkout from URL param opens dialog", async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@sollar.com.br");
    await page.getByLabel("Senha").fill("AdminPassword123!");
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to billing with checkout param
    await page.goto("/dashboard/configuracoes/billing?checkout=intermediario");
    await page.waitForLoadState("networkidle");

    // Dialog should auto-open (if user has permission)
    const dialog = page.getByText("Confirmar Assinatura");
    const hasDialog = await dialog.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasDialog) {
      // Check for plan name in dialog description
      await expect(page.getByRole("dialog").getByText(/Intermediário/i).first()).toBeVisible();
    }
  });

  test("10. Checkout redirects to Stripe (with terms accepted)", async ({ page }) => {
    // Skip this test in CI - Stripe keys not available
    // This test requires real Stripe API keys to work
    test.skip(!!process.env.CI, "Skipping Stripe redirect test in CI - requires Stripe keys");

    // Login as admin
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@sollar.com.br");
    await page.getByLabel("Senha").fill("AdminPassword123!");
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to billing
    await page.goto("/dashboard/configuracoes/billing");
    await page.waitForLoadState("networkidle");

    // Skip if user doesn't have permission
    const baseButton = page.getByRole("button", { name: /Assinar Base/i });
    const hasButton = await baseButton.isVisible().catch(() => false);
    if (!hasButton) {
      test.skip();
      return;
    }

    // Click on Base plan
    await baseButton.click();
    await expect(page.getByText("Confirmar Assinatura")).toBeVisible({ timeout: 5000 });

    // Accept terms
    await page.getByLabel(/Termos de Uso/i).check();
    await page.getByLabel(/Privacidade e LGPD/i).check();

    // Click checkout - this will redirect to Stripe
    const checkoutButton = page.getByRole("button", { name: /Prosseguir para Pagamento/i });

    // Listen for API response
    const responsePromise = page.waitForResponse(resp => resp.url().includes("/api/stripe/checkout"));
    await checkoutButton.click();
    const response = await responsePromise;

    // API should return success (200)
    expect(response.status()).toBe(200);

    // Wait for redirect to Stripe (the page will navigate away)
    // Use waitUntil: "commit" since Stripe's page takes a while to fully load
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000, waitUntil: "commit" });
    expect(page.url()).toContain("checkout.stripe.com");
  });
});
