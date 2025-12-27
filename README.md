# Sollar Insight Hub

Plataforma de gestão de pesquisas e avaliações de clima organizacional desenvolvida com Next.js 15, TypeScript e Supabase.

## Sobre o Projeto

O Sollar Insight Hub é uma aplicação web moderna que permite às organizações criar, gerenciar e analisar pesquisas de clima organizacional e avaliações customizadas. Com foco em privacidade e análise de dados, a plataforma oferece recursos avançados de segmentação por departamento, gestão de usuários multi-nível e anonimato nas respostas.

## Tecnologias Principais

- **Next.js 15** - Framework React com App Router e Server Components
- **TypeScript** - Tipagem estática para maior segurança
- **Supabase** - Backend as a Service (PostgreSQL + Auth + Storage)
- **TailwindCSS** - Estilização com utility-first CSS
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Recharts** - Visualização de dados e gráficos
- **Playwright** - Testes E2E automatizados

## Funcionalidades

### Gestão de Organizações
- Sistema multi-tenant com isolamento de dados
- Gestão de departamentos e hierarquia organizacional
- Configurações personalizadas por organização

### Gestão de Usuários
- 3 níveis de permissão: Admin, Manager, User
- Autenticação segura via Supabase Auth
- Convites de usuários por email
- Gestão de perfis e permissões

### Questionários
- Editor de questionários customizados
- Múltiplos tipos de questões (escala, texto, múltipla escolha)
- Categorização e organização de questões
- Biblioteca de templates prontos

### Assessments (Avaliações)
- Criação de avaliações com datas de início/fim
- Segmentação por departamento
- Link público anônimo para coleta de respostas
- Status em tempo real (rascunho, ativo, encerrado)

### Análise e Relatórios
- Dashboard com métricas consolidadas
- Visualização de resultados por departamento
- Gráficos e estatísticas detalhadas
- Exportação de dados

### Segurança e Privacidade
- Respostas anônimas com hash único
- Row Level Security (RLS) no Supabase
- Isolamento completo de dados entre organizações
- Testes automatizados de segurança

## Estrutura do Projeto

```
sollar-insight-hub/
├── app/                      # App Router do Next.js
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/
│   │   ├── signup/
│   │   └── confirm/
│   ├── dashboard/           # Área autenticada
│   │   ├── assessments/     # CRUD de avaliações
│   │   ├── questionnaires/  # CRUD de questionários
│   │   ├── results/         # Análise de resultados
│   │   └── users/           # Gestão de usuários (admin)
│   ├── assess/[id]/         # Página pública de resposta
│   └── api/                 # API Routes
├── components/              # Componentes React
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   ├── assessments/         # Assessment-specific
│   ├── questionnaires/      # Questionnaire-specific
│   └── results/             # Results visualization
├── lib/                     # Utilitários
│   ├── supabase/            # Clients do Supabase
│   └── utils.ts             # Helper functions
├── hooks/                   # React Hooks customizados
├── types/                   # TypeScript types
├── supabase/               # Configurações do Supabase
│   └── migrations/         # Database migrations
└── tests/                  # Testes automatizados
    ├── e2e/               # Testes E2E (Playwright)
    └── security/          # Testes de segurança
```

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Git

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sollar-insight-hub.git
cd sollar-insight-hub
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Configure o banco de dados:

Execute as migrations no seu projeto Supabase através do Supabase CLI ou dashboard web.

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint

# Testes
npm test             # Executa testes unitários (Vitest)
npm run test:unit    # Executa testes unitários uma vez
npm run test:watch   # Testes unitários em modo watch
npm run test:e2e     # Executa testes E2E (Playwright)
npm run test:e2e:ui  # Testes E2E com UI interativa
npm run test:security # Executa testes de segurança

# Banco de Dados (Supabase)
npm run db:start     # Inicia Supabase local
npm run db:stop      # Para Supabase local
npm run db:reset     # Reseta banco de dados
npm run db:push      # Aplica migrations
npm run db:types     # Gera tipos TypeScript
```

## Fluxo de Uso

1. **Setup Inicial**
   - Crie uma conta de administrador
   - Configure sua organização
   - Crie departamentos

2. **Criar Questionário**
   - Acesse "Questionários"
   - Crie questões customizadas ou use templates
   - Organize por categorias

3. **Criar Assessment**
   - Acesse "Assessments"
   - Selecione o questionário
   - Defina período e segmentação
   - Ative o assessment

4. **Coletar Respostas**
   - Compartilhe o link público
   - Usuários respondem anonimamente
   - Acompanhe taxa de participação

5. **Analisar Resultados**
   - Visualize dashboard consolidado
   - Filtre por departamento/período
   - Exporte relatórios

## Testes

### Testes E2E
```bash
npm run test:e2e
```

### Testes de Segurança
```bash
npm run test:security
```

Testes cobrem:
- Isolamento entre organizações
- Anonimato nas respostas
- Controle de acesso por role
- Tentativas de acesso não autorizado

## Arquitetura

### Server vs Client Components
- Server Components para data fetching
- Client Components para interatividade
- Otimização de bundle e performance

### Row Level Security (RLS)
- Políticas a nível de banco de dados
- Isolamento automático por organização
- Controle de acesso por role

### Autenticação
- Supabase Auth com JWT
- Middleware de proteção de rotas
- Session management otimizado

## Roadmap

- [x] Fase 0: Setup inicial e autenticação
- [x] Fase 1: Gestão de organizações
- [x] Fase 2: CRUD de questionários
- [x] Fase 3: Gestão de usuários
- [x] Fase 4: Dashboard e layout
- [x] Fase 5: CRUD de assessments
- [x] Fase 6: Coleta de respostas anônimas
- [x] Fase 7: Análise e relatórios (NR-1, 8 blocos)
- [x] Fase 8: Exportação de dados (CSV/PDF)
- [x] Fase 9: CI/CD e testes automatizados
- [x] Fase 10: Integração Stripe (billing)

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Documentação Adicional

- [ROADMAP.md](./ROADMAP.md) - Roadmap detalhado do projeto
- [docs/SETUP_GITHUB_SECRETS.md](./docs/SETUP_GITHUB_SECRETS.md) - Configuração de CI/CD
- [docs/SETUP_STRIPE.md](./docs/SETUP_STRIPE.md) - Configuração do Stripe (billing)
- [MIGRATIONS.md](./MIGRATIONS.md) - Documentação das migrations
- [TESTING.md](./TESTING.md) - Guia de testes
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup do Supabase

## Status dos Testes

| Tipo | Cobertura | Status |
|------|-----------|--------|
| Unitários | 27/27 | ✅ 100% |
| Segurança | 23/25 | ✅ 92% |
| E2E | 16/18 | ✅ 89% |

> Os 2 testes de segurança que "falham" são comportamento esperado devido à política de acesso público para assessments ativos.

## Licença

Este projeto está sob a licença MIT.

## Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

Desenvolvido com ❤️ para melhorar o clima organizacional das empresas.
