# Configuracao de Secrets do GitHub

Este guia explica como configurar os secrets necessarios para o CI/CD funcionar.

## Passo 1: Acessar Configuracoes do Repositorio

1. Acesse seu repositorio no GitHub
2. Va em **Settings** (engrenagem)
3. No menu lateral, clique em **Secrets and variables** > **Actions**
4. Clique em **New repository secret**

## Passo 2: Adicionar Secrets do Supabase

### NEXT_PUBLIC_SUPABASE_URL
- **Onde encontrar**: Supabase Dashboard > Settings > API > Project URL
- **Formato**: `https://xxxxx.supabase.co`

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Onde encontrar**: Supabase Dashboard > Settings > API > anon public
- **Formato**: `eyJhbGci...` (JWT token longo)

## Passo 3: Adicionar Secrets da Vercel

### VERCEL_TOKEN
1. Acesse [Vercel Dashboard](https://vercel.com/account/tokens)
2. Clique em **Create Token**
3. De um nome (ex: "GitHub Actions")
4. Defina o escopo como **Full Account**
5. Copie o token gerado

### VERCEL_ORG_ID
1. Acesse [Vercel Dashboard](https://vercel.com)
2. Clique no seu perfil/time no canto superior esquerdo
3. Va em **Settings**
4. Copie o **Team ID** (ou Personal Account ID)

### VERCEL_PROJECT_ID
1. Acesse seu projeto na Vercel
2. Va em **Settings** > **General**
3. Copie o **Project ID**

## Passo 4: Secrets Opcionais (Testes)

### TEST_USER_EMAIL
- Email de um usuario de teste criado no Supabase
- Exemplo: `test@suaempresa.com.br`

### TEST_USER_PASSWORD
- Senha do usuario de teste
- Minimo 8 caracteres

### TEST_ADMIN_EMAIL
- Email de um admin de teste
- Exemplo: `admin@suaempresa.com.br`

### TEST_ADMIN_PASSWORD
- Senha do admin de teste

## Passo 5: Criar Usuarios de Teste no Supabase

### Via Dashboard (Recomendado)

1. Acesse Supabase Dashboard > Authentication > Users
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - Email: `test@suaempresa.com.br`
   - Password: `TestPassword123!`
   - Auto Confirm User: **ON**
4. Apos criar, va em **SQL Editor** e execute:

```sql
-- Vincular usuario a organizacao existente
INSERT INTO public.user_profiles (id, organization_id, full_name, role)
SELECT
  (SELECT id FROM auth.users WHERE email = 'test@suaempresa.com.br'),
  (SELECT id FROM public.organizations LIMIT 1),
  'Usuario Teste',
  'member'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Usuario Teste',
  role = 'member';
```

5. Repita para admin:

```sql
-- Criar perfil admin
INSERT INTO public.user_profiles (id, organization_id, full_name, role)
SELECT
  (SELECT id FROM auth.users WHERE email = 'admin@suaempresa.com.br'),
  (SELECT id FROM public.organizations LIMIT 1),
  'Admin Teste',
  'admin'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Admin Teste',
  role = 'admin';
```

## Lista Completa de Secrets

| Secret | Obrigatorio | Descricao |
|--------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anonima do Supabase |
| `VERCEL_TOKEN` | Sim* | Token de API da Vercel |
| `VERCEL_ORG_ID` | Sim* | ID da organizacao/conta Vercel |
| `VERCEL_PROJECT_ID` | Sim* | ID do projeto na Vercel |
| `TEST_USER_EMAIL` | Nao | Email do usuario de teste |
| `TEST_USER_PASSWORD` | Nao | Senha do usuario de teste |
| `TEST_ADMIN_EMAIL` | Nao | Email do admin de teste |
| `TEST_ADMIN_PASSWORD` | Nao | Senha do admin de teste |

*Obrigatorio apenas se quiser deploy automatico

## Verificar Configuracao

Apos configurar, faca um push para o repositorio e verifique:

1. Va em **Actions** no GitHub
2. Verifique se o workflow **CI/CD Pipeline** iniciou
3. Todos os jobs devem passar (verde)

## Seguranca

- Secrets sao criptografados e nunca aparecem em logs
- Nunca compartilhe secrets em issues ou PRs
- Use secrets diferentes para producao e desenvolvimento
- Rotacione tokens periodicamente
