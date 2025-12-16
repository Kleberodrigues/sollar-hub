# 🔐 Testes de Segurança - Sollar Insight Hub

Suite completa de testes automatizados para validar a segurança do banco de dados Supabase.

## 📋 Suites de Teste

### 1. **Isolamento Multi-Tenant** (`test-isolation.ts`)
Valida que organizações diferentes não conseguem acessar dados umas das outras.

**Testes realizados:**
- ✅ Criar 2 organizações diferentes
- ✅ Verificar que User1 só vê sua organização
- ✅ Verificar que User2 só vê sua organização
- ✅ Verificar que User1 não vê profiles do User2
- ✅ Tentar inserir em outra organização (deve falhar)
- ✅ Tentar atualizar outra organização (deve falhar)

---

### 2. **Hierarquia de Roles** (`test-roles.ts`)
Valida que Admin > Manager > Member > Viewer têm permissões corretas.

**Testes realizados:**
- ✅ Admin pode criar/atualizar/deletar
- ✅ Admin pode atualizar organização
- ✅ Manager pode criar questionários
- ✅ Manager NÃO pode atualizar organização
- ✅ Member pode ler mas NÃO pode criar
- ✅ Viewer pode ler mas NÃO pode criar/atualizar

---

### 3. **Anonimato de Respostas** (`test-anonymity.ts`)
Valida que respostas são completamente anônimas e protegidas.

**Testes realizados:**
- ✅ Cliente anônimo pode ler perguntas de assessment ativo
- ✅ Cliente anônimo pode submeter respostas
- ✅ Respostas usam `anonymous_id` (sem `user_id`)
- ✅ Admin NÃO consegue ler respostas individuais
- ✅ Assessment ativo é acessível publicamente
- ✅ Assessment inativo NÃO é acessível publicamente

---

## 🚀 Como Executar

### Executar todos os testes
```bash
npm run test:security
```

### Executar testes individuais
```bash
# Teste de isolamento
npm run test:isolation

# Teste de hierarquia de roles
npm run test:roles

# Teste de anonimato
npm run test:anonymity
```

---

## 📊 Interpretação dos Resultados

### ✅ **100% - Perfeito!**
Todos os testes passaram. Segurança está implementada corretamente.

### ⚠️ **70-99% - Atenção**
A maioria dos testes passaram, mas há alguns pontos a melhorar.

### ❌ **<70% - Crítico**
Há problemas sérios de segurança que precisam ser corrigidos imediatamente.

---

## 🔧 Requisitos

- Node.js 18+
- Variáveis de ambiente configuradas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🛡️ Políticas RLS Validadas

### Organizations
- ✅ Usuários veem apenas sua organização
- ✅ Apenas admins podem atualizar
- ✅ INSERT apenas via service_role

### User Profiles
- ✅ Usuários veem próprio perfil + membros da org
- ✅ Apenas próprio perfil pode ser atualizado
- ✅ INSERT apenas via trigger/admin

### Departments
- ✅ Apenas da mesma organização
- ✅ Admins e Managers podem gerenciar

### Questionnaires
- ✅ Apenas da mesma organização
- ✅ Admins e Managers podem criar/editar/deletar
- ✅ Members e Viewers podem apenas ler

### Questions
- ✅ Autenticados veem via questionnaire da org
- ✅ Anônimos veem via assessment ativo
- ✅ Admins e Managers podem gerenciar

### Assessments
- ✅ Autenticados veem própria org + filtro por departamento
- ✅ Anônimos veem apenas assessments ativos
- ✅ Admins e Managers podem gerenciar

### Responses (CRÍTICO - Anonimato)
- ✅ Qualquer um pode submeter (anon + authenticated)
- ✅ **NENHUMA** política SELECT - respostas individuais são privadas
- ✅ Apenas `anonymous_id` (sem `user_id`)

### Risk Scores
- ✅ Apenas própria organização + filtro por departamento
- ✅ INSERT/UPDATE apenas via server functions

---

## 🐛 Troubleshooting

### Erro: "permission denied for schema auth"
**Solução:** As helper functions devem estar no schema `public`, não `auth`.

### Erro: "row-level security policy"
**Solução:** Verifique se executou o SQL `supabase-security-complete-v2.sql`.

### Erro: "Missing environment variables"
**Solução:** Configure `.env.local` com todas as variáveis necessárias.

---

## 📝 Manutenção

Sempre que modificar políticas RLS:
1. Atualizar o SQL em `supabase-security-complete-v2.sql`
2. Executar SQL no Supabase
3. Executar `npm run test:security`
4. Validar que todos os testes passam

---

## 🔍 Estrutura dos Testes

```
tests/security/
├── test-isolation.ts      # Testes de isolamento multi-tenant
├── test-roles.ts          # Testes de hierarquia de permissões
├── test-anonymity.ts      # Testes de anonimato de respostas
├── run-all-tests.ts       # Runner que executa todos os testes
└── README.md              # Esta documentação
```

---

## 📖 Referências

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
