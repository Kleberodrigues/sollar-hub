# ⚡ Quick Start - Testes

Guia rápido para executar e criar testes no projeto.

---

## 🚀 Executar Testes

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com interface visual
npm run test:e2e:ui

# Executar teste específico
npx playwright test privacy-page

# Modo debug (passo a passo)
npx playwright test --debug

# Gerar relatório HTML
npx playwright show-report
```

### Testes Unitários (Vitest) - Quando Implementado

```bash
# Executar todos
npm test

# Modo watch (atualiza automaticamente)
npm run test:watch

# Com coverage
npm run test:coverage

# Interface visual
npm run test:ui

# Teste específico
npm test LGPDConsentModal
```

---

## 🛠️ Criar Novos Testes

### 1. Teste E2E (Playwright)

**Quando usar**: Testar fluxos completos, navegação entre páginas, interações do usuário.

```typescript
// tests/e2e/meu-teste.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Minha Feature', () => {
  test('deve fazer algo', async ({ page }) => {
    await page.goto('/minha-pagina');

    await expect(page.getByText('Título')).toBeVisible();

    await page.click('button:has-text("Salvar")');

    await expect(page.getByText('Sucesso')).toBeVisible();
  });
});
```

**Executar**:
```bash
npx playwright test meu-teste
```

---

### 2. Teste Unitário (Vitest)

**Quando usar**: Testar componentes isolados, funções, lógica de negócio.

```typescript
// tests/unit/components/MeuComponente.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MeuComponente } from '@/components/MeuComponente';

describe('MeuComponente', () => {
  it('deve renderizar', () => {
    render(<MeuComponente />);
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('deve responder a cliques', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(<MeuComponente onClick={mockOnClick} />);

    await user.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
```

**Executar**:
```bash
npm test MeuComponente
```

---

### 3. Teste de Segurança

**Quando usar**: Testar vulnerabilidades, proteção de dados, compliance.

```typescript
// tests/security/minha-seguranca.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Segurança', () => {
  test('deve proteger contra XSS', async ({ page }) => {
    await page.goto('/formulario');

    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[name="campo"]', xssPayload);
    await page.click('button[type="submit"]');

    // Script não deve executar
    const content = await page.content();
    expect(content).not.toContain('<script>alert');
  });
});
```

---

## 📋 Checklist Antes de Commitar

- [ ] Executei `npm run test:e2e` - todos passaram
- [ ] Executei `npm test` - todos passaram (quando implementado)
- [ ] Não deixei `test.only` no código
- [ ] Testes estão claros e descritivos
- [ ] Adicionei comentários se necessário

---

## 🐛 Troubleshooting

### Testes E2E falhando

**Problema**: "Target page, context or browser has been closed"
```bash
# Solução: Aumentar timeout
npx playwright test --timeout=60000
```

**Problema**: "Page didn't navigate"
```bash
# Solução: Verificar se servidor está rodando
npm run dev
# Em outro terminal:
npm run test:e2e
```

**Problema**: "Seletor não encontrado"
```typescript
// Use waitFor para elementos que carregam depois
await page.waitForSelector('button:has-text("Salvar")');
```

---

### Testes Unitários falhando

**Problema**: "Cannot find module '@/components/...'"
```typescript
// Solução: Verificar alias no vitest.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

**Problema**: "document is not defined"
```typescript
// Solução: Configurar environment no vitest.config.ts
test: {
  environment: 'happy-dom',
}
```

---

## 🎯 Seletores Recomendados

### Prioridade (melhor → pior)

1. **Por Role** (melhor para acessibilidade)
```typescript
page.getByRole('button', { name: 'Salvar' })
page.getByRole('textbox', { name: 'Email' })
```

2. **Por Label**
```typescript
page.getByLabel('Nome completo')
page.getByPlaceholder('Digite seu email')
```

3. **Por Texto**
```typescript
page.getByText('Política de Privacidade')
page.getByText(/termos.*uso/i) // regex
```

4. **Por Test ID** (quando necessário)
```typescript
page.getByTestId('submit-button')
// No JSX: <button data-testid="submit-button">
```

5. **CSS Selector** (último caso)
```typescript
page.locator('.btn-primary')
page.locator('button[type="submit"]')
```

---

## 📖 Recursos Úteis

### Documentação Oficial
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

### Guias do Projeto
- [`README.md`](./README.md) - Visão geral completa
- [`UNIT_TESTS_RECOMMENDATIONS.md`](./UNIT_TESTS_RECOMMENDATIONS.md) - Como criar testes unitários
- [`SECURITY_TESTS_GUIDE.md`](./SECURITY_TESTS_GUIDE.md) - Testes de segurança

### Exemplos no Projeto
- `tests/e2e/privacy-page.spec.ts` - Exemplo E2E completo
- `tests/e2e/animations.spec.ts` - Testes de UI/animações

---

## 💡 Dicas Rápidas

### E2E
```typescript
// ✅ BOM: Esperar elemento estar visível
await expect(page.getByText('Sucesso')).toBeVisible();

// ❌ RUIM: Usar timeout fixo
await page.waitForTimeout(5000);

// ✅ BOM: Usar waitForLoadState
await page.waitForLoadState('networkidle');
```

### Unitários
```typescript
// ✅ BOM: Testar comportamento do usuário
await user.click(screen.getByRole('button'));

// ❌ RUIM: Testar implementação interna
expect(component.state.isOpen).toBe(true);

// ✅ BOM: Query inclusivo
screen.getByRole('button', { name: /salvar/i });

// ❌ RUIM: Query frágil
screen.getByClassName('btn-save');
```

---

## 🎓 Padrão AAA (Arrange-Act-Assert)

```typescript
test('deve adicionar item ao carrinho', async () => {
  // 1. ARRANGE (preparar)
  const produto = { id: 1, nome: 'Produto Teste' };
  render(<Carrinho produtos={[]} />);

  // 2. ACT (agir)
  await user.click(screen.getByText('Adicionar'));

  // 3. ASSERT (verificar)
  expect(screen.getByText('1 item no carrinho')).toBeInTheDocument();
});
```

---

## ⚡ Comandos Mais Usados

```bash
# Development
npm run dev                    # Iniciar servidor
npm run test:e2e              # Rodar testes E2E
npm test                      # Rodar testes unitários

# Debug
npx playwright test --debug   # Debug E2E
npm test -- --watch           # Watch unitários

# Reports
npx playwright show-report    # Ver relatório E2E
npm run test:coverage         # Ver coverage

# Specific
npx playwright test privacy-page       # Teste específico E2E
npm test ConsentModal                  # Teste específico unitário
```

---

**Precisa de ajuda?**
- 📖 Leia [`README.md`](./README.md) completo
- 💬 Pergunte no Slack: #engineering-tests
- 🐛 Reporte bugs com reprodução

---

**Happy Testing! 🎉**
