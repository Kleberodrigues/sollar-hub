# 🗄️ Database Migrations - Sollar Insight Hub

**Data de Criação**: 2025-12-02
**Status**: ✅ **16 Migrations Formais Criadas**
**Segurança**: 🏆 **100% Testado** (25/25 testes passando)

---

## 📋 Visão Geral

Este documento descreve todas as migrations do banco de dados Supabase, organizadas cronologicamente para versionamento e reprodutibilidade.

### Objetivo

Transformar o schema do banco de dados em **Infrastructure as Code**, permitindo:

- ✅ Versionamento via Git
- ✅ Reprodutibilidade (dev → staging → production)
- ✅ Rollback de mudanças
- ✅ Documentação automática
- ✅ CI/CD integration

---

## 🏗️ Estrutura das Migrations

### Tabelas Core (Migrations 001-009)

| # | Arquivo | Tabela | Descrição |
|---|---------|--------|-----------|
| 001 | `20241202000001_create_organizations.sql` | `organizations` | Organizações/empresas (multi-tenant root) |
| 002 | `20241202000002_create_user_profiles.sql` | `user_profiles` | Perfis de usuários (extends auth.users) |
| 003 | `20241202000003_create_departments.sql` | `departments` | Departamentos com hierarquia |
| 004 | `20241202000004_create_department_members.sql` | `department_members` | Membros de departamentos (N:N) |
| 005 | `20241202000005_create_questionnaires.sql` | `questionnaires` | Templates de questionários |
| 006 | `20241202000006_create_questions.sql` | `questions` | Perguntas individuais |
| 007 | `20241202000007_create_assessments.sql` | `assessments` | Avaliações/Diagnósticos |
| 008 | `20241202000008_create_responses.sql` | `responses` | Respostas anônimas |
| 009 | `20241202000009_create_risk_scores.sql` | `risk_scores` | Scores de risco calculados |

### Row Level Security (Migrations 010-016)

| # | Arquivo | Escopo | Descrição |
|---|---------|--------|-----------|
| 010 | `20241202000010_enable_rls_all_tables.sql` | Todas tabelas | Habilita RLS + FORCE RLS |
| 011 | `20241202000011_create_rls_policies_organizations.sql` | `organizations` | Isolamento multi-tenant |
| 012 | `20241202000012_create_rls_policies_users.sql` | `user_profiles` | Org-scoped + hierarquia |
| 013 | `20241202000013_create_rls_policies_departments.sql` | `departments`, `department_members` | Admin/Manager access |
| 014 | `20241202000014_create_rls_policies_questionnaires.sql` | `questionnaires`, `questions` | Admin/Manager CRUD |
| 015 | `20241202000015_create_rls_policies_assessments.sql` | `assessments`, `risk_scores` | Admin/Manager CRUD |
| 016 | `20241202000016_create_rls_policies_responses.sql` | `responses` | Anonimato total |

---

## 🔐 Segurança e RLS

### Políticas Implementadas

#### 1. **Isolamento Multi-Tenant** (100%)
Cada organização só acessa seus próprios dados.

**Testado**:
- ✅ SELECT isolation (8/8 testes)
- ✅ UPDATE cross-org blocked
- ✅ DELETE cross-org blocked
- ✅ INSERT cross-org blocked

#### 2. **Hierarquia de Roles** (100%)
```
admin > manager > member > viewer
```

**Permissões**:
- `admin`: Full access (CRUD em tudo da org)
- `manager`: CRUD em assessments/questionnaires
- `member`: READ em dados da org
- `viewer`: READ-ONLY em tudo

**Testado**: 10/10 testes (100%)

#### 3. **Anonimato de Respostas** (100%)
Respostas completamente anônimas - sem user_id.

**Garantias**:
- ✅ Apenas `anonymous_id` (UUID aleatório)
- ✅ INSERT público (anon + authenticated)
- ✅ No UPDATE/DELETE (respostas imutáveis)
- ✅ Impossível correlacionar com usuários

**Testado**: 7/7 testes (100%)

---

## 📊 Schema Diagram

```
organizations (multi-tenant root)
    ├─ user_profiles (1:N)
    │   └─ department_members (N:N)
    │       └─ departments (1:N, hierarchical)
    │
    ├─ questionnaires (1:N)
    │   └─ questions (1:N)
    │
    └─ assessments (1:N)
        ├─ responses (1:N, anonymous)
        └─ risk_scores (1:N)
```

---

## 🚀 Como Usar as Migrations

### Ambiente Local (Docker Required)

```bash
# 1. Iniciar Supabase local
npx supabase start

# 2. Aplicar todas as migrations
npx supabase db reset

# 3. Validar com testes
npm run test:security

# Resultado esperado: 25/25 testes (100%)
```

### Ambiente Remoto (Production)

```bash
# 1. Conectar ao projeto
npx supabase link --project-ref <project-id>

# 2. Aplicar migrations remotas
npx supabase db push

# 3. Validar
npm run test:security
```

### Gerar Types TypeScript

```bash
# Gerar types do schema atual
npx supabase gen types typescript --local > types/database.types.ts

# Ou do remoto
npx supabase gen types typescript --linked > types/database.types.ts
```

---

## 📝 Convenções de Nomenclatura

### Migrations

**Formato**: `YYYYMMDDHHMMSS_description.sql`

**Exemplos**:
- `20241202000001_create_organizations.sql`
- `20241202000011_create_rls_policies_organizations.sql`

### Tabelas

- Plural: `organizations`, `users`, `departments`
- Snake_case: `user_profiles`, `department_members`
- Descritivo: `risk_scores`, `response_answers`

### Políticas RLS

**Formato**: `{table}_{operation}_{condition}`

**Exemplos**:
- `orgs_select_own` - Usuários veem apenas sua org
- `orgs_update_own_admin` - Apenas admins atualizam
- `responses_insert_public` - INSERT público/anônimo

---

## 🔧 Manutenção

### Criar Nova Migration

```bash
# Criar arquivo com timestamp
npx supabase migration new <description>

# Exemplo
npx supabase migration new add_notifications_table
```

### Rollback

```bash
# Ver histórico
npx supabase migration list

# Reverter última migration
npx supabase migration repair <timestamp> --status reverted
```

### Diff com Remoto

```bash
# Ver diferenças entre local e remoto
npx supabase db diff --linked

# Gerar migration das diferenças
npx supabase db diff --linked --schema public > new_migration.sql
```

---

## ✅ Checklist de Validação

Antes de aplicar migrations em produção:

- [ ] Migrations testadas localmente
- [ ] Testes de segurança passando (25/25)
- [ ] Types TypeScript atualizados
- [ ] Backup do banco de dados remoto
- [ ] Plano de rollback documentado
- [ ] Stakeholders notificados

---

## 📚 Referências

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📈 Histórico de Mudanças

### 2025-12-02 - Initial Migration Set
- ✅ Criadas 16 migrations formais
- ✅ Schema completo documentado
- ✅ RLS 100% implementado e testado
- ✅ 25/25 testes de segurança passando

---

**Desenvolvido com 💚 por Claude Code**
**Última Atualização**: 2025-12-02
