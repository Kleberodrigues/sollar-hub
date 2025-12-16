# Guia de Testes de Segurança

## Visão Geral

Este documento descreve estratégias e implementações de testes de segurança para o Sollar Insight Hub, focando em:
- Autenticação e Autorização
- Proteção contra XSS
- Proteção contra CSRF
- Validação de Dados
- LGPD/GDPR Compliance

---

## 1. Testes de Autenticação

### Configuração Base
```typescript
// tests/security/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Segurança de Autenticação', () => {
  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    await page.goto('/dashboard');

    // Deve redirecionar para página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('não deve permitir acesso a rotas protegidas sem token', async ({ context, page }) => {
    // Limpar cookies de autenticação
    await context.clearCookies();

    // Tentar acessar dashboard
    await page.goto('/dashboard/analytics');

    // Verificar redirecionamento
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve fazer logout e limpar session', async ({ page, context }) => {
    // TODO: Fazer login primeiro
    // await loginAsTestUser(page);

    // Verificar cookies de sessão existem
    const cookiesBefore = await context.cookies();
    expect(cookiesBefore.length).toBeGreaterThan(0);

    // Fazer logout
    await page.click('[data-testid="logout-button"]');

    // Verificar cookies foram limpos
    const cookiesAfter = await context.cookies();
    expect(cookiesAfter.filter(c => c.name.includes('auth')).length).toBe(0);
  });

  test('não deve expor tokens em URLs', async ({ page }) => {
    await page.goto('/dashboard');

    const url = page.url();
    expect(url).not.toContain('token=');
    expect(url).not.toContain('access_token=');
    expect(url).not.toContain('refresh_token=');
  });

  test('deve usar cookies HttpOnly para sessão', async ({ context, page }) => {
    // TODO: Fazer login
    // await loginAsTestUser(page);

    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));

    if (authCookie) {
      expect(authCookie.httpOnly).toBe(true);
      expect(authCookie.secure).toBe(true); // Em produção
    }
  });
});
```

---

## 2. Testes de Autorização

### Níveis de Acesso
```typescript
// tests/security/authorization.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Autorização e Controle de Acesso', () => {
  test('usuário comum não deve acessar painel admin', async ({ page }) => {
    // TODO: Login como usuário comum
    // await loginAsRegularUser(page);

    await page.goto('/dashboard/users');

    // Deve mostrar erro 403 ou redirecionar
    const has403 = await page.locator('text=/403|não autorizado/i').isVisible();
    const redirected = !page.url().includes('/dashboard/users');

    expect(has403 || redirected).toBe(true);
  });

  test('deve validar permissões antes de ações sensíveis', async ({ page }) => {
    // Tentar deletar usuário sem permissão
    const response = await page.request.delete('/api/users/123', {
      headers: {
        // Token sem permissões de admin
      }
    });

    expect(response.status()).toBe(403);
  });

  test('não deve permitir acesso a dados de outros usuários', async ({ page }) => {
    // TODO: Login como usuário A
    // await loginAsUser(page, 'user-a');

    // Tentar acessar dados do usuário B
    const response = await page.request.get('/api/users/user-b/responses');

    expect(response.status()).toBe(403);
  });
});
```

---

## 3. Testes de XSS (Cross-Site Scripting)

### Proteção contra Injeção de Scripts
```typescript
// tests/security/xss.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Proteção contra XSS', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '<svg/onload=alert("XSS")>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
  ];

  test('deve escapar scripts em inputs de formulário', async ({ page }) => {
    await page.goto('/assess/create');

    for (const payload of xssPayloads) {
      // Inserir payload malicioso no campo de título
      await page.fill('[name="title"]', payload);
      await page.click('button[type="submit"]');

      // Verificar se o script foi escapado e não executado
      const alerts = page.locator('text=/XSS/i');
      expect(await alerts.count()).toBe(0);

      // Verificar se o texto foi escapado no HTML
      const displayedText = await page.locator('[data-testid="assessment-title"]').textContent();
      expect(displayedText).not.toContain('<script>');
    }
  });

  test('deve sanitizar rich text em descrições', async ({ page }) => {
    await page.goto('/dashboard/assessments/new');

    const payload = '<p>Texto normal</p><script>alert("XSS")</script>';
    await page.fill('[name="description"]', payload);

    // Verificar que script foi removido mas HTML permitido permaneceu
    const content = await page.locator('[data-testid="preview"]').innerHTML();
    expect(content).toContain('<p>Texto normal</p>');
    expect(content).not.toContain('<script>');
  });

  test('não deve executar javascript em atributos', async ({ page }) => {
    await page.goto('/dashboard');

    // Tentar injetar JS em atributo de imagem
    await page.evaluate(() => {
      const img = document.createElement('img');
      img.src = 'javascript:alert("XSS")';
      document.body.appendChild(img);
    });

    // Verificar que alert não foi disparado
    page.on('dialog', dialog => {
      throw new Error('XSS dialog detected!');
    });

    await page.waitForTimeout(1000);
  });

  test('deve usar Content Security Policy', async ({ page }) => {
    const response = await page.goto('/');

    const cspHeader = response?.headers()['content-security-policy'];
    expect(cspHeader).toBeDefined();
    expect(cspHeader).toContain("script-src 'self'");
  });
});
```

---

## 4. Testes de CSRF (Cross-Site Request Forgery)

### Proteção contra Requisições Forjadas
```typescript
// tests/security/csrf.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Proteção contra CSRF', () => {
  test('deve exigir token CSRF em POST requests', async ({ page }) => {
    // Fazer login
    // TODO: await loginAsTestUser(page);

    // Tentar fazer POST sem token CSRF
    const response = await page.request.post('/api/assessments', {
      data: {
        title: 'Test Assessment',
        description: 'Test'
      }
    });

    // Deve rejeitar por falta de token CSRF
    expect([403, 419]).toContain(response.status());
  });

  test('deve validar origem da requisição', async ({ page, context }) => {
    // Fazer requisição de origem suspeita
    const response = await context.request.post('/api/assessments', {
      headers: {
        'Origin': 'https://malicious-site.com',
        'Referer': 'https://malicious-site.com'
      },
      data: { title: 'Malicious' }
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('tokens CSRF devem expirar', async ({ page }) => {
    // TODO: Obter token CSRF
    // const oldToken = await getCsrfToken(page);

    // Aguardar expiração (ex: 1 hora)
    // await page.waitForTimeout(3600000);

    // Tentar usar token expirado
    // const response = await makeRequestWithToken(oldToken);

    // expect(response.status()).toBe(419); // Token expirado
  });
});
```

---

## 5. Testes de Validação de Dados

### Input Validation e Sanitização
```typescript
// tests/security/validation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Validação de Dados', () => {
  test('deve validar formato de email', async ({ page }) => {
    await page.goto('/dashboard/users/new');

    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@.com',
      'user@example.',
    ];

    for (const email of invalidEmails) {
      await page.fill('[name="email"]', email);
      await page.click('button[type="submit"]');

      // Verificar mensagem de erro
      await expect(page.locator('text=/email inválido/i')).toBeVisible();
    }
  });

  test('deve rejeitar inputs muito longos', async ({ page }) => {
    await page.goto('/assess/create');

    const longTitle = 'A'.repeat(10000);
    await page.fill('[name="title"]', longTitle);
    await page.click('button[type="submit"]');

    // Verificar erro de tamanho máximo
    await expect(page.locator('text=/muito longo|máximo/i')).toBeVisible();
  });

  test('deve validar tipos de dados em APIs', async ({ page }) => {
    const response = await page.request.post('/api/assessments', {
      data: {
        title: 123, // Deveria ser string
        start_date: 'não-é-data', // Formato inválido
        status: 'invalid-status', // Status não permitido
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  test('deve prevenir SQL injection', async ({ page }) => {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users--",
      "1' UNION SELECT * FROM users--",
    ];

    for (const payload of sqlPayloads) {
      const response = await page.request.get(`/api/assessments?search=${payload}`);

      // Não deve retornar erro de SQL
      expect(response.status()).not.toBe(500);

      const body = await response.json();
      expect(body).not.toContain('SQL');
      expect(body).not.toContain('syntax error');
    }
  });
});
```

---

## 6. Testes de Compliance LGPD

### Conformidade com Proteção de Dados
```typescript
// tests/security/lgpd.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Compliance LGPD/GDPR', () => {
  test('deve exibir política de privacidade acessível', async ({ page }) => {
    await page.goto('/');

    const privacyLink = page.locator('a[href*="privacidade"]');
    await expect(privacyLink).toBeVisible();

    await privacyLink.click();
    await expect(page).toHaveURL(/privacidade/);

    // Verificar conteúdo mínimo da política
    await expect(page.locator('text=/coleta de dados/i')).toBeVisible();
    await expect(page.locator('text=/direitos do titular/i')).toBeVisible();
  });

  test('deve permitir opt-out de cookies não essenciais', async ({ page, context }) => {
    await page.goto('/');

    // Verificar banner de cookies
    const cookieBanner = page.locator('[data-testid="cookie-consent"]');
    if (await cookieBanner.isVisible()) {
      // Rejeitar cookies não essenciais
      await page.click('button:has-text("Rejeitar")');

      // Verificar que apenas cookies essenciais foram definidos
      const cookies = await context.cookies();
      const trackingCookies = cookies.filter(c =>
        c.name.includes('_ga') || c.name.includes('analytics')
      );

      expect(trackingCookies.length).toBe(0);
    }
  });

  test('deve permitir solicitar exclusão de dados', async ({ page }) => {
    // TODO: Login como usuário
    // await loginAsTestUser(page);

    await page.goto('/dashboard/configuracoes');

    const deleteButton = page.locator('button:has-text("Excluir meus dados")');
    await expect(deleteButton).toBeVisible();

    await deleteButton.click();

    // Verificar modal de confirmação
    await expect(page.locator('text=/tem certeza/i')).toBeVisible();
  });

  test('deve anonimizar dados em relatórios', async ({ page }) => {
    // TODO: Login como admin
    // await loginAsAdmin(page);

    await page.goto('/dashboard/analytics?assessment=test-id');

    // Verificar que dados pessoais não aparecem
    const content = await page.content();
    expect(content).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/); // CPF
    expect(content).not.toMatch(/[\w.-]+@[\w.-]+\.\w+/); // Email
  });

  test('deve registrar consentimento em banco de dados', async ({ page }) => {
    // TODO: Implementar quando componentes LGPD estiverem integrados

    await page.goto('/questionario/pulso-mensal');

    // Aceitar consentimento
    await page.click('button:has-text("Aceito os termos")');

    // Verificar que consentimento foi registrado
    // const consent = await getConsentRecord();
    // expect(consent).toBeDefined();
    // expect(consent.timestamp).toBeDefined();
  });
});
```

---

## 7. Testes de Rate Limiting

### Proteção contra Abuso
```typescript
// tests/security/rate-limiting.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Rate Limiting', () => {
  test('deve limitar requisições repetidas', async ({ page }) => {
    const endpoint = '/api/assessments';
    const requests = [];

    // Fazer 100 requisições rapidamente
    for (let i = 0; i < 100; i++) {
      requests.push(page.request.get(endpoint));
    }

    const responses = await Promise.all(requests);

    // Algumas devem retornar 429 (Too Many Requests)
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('deve ter limite específico para endpoints sensíveis', async ({ page }) => {
    const loginEndpoint = '/api/auth/login';
    const requests = [];

    // Tentar login 10 vezes
    for (let i = 0; i < 10; i++) {
      requests.push(
        page.request.post(loginEndpoint, {
          data: { email: 'test@example.com', password: 'wrong' }
        })
      );
    }

    const responses = await Promise.all(requests);

    // Após algumas tentativas, deve bloquear
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.status()).toBe(429);
  });
});
```

---

## 8. Testes de Headers de Segurança

### Configuração de Headers HTTP
```typescript
// tests/security/headers.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('deve ter todos os headers de segurança essenciais', async ({ page }) => {
    const response = await page.goto('/');

    const headers = response?.headers() || {};

    // Content Security Policy
    expect(headers['content-security-policy']).toBeDefined();

    // X-Frame-Options (proteção contra clickjacking)
    expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);

    // X-Content-Type-Options
    expect(headers['x-content-type-options']).toBe('nosniff');

    // Strict-Transport-Security (HTTPS)
    if (process.env.NODE_ENV === 'production') {
      expect(headers['strict-transport-security']).toContain('max-age');
    }

    // Referrer-Policy
    expect(headers['referrer-policy']).toBeDefined();

    // Permissions-Policy
    expect(headers['permissions-policy']).toBeDefined();
  });
});
```

---

## Executar Testes de Segurança

### Scripts package.json
```json
{
  "scripts": {
    "test:security": "playwright test tests/security",
    "test:security:ui": "playwright test tests/security --ui",
    "test:security:report": "playwright test tests/security --reporter=html"
  }
}
```

### Comandos
```bash
# Executar todos os testes de segurança
npm run test:security

# Executar categoria específica
npx playwright test tests/security/xss.spec.ts

# Executar com relatório detalhado
npm run test:security:report
```

---

## Checklist de Segurança

### Implementação Obrigatória
- [x] Política de privacidade publicada
- [ ] Autenticação com tokens seguros
- [ ] Cookies HttpOnly e Secure
- [ ] CSRF protection em todas as rotas
- [ ] XSS protection (sanitização de inputs)
- [ ] SQL injection prevention (usar ORMs)
- [ ] Rate limiting em APIs
- [ ] Headers de segurança configurados
- [ ] HTTPS em produção
- [ ] Validação de inputs server-side

### LGPD Compliance
- [ ] Consentimento explícito para coleta de dados
- [ ] Direito de acesso aos dados
- [ ] Direito de exclusão (right to be forgotten)
- [ ] Direito de portabilidade
- [ ] Anonimização de dados em relatórios
- [ ] Registro de consentimentos
- [ ] DPO/Encarregado designado

---

## Recursos Adicionais

### Ferramentas Recomendadas
- **OWASP ZAP**: Scanner de vulnerabilidades
- **Burp Suite**: Teste de penetração
- **npm audit**: Vulnerabilidades em dependências
- **Snyk**: Monitoramento contínuo de segurança

### Referências
- [OWASP Top 10](https://owasp.org/Top10/)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

---

**Última Atualização**: 2025-12-09
**Responsável**: Time de Segurança Sollar
