import { chromium } from 'playwright';

const BASE_URL = 'https://psicomapa.cloud';
const EMAIL = process.env.PROD_TEST_EMAIL || '';
const PASSWORD = process.env.PROD_TEST_PASSWORD || '';

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function pass(test) {
  results.passed.push(test);
  log('✅', test);
}

function fail(test, reason) {
  results.failed.push({ test, reason });
  log('❌', `${test}: ${reason}`);
}

function warn(test, reason) {
  results.warnings.push({ test, reason });
  log('⚠️', `${test}: ${reason}`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       AUDITORIA COMPLETA DE PRODUÇÃO - PsicoMapa');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🌐 URL: ${BASE_URL}`);
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // ═══════════════════════════════════════════════════════════
    // 1. LANDING PAGE & NAVIGATION
    // ═══════════════════════════════════════════════════════════
    console.log('\n📄 1. LANDING PAGE & NAVEGAÇÃO\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Check page loads
    const title = await page.title();
    if (title && title.length > 0) {
      pass(`Landing page carrega (título: ${title.substring(0, 50)}...)`);
    } else {
      fail('Landing page', 'Título vazio');
    }

    // Check HTTPS
    if (page.url().startsWith('https://')) {
      pass('HTTPS ativo');
    } else {
      fail('HTTPS', 'Site não usa HTTPS');
    }

    // Test navigation links
    const navLinks = [
      { name: 'Para quem é', href: '/#para-quem' },
      { name: 'Quem Somos', href: '/#quem-somos' },
      { name: 'Como funciona', href: '/#como-funciona' },
      { name: 'Planos', href: '/#planos' },
      { name: 'Blog', href: '/blog' },
    ];

    for (const link of navLinks) {
      const linkEl = page.locator(`a:has-text("${link.name}")`).first();
      const exists = await linkEl.isVisible().catch(() => false);
      if (exists) {
        pass(`Link navegação: ${link.name}`);
      } else {
        fail(`Link navegação: ${link.name}`, 'Não encontrado');
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 2. BLOG - SHARE BUTTONS REMOVED
    // ═══════════════════════════════════════════════════════════
    console.log('\n📝 2. BLOG\n');

    await page.goto(`${BASE_URL}/blog`, { waitUntil: 'networkidle' });

    // Check blog loads
    const blogTitle = page.locator('h1');
    if (await blogTitle.isVisible()) {
      pass('Página do blog carrega');
    } else {
      fail('Página do blog', 'Não carregou');
    }

    // Click on first article
    const firstArticle = page.locator('article').first();
    await firstArticle.click();
    await page.waitForTimeout(2000);

    if (page.url().includes('/blog/') && !page.url().endsWith('/blog')) {
      pass('Navegação para artigo funciona');

      // Check share buttons are GONE
      const shareSection = page.locator('text=Compartilhe este artigo');
      const shareExists = await shareSection.isVisible().catch(() => false);
      if (!shareExists) {
        pass('Botões de compartilhamento removidos');
      } else {
        fail('Botões de compartilhamento', 'Ainda visíveis');
      }
    } else {
      fail('Navegação blog', 'Não navegou para artigo');
    }

    // ═══════════════════════════════════════════════════════════
    // 3. PUBLIC PAGES
    // ═══════════════════════════════════════════════════════════
    console.log('\n🌐 3. PÁGINAS PÚBLICAS\n');

    const publicPages = [
      { path: '/contato', name: 'Contato' },
      { path: '/sobre', name: 'Sobre' },
      { path: '/privacidade', name: 'Privacidade' },
      { path: '/termos', name: 'Termos' },
      { path: '/lgpd', name: 'LGPD' },
      { path: '/login', name: 'Login' },
      { path: '/api-docs', name: 'API Docs' },
    ];

    for (const pg of publicPages) {
      try {
        const response = await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (response && response.status() === 200) {
          pass(`Página ${pg.name} (${pg.path})`);
        } else if (response && response.status() === 404) {
          fail(`Página ${pg.name}`, '404 Not Found');
        } else {
          warn(`Página ${pg.name}`, `Status: ${response?.status()}`);
        }
      } catch (e) {
        fail(`Página ${pg.name}`, e.message);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 4. CHECKOUT FLOW
    // ═══════════════════════════════════════════════════════════
    console.log('\n💳 4. CHECKOUT STRIPE\n');

    // Test checkout page loads
    const plans = ['base', 'intermediario', 'avancado'];
    for (const plan of plans) {
      try {
        const response = await page.goto(`${BASE_URL}/checkout/${plan}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (response && response.status() === 200) {
          pass(`Checkout ${plan} carrega`);
        } else {
          fail(`Checkout ${plan}`, `Status: ${response?.status()}`);
        }
      } catch (e) {
        fail(`Checkout ${plan}`, e.message);
      }
    }

    // Test cancel page
    try {
      const response = await page.goto(`${BASE_URL}/checkout/cancelado?plan=base`, { waitUntil: 'domcontentloaded' });
      if (response && response.status() === 200) {
        const cancelText = page.locator('text=Pagamento Cancelado');
        if (await cancelText.isVisible()) {
          pass('Página de cancelamento funciona');
        } else {
          warn('Página de cancelamento', 'Carregou mas sem texto esperado');
        }
      } else {
        fail('Página de cancelamento', `Status: ${response?.status()}`);
      }
    } catch (e) {
      fail('Página de cancelamento', e.message);
    }

    // ═══════════════════════════════════════════════════════════
    // 5. AUTHENTICATION
    // ═══════════════════════════════════════════════════════════
    console.log('\n🔐 5. AUTENTICAÇÃO\n');

    if (!EMAIL || !PASSWORD) {
      warn('Teste de login', 'Credenciais não configuradas (PROD_TEST_EMAIL/PASSWORD)');
    } else {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      // Fill login form
      await page.fill('input[type="email"]', EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');

      try {
        await page.waitForURL(/dashboard/, { timeout: 15000 });
        pass('Login funciona');

        // ═══════════════════════════════════════════════════════════
        // 6. DASHBOARD FEATURES
        // ═══════════════════════════════════════════════════════════
        console.log('\n📊 6. DASHBOARD\n');

        // Check dashboard pages
        const dashboardPages = [
          { path: '/dashboard', name: 'Dashboard Home' },
          { path: '/dashboard/assessments', name: 'Avaliações' },
          { path: '/dashboard/analytics', name: 'Analytics' },
          { path: '/dashboard/reports', name: 'Relatórios' },
          { path: '/dashboard/users', name: 'Usuários' },
          { path: '/dashboard/settings', name: 'Configurações' },
        ];

        for (const dp of dashboardPages) {
          try {
            const response = await page.goto(`${BASE_URL}${dp.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
            if (response && response.status() === 200) {
              pass(`Dashboard: ${dp.name}`);
            } else if (response && response.status() === 307 || response?.status() === 302) {
              warn(`Dashboard: ${dp.name}`, 'Redirecionado (pode ser permissão)');
            } else {
              fail(`Dashboard: ${dp.name}`, `Status: ${response?.status()}`);
            }
          } catch (e) {
            fail(`Dashboard: ${dp.name}`, e.message);
          }
        }

        // ═══════════════════════════════════════════════════════════
        // 7. FORM FUNCTIONALITY
        // ═══════════════════════════════════════════════════════════
        console.log('\n📋 7. FORMULÁRIOS\n');

        // Check if we can create assessment
        await page.goto(`${BASE_URL}/dashboard/assessments`, { waitUntil: 'networkidle' });
        const newAssessmentBtn = page.locator('button:has-text("Nova"), button:has-text("Criar")').first();
        if (await newAssessmentBtn.isVisible().catch(() => false)) {
          pass('Botão criar avaliação visível');
        } else {
          warn('Botão criar avaliação', 'Não encontrado (pode ser vazio)');
        }

      } catch (e) {
        fail('Login', `Falhou: ${e.message}`);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 8. API HEALTH CHECKS
    // ═══════════════════════════════════════════════════════════
    console.log('\n🔧 8. APIs & BACKEND\n');

    const apiEndpoints = [
      { path: '/api/health', name: 'Health Check' },
    ];

    for (const api of apiEndpoints) {
      try {
        const response = await page.goto(`${BASE_URL}${api.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        if (response && response.status() === 200) {
          pass(`API: ${api.name}`);
        } else {
          fail(`API: ${api.name}`, `Status: ${response?.status()}`);
        }
      } catch (e) {
        fail(`API: ${api.name}`, e.message);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 9. SECURITY HEADERS
    // ═══════════════════════════════════════════════════════════
    console.log('\n🛡️ 9. SEGURANÇA\n');

    const secResponse = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const headers = secResponse.headers();

    // Check security headers
    const securityHeaders = [
      { header: 'x-frame-options', name: 'X-Frame-Options' },
      { header: 'x-content-type-options', name: 'X-Content-Type-Options' },
      { header: 'strict-transport-security', name: 'HSTS' },
    ];

    for (const sh of securityHeaders) {
      if (headers[sh.header]) {
        pass(`Header: ${sh.name}`);
      } else {
        warn(`Header: ${sh.name}`, 'Não configurado');
      }
    }

    // Check for exposed secrets in page
    const pageContent = await page.content();
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]+/,
      /sk_test_[a-zA-Z0-9]+/,
      /supabase.*service.*role/i,
    ];

    let secretsFound = false;
    for (const pattern of secretPatterns) {
      if (pattern.test(pageContent)) {
        fail('Segurança', `Possível segredo exposto: ${pattern}`);
        secretsFound = true;
      }
    }
    if (!secretsFound) {
      pass('Nenhum segredo exposto no HTML');
    }

    // ═══════════════════════════════════════════════════════════
    // 10. CONSOLE ERRORS
    // ═══════════════════════════════════════════════════════════
    console.log('\n🖥️ 10. ERROS DE CONSOLE\n');

    if (consoleErrors.length === 0) {
      pass('Nenhum erro de console');
    } else {
      for (const err of consoleErrors.slice(0, 5)) {
        warn('Console error', err.substring(0, 100));
      }
      if (consoleErrors.length > 5) {
        warn('Console errors', `+${consoleErrors.length - 5} erros adicionais`);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 11. MOBILE RESPONSIVENESS
    // ═══════════════════════════════════════════════════════════
    console.log('\n📱 11. RESPONSIVIDADE\n');

    await context.close();
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Check mobile menu
    const mobileMenuBtn = mobilePage.locator('button[aria-label*="menu"], button:has(svg)').first();
    if (await mobileMenuBtn.isVisible().catch(() => false)) {
      pass('Menu mobile visível');
    } else {
      warn('Menu mobile', 'Não encontrado');
    }

    await mobilePage.screenshot({ path: './screenshots/audit-mobile.png' });
    pass('Screenshot mobile salvo');

    await mobileContext.close();

  } catch (error) {
    fail('Execução geral', error.message);
  } finally {
    await browser.close();
  }

  // ═══════════════════════════════════════════════════════════
  // RELATÓRIO FINAL
  // ═══════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    RELATÓRIO FINAL');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`✅ PASSOU: ${results.passed.length}`);
  console.log(`⚠️ AVISOS: ${results.warnings.length}`);
  console.log(`❌ FALHOU: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n🚨 FALHAS CRÍTICAS:');
    results.failed.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.test}`);
      console.log(`      → ${f.reason}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️ AVISOS:');
    results.warnings.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w.test}: ${w.reason}`);
    });
  }

  const score = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100);
  console.log(`\n📊 SCORE: ${score}%`);

  if (score >= 90) {
    console.log('🎉 Sistema pronto para produção!');
  } else if (score >= 70) {
    console.log('⚠️ Sistema funcional mas com problemas a resolver');
  } else {
    console.log('🚨 Sistema com problemas críticos');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

main();
