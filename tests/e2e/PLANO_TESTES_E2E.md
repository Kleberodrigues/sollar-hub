# Plano de Testes E2E - PsicoMapa (Sollar Insight Hub)

## Tipo de Teste: **Smoke Test Suite / End-to-End User Journey Test**

### Objetivo
Validar que um novo usuário consegue completar toda a jornada no sistema, desde o registro até a utilização de todas as funcionalidades principais.

---

## 1. Escopo dos Testes

### 1.1 Fluxos Críticos (P0 - Bloqueadores)
| ID | Fluxo | Descrição | Criticidade |
|----|-------|-----------|-------------|
| T01 | Registro | Criar nova conta de usuário | CRÍTICO |
| T02 | Login | Autenticar com credenciais válidas | CRÍTICO |
| T03 | Pagamento | Completar checkout Stripe | CRÍTICO |
| T04 | Recuperação de Senha | Solicitar e redefinir senha | CRÍTICO |

### 1.2 Funcionalidades Core (P1 - Alta Prioridade)
| ID | Fluxo | Descrição | Criticidade |
|----|-------|-----------|-------------|
| T05 | Dashboard | Acessar e visualizar dashboard principal | ALTA |
| T06 | Criar Assessment | Criar nova avaliação psicossocial | ALTA |
| T07 | Gerenciar Questionário | Criar/editar questionário | ALTA |
| T08 | Responder Questionário | Simular participante respondendo | ALTA |
| T09 | Analytics | Visualizar relatórios e métricas | ALTA |
| T10 | Exportar Relatório | Gerar PDF/Excel dos resultados | ALTA |

### 1.3 Funcionalidades Avançadas (P2 - Média Prioridade)
| ID | Fluxo | Descrição | Criticidade |
|----|-------|-----------|-------------|
| T11 | Plano de Ação IA | Gerar plano de ação com IA | MÉDIA |
| T12 | Importar Participantes | Upload de CSV com participantes | MÉDIA |
| T13 | Gerenciar Organização | Editar dados da empresa | MÉDIA |
| T14 | Gerenciar Departamentos | CRUD de departamentos | MÉDIA |
| T15 | Configurações de Perfil | Atualizar dados do usuário | MÉDIA |

### 1.4 Integridade de Dados (P1 - Alta Prioridade)
| ID | Fluxo | Descrição | Criticidade |
|----|-------|-----------|-------------|
| T16 | RLS Supabase | Verificar isolamento multi-tenant | ALTA |
| T17 | Persistência | Dados salvos corretamente | ALTA |
| T18 | Consistência | Dados consistentes entre views | ALTA |

---

## 2. Ambiente de Testes

### 2.1 URLs
- **Produção**: https://psicomapa.cloud
- **Staging**: https://sollar-hub-yurq.vercel.app (se disponível)

### 2.2 Credenciais de Teste
```
Admin Existente:
- Email: admin@sollartreinamentos.com.br
- Senha: AdminPassword123!

Novo Usuário (criado durante teste):
- Email: teste.e2e.{timestamp}@teste.com
- Senha: TesteE2E@2024!
```

### 2.3 Dados de Teste Stripe
```
Cartão de Teste (Sucesso):
- Número: 4242 4242 4242 4242
- Validade: 12/30
- CVV: 123

Cartão de Teste (Falha):
- Número: 4000 0000 0000 0002
- Validade: 12/30
- CVV: 123
```

---

## 3. Casos de Teste Detalhados

### T01 - Registro de Novo Usuário
**Pré-condições**: Nenhuma conta existente com o email de teste

**Passos**:
1. Acessar /register
2. Preencher nome completo
3. Preencher email único
4. Preencher nome da empresa
5. Selecionar plano (base/intermediario/avancado)
6. Preencher senha (mínimo 8 caracteres)
7. Confirmar senha
8. Aceitar termos de uso
9. Clicar em "Criar Conta"

**Resultado Esperado**:
- Redirecionamento para /dashboard ou /checkout
- Toast de sucesso exibido
- Usuário criado no Supabase Auth
- Perfil criado em user_profiles
- Organização criada em organizations

**Verificações de Banco**:
```sql
SELECT * FROM auth.users WHERE email = 'teste@email.com';
SELECT * FROM user_profiles WHERE id = '{user_id}';
SELECT * FROM organizations WHERE id = '{org_id}';
```

---

### T02 - Login
**Pré-condições**: Conta existente

**Passos**:
1. Acessar /login
2. Preencher email
3. Preencher senha
4. Clicar em "Entrar"

**Resultado Esperado**:
- Redirecionamento para /dashboard
- Sessão criada
- Nome do usuário exibido no header

**Casos de Erro**:
- Email inválido → Mensagem de erro
- Senha incorreta → Mensagem de erro
- Conta inexistente → Mensagem de erro

---

### T03 - Pagamento Stripe
**Pré-condições**: Usuário logado sem assinatura ativa

**Passos**:
1. Acessar página de preços ou /checkout
2. Selecionar plano
3. Ser redirecionado ao Stripe Checkout
4. Preencher dados do cartão de teste
5. Confirmar pagamento

**Resultado Esperado**:
- Redirecionamento para /checkout/success
- Webhook processado
- Subscription criada em subscriptions
- billing_customer criado

**Verificações de Banco**:
```sql
SELECT * FROM subscriptions WHERE organization_id = '{org_id}';
SELECT * FROM billing_customers WHERE organization_id = '{org_id}';
```

---

### T04 - Recuperação de Senha
**Pré-condições**: Conta existente

**Passos**:
1. Acessar /login
2. Clicar em "Esqueci minha senha"
3. Preencher email
4. Clicar em "Enviar link"
5. (Manual) Verificar email recebido
6. Clicar no link de recuperação
7. Preencher nova senha
8. Confirmar nova senha
9. Clicar em "Redefinir Senha"

**Resultado Esperado**:
- Email enviado com link válido
- Link redireciona para /reset-password
- Senha atualizada com sucesso
- Login com nova senha funciona

---

### T05 - Dashboard Principal
**Pré-condições**: Usuário logado

**Passos**:
1. Acessar /dashboard
2. Verificar carregamento dos cards
3. Verificar métricas exibidas
4. Verificar navegação da sidebar

**Resultado Esperado**:
- Dashboard carrega em < 3s
- Cards exibem dados corretos
- Sidebar funcional
- Nenhum erro no console

---

### T06 - Criar Assessment
**Pré-condições**: Usuário logado com permissão

**Passos**:
1. Acessar /dashboard/assessments
2. Clicar em "Nova Avaliação"
3. Preencher título
4. Selecionar questionário
5. Definir período
6. Selecionar departamentos
7. Clicar em "Criar"

**Resultado Esperado**:
- Assessment criado
- Redirecionamento para detalhes
- Link de participação gerado
- Registro em assessments table

---

### T07 - Gerenciar Questionário
**Pré-condições**: Usuário admin logado

**Passos**:
1. Acessar /dashboard/questionnaires
2. Clicar em "Novo Questionário"
3. Preencher título e descrição
4. Adicionar perguntas (likert, texto, nps)
5. Configurar categorias
6. Salvar questionário

**Resultado Esperado**:
- Questionário criado
- Perguntas associadas
- Categorias configuradas

---

### T08 - Responder Questionário (Participante)
**Pré-condições**: Assessment ativo com link válido

**Passos**:
1. Acessar link de participação /respond/{token}
2. Preencher dados demográficos
3. Responder todas as perguntas
4. Submeter respostas

**Resultado Esperado**:
- Progresso salvo
- Respostas registradas em responses
- Tela de agradecimento exibida
- Não permite re-submissão

---

### T09 - Analytics
**Pré-condições**: Assessment com respostas

**Passos**:
1. Acessar /dashboard/analytics
2. Selecionar assessment
3. Verificar gráficos carregados
4. Verificar métricas de risco
5. Navegar entre abas

**Resultado Esperado**:
- Gráficos renderizados
- Cálculos de risco corretos
- Filtros funcionais
- Performance < 5s

---

### T10 - Exportar Relatório
**Pré-condições**: Analytics com dados

**Passos**:
1. Na página de analytics
2. Clicar em "Exportar PDF" ou "Exportar Excel"
3. Aguardar geração
4. Verificar download

**Resultado Esperado**:
- Arquivo baixado
- Conteúdo correto
- Formatação adequada

---

### T11 - Plano de Ação com IA
**Pré-condições**: Analytics com categorias de risco médio/alto

**Passos**:
1. Na página de analytics
2. Clicar no card "Plano de Ação com IA"
3. Clicar em "Gerar com IA"
4. Aguardar geração
5. Verificar ações sugeridas

**Resultado Esperado**:
- Ações geradas baseadas no risco
- Prioridades corretas
- Timeline e responsáveis definidos

---

## 4. Matriz de Rastreabilidade

| Requisito | Casos de Teste | Status |
|-----------|----------------|--------|
| REQ-001: Registro | T01 | ⏳ |
| REQ-002: Autenticação | T02, T04 | ⏳ |
| REQ-003: Pagamento | T03 | ⏳ |
| REQ-004: Assessments | T06, T08 | ⏳ |
| REQ-005: Analytics | T09, T10, T11 | ⏳ |
| REQ-006: Multi-tenant | T16 | ⏳ |

---

## 5. Plano de Correção

### Template de Bug Report
```markdown
## Bug #XXX - [Título Descritivo]

**Severidade**: CRÍTICO | ALTA | MÉDIA | BAIXA
**Prioridade**: P0 | P1 | P2 | P3
**Caso de Teste**: T0X
**Ambiente**: Produção / Staging

### Descrição
[Descrição clara do problema]

### Passos para Reproduzir
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

### Resultado Atual
[O que acontece]

### Resultado Esperado
[O que deveria acontecer]

### Evidências
- Screenshot: [link]
- Console Log: [erro]
- Network: [request/response]

### Análise Técnica
- Arquivo: [caminho do arquivo]
- Linha: [número]
- Causa Raiz: [análise]

### Solução Proposta
[Descrição da correção]

### Estimativa
- Tempo: [horas]
- Complexidade: Baixa | Média | Alta

### Checklist de Correção
- [ ] Fix implementado
- [ ] Testes unitários adicionados
- [ ] Teste E2E atualizado
- [ ] Code review aprovado
- [ ] Deploy realizado
- [ ] Verificação em produção
```

### Priorização de Correções

| Severidade | SLA | Ação |
|------------|-----|------|
| CRÍTICO | 4h | Parar tudo, corrigir imediatamente |
| ALTA | 24h | Próxima sprint, alta prioridade |
| MÉDIA | 1 semana | Incluir na sprint atual |
| BAIXA | 2 semanas | Backlog priorizado |

---

## 6. Cronograma de Execução

### Fase 1: Testes Críticos (P0)
- [ ] T01 - Registro
- [ ] T02 - Login
- [ ] T03 - Pagamento
- [ ] T04 - Recuperação de Senha

### Fase 2: Testes Core (P1)
- [ ] T05 - Dashboard
- [ ] T06 - Criar Assessment
- [ ] T07 - Gerenciar Questionário
- [ ] T08 - Responder Questionário
- [ ] T09 - Analytics
- [ ] T10 - Exportar Relatório

### Fase 3: Testes Avançados (P2)
- [ ] T11 - Plano de Ação IA
- [ ] T12 - Importar Participantes
- [ ] T13 - Gerenciar Organização
- [ ] T14 - Gerenciar Departamentos
- [ ] T15 - Configurações de Perfil

### Fase 4: Testes de Integridade (P1)
- [ ] T16 - RLS Supabase
- [ ] T17 - Persistência
- [ ] T18 - Consistência

---

## 7. Ferramentas Utilizadas

- **Playwright**: Automação de browser
- **Supabase**: Verificação de dados
- **Stripe Test Mode**: Testes de pagamento
- **Screenshots**: Evidências visuais
- **Console Logs**: Debug de erros

---

## 8. Critérios de Aceite

### Para Release
- 100% dos testes P0 passando
- 90% dos testes P1 passando
- 80% dos testes P2 passando
- Zero bugs CRÍTICOS abertos
- Máximo 2 bugs ALTA abertos

### Para Deploy
- Build sem erros
- Lint sem warnings críticos
- Testes unitários passando
- E2E críticos passando
