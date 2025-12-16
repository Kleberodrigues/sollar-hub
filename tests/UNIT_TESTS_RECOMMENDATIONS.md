# Recomendações para Testes Unitários

## Configuração Vitest

### 1. Instalar Dependências
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

### 2. Criar Configuração (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/types.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### 3. Setup File (tests/setup.ts)
```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

---

## Componentes Prioritários para Testar

### 1. Componentes de Consentimento LGPD

#### `components/consent/LGPDConsentModal.tsx`
```typescript
// tests/unit/components/consent/LGPDConsentModal.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LGPDConsentModal } from '@/components/consent/LGPDConsentModal'

describe('LGPDConsentModal', () => {
  const mockOnClose = vi.fn()
  const mockOnAccept = vi.fn()
  const mockOnDecline = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onAccept: mockOnAccept,
    onDecline: mockOnDecline,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar quando isOpen é true', () => {
    render(<LGPDConsentModal {...defaultProps} />)
    expect(screen.getByText('Política de Privacidade e Consentimento')).toBeInTheDocument()
  })

  it('não deve renderizar quando isOpen é false', () => {
    render(<LGPDConsentModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Política de Privacidade e Consentimento')).not.toBeInTheDocument()
  })

  it('deve desabilitar botão de aceitar antes de rolar até o final', () => {
    render(<LGPDConsentModal {...defaultProps} />)
    const acceptButton = screen.getByText('Aceito os termos')
    expect(acceptButton).toBeDisabled()
  })

  it('deve habilitar botão após rolar até o final', async () => {
    render(<LGPDConsentModal {...defaultProps} />)

    // Simular scroll até o final
    const content = screen.getByRole('dialog').querySelector('.overflow-y-auto')
    if (content) {
      Object.defineProperty(content, 'scrollTop', { value: 1000, writable: true })
      Object.defineProperty(content, 'scrollHeight', { value: 1200, writable: true })
      Object.defineProperty(content, 'clientHeight', { value: 400, writable: true })

      content.dispatchEvent(new Event('scroll'))
    }

    await waitFor(() => {
      expect(screen.getByText('Aceito os termos')).not.toBeDisabled()
    })
  })

  it('deve chamar onAccept ao clicar em aceitar (após scroll)', async () => {
    const user = userEvent.setup()
    render(<LGPDConsentModal {...defaultProps} />)

    // Simular scroll e habilitar botão
    const content = screen.getByRole('dialog').querySelector('.overflow-y-auto')
    if (content) {
      Object.defineProperty(content, 'scrollTop', { value: 1000, writable: true })
      Object.defineProperty(content, 'scrollHeight', { value: 1200, writable: true })
      Object.defineProperty(content, 'clientHeight', { value: 400, writable: true })
      content.dispatchEvent(new Event('scroll'))
    }

    await waitFor(() => expect(screen.getByText('Aceito os termos')).not.toBeDisabled())

    await user.click(screen.getByText('Aceito os termos'))

    await waitFor(() => {
      expect(mockOnAccept).toHaveBeenCalledTimes(1)
    })
  })

  it('deve chamar onDecline ao clicar em não aceitar', async () => {
    const user = userEvent.setup()
    render(<LGPDConsentModal {...defaultProps} />)

    await user.click(screen.getByText('Não aceito'))
    expect(mockOnDecline).toHaveBeenCalledTimes(1)
  })

  it('deve ter link para política completa', () => {
    render(<LGPDConsentModal {...defaultProps} />)
    const link = screen.getByText(/Ler a Política de Privacidade completa/)
    expect(link).toHaveAttribute('href', '/privacidade')
  })
})
```

#### `components/consent/ConsentCheckbox.tsx`
```typescript
// tests/unit/components/consent/ConsentCheckbox.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConsentCheckbox } from '@/components/consent/ConsentCheckbox'

describe('ConsentCheckbox', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar com label padrão', () => {
    render(<ConsentCheckbox checked={false} onChange={mockOnChange} />)
    expect(screen.getByText(/Li e aceito a Política de Privacidade/)).toBeInTheDocument()
  })

  it('deve renderizar com label customizado', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onChange={mockOnChange}
        label="Aceito os termos"
      />
    )
    expect(screen.getByText('Aceito os termos')).toBeInTheDocument()
  })

  it('deve exibir asterisco quando required', () => {
    render(<ConsentCheckbox checked={false} onChange={mockOnChange} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('deve chamar onChange ao clicar no checkbox', async () => {
    const user = userEvent.setup()
    render(<ConsentCheckbox checked={false} onChange={mockOnChange} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('deve chamar onChange ao clicar no label', async () => {
    const user = userEvent.setup()
    render(<ConsentCheckbox checked={false} onChange={mockOnChange} />)

    const label = screen.getByText(/Li e aceito/)
    await user.click(label)

    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('deve ter link para política completa', () => {
    render(<ConsentCheckbox checked={false} onChange={mockOnChange} />)
    const link = screen.getByText('(ler política completa)')
    expect(link).toHaveAttribute('href', '/privacidade')
  })

  it('deve mostrar checkmark quando checked', () => {
    render(<ConsentCheckbox checked={true} onChange={mockOnChange} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })
})
```

---

### 2. Utilitários de Analytics

#### `app/dashboard/analytics/utils.ts`
```typescript
// tests/unit/utils/analytics.test.ts
import { describe, it, expect } from 'vitest'
import {
  getCategoryName,
  getRiskLevelLabel,
  getRiskLevelColor,
} from '@/app/dashboard/analytics/utils'

describe('Analytics Utils', () => {
  describe('getCategoryName', () => {
    it('deve retornar nome correto para categorias NR-1', () => {
      expect(getCategoryName('demands')).toBe('Demandas')
      expect(getCategoryName('control')).toBe('Controle')
      expect(getCategoryName('support')).toBe('Apoio')
      expect(getCategoryName('relationships')).toBe('Relacionamentos')
      expect(getCategoryName('role')).toBe('Papel')
      expect(getCategoryName('change')).toBe('Mudança')
    })

    it('deve retornar valor original para categoria desconhecida', () => {
      expect(getCategoryName('unknown')).toBe('unknown')
    })
  })

  describe('getRiskLevelLabel', () => {
    it('deve retornar labels corretos para níveis de risco', () => {
      expect(getRiskLevelLabel('low')).toBe('Baixo')
      expect(getRiskLevelLabel('medium')).toBe('Médio')
      expect(getRiskLevelLabel('high')).toBe('Alto')
    })
  })

  describe('getRiskLevelColor', () => {
    it('deve retornar classes CSS corretas', () => {
      expect(getRiskLevelColor('low')).toContain('green')
      expect(getRiskLevelColor('medium')).toContain('yellow')
      expect(getRiskLevelColor('high')).toContain('red')
    })
  })
})
```

---

### 3. Componentes de UI (shadcn/ui)

#### Exemplo: Badge Component
```typescript
// tests/unit/components/ui/badge.test.tsx
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('deve renderizar children', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('deve aplicar variante default', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toHaveClass('bg-primary')
  })

  it('deve aplicar variante outline', () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('border')
  })

  it('deve aplicar className customizado', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })
})
```

---

## Estrutura de Testes Recomendada

```
tests/
├── setup.ts
├── unit/
│   ├── components/
│   │   ├── consent/
│   │   │   ├── LGPDConsentModal.test.tsx
│   │   │   └── ConsentCheckbox.test.tsx
│   │   ├── analytics/
│   │   │   ├── CategoryScoresChart.test.tsx
│   │   │   └── QuestionDistributionCharts.test.tsx
│   │   └── ui/
│   │       ├── badge.test.tsx
│   │       ├── card.test.tsx
│   │       └── button.test.tsx
│   ├── utils/
│   │   ├── analytics.test.ts
│   │   └── date-formatting.test.ts
│   └── lib/
│       └── animation-tokens.test.ts
└── fixtures/
    ├── mock-analytics-data.ts
    └── mock-responses.ts
```

---

## Scripts package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## Melhores Práticas

### 1. Organização
- ✅ Um arquivo de teste por componente/função
- ✅ Manter estrutura de pastas espelhada
- ✅ Usar describe/it para hierarquia clara

### 2. Nomenclatura
- ✅ Arquivos: `*.test.tsx` ou `*.spec.tsx`
- ✅ Describes: Nome do componente/função
- ✅ Its: "deve [comportamento esperado]"

### 3. Coverage
- ✅ Alvo: >80% coverage
- ✅ Focar em lógica de negócio
- ✅ Testar edge cases e erros

### 4. Mocks
- ✅ Mock de APIs externas (Supabase)
- ✅ Mock de Next.js (router, navigation)
- ✅ Mock de animações (Framer Motion)

### 5. Assertions
- ✅ Usar testing-library queries
- ✅ Preferir toBeInTheDocument()
- ✅ Testar acessibilidade (roles, aria)

---

## Próximos Passos

1. [ ] Instalar dependências
2. [ ] Criar configuração Vitest
3. [ ] Implementar testes de consentimento LGPD
4. [ ] Implementar testes de utils
5. [ ] Adicionar testes para componentes analytics
6. [ ] Configurar CI/CD para rodar testes
7. [ ] Atingir >80% coverage

---

**Benefícios**:
- ✅ Detecção precoce de bugs
- ✅ Refatoração segura
- ✅ Documentação viva do código
- ✅ Maior confiança em deploys
