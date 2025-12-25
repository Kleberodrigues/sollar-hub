# Plano de Implementação - Landing Page PsicoMapa

## Resumo Executivo

Atualização completa da landing page para refletir o posicionamento de **Diagnóstico de Riscos Psicossociais e Pesquisa de Clima Contínua**, com foco em automatização e resultados rápidos.

---

## 1. HEADER (Header.tsx)

### Alterações Necessárias

**Menu atual:**
```
Preços | Sobre | Privacidade
```

**Novo menu:**
```
Para quem é | Quem Somos | Como funciona | O que mede | Planos | Blog
```

**Botões:**
- Manter "Entrar"
- Trocar "Começar Grátis" → "Agendar Demonstração"

### Arquivo: `components/landing/Header.tsx`
```tsx
const navLinks = [
  { href: "#para-quem", label: "Para quem é" },
  { href: "/sobre", label: "Quem Somos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#o-que-mede", label: "O que mede" },
  { href: "/precos", label: "Planos" },
  { href: "/blog", label: "Blog" },
];
```

---

## 2. HERO (Hero.tsx)

### Alterações Necessárias

**Título:**
```
DIAGNÓSTICO DE RISCOS PSICOSSOCIAIS E PESQUISA DE CLIMA CONTÍNUA
```

**Subtítulo:**
```
Aplique questionários em minutos, acompanhe dashboards automáticos
e gere relatórios executivos em poucos cliques. Tudo pronto em até 24 horas.
```

**Botões:**
- "Começar Gratuitamente" → "Agendar Demonstração"
- Manter "Ver Demonstração"

**Dashboard Preview:**
- Inverter percentuais: Alto risco maior que médio e baixo
- Exemplo: Alto 45%, Médio 35%, Baixo 20%
- Usar nomes reais das categorias:
  - Demandas e Ritmo de Trabalho
  - Autonomia, Clareza e Mudanças
  - Liderança e Reconhecimento
  - Relações, Clima e Comunicação
  - Equilíbrio Trabalho–Vida e Saúde
  - Violência, Assédio e Medo

### Arquivo: `components/landing/Hero.tsx`
- Atualizar `riskData` com novos percentuais
- Atualizar categorias com nomes reais
- Atualizar textos e botões

---

## 3. NOVA SEÇÃO: "PARA QUEM É" (TargetAudience.tsx)

### Criar Nova Seção

**Parte 1 - Dores:**
```
Se você cuida de pessoas e resultados, talvez reconheça estes sinais:
- Turnover alto — e o custo real vai muito além da rescisão
- Riscos e processos trabalhistas que poderiam ser evitados
- Liderança sem preparo gerando conflitos, retrabalho e desgaste
- RH no modo emergência, sem tempo para atuar no estratégico
- Falta de dados confiáveis — decisões no "achismo"
- Pesquisas tradicionais de clima demorando semanas para sair
```

**Parte 2 - Público-alvo:**

| RHs e CEOs | Consultores |
|------------|-------------|
| Clareza rápida | Velocidade |
| Diagnósticos recorrentes | Padronização |
| Decisões baseadas em dados | Entrega automática |
| Comunicação assertiva | |
| Prevenção de riscos | |

**Citação destaque:**
```
"Um único desligamento pode custar mais do que meses de prevenção."
```

### Novo Arquivo: `components/landing/TargetAudience.tsx`

---

## 4. SEÇÃO "COMO FUNCIONA" (HowItWorks.tsx)

### Alterações Necessárias

**Passos atualizados:**
1. "Envie o link do questionário para sua equipe em poucos cliques"
2. "Eles respondem em 15–20 minutos"
3. "A partir das respostas, você recebe dashboards e relatórios de forma automática"

**Texto destaque:**
```
Nada de planilhas. Nada de análise manual. Nada de esperar semanas.
```

### Arquivo: `components/landing/HowItWorks.tsx`

---

## 5. NOVA SEÇÃO: "O QUE MEDE" (WhatItMeasures.tsx)

### Criar Nova Seção

**Diagnóstico de Riscos Psicossociais:**
- Demandas e Ritmo de Trabalho
- Autonomia, Clareza e Mudanças
- Liderança e Reconhecimento
- Relações, Clima e Comunicação
- Equilíbrio Trabalho–Vida e Saúde
- Violência, Assédio e Medo de Repressão

**Pesquisa de Clima Contínua:**
- Satisfação
- Comunicação
- Carga de trabalho
- Segurança psicológica
- Liderança

### Novo Arquivo: `components/landing/WhatItMeasures.tsx`

---

## 6. SEÇÃO FEATURES (Features.tsx)

### Alterações Necessárias

**Simplificar para 3 features principais:**

1. **Relatórios Automáticos**
   - Dashboards + relatórios interpretados automaticamente
   - Indicadores críticos destacados

2. **Totalmente Anônimo e Seguro**
   - Sem identificação individual
   - Dados agregados por áreas
   - Sem visualização de respostas abertas

3. **Interface Simples**
   - Você entende tudo rapidamente
   - Mesmo sem experiência

**Adicionar botão:** "COMECE AGORA" → link para /precos

### Arquivo: `components/landing/Features.tsx`

---

## 7. PÁGINA DE PREÇOS (precos/page.tsx)

### Alterações Necessárias

**Novo formato - Destaque mensal, anual abaixo:**

#### PLANO BASE — R$ 330,83/mês (R$ 3.970/ano)
- 50 a 120 colaboradores
- 14 Relatórios anuais:
  - 6 Relatórios de Clima (bimestrais)
  - 4 Relatórios Técnicos de Riscos Psicossociais (trimestrais)
  - 4 Relatórios de Plano de Ação (trimestrais)
- Dashboards automáticos
- Análise de dados completa
- Relatório técnico personalizado
- Plano de ação orientado à prevenção

#### PLANO INTERMEDIÁRIO — R$ 414,17/mês (R$ 4.970/ano)
- 121 a 250 colaboradores
- 24 Relatórios anuais
- Tudo do Base +
  - 4 Relatórios Comparativos entre ciclos (trimestrais)
  - 6 Relatórios Executivos para liderança (bimestrais)

#### PLANO AVANÇADO — R$ 497,50/mês (R$ 5.970/ano)
- 251 a 400 colaboradores
- 28 Relatórios anuais
- Tudo do Intermediário +
  - 4 Relatórios de Correlação entre fatores organizacionais (trimestral)
  - Apresentação de 2 relatórios pela equipe PsicoMapa
  - Condição exclusiva para Plano de Ação Completo pela Consultoria

#### PLANO ENTERPRISE
- Mais de 400 colaboradores
- Plano personalizado
- Botão: "Fale com especialista"

### Arquivo: `app/(public)/precos/page.tsx`

---

## 8. SEÇÃO FAQ (criar novo)

### Criar Nova Seção

| Pergunta | Resposta |
|----------|----------|
| Quanto tempo leva para ter os resultados? | Em até 24 horas após o envio. |
| As respostas são anônimas? | Sim. Sem identificação individual. Resultados agregados por área. Respostas abertas não ficam visíveis. |
| É preciso instalar algo? | Não. É 100% online. |
| Serve para qualquer setor? | Sim. Tecnologia, indústria, varejo, logística, serviços, etc. |
| Posso cancelar quando quiser? | Sim. Sem burocracia. |
| Tem limite de colaboradores? | Até 400. Acima disso, plano personalizado. |

### Novo Arquivo: `components/landing/FAQ.tsx`

---

## 9. FOOTER (Footer.tsx)

### Alterações Necessárias

**Simplificar para:**

1. **Contato** (centro)
   - Email: contato@psicomapa.cloud
   - Telefone: (XX) XXXX-XXXX

2. **Legal** (manter)
   - Privacidade
   - Termos de Uso
   - LGPD
   - Cookies

3. **COPSOQ Reference** (canto inferior direito)
   ```
   O diagnóstico é baseado no COPSOQ II Brasileiro (COPSOQ II-BR),
   referência internacional para avaliação de fatores de riscos
   psicossociais, adaptada ao contexto brasileiro.
   ```

**Remover:**
- Seções: Produto, Recursos, Empresa
- Redes sociais
- Última linha "configurações..."

### Arquivo: `components/landing/Footer.tsx`

---

## 10. CTA FINAL (CTA.tsx)

### Alterações Necessárias

**Título:**
```
Turnover, conflitos e baixa performance custam caro.
```

**Subtítulo:** Manter texto sobre PsicoMapa

**Botão:** "COMECE AGORA" → link para /precos

### Arquivo: `components/landing/CTA.tsx`

---

## 11. ESTRUTURA FINAL DA PÁGINA

### Ordem das seções em `app/page.tsx`:

```tsx
<Header />
<main>
  <Hero />                    // Atualizado
  <TargetAudience />          // NOVO - "Para quem é"
  <HowItWorks />              // Atualizado - 3 passos
  <WhatItMeasures />          // NOVO - "O que mede"
  <Features />                // Simplificado - 3 features
  <FAQ />                     // NOVO
  <CTA />                     // Atualizado
</main>
<Footer />                    // Simplificado
```

---

## 12. ARQUIVOS A CRIAR

| Arquivo | Descrição |
|---------|-----------|
| `components/landing/TargetAudience.tsx` | Seção "Para quem é" |
| `components/landing/WhatItMeasures.tsx` | Seção "O que mede" |
| `components/landing/FAQ.tsx` | Seção FAQ |

---

## 13. ARQUIVOS A MODIFICAR

| Arquivo | Alterações |
|---------|------------|
| `components/landing/Header.tsx` | Menu, botões |
| `components/landing/Hero.tsx` | Título, subtítulo, dashboard, botões |
| `components/landing/HowItWorks.tsx` | Textos dos passos |
| `components/landing/Features.tsx` | Simplificar para 3 features |
| `components/landing/CTA.tsx` | Título, botão |
| `components/landing/Footer.tsx` | Simplificar drasticamente |
| `components/landing/index.ts` | Exportar novos componentes |
| `app/page.tsx` | Adicionar novas seções |
| `app/(public)/precos/page.tsx` | Novos planos e formato |

---

## 14. REMOVER

- Seção `Stats.tsx` (ou integrar em TargetAudience)
- Seção `Testimonials.tsx` (temporariamente, até ter depoimentos reais)

---

## 15. OBSERVAÇÕES FUTURAS

1. **Vídeo Demonstrativo**: Será adicionado após finalização do SaaS
2. **Consultores**: Ajustes internos serão feitos após primeiras vendas

---

## 16. ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Fase 1 - Estrutura Base
1. Criar `TargetAudience.tsx`
2. Criar `WhatItMeasures.tsx`
3. Criar `FAQ.tsx`
4. Atualizar `components/landing/index.ts`

### Fase 2 - Atualizações de Conteúdo
5. Atualizar `Hero.tsx`
6. Atualizar `Header.tsx`
7. Atualizar `HowItWorks.tsx`
8. Atualizar `Features.tsx`

### Fase 3 - Preços e Footer
9. Atualizar `precos/page.tsx`
10. Atualizar `Footer.tsx`
11. Atualizar `CTA.tsx`

### Fase 4 - Integração
12. Atualizar `app/page.tsx`
13. Remover componentes não utilizados
14. Testes e ajustes finais

---

## Estimativa de Complexidade

| Componente | Complexidade | Novo/Modificar |
|------------|--------------|----------------|
| TargetAudience | Média | Novo |
| WhatItMeasures | Baixa | Novo |
| FAQ | Baixa | Novo |
| Hero | Alta | Modificar |
| Header | Baixa | Modificar |
| HowItWorks | Baixa | Modificar |
| Features | Média | Modificar |
| Footer | Média | Modificar |
| CTA | Baixa | Modificar |
| Preços | Alta | Modificar |
