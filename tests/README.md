# Documentação de Testes - Sollar Insight Hub

## 📋 Visão Geral

Este diretório contém toda a estrutura de testes do projeto Sollar Insight Hub, incluindo:
- **Testes E2E** (End-to-End) com Playwright
- **Testes Unitários** com Vitest (recomendados)
- **Testes de Segurança** (guia de implementação)

---

## 📁 Estrutura de Diretórios

```
tests/
├── README.md                          # Este arquivo
├── TEST_CORRECTIONS_SUMMARY.md        # Resumo das correções aplicadas
├── UNIT_TESTS_RECOMMENDATIONS.md      # Guia de testes unitários
├── SECURITY_TESTS_GUIDE.md            # Guia de testes de segurança
│
├── e2e/                               # Testes E2E com Playwright
│   ├── analytics-dashboard.spec.ts    # ✅ 1 ativo + 26 skip
│   ├── animations.spec.ts             # ✅ 7 testes ativos
│   ├── privacy-page.spec.ts           # ✅ 8 testes ativos
│   └── visual-inspection.spec.ts      # ✅ 13 testes ativos
│
├── unit/                              # ⚠️ A IMPLEMENTAR
│   ├── components/
│   ├── utils/
│   └── lib/
│
├── security/                          # ⚠️ A IMPLEMENTAR
│   ├── auth.spec.ts
│   ├── xss.spec.ts
│   ├── csrf.spec.ts
│   └── lgpd.spec.ts
│
└── fixtures/                          # ⚠️ A CRIAR
    ├── mock-analytics-data.ts
    └── mock-responses.ts
```

---

## 🚀 Início Rápido

### Executar Testes E2E
```bash
# Todos os testes E2E
npm run test:e2e

# Com interface visual
npm run test:e2e:ui

# Modo debug
npx playwright test --debug

# Teste específico
npx playwright test privacy-page
```

### Executar Testes Unitários (quando implementados)
```bash
# Todos os testes unitários
npm test

# Modo watch
npm run test:watch

# Com coverage
npm run test:coverage

# Interface UI
npm run test:ui
```

---

## 📊 Status Atual dos Testes

### Testes E2E (Playwright)
| Arquivo | Testes | Status | Observações |
|---------|--------|--------|-------------|
| `analytics-dashboard.spec.ts` | 1 + 26 | ✅ Parcial | 1 ativo, 26 aguardam auth |
| `animations.spec.ts` | 7 | ✅ Ativo | Funcionais |
| `privacy-page.spec.ts` | 8 | ✅ Ativo | Funcionais |
| `visual-inspection.spec.ts` | 13 | ✅ Ativo | Funcionais |
| **TOTAL** | **29 + 26** | **53% ativos** | 29 funcionais, 26 skip |

### Testes Unitários (Vitest)
| Categoria | Status | Prioridade |
|-----------|--------|-----------|
| Componentes LGPD | ⚠️ A implementar | 🔴 Alta |
| Utils Analytics | ⚠️ A implementar | 🔴 Alta |
| Componentes UI | ⚠️ A implementar | 🟡 Média |
| Hooks | ⚠️ A implementar | 🟡 Média |

### Testes de Segurança
| Categoria | Status | Prioridade |
|-----------|--------|-----------|
| Autenticação | ⚠️ A implementar | 🔴 Alta |
| XSS Protection | ⚠️ A implementar | 🔴 Alta |
| CSRF Protection | ⚠️ A implementar | 🔴 Alta |
| LGPD Compliance | ⚠️ A implementar | 🔴 Alta |
| Rate Limiting | ⚠️ A implementar | 🟡 Média |

---

## 📖 Guias Detalhados

### 1. [TEST_CORRECTIONS_SUMMARY.md](./TEST_CORRECTIONS_SUMMARY.md)
**Conteúdo**:
- Testes habilitados e corrigidos
- Testes removidos (com justificativas)
- Estatísticas de antes/depois
- Checklist de implementação

**Use quando**: Precisar entender o histórico de correções.

---

### 2. [UNIT_TESTS_RECOMMENDATIONS.md](./UNIT_TESTS_RECOMMENDATIONS.md)
**Conteúdo**:
- Configuração Vitest completa
- Exemplos de testes para componentes LGPD
- Testes de utils e helpers
- Melhores práticas e padrões

**Use quando**: For implementar testes unitários.

---

### 3. [SECURITY_TESTS_GUIDE.md](./SECURITY_TESTS_GUIDE.md)
**Conteúdo**:
- Testes de autenticação e autorização
- Proteção contra XSS e CSRF
- Validação de dados e inputs
- LGPD/GDPR compliance
- Rate limiting e headers de segurança

**Use quando**: For implementar testes de segurança.

---

## 🎯 Roadmap de Testes

### Fase 1: Fundação ✅ (Concluída)
- [x] Corrigir testes E2E existentes
- [x] Remover testes não aplicáveis
- [x] Documentar estrutura e guias
- [x] Habilitar testes básicos de UI

### Fase 2: Testes Unitários (Próximos Passos)
- [ ] Configurar Vitest
- [ ] Implementar testes de componentes LGPD
- [ ] Implementar testes de utils
- [ ] Atingir 50% coverage

### Fase 3: Autenticação e Analytics
- [ ] Configurar mocks de autenticação
- [ ] Criar fixtures de dados de teste
- [ ] Habilitar testes de analytics
- [ ] Habilitar testes de dashboard

### Fase 4: Segurança
- [ ] Implementar testes de XSS
- [ ] Implementar testes de CSRF
- [ ] Implementar testes de LGPD
- [ ] Auditoria de segurança completa

### Fase 5: Qualidade e Manutenção
- [ ] Atingir 80% coverage
- [ ] Configurar CI/CD
- [ ] Testes de performance
- [ ] Testes de acessibilidade

---

## 🛠️ Ferramentas e Tecnologias

### Testes E2E
- **Playwright** - Framework de testes E2E
- **@playwright/test** - Test runner
- Suporta Chrome, Firefox, Safari, Edge

### Testes Unitários (Recomendado)
- **Vitest** - Framework de testes unitários
- **@testing-library/react** - Utilitários para testar React
- **@testing-library/jest-dom** - Matchers customizados
- **happy-dom** - DOM environment para testes

### Testes de Segurança
- **OWASP ZAP** - Scanner de vulnerabilidades
- **npm audit** - Auditoria de dependências
- **Snyk** - Monitoramento contínuo

---

## 📝 Convenções de Nomenclatura

### Arquivos
- E2E: `*.spec.ts` (ex: `analytics-dashboard.spec.ts`)
- Unit: `*.test.tsx` ou `*.test.ts` (ex: `LGPDConsentModal.test.tsx`)
- Fixtures: `mock-*.ts` (ex: `mock-analytics-data.ts`)

### Estrutura de Testes
```typescript
describe('NomeDoComponente', () => {
  describe('funcionalidade específica', () => {
    it('deve fazer algo esperado', () => {
      // arrange
      // act
      // assert
    });
  });
});
```

---

## 🔍 Debugging

### Playwright
```bash
# Modo debug interativo
npx playwright test --debug

# Com headed browser
npx playwright test --headed

# Específico linha
npx playwright test:debug file.spec.ts:42
```

### Vitest
```bash
# Modo debug
npm test -- --inspect-brk

# Filtrar por nome
npm test -- ConsentModal

# Watch mode com UI
npm run test:ui
```

---

## 📈 Métricas de Qualidade

### Objetivos de Coverage
- **Mínimo Aceitável**: 60%
- **Objetivo**: 80%
- **Excelente**: 90%+

### Categorias
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Prioridades de Coverage
1. 🔴 **Alta**: Lógica de negócio, autenticação, validações
2. 🟡 **Média**: Componentes UI, utils, helpers
3. 🟢 **Baixa**: Tipos, configurações, mocks

---

## 🤝 Contribuindo

### Adicionando Novos Testes

1. **Escolha o tipo de teste**:
   - UI/Fluxo? → E2E (Playwright)
   - Componente isolado? → Unit (Vitest)
   - Vulnerabilidade? → Security

2. **Siga a estrutura**:
   - Um arquivo por componente/página
   - Agrupe testes relacionados com `describe`
   - Use nomes descritivos em `it`

3. **Escreva testes claros**:
   - Arrange-Act-Assert
   - Um conceito por teste
   - Nomes em português descritivos

4. **Documente casos especiais**:
   - Comentários para lógica complexa
   - TODOs para melhorias futuras
   - Justificativas para skips

---

## 📞 Suporte

### Problemas Comuns

**Testes E2E falhando**:
1. Verificar se servidor está rodando (`npm run dev`)
2. Verificar portas no `playwright.config.ts`
3. Limpar cache do Playwright (`npx playwright install`)

**Testes Unitários não encontrados**:
1. Verificar configuração do Vitest
2. Verificar extensões dos arquivos (`.test.tsx`)
3. Verificar setup de testing-library

**Autenticação falhando**:
1. Verificar variáveis de ambiente
2. Verificar cookies/session
3. Verificar mocks de Supabase

---

## 📚 Recursos Externos

### Documentação Oficial
- [Playwright Docs](https://playwright.dev/)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

### Tutoriais e Guias
- [Kent C. Dodds - Testing Course](https://testingjavascript.com/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [LGPD - Guia de Conformidade](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

## 📄 Licença

Este projeto e seus testes estão sob a mesma licença do projeto principal.

---

**Mantido por**: Time de Desenvolvimento Sollar
**Última atualização**: 2025-12-09
**Versão**: 1.0.0
