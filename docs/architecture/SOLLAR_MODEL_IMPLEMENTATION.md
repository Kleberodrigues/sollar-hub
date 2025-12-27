# Implementação do Modelo Sollar de Riscos Psicossociais

## 📋 Resumo Executivo

Este documento descreve a implementação completa do **Modelo Sollar de Riscos Psicossociais** no sistema Sollar Insight Hub, substituindo o modelo anterior (HSE Management Standards) por um modelo brasileiro adaptado às necessidades da NR-1 e do mercado nacional.

**Data de Implementação**: 2025-01-05
**Status**: ✅ Migrations criadas, ⏳ Aguardando execução no banco

---

## 🎯 Objetivo

Adequar o sistema ao modelo Sollar de questionários psicossociais conforme especificação fornecida, incluindo:

1. **Questionário Sollar de Riscos Psicossociais** (30 perguntas, 8 blocos)
2. **Pesquisa de Clima** (5 perguntas, 1 minuto)
3. Suporte a escalas customizadas, lógica de risco invertida e anonimato

---

## 📊 Mudanças Implementadas

### 1. Atualização do Schema do Banco de Dados

**Arquivo**: `supabase/migrations/20250105000001_update_schema_sollar_model.sql`

#### 1.1. Novas Categorias de Risco (8 Blocos Sollar)

**Antes** (HSE Model):
```sql
CREATE TYPE risk_category AS ENUM (
  'demands', 'control', 'support', 'relationships', 'role', 'change'
);
```

**Depois** (Sollar Model):
```sql
CREATE TYPE risk_category AS ENUM (
  'demands_and_pace',           -- Demandas e Ritmo de Trabalho
  'autonomy_clarity_change',    -- Autonomia, Clareza e Mudanças
  'leadership_recognition',     -- Liderança e Reconhecimento
  'relationships_communication',-- Relações, Clima e Comunicação
  'work_life_health',           -- Equilíbrio Trabalho–Vida e Saúde
  'violence_harassment',        -- Violência, Assédio e Medo de Repressão
  'anchors',                    -- Âncoras (Satisfação, Saúde, Permanência)
  'suggestions'                 -- Sugestões
);
```

#### 1.2. Novos Campos na Tabela `questionnaires`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `introduction_text` | TEXT | Texto de boas-vindas exibido no início (suporta Markdown) |
| `lgpd_consent_text` | TEXT | Termo de consentimento LGPD que o respondente deve aceitar |
| `questionnaire_type` | ENUM | Tipo: `nr1_full` (NR-1 completo), `pulse_monthly` (pesquisa rápida) ou `custom` |

#### 1.3. Novos Campos na Tabela `questions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `scale_labels` | JSONB | Labels customizados para escala Likert (ex: `{"1": "Nunca", "5": "Sempre"}`) |
| `allow_skip` | BOOLEAN | Permite opção "Prefiro não responder" (importante para questões sensíveis) |
| `risk_inverted` | BOOLEAN | Lógica de risco: `true` = maior nota = maior risco (padrão Sollar) |
| `is_strategic_open` | BOOLEAN | Marca perguntas abertas estratégicas (ex: "O que você mudaria?") |
| `min_value` | INTEGER | Valor mínimo para escalas numéricas (ex: 0 para escala 0-10) |
| `max_value` | INTEGER | Valor máximo para escalas numéricas (ex: 10 para escala 0-10) |

### 2. Questionário Sollar de Riscos Psicossociais

**Arquivos**:
- `supabase/migrations/20250105000002_seed_sollar_questionnaire_part1.sql` (Blocos 1-4)
- `supabase/migrations/20250105000003_seed_sollar_questionnaire_part2.sql` (Blocos 5-8)

**Estrutura**:

#### Bloco 1: Demandas e Ritmo de Trabalho (4 questões)
- Q1.1: Mais tarefas do que consigo fazer
- Q1.2: Ritmo acelerado
- Q1.3: Trabalho repetitivo ou parado
- Q1.A (aberta): "O que você mudaria?"

#### Bloco 2: Autonomia, Clareza e Mudanças (4 questões)
- Q2.1: Pouca liberdade para decidir
- Q2.2: Falta de clareza nas prioridades
- Q2.3: Mudanças sem explicação
- Q2.A (aberta): "O que atrapalha sua organização?"

#### Bloco 3: Liderança e Reconhecimento (4 questões)
- Q3.1: Desrespeito pela liderança
- Q3.2: Falta de reconhecimento
- Q3.3: Medo de dar opinião
- Q3.A (aberta): "Que mudança pediria à liderança?"

#### Bloco 4: Relações, Clima e Comunicação (4 questões)
- Q4.1: Dificuldade para conseguir ajuda
- Q4.2: Falta de respeito entre equipe
- Q4.3: Injustiça ou favoritismo
- Q4.A (aberta): "Percebe injustiça ou favoritismo?"

#### Bloco 5: Equilíbrio Trabalho–Vida e Saúde (4 questões)
- Q5.1: Trabalho atrapalha vida pessoal
- Q5.2: Preocupação fora do horário
- Q5.3: Esgotamento nos últimos 30 dias
- Q5.A (aberta): "Trabalho impacta sua saúde?"

#### Bloco 6: Violência, Assédio e Medo de Repressão (4 questões)
- Q6.1: Tratamento humilhante ou agressivo (**permite "Prefiro não responder"**)
- Q6.2: Presenciou assédio moral ou sexual (**permite "Prefiro não responder"**)
- Q6.3: Medo de represália (**permite "Prefiro não responder"**)
- Q6.A (aberta, opcional): "Conte situação grave" (completamente opcional)

#### Bloco 7: Âncoras (3 questões)
- Q7.1: Satisfação geral (escala 0-10, **não invertida**: 10 = alta satisfação)
- Q7.2: Intenção de permanecer (Sim/Não/Não sei)
- Q7.3: Saúde física e mental (5 níveis: Muito boa → Muito ruim, **não invertida**)

#### Bloco 8: Sugestões (3 questões abertas)
- Q8.1: 3 coisas que mais ajudam
- Q8.2: 3 coisas que mais atrapalham
- Q8.3: 1 ação prática de melhoria

**Total**: 30 questões (19 fechadas + 11 abertas)

### 3. Questionário Pulse Geral Mensal

**Arquivo**: `supabase/migrations/20250105000004_seed_pulse_questionnaire.sql`

**Estrutura** (5 questões, 1 minuto):

1. **Sentimento geral**: Como você está se sentindo? (Muito bem → Muito mal)
2. **Satisfação**: Escala 0-10 (**não invertida**)
3. **Carga sustentável**: Consigo dar conta sem sobrecarga? (**não invertida**: mais = melhor)
4. **Comunicação com liderança**: Posso falar abertamente? (**não invertida**: mais = melhor)
5. **Ambiente respeitoso**: Ambiente colaborativo? (**não invertida**: mais = melhor)

### 4. Atualização dos Types TypeScript

**Arquivos Modificados**:
- `types/database.types.ts`
- `types/index.ts`

**Mudanças**:

```typescript
// Novo tipo para tipo de questionário
export type QuestionnaireType = 'nr1_full' | 'pulse_monthly' | 'custom'

// Novas categorias Sollar
export type RiskCategory =
  | 'demands_and_pace'
  | 'autonomy_clarity_change'
  | 'leadership_recognition'
  | 'relationships_communication'
  | 'work_life_health'
  | 'violence_harassment'
  | 'anchors'
  | 'suggestions'

// Novos labels em português
export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  demands_and_pace: 'Demandas e Ritmo de Trabalho',
  autonomy_clarity_change: 'Autonomia, Clareza e Mudanças',
  leadership_recognition: 'Liderança e Reconhecimento',
  relationships_communication: 'Relações, Clima e Comunicação',
  work_life_health: 'Equilíbrio Trabalho–Vida e Saúde',
  violence_harassment: 'Violência, Assédio e Medo de Repressão',
  anchors: 'Âncoras (Satisfação, Saúde, Permanência)',
  suggestions: 'Sugestões'
}

export const QUESTIONNAIRE_TYPE_LABELS: Record<QuestionnaireType, string> = {
  nr1_full: 'NR-1 Completo',
  pulse_monthly: 'Pulse Mensal',
  custom: 'Personalizado'
}
```

**Interfaces Atualizadas**:
- `Questionnaire`: Adicionados `questionnaire_type`, `introduction_text`, `lgpd_consent_text`
- `Question`: Adicionados `scale_labels`, `allow_skip`, `risk_inverted`, `is_strategic_open`, `min_value`, `max_value`

---

## 🔄 Lógica de Risco Invertida

### Conceito

No modelo Sollar, a maioria das questões **fechadas** são formuladas como **perguntas de risco**:

- **Maior nota (5) = Maior risco psicossocial**
- **Menor nota (1) = Menor risco psicossocial**

**Exemplo**:
> "Sinto que tenho mais tarefas do que consigo fazer"
> - 5 (Sempre) → **ALTO RISCO** ⚠️
> - 1 (Nunca) → **BAIXO RISCO** ✅

### Exceções (risk_inverted = false)

Algumas questões seguem lógica **não invertida** (maior = melhor):

1. **Âncoras (Bloco 7)**:
   - Q7.1: Satisfação (0-10) → 10 = Alta satisfação (BOM)
   - Q7.3: Saúde → Muito boa (MELHOR)

2. **Pulse Survey** (todas não invertidas):
   - P3: Carga sustentável → Sempre = Sustentável (BOM)
   - P4: Comunicação aberta → Sempre = Boa comunicação (BOM)
   - P5: Ambiente respeitoso → Sempre = Bom ambiente (BOM)

### Implementação nos Cálculos

```typescript
// Exemplo de cálculo de risco
function calculateRiskScore(question: Question, answer: number): number {
  if (question.risk_inverted) {
    // Maior resposta = maior risco (padrão Sollar)
    return (answer / question.max_value) * 100
  } else {
    // Maior resposta = melhor resultado (invertido)
    return (1 - (answer / question.max_value)) * 100
  }
}
```

---

## 🛡️ Funcionalidade "Prefiro Não Responder"

### Objetivo

Permitir que respondentes **pulem questões sensíveis** sem comprometer o anonimato ou criar desconforto, especialmente no **Bloco 6** (Violência e Assédio).

### Implementação

**Banco de Dados**:
- Campo `allow_skip: boolean` na tabela `questions`
- Questões do Bloco 6 têm `allow_skip = true`

**Interface (futuro)**:
- Exibir botão "Prefiro não responder" quando `allow_skip = true`
- Armazenar como `null` ou valor especial (ex: `-1`) no banco

**Cálculo de Risco**:
```typescript
// Tratar "prefiro não responder" como dado ausente
function calculateCategoryRisk(responses: Response[]): number {
  const validResponses = responses.filter(r => r.answer !== null && r.answer !== -1)
  const sum = validResponses.reduce((acc, r) => acc + r.answer, 0)
  return sum / validResponses.length // Média apenas das respostas válidas
}

// Métrica adicional: % de "prefiro não responder"
function getSkipRate(responses: Response[]): number {
  const skipCount = responses.filter(r => r.answer === null || r.answer === -1).length
  return (skipCount / responses.length) * 100
}
```

**Análise**:
- **Alto % de "prefiro não responder"** (>20%) indica **medo de represália** ou **falta de segurança psicológica**
- Deve ser reportado como métrica separada nos relatórios

---

## 📈 Próximos Passos

### Fase 1: Aplicar Migrations ✅ CRIADAS
- [x] Migration 1: Atualizar schema
- [x] Migration 2: Questionário Sollar (Part 1)
- [x] Migration 3: Questionário Sollar (Part 2)
- [x] Migration 4: Questionário Pulse

**Execução**:
```bash
cd sollar-insight-hub
npx supabase db push
```

### Fase 2: Atualizar Componentes React ⏳ PENDENTE
- [ ] Atualizar `questions-step.tsx` para exibir novos campos
- [ ] Criar componente `ScaleLabels` para escalas customizadas
- [ ] Implementar botão "Prefiro não responder"
- [ ] Exibir texto de introdução/LGPD no início do assessment
- [ ] Atualizar `review-step.tsx` para mostrar novas categorias

### Fase 3: Atualizar Cálculos de Analytics ⏳ PENDENTE
- [ ] Modificar `analytics-calculations.ts`:
  - Aplicar lógica `risk_inverted` nos cálculos
  - Tratar "Prefiro não responder" como dado ausente
  - Calcular % de skip rate no Bloco 6
- [ ] Atualizar relatórios PDF/CSV para incluir novas categorias
- [ ] Adicionar gráfico de skip rate para questões sensíveis

### Fase 4: Testes ⏳ PENDENTE
- [ ] Testar migrations em ambiente de desenvolvimento
- [ ] Atualizar testes unitários para novas categorias
- [ ] Criar testes E2E para novo fluxo de questionário
- [ ] Validar cálculos de risco com lógica invertida

### Fase 5: Documentação ⏳ PENDENTE
- [ ] Atualizar README com novos questionários
- [ ] Criar guia de uso para admins/managers
- [ ] Documentar lógica de risco invertida
- [ ] Adicionar exemplos de análise de skip rate

---

## 🔍 Validação e Testes

### Checklist de Validação

#### Schema
- [ ] Enum `risk_category` atualizado com 8 valores
- [ ] Tabela `questionnaires` possui 3 novos campos
- [ ] Tabela `questions` possui 6 novos campos
- [ ] Enum `questionnaire_type` criado

#### Dados
- [ ] Questionário "Sollar de Riscos Psicossociais" inserido (30 questões)
- [ ] Questionário "Pesquisa de Clima" inserido (5 questões)
- [ ] Escalas customizadas aplicadas corretamente
- [ ] Flags `risk_inverted` configuradas corretamente
- [ ] Flags `allow_skip` ativas no Bloco 6

#### Types
- [ ] `RiskCategory` atualizado em `database.types.ts`
- [ ] `QuestionnaireType` adicionado
- [ ] `CATEGORY_LABELS` com novos labels
- [ ] Interfaces `Questionnaire` e `Question` atualizadas

#### Funcionalidade
- [ ] Respondente pode visualizar texto de introdução
- [ ] Termo LGPD exibido antes do início
- [ ] Botão "Prefiro não responder" funciona (Bloco 6)
- [ ] Escalas customizadas renderizam corretamente
- [ ] Lógica de risco invertida aplicada nos cálculos

---

## 📚 Referências

- **Modelo Sollar Original**: Especificação fornecida pelo cliente
- **NR-1 (Norma Regulamentadora 1)**: Legislação brasileira sobre riscos psicossociais
- **HSE Management Standards**: Modelo britânico anterior (substituído)
- **LGPD (Lei 13.709/2018)**: Lei Geral de Proteção de Dados brasileira

---

## 👥 Contribuidores

- **Claude Code** (Anthropic) - Implementação completa
- **Co-Authored-By**: Claude <noreply@anthropic.com>

---

## 📝 Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-01-05 | 1.0.0 | Implementação inicial do Modelo Sollar |

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
