# Testes E2E com Playwright - Sollar Insight Hub

Este diretório contém os testes end-to-end (E2E) usando Playwright para verificar as funcionalidades implementadas.

## 🎯 Cobertura de Testes

### ✅ Implementados

1. **privacy-page.spec.ts** - Testes da página de Política de Privacidade
   - ✅ Carregamento da página
   - ✅ Exibição de todas as 8 seções
   - ✅ Fontes corretas (Playfair para títulos, Lora para corpo)
   - ✅ Links de email funcionais
   - ✅ Animações no scroll
   - ✅ Responsividade mobile
   - ✅ HTML semântico
   - ✅ Data de atualização

2. **animations.spec.ts** - Testes dos componentes de animação
   - ✅ Animações de carregamento suaves
   - ✅ Respeito ao `prefers-reduced-motion`
   - ✅ Animação em cascata (stagger) nas seções
   - ✅ Comportamento de scroll suave
   - ✅ Integração da paleta de cores Sollar
   - ✅ Carregamento de fontes customizadas
   - ✅ Estilos de sombra adequados
   - ✅ Performance (tempo de carregamento < 3s)
   - ✅ Core Web Vitals (LCP < 2.5s)
   - ✅ Ausência de erros no console

3. **lgpd-consent.spec.ts** - Testes dos componentes LGPD
   - 📝 Testes de placeholder (serão ativados quando integrados aos questionários)
   - 📝 Scroll-to-bottom requirement
   - 📝 Acessibilidade (ARIA labels)
   - 📝 Navegação por teclado
   - 📝 Ratios de contraste
   - 📝 Compatibilidade com screen readers

### 🚧 Próximos Testes (Fases 3-6)

- Questionário Pesquisa de Clima
- Questionário Completo (8 blocos)
- Autenticação magic link
- Dashboard de analytics
- Componentes de formulário
- Integração LGPD com questionários

## 🚀 Como Executar

### Opção 1: Com Servidor Manual (Recomendado)

1. Inicie o servidor de desenvolvimento em um terminal:
\`\`\`bash
npm run dev
\`\`\`

2. Em outro terminal, execute os testes:
\`\`\`bash
npm run test:e2e
\`\`\`

### Opção 2: Modo Headed (ver o navegador)
\`\`\`bash
npm run test:e2e:headed
\`\`\`

### Opção 3: Modo UI Interativo
\`\`\`bash
npm run test:e2e:ui
\`\`\`

### Opção 4: Ver Relatório
\`\`\`bash
npm run test:e2e:report
\`\`\`

## 📊 Resultados Esperados

### Privacy Page (8 testes)
- ✅ Carregamento e título
- ✅ 8 seções visíveis
- ✅ Fontes Playfair e Lora
- ✅ Links de email (2)
- ✅ Animações scroll
- ✅ Responsivo mobile
- ✅ HTML semântico
- ✅ Data de atualização

### Animations (11 testes)
- ✅ Animações suaves
- ✅ Reduced motion
- ✅ Stagger animations
- ✅ Smooth scroll
- ✅ Cores Sollar
- ✅ Fontes carregadas
- ✅ Sombras aplicadas
- ✅ Performance < 3s
- ✅ Sem erros console
- ✅ LCP < 2.5s

### LGPD Consent (9 testes)
- ⏸️ Skipped (aguardando integração)

## 🔧 Configuração

A configuração do Playwright está em `playwright.config.ts`:

- **Browser**: Chromium (Desktop Chrome)
- **Base URL**: http://localhost:3000
- **Retry**: 2x em CI, 0x local
- **Reporter**: HTML
- **Screenshot**: On failure
- **Video**: On failure
- **Trace**: On first retry

## 📝 Escrevendo Novos Testes

Exemplo de teste básico:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('Minha Feature', () => {
  test('deve fazer algo', async ({ page }) => {
    await page.goto('/minha-rota');

    const elemento = page.locator('.meu-elemento');
    await expect(elemento).toBeVisible();
  });
});
\`\`\`

## 🎨 Testes de Animação

Para testar animações Framer Motion:

\`\`\`typescript
// Verificar que elemento está visível após animação
await expect(elemento).toBeVisible({ timeout: 2000 });

// Verificar opacity (elemento animado)
const opacity = await elemento.evaluate(el =>
  window.getComputedStyle(el).opacity
);
expect(parseFloat(opacity)).toBeGreaterThan(0.9);
\`\`\`

## 📱 Testes Mobile

\`\`\`typescript
// Definir viewport mobile
await page.setViewportSize({ width: 375, height: 667 });

// Verificar que conteúdo não ultrapassa viewport
const boundingBox = await content.boundingBox();
expect(boundingBox.width).toBeLessThanOrEqual(375);
\`\`\`

## ♿ Testes de Acessibilidade

\`\`\`typescript
// Verificar ARIA labels
const modal = page.locator('[role="dialog"]');
await expect(modal).toHaveAttribute('aria-labelledby');

// Verificar navegação por teclado
await page.keyboard.press('Tab');
await expect(button).toBeFocused();
\`\`\`

## 🐛 Debugging

### Ver testes executando
\`\`\`bash
npm run test:e2e:headed
\`\`\`

### Modo UI Interativo
\`\`\`bash
npm run test:e2e:ui
\`\`\`

### Ver screenshots/videos de falhas
Os arquivos são salvos em `test-results/`

### Ver traces
\`\`\`bash
npx playwright show-trace test-results/.../trace.zip
\`\`\`

## 📦 Estrutura

\`\`\`
tests/e2e/
├── README.md              # Este arquivo
├── privacy-page.spec.ts   # Testes da página de privacidade
├── animations.spec.ts     # Testes de animação
└── lgpd-consent.spec.ts   # Testes LGPD (placeholder)
\`\`\`

## ✅ Checklist de Qualidade

Cada teste deve:
- [ ] Ter um describe claro
- [ ] Ter testes com nomes descritivos
- [ ] Usar timeouts apropriados
- [ ] Limpar estado entre testes (beforeEach)
- [ ] Verificar acessibilidade
- [ ] Testar casos de erro
- [ ] Ser independente de outros testes
- [ ] Ter asserções claras

## 🚀 CI/CD

Os testes são configurados para rodar em CI com:
- Retry automático (2x)
- Execução sequencial
- Screenshots e videos de falhas
- Relatório HTML gerado

## 📚 Recursos

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
