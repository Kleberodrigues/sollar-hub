import { test, expect } from '@playwright/test';

/**
 * Analytics Dashboard E2E Tests
 *
 * NOTA: Estes testes requerem autenticação e dados no Supabase.
 * Para executar localmente:
 * 1. Configure variáveis de ambiente (.env.local)
 * 2. Crie um usuário de teste no Supabase
 * 3. Crie assessments e respostas de teste
 * 4. Configure authentication mock no beforeEach
 *
 * Testes básicos de UI/estrutura podem ser habilitados sem autenticação.
 */

test.describe('Analytics Dashboard - Basic UI', () => {
  test.skip('deve exibir mensagem de seleção quando sem assessment ID', async ({ page }) => {
    // SKIP: Este teste requer autenticação - a página redireciona para /login
    // Mover para analytics.auth.spec.ts quando implementar testes autenticados de analytics
    await page.goto('/dashboard/analytics');

    await expect(page.getByText('Análise de Riscos')).toBeVisible();
    await expect(page.getByText(/Selecione um assessment/i)).toBeVisible();
  });
});

test.describe.skip('Analytics Dashboard - Com Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Configurar autenticação
    // - Mock de cookies/session do Supabase
    // - Ou usar conta de teste real
  });

  test.describe('Carregamento e Exibição de Métricas', () => {
    test('deve exibir cards de métricas principais', async ({ page }) => {
      // Navegar para analytics com assessment ID de teste
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se os 4 cards de métricas estão presentes
      const participantesCard = page.getByText('Participantes').first();
      const perguntasCard = page.getByText('Perguntas').first();
      const conclusaoCard = page.getByText('Taxa de Conclusão').first();
      const ultimaRespostaCard = page.getByText('Última Resposta').first();

      await expect(participantesCard).toBeVisible();
      await expect(perguntasCard).toBeVisible();
      await expect(conclusaoCard).toBeVisible();
      await expect(ultimaRespostaCard).toBeVisible();
    });

    test('deve exibir valores numéricos nas métricas', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se há números exibidos (formato: dígitos)
      const metricsValues = page.locator('.text-2xl.font-bold');
      const count = await metricsValues.count();

      expect(count).toBeGreaterThanOrEqual(4); // 4 cards principais

      // Verificar que cada valor é numérico ou porcentagem
      for (let i = 0; i < count; i++) {
        const text = await metricsValues.nth(i).textContent();
        expect(text).toMatch(/\d+|N\/A/); // Número ou N/A
      }
    });

    test('deve exibir estado vazio quando não há respostas', async ({ page }) => {
      // Navegar com assessment sem respostas
      await page.goto('/dashboard/analytics?assessment=empty-assessment-id');

      // Verificar mensagem de estado vazio
      await expect(page.getByText('Ainda não há respostas para este assessment')).toBeVisible();
      await expect(page.getByText('Os gráficos e análises aparecerão quando houver respostas')).toBeVisible();
    });

    test('deve exibir erro quando assessment não existe', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=non-existent-id');

      // Verificar mensagem de erro
      await expect(page.getByText('Assessment não encontrado')).toBeVisible();
    });
  });

  test.describe('Níveis de Risco por Categoria NR-1', () => {
    test('deve exibir 6 categorias NR-1', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se todas as 6 categorias estão presentes
      const categories = [
        'Demandas',
        'Controle',
        'Apoio',
        'Relacionamentos',
        'Papel',
        'Mudança'
      ];

      for (const category of categories) {
        await expect(page.getByText(category)).toBeVisible();
      }
    });

    test('deve exibir badges de nível de risco', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se há badges com níveis de risco
      const riskBadges = page.locator('text=/Baixo|Médio|Alto/');
      const count = await riskBadges.count();

      expect(count).toBeGreaterThanOrEqual(6); // 6 categorias
    });

    test('badges devem ter cores apropriadas', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar classes de cores nos badges
      const lowRiskBadge = page.locator('.text-green-600').first();
      const mediumRiskBadge = page.locator('.text-yellow-600').first();
      const highRiskBadge = page.locator('.text-red-600').first();

      // Pelo menos um tipo de badge deve existir
      const hasLowRisk = await lowRiskBadge.count() > 0;
      const hasMediumRisk = await mediumRiskBadge.count() > 0;
      const hasHighRisk = await highRiskBadge.count() > 0;

      expect(hasLowRisk || hasMediumRisk || hasHighRisk).toBe(true);
    });

    test('deve exibir pontuações médias por categoria', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se há pontuações exibidas (formato: X.XX)
      const scores = page.locator('.text-2xl.font-bold').filter({ hasText: /\d\.\d{2}/ });
      const count = await scores.count();

      expect(count).toBeGreaterThanOrEqual(6); // 6 categorias
    });
  });

  test.describe('Gráfico de Pontuação por Categoria', () => {
    test('deve exibir bar chart de categorias', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se o título do gráfico está presente
      await expect(page.getByText('Pontuação Média por Categoria')).toBeVisible();

      // Verificar se há elementos SVG do gráfico (Recharts usa SVG)
      const svgElements = page.locator('svg');
      const count = await svgElements.count();

      expect(count).toBeGreaterThan(0); // Pelo menos um gráfico SVG
    });

    test('gráfico deve ter barras visíveis', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se há elementos <rect> (barras do bar chart)
      const bars = page.locator('svg rect').filter({ hasNotText: '' });
      const count = await bars.count();

      expect(count).toBeGreaterThan(0); // Barras presentes
    });

    test('gráfico deve ter eixos X e Y', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar elementos de eixos (Recharts usa <g> com classes específicas)
      const hasAxes = await page.locator('svg').first().evaluate((svg) => {
        return svg.querySelectorAll('g').length > 0;
      });

      expect(hasAxes).toBe(true);
    });
  });

  test.describe('Gráficos de Distribuição de Respostas', () => {
    test('deve exibir seletor de perguntas', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se o select de perguntas está presente
      const questionSelector = page.locator('select').filter({ hasText: /Pergunta \d+/ });
      await expect(questionSelector).toBeVisible();
    });

    test('deve permitir trocar entre perguntas', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      const questionSelector = page.locator('select').first();

      // Selecionar a primeira pergunta
      await questionSelector.selectOption({ index: 0 });
      const firstQuestionText = await page.locator('h3').filter({ hasText: /Pergunta/ }).first().textContent();

      // Selecionar a segunda pergunta
      await questionSelector.selectOption({ index: 1 });
      const secondQuestionText = await page.locator('h3').filter({ hasText: /Pergunta/ }).first().textContent();

      // Verificar que o texto mudou
      expect(firstQuestionText).not.toBe(secondQuestionText);
    });

    test('deve ter botões de toggle Bar/Pie chart', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar botões de toggle
      const barButton = page.getByRole('button', { name: /Barras/i });
      const pieButton = page.getByRole('button', { name: /Pizza/i });

      await expect(barButton).toBeVisible();
      await expect(pieButton).toBeVisible();
    });

    test('deve alternar entre Bar e Pie chart', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      const barButton = page.getByRole('button', { name: /Barras/i });
      const pieButton = page.getByRole('button', { name: /Pizza/i });

      // Clicar em Pie chart
      await pieButton.click();

      // Verificar se mudou (botão pie agora tem estilo primary)
      const pieButtonClass = await pieButton.getAttribute('class');
      expect(pieButtonClass).toContain('primary');

      // Voltar para Bar chart
      await barButton.click();

      const barButtonClass = await barButton.getAttribute('class');
      expect(barButtonClass).toContain('primary');
    });

    test('deve exibir tabela de detalhamento', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se a tabela de detalhamento está presente
      await expect(page.getByText('Detalhamento das Respostas')).toBeVisible();

      // Verificar colunas da tabela
      await expect(page.getByText('Resposta')).toBeVisible();
      await expect(page.getByText('Quantidade')).toBeVisible();
      await expect(page.getByText('Porcentagem')).toBeVisible();
    });

    test('tabela deve exibir dados com porcentagens', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar se há células com porcentagens (formato: XX.X%)
      const percentages = page.locator('td').filter({ hasText: /%$/ });
      const count = await percentages.count();

      expect(count).toBeGreaterThan(0); // Pelo menos uma porcentagem
    });
  });

  test.describe('Responsividade', () => {
    test('deve ser responsivo em mobile', async ({ page }) => {
      // Configurar viewport mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar que cards empilham verticalmente
      const cards = page.locator('[class*="grid"]').first();
      const gridClass = await cards.getAttribute('class');

      // Grid deve ter configuração mobile (grid-cols-1)
      expect(gridClass).toMatch(/grid-cols-1|md:grid-cols/);
    });

    test('deve ser responsivo em tablet', async ({ page }) => {
      // Configurar viewport tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar que layout se adapta
      const isVisible = await page.locator('main').isVisible();
      expect(isVisible).toBe(true);
    });
  });

  test.describe('Loading States', () => {
    test('deve exibir skeleton durante carregamento', async ({ page }) => {
      // Interceptar request para atrasar resposta
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      const loadingPromise = page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar skeleton (componente Skeleton do shadcn/ui)
      const skeleton = page.locator('[class*="skeleton"]').first();

      // Skeleton deve estar visível durante carregamento
      const hasSkeletonDuringLoad = await skeleton.isVisible().catch(() => false);

      await loadingPromise;

      // Após carregamento, skeleton não deve mais existir
      const hasSkeletonAfterLoad = await skeleton.isVisible().catch(() => false);

      expect(hasSkeletonDuringLoad || !hasSkeletonAfterLoad).toBe(true);
    });
  });

  test.describe('Acessibilidade', () => {
    test('deve ter títulos semânticos', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar h1 principal
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).toHaveText(/Análise de Riscos/i);
    });

    test('gráficos devem ter labels descritivos', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      // Verificar títulos dos gráficos
      await expect(page.getByText('Pontuação Média por Categoria')).toBeVisible();
      await expect(page.getByText('Distribuição de Respostas por Pergunta')).toBeVisible();
    });

    test('botões devem ser navegáveis por teclado', async ({ page }) => {
      await page.goto('/dashboard/analytics?assessment=test-assessment-id');

      const barButton = page.getByRole('button', { name: /Barras/i });

      // Focar o botão com Tab
      await barButton.focus();

      // Verificar se está focado
      const isFocused = await barButton.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    });
  });
});

/**
 * Testes de Integração com Dados Reais
 *
 * TODO: Implementar após configurar ambiente de teste com Supabase
 */
test.describe.skip('Analytics com Dados Reais', () => {
  test('deve calcular corretamente total de participantes', async ({ page }) => {
    // TODO: Criar assessment de teste com dados conhecidos
    // TODO: Verificar se contagem de participantes únicos está correta
  });

  test('deve calcular corretamente taxa de conclusão', async ({ page }) => {
    // TODO: Criar assessment com respostas parciais
    // TODO: Verificar cálculo: (respostas / (participantes * perguntas)) * 100
  });

  test('deve classificar risco corretamente', async ({ page }) => {
    // TODO: Criar respostas com scores conhecidos
    // TODO: Verificar: <2.5 = alto, <3.5 = médio, >=3.5 = baixo
  });

  test('deve agrupar respostas por categoria NR-1', async ({ page }) => {
    // TODO: Verificar agregação por categoria
    // TODO: Validar médias calculadas
  });

  test('deve exibir distribuição correta de respostas', async ({ page }) => {
    // TODO: Criar respostas com distribuição conhecida
    // TODO: Verificar porcentagens no gráfico
  });
});
