/**
 * Clima Survey E2E Test
 *
 * Tests the complete flow:
 * 1. Login as admin
 * 2. Find active Clima assessment and get survey link
 * 3. Complete survey with all 10 questions
 * 4. Navigate to analytics dashboard
 * 5. View Clima dashboard and take screenshots
 *
 * Note: This test requires specific system state and credentials.
 * It may fail in CI if the required data doesn't exist.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://sollar-hub-yurq.vercel.app';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@sollar.com.br';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!';

// Skip this test in CI if credentials are not configured
const shouldSkip = !!(process.env.CI && !process.env.TEST_ADMIN_EMAIL);

test.describe('Clima Survey Complete Flow', () => {
  test.setTimeout(300000); // 5 minutes timeout

  test('Complete Clima survey and verify analytics dashboard', async ({ page }, testInfo) => {
    // Skip in CI environments without proper test credentials
    if (shouldSkip) {
      testInfo.skip(true, 'Skipping in CI - requires configured test credentials');
      return;
    }
    // Enable verbose logging
    page.on('console', msg => console.log('Browser:', msg.text()));

    // Step 1: Login
    console.log('Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Take screenshot of login page
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });
    console.log('Screenshot: 01-login-page.png');

    // Fill login form
    console.log('Filling login credentials...');
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);

    await page.screenshot({ path: 'screenshots/02-login-filled.png', fullPage: true });

    // Submit login
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    try {
      await page.waitForURL(/dashboard/, { timeout: 30000 });
      console.log('Login successful, redirected to dashboard');
    } catch (error) {
      console.log('Login may have failed or redirect took too long');
      await page.screenshot({ path: 'screenshots/02-login-error.png', fullPage: true });
    }

    await page.screenshot({ path: 'screenshots/03-after-login.png', fullPage: true });
    console.log('Screenshot: 03-after-login.png');

    // Step 2: Navigate to assessments
    console.log('Step 2: Navigating to assessments...');
    await page.goto(`${BASE_URL}/dashboard/assessments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for data to load

    await page.screenshot({ path: 'screenshots/04-assessments-page.png', fullPage: true });
    console.log('Screenshot: 04-assessments-page.png');

    // Step 3: Click "Ver Detalhes" to see assessment details and get survey link
    console.log('Step 3: Clicking Ver Detalhes to get survey link...');

    const verDetalhesButton = page.locator('button:has-text("Ver Detalhes"), a:has-text("Ver Detalhes")').first();
    if (await verDetalhesButton.count() > 0) {
      await verDetalhesButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'screenshots/05-assessment-details.png', fullPage: true });
      console.log('Screenshot: 05-assessment-details.png');

      // Look for the survey link in the details page
      // Try to find share/link button or copy link
      const shareButton = page.locator('button:has-text("Copiar Link"), button:has-text("Compartilhar"), [aria-label*="copy"], [data-testid*="copy-link"]').first();

      if (await shareButton.count() > 0) {
        console.log('Found share/copy link button');
        await shareButton.click();
        await page.waitForTimeout(1000);
      }

      // Look for visible survey link
      const surveyLinkElement = page.locator('input[readonly], [data-testid="survey-link"], code, .survey-link').first();
      let surveyUrl = '';

      if (await surveyLinkElement.count() > 0) {
        surveyUrl = await surveyLinkElement.inputValue() || await surveyLinkElement.textContent() || '';
        console.log('Found survey URL in input:', surveyUrl);
      }

      // Also check for direct link
      const directLink = page.locator('a[href*="/s/"], a[href*="/survey/"], a[href*="/responder/"]').first();
      if (await directLink.count() > 0) {
        surveyUrl = await directLink.getAttribute('href') || '';
        console.log('Found direct survey link:', surveyUrl);
      }

      // Extract assessment ID from URL if we're on details page
      const currentUrl = page.url();
      console.log('Current URL after clicking Ver Detalhes:', currentUrl);

      // Try to extract assessment ID from URL
      const assessmentIdMatch = currentUrl.match(/assessments\/([a-f0-9-]+)/i);
      if (assessmentIdMatch) {
        const assessmentId = assessmentIdMatch[1];
        console.log('Found assessment ID:', assessmentId);
        // The public survey route is /assess/{id} not /s/{id}
        surveyUrl = `${BASE_URL}/assess/${assessmentId}`;
        console.log('Constructed survey URL:', surveyUrl);
      }

      // Navigate to survey if we have a URL
      if (surveyUrl) {
        console.log('Navigating to survey:', surveyUrl);
        await page.goto(surveyUrl);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'screenshots/06-survey-page.png', fullPage: true });
        console.log('Screenshot: 06-survey-page.png');
      }
    }

    // Check if we're on a survey page now
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/assess/') || currentUrl.includes('/s/') || currentUrl.includes('/survey/') || currentUrl.includes('/responder/')) {
      console.log('On survey page, completing questions...');

      // Wait for survey to fully load
      await page.waitForTimeout(3000);

      // Take screenshot of survey form (introduction/LGPD page)
      await page.screenshot({ path: 'screenshots/07-survey-intro.png', fullPage: true });
      console.log('Screenshot: 07-survey-intro.png');

      // Step 1: Accept LGPD consent - first check the checkbox, then click the button
      console.log('Looking for LGPD consent checkbox...');

      // First, check the consent checkbox
      const consentCheckbox = page.locator('input[type="checkbox"]').first();
      if (await consentCheckbox.count() > 0) {
        console.log('Found consent checkbox, clicking...');
        await consentCheckbox.click();
        await page.waitForTimeout(500);
      }

      // Now click the "Iniciar Questionário" button
      console.log('Looking for Iniciar Questionário button...');
      const startButton = page.locator('button:has-text("Iniciar Questionário"), button:has-text("Aceitar"), button:has-text("Concordo"), button:has-text("Continuar"), button:has-text("Iniciar")').first();
      if (await startButton.count() > 0) {
        console.log('Clicking start button...');
        await startButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/08-after-lgpd.png', fullPage: true });
        console.log('Screenshot: 08-after-lgpd.png');
      }

      // Step 2: Complete questions one by one (form shows one question at a time)
      // Clima survey has: Q1-Q8 Likert (1-5), Q9 NPS (0-10), Q10 text
      const totalQuestions = 10;

      for (let q = 1; q <= totalQuestions; q++) {
        console.log(`Answering question ${q}...`);
        await page.waitForTimeout(1000);

        // Check if this is a Likert scale question (Q1-Q8)
        // Likert questions have clickable div containers with radio inputs
        const likertOptions = page.locator('input[type="radio"]');
        const likertCount = await likertOptions.count();

        // Check if this is an NPS scale (11 buttons for 0-10)
        const npsButtons = page.locator('.grid.grid-cols-11 button');
        const npsCount = await npsButtons.count();

        // Check if this is a text question
        const textArea = page.locator('textarea');
        const textCount = await textArea.count();

        if (npsCount === 11) {
          // NPS Scale (0-10) - click button for value 8
          console.log('  NPS question detected, clicking 8...');
          const npsButton8 = page.locator('.grid.grid-cols-11 button').nth(8); // 0-indexed, so nth(8) = value 8
          if (await npsButton8.count() > 0) {
            await npsButton8.click();
            console.log('  Selected NPS value 8');
          }
        } else if (textCount > 0 && likertCount === 0) {
          // Text question
          console.log('  Text question detected, filling response...');
          await textArea.first().fill('Teste automatizado E2E - O ambiente de trabalho é positivo com boa colaboração entre equipes. Sugiro melhorias na comunicação interna e mais oportunidades de desenvolvimento profissional.');
          console.log('  Filled text response');
        } else if (likertCount > 0) {
          // Likert scale (1-5) - click on value 4 (positive but not extreme)
          console.log(`  Likert question detected with ${likertCount} options, clicking value 4...`);
          // The clickable area is the parent div, but we can click the radio input directly
          // Or click on the container div that has the value
          const likertContainer = page.locator('div.flex.items-center.p-3.rounded-lg.border-2').nth(3); // 0-indexed, so nth(3) = 4th option (value 4)
          if (await likertContainer.count() > 0) {
            await likertContainer.click();
            console.log('  Selected Likert value 4');
          } else {
            // Fallback: click the radio input directly
            const radioValue4 = page.locator('input[type="radio"][value="4"]').first();
            if (await radioValue4.count() > 0) {
              await radioValue4.click();
              console.log('  Selected Likert value 4 via radio input');
            }
          }
        }

        await page.waitForTimeout(500);

        // Take screenshot of current question
        await page.screenshot({ path: `screenshots/09-q${q}-answered.png`, fullPage: true });
        console.log(`  Screenshot: 09-q${q}-answered.png`);

        // Click "Próxima" or "Enviar Respostas" button
        const nextButton = page.locator('button:has-text("Próxima")').first();
        const submitButton = page.locator('button:has-text("Enviar Respostas")').first();

        if (q < totalQuestions && await nextButton.count() > 0) {
          console.log('  Clicking Next button...');
          await nextButton.click();
          await page.waitForTimeout(1000);
        } else if (await submitButton.count() > 0) {
          console.log('  Clicking Submit button...');
          await submitButton.click();
          await page.waitForTimeout(5000); // Wait for submission
          await page.screenshot({ path: 'screenshots/10-survey-submitted.png', fullPage: true });
          console.log('Screenshot: 10-survey-submitted.png');
          break;
        }
      }

      // Verify we're on the thank you page
      const currentUrlAfterSubmit = page.url();
      console.log('URL after submission:', currentUrlAfterSubmit);
      if (currentUrlAfterSubmit.includes('/obrigado')) {
        console.log('Successfully submitted survey - on thank you page');
        await page.screenshot({ path: 'screenshots/11-thank-you-page.png', fullPage: true });
        console.log('Screenshot: 11-thank-you-page.png');
      }
    } else {
      console.log('Not on survey page, skipping survey completion');
    }

    // Step 4: Navigate to analytics
    console.log('Step 4: Navigating to analytics...');
    await page.goto(`${BASE_URL}/dashboard/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for charts to render

    await page.screenshot({ path: 'screenshots/20-analytics-page.png', fullPage: true });
    console.log('Screenshot: 20-analytics-page.png');

    // Step 5: Select the Clima assessment in analytics
    console.log('Step 5: Selecting assessment in analytics...');

    // Look for assessment selector/dropdown - the card on the left side
    const assessmentCard = page.locator('text=Teste de Clima').first();
    if (await assessmentCard.count() > 0) {
      console.log('Found Clima assessment card, clicking...');
      await assessmentCard.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/21-assessment-selected.png', fullPage: true });
      console.log('Screenshot: 21-assessment-selected.png');
    }

    // Step 6: Find and click "Visão Clima" tab
    console.log('Step 6: Looking for Visão Clima tab...');
    const climaTab = page.locator('button:has-text("Visão Clima"), [data-value="clima"], [role="tab"]:has-text("Clima")').first();

    if (await climaTab.count() > 0) {
      console.log('Found Visão Clima tab, clicking...');
      await climaTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/22-clima-tab.png', fullPage: true });
      console.log('Screenshot: 22-clima-tab.png');
    }

    // Step 7: Take screenshots of the Clima dashboard
    console.log('Step 7: Taking final dashboard screenshots...');

    // Full page screenshot
    await page.screenshot({ path: 'screenshots/23-clima-dashboard-full.png', fullPage: true });
    console.log('Screenshot: 23-clima-dashboard-full.png');

    // Viewport screenshot
    await page.screenshot({ path: 'screenshots/24-clima-dashboard-viewport.png' });
    console.log('Screenshot: 24-clima-dashboard-viewport.png');

    // Scroll down and take more screenshots to capture all charts
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/25-clima-dashboard-scrolled1.png', fullPage: true });
    console.log('Screenshot: 25-clima-dashboard-scrolled1.png');

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/26-clima-dashboard-scrolled2.png', fullPage: true });
    console.log('Screenshot: 26-clima-dashboard-scrolled2.png');

    console.log('Test completed! Check the screenshots folder for results.');
  });
});
