# Configuração do Supabase - Políticas RLS

## Problema Identificado

O erro "Database error saving new user" ocorre porque as políticas de Row Level Security (RLS) estão bloqueando as operações.

## Solução: Configurar Políticas RLS

Execute os seguintes comandos SQL no Supabase SQL Editor:

### 1. Políticas para `organizations`

```sql
-- Permitir INSERT para usuários autenticados
CREATE POLICY "Users can create organizations"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir SELECT para membros da organização
CREATE POLICY "Users can view their organization"
ON organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid()
  )
);

-- Permitir UPDATE para admins
CREATE POLICY "Admins can update their organization"
ON organizations FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 2. Políticas para `user_profiles`

```sql
-- Permitir SELECT do próprio perfil
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Permitir UPDATE do próprio perfil
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Permitir SELECT de perfis da mesma organização
CREATE POLICY "Users can view organization members"
ON user_profiles FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid()
  )
);
```

### 3. Políticas para `departments`

```sql
-- Permitir SELECT de departamentos da organização
CREATE POLICY "Users can view organization departments"
ON departments FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid()
  )
);

-- Permitir INSERT para admins/managers
CREATE POLICY "Admins and managers can create departments"
ON departments FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Permitir UPDATE para admins/managers
CREATE POLICY "Admins and managers can update departments"
ON departments FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Permitir DELETE para admins
CREATE POLICY "Admins can delete departments"
ON departments FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 4. Verificar se RLS está ativo

```sql
-- Ver status do RLS em todas as tabelas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### 5. Se necessário, habilitar RLS

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
```

## Teste após configurar

1. Execute os comandos SQL acima no Supabase
2. Tente criar uma nova conta
3. Verifique os logs do servidor
4. Se ainda houver erro, compartilhe a mensagem de erro específica
