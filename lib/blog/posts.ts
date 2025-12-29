// Blog Posts Data - Artigos sobre NR-1, Riscos Psicossociais e Saúde Mental no Trabalho
// Conteúdo baseado em fontes oficiais: MTE, OMS, OPAS, ANAMT

export interface BlogPost {
  slug: string;
  titulo: string;
  subtitulo: string;
  resumo: string;
  conteudo: string;
  data: string;
  dataISO: string;
  categoria: string;
  tags: string[];
  tempo: string;
  autor: {
    nome: string;
    cargo: string;
    avatar?: string;
  };
  imagem: string;
  imagemAlt: string;
  referencias: {
    titulo: string;
    url: string;
    fonte: string;
  }[];
  destaque?: boolean;
}

const post1Content = `
## O que está mudando na NR-1?

A Norma Regulamentadora nº 1 (NR-1) passou por uma atualização histórica em agosto de 2024, através da **Portaria MTE nº 1.419**. Pela primeira vez, a legislação brasileira exige formalmente que as empresas incluam a **avaliação de riscos psicossociais** em seu processo de Gerenciamento de Riscos Ocupacionais (GRO).

Esta mudança representa um avanço significativo na proteção da saúde mental dos trabalhadores brasileiros, alinhando o país às melhores práticas internacionais de segurança e saúde no trabalho.

## Cronograma de Implementação

### Período Educativo (Maio 2025 - Maio 2026)

A **Portaria MTE nº 765/2025** estabeleceu que a implementação ocorrerá em caráter **educativo e orientativo** durante o primeiro ano:

- **26 de maio de 2025**: Início do período educativo
- **25 de maio de 2026**: Início da fiscalização efetiva

Durante este período, as empresas receberão orientações técnicas sem aplicação de multas, permitindo uma adaptação gradual às novas exigências.

> "Durante esse primeiro ano, será um processo de implantação educativa, e a autuação pela Inspeção do Trabalho só terá início em 26 de maio de 2026." — Ministério do Trabalho e Emprego

## O que são Riscos Psicossociais?

Os riscos psicossociais são fatores presentes no ambiente de trabalho que podem afetar negativamente a saúde mental, emocional e física dos colaboradores.

### Fatores de Risco Identificados

1. **Estresse ocupacional crônico**
2. **Assédio moral e sexual**
3. **Carga mental excessiva**
4. **Falta de autonomia no trabalho**
5. **Conflitos interpessoais**
6. **Pressão por metas irrealistas**
7. **Jornadas exaustivas**
8. **Falta de reconhecimento**

## Obrigações das Empresas

### O que fazer agora?

1. **Identificar e avaliar** riscos psicossociais no ambiente de trabalho
2. **Elaborar planos de ação** com medidas preventivas e corretivas
3. **Implementar melhorias** na organização do trabalho
4. **Monitorar continuamente** a eficácia das ações adotadas
5. **Documentar no PGR** todas as ações realizadas

### Quem está obrigado?

Todas as empresas com empregados CLT, **independentemente do porte**, devem avaliar riscos psicossociais. A única exceção são os Microempreendedores Individuais (MEI).

## Por que se antecipar?

Empresas que se antecipam à fiscalização obrigatória obtêm vantagens competitivas significativas:

- **Redução de afastamentos** por transtornos mentais
- **Diminuição do turnover** e custos de reposição
- **Melhoria do clima organizacional**
- **Aumento da produtividade**
- **Fortalecimento da marca empregadora**
- **Prevenção de passivos trabalhistas**

## Como o PsicoMapa pode ajudar

O PsicoMapa utiliza a metodologia **COPSOQ II-BR**, validada cientificamente para o contexto brasileiro, oferecendo:

- Diagnóstico completo de riscos psicossociais
- Relatórios técnicos em conformidade com a NR-1
- Planos de ação personalizados
- Monitoramento contínuo através de pesquisas de clima
- Dashboards em tempo real para gestão

---

*Este artigo será atualizado conforme novas orientações do MTE sejam publicadas.*
`;

const post2Content = `
## Por que avaliar riscos psicossociais?

A identificação precoce de riscos psicossociais não é apenas uma exigência legal — é uma estratégia inteligente de gestão. Empresas que investem na saúde mental de seus colaboradores observam:

- **Redução de até 40%** nos afastamentos por transtornos mentais
- **Aumento de 21%** na produtividade
- **Diminuição de 25%** no turnover

## As 7 Dimensões dos Riscos Psicossociais

A metodologia COPSOQ II organiza os fatores de risco em dimensões claras e mensuráveis:

### 1. Exigências Laborais
- Carga de trabalho
- Ritmo de trabalho
- Exigências emocionais
- Exigências cognitivas

### 2. Organização do Trabalho
- Influência no trabalho
- Possibilidades de desenvolvimento
- Significado do trabalho
- Compromisso com o local de trabalho

### 3. Relações Interpessoais e Liderança
- Previsibilidade
- Recompensas (reconhecimento)
- Transparência do papel laboral
- Qualidade da liderança
- Apoio social de superiores
- Apoio social de colegas

### 4. Interface Trabalho-Família
- Conflito trabalho/família
- Satisfação no trabalho

### 5. Valores no Local de Trabalho
- Confiança vertical e horizontal
- Justiça e respeito
- Comunidade social no trabalho

### 6. Comportamentos Ofensivos
- Assédio moral (bullying)
- Assédio sexual
- Ameaças de violência
- Violência física

### 7. Saúde e Bem-estar (Indicadores)
- Saúde geral
- Problemas de sono
- Burnout
- Estresse
- Sintomas depressivos

## Como aplicar uma avaliação eficaz

### Passo 1: Planejamento
- Defina o escopo (toda empresa ou setores específicos)
- Comunique a liderança sobre a importância
- Garanta a confidencialidade das respostas

### Passo 2: Escolha da Metodologia
O **COPSOQ II-BR** é a metodologia mais recomendada para o contexto brasileiro.

### Passo 3: Aplicação
- Utilize plataformas digitais para maior adesão
- Garanta anonimato aos respondentes
- Estabeleça prazo adequado para respostas

### Passo 4: Análise dos Resultados
- Interprete usando o sistema "semáforo" (verde, amarelo, vermelho)
- Identifique áreas críticas prioritárias
- Compare resultados entre departamentos

### Passo 5: Plano de Ação
- Desenvolva ações específicas para cada risco identificado
- Defina responsáveis e prazos
- Estabeleça indicadores de acompanhamento

---

*Precisa de ajuda para implementar uma avaliação de riscos psicossociais? O PsicoMapa oferece diagnóstico completo baseado no COPSOQ II-BR.*
`;

const post3Content = `
## O Brasil e a CID-11

Desde **1º de janeiro de 2025**, o Brasil adotou oficialmente a **Classificação Internacional de Doenças (CID-11)** da Organização Mundial da Saúde. Esta atualização traz uma mudança fundamental: o **Burnout** agora é classificado como **doença ocupacional** sob o código **QD85**.

## O que é Burnout segundo a OMS?

A definição oficial da Organização Mundial da Saúde é clara:

> "Burnout é uma síndrome conceituada como resultante do **estresse crônico no local de trabalho** que não foi gerenciado com sucesso."

A síndrome é caracterizada por **três dimensões**:

### 1. Exaustão
Sentimentos de esgotamento ou esgotamento de energia física e emocional.

### 2. Distanciamento Mental
Aumento do distanciamento mental do próprio trabalho, sentimentos de negativismo ou cinismo.

### 3. Redução da Eficácia
Diminuição da eficácia profissional, sensação de incompetência e falta de realização.

## O Brasil é o 2º país com mais casos

Dados alarmantes da **Associação Nacional de Medicina do Trabalho (ANAMT)**:

- **30% dos trabalhadores brasileiros** sofrem com burnout
- O Brasil ocupa a **2ª posição mundial** em casos
- Crescimento acelerado após a pandemia

## Implicações Legais para Empresas

### Responsabilidade Objetiva

Com o burnout reconhecido como doença ocupacional, as empresas passam a ter **responsabilidade direta** sobre casos diagnosticados.

### Direitos do Trabalhador

- **Afastamento remunerado** pelo empregador (até 15 dias)
- **Auxílio-doença acidentário** pelo INSS (após 15 dias)
- **Estabilidade provisória** de 12 meses após retorno
- **FGTS continua sendo depositado** durante afastamento

## Como prevenir o Burnout

### Ações Organizacionais

1. **Carga de trabalho equilibrada**
2. **Liderança humanizada**
3. **Cultura de apoio**
4. **Monitoramento contínuo**

---

*Prevenir é mais barato que remediar. Faça o diagnóstico de riscos psicossociais da sua empresa com o PsicoMapa.*
`;

const post4Content = `
## O que é o COPSOQ?

O **Copenhagen Psychosocial Questionnaire (COPSOQ)** foi desenvolvido pelo National Institute for Occupational Health da Dinamarca e é reconhecido mundialmente como o instrumento mais completo para avaliar fatores de riscos psicossociais no trabalho.

## Por que o COPSOQ é considerado padrão-ouro?

### 1. Validação Científica Rigorosa
O COPSOQ passou por extensos estudos de validação em diversos países, incluindo o Brasil.

### 2. Abordagem Multidimensional
Diferente de outros instrumentos, o COPSOQ avalia **41 dimensões** diferentes.

### 3. Flexibilidade de Aplicação
O instrumento possui três versões:

| Versão | Dimensões | Perguntas | Indicação |
|--------|-----------|-----------|-----------|
| Curta | 23 | 40 | Autoavaliação, empresas < 30 funcionários |
| Média | 28 | 87 | Profissionais de SST, avaliação de riscos |
| Longa | 41 | 128 | Pesquisa acadêmica, análises aprofundadas |

## Dimensões Avaliadas pelo COPSOQ II

- Exigências Laborais
- Organização e Conteúdo do Trabalho
- Relações e Liderança
- Valores Organizacionais
- Saúde e Bem-estar

## Como funciona a interpretação?

O COPSOQ utiliza o sistema **"semáforo"** para classificação:

- 🟢 **Verde (Baixo Risco)**: Situação favorável
- 🟡 **Amarelo (Risco Moderado)**: Atenção necessária
- 🔴 **Vermelho (Alto Risco)**: Intervenção urgente

## COPSOQ II-BR: A versão brasileira

A validação do COPSOQ II para o Brasil foi realizada por pesquisadores da ISMA-BR, seguindo rigorosos protocolos científicos.

---

*Quer implementar uma avaliação COPSOQ II na sua empresa? Conheça o PsicoMapa.*
`;

const post5Content = `
## O que é GRO?

O **Gerenciamento de Riscos Ocupacionais (GRO)** é o processo contínuo e sistemático que as empresas devem adotar para:

- **Identificar** perigos e riscos no ambiente de trabalho
- **Avaliar** a magnitude e probabilidade desses riscos
- **Controlar** ou eliminar os riscos identificados
- **Monitorar** a eficácia das medidas adotadas

## O que é PGR?

O **Programa de Gerenciamento de Riscos (PGR)** é a **documentação formal** do GRO. Ele materializa todo o processo em dois documentos principais:

### 1. Inventário de Riscos Ocupacionais
Registro detalhado de todos os riscos identificados.

### 2. Plano de Ação
Documento que estabelece medidas de controle, cronograma e responsáveis.

## Quem está obrigado?

### Obrigatório para:
- Todas as empresas com empregados CLT
- Independente do porte

### Dispensados:
- MEI (Microempreendedor Individual)
- ME e EPP graus de risco 1 e 2 em condições específicas

## O PGR substituiu o PPRA

Desde **janeiro de 2022**, o PGR substituiu o antigo PPRA.

## Riscos Psicossociais no PGR

Com a atualização da NR-1, os **riscos psicossociais** passam a integrar obrigatoriamente o PGR.

### Prazos:
- **Maio 2025 a Maio 2026**: Período educativo
- **A partir de Maio 2026**: Fiscalização efetiva

---

*Precisa adequar seu PGR aos riscos psicossociais? O PsicoMapa oferece a solução completa.*
`;

const post6Content = `
## A cultura como fator de proteção ou risco

A cultura organizacional não é apenas um conceito abstrato — ela tem impacto direto e mensurável na saúde mental dos colaboradores.

Empresas com culturas tóxicas apresentam:

- **3x mais casos** de burnout
- **2,5x mais afastamentos** por transtornos mentais
- **50% maior turnover** comparado a empresas saudáveis

## Elementos de uma cultura protetora

### 1. Segurança Psicológica
A base de um ambiente saudável é a crença de que ninguém será punido ou humilhado por expressar ideias, dúvidas ou erros.

### 2. Comunicação Transparente
Ambientes onde a informação flui claramente reduzem ansiedade e incerteza.

### 3. Equilíbrio Trabalho-Vida
Respeitar os limites entre vida profissional e pessoal é fundamental.

### 4. Reconhecimento e Valorização
Colaboradores que se sentem valorizados têm menor risco de adoecimento mental.

### 5. Liderança Humanizada
O papel da liderança é central na construção de uma cultura saudável.

## Sinais de uma cultura tóxica

- Metas constantemente inatingíveis
- Cultura de "sempre disponível"
- Competição predatória entre colegas
- Falta de transparência nas decisões
- Assédio moral normalizado
- Alta rotatividade de pessoas

## Diagnóstico cultural

Para entender a cultura real da sua empresa, é preciso ouvir os colaboradores de forma anônima e estruturada.

---

*Quer conhecer a real cultura da sua empresa? O PsicoMapa oferece diagnóstico completo com pesquisas de clima baseadas em metodologia científica.*
`;

export const blogPosts: BlogPost[] = [
  {
    slug: 'nr-1-riscos-psicossociais-2025-2026-guia-completo',
    titulo: 'NR-1 e Riscos Psicossociais: O Guia Definitivo para 2025-2026',
    subtitulo: 'Tudo o que sua empresa precisa saber sobre as mudanças na Norma Regulamentadora',
    resumo: 'Entenda as principais mudanças na NR-1, os prazos de implementação, o período educativo e como preparar sua empresa para a avaliação obrigatória de riscos psicossociais.',
    data: '20 Dez 2024',
    dataISO: '2024-12-20',
    categoria: 'Legislação',
    tags: ['NR-1', 'Riscos Psicossociais', 'GRO', 'PGR', 'MTE'],
    tempo: '12 min',
    destaque: true,
    imagem: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    imagemAlt: 'Profissionais analisando documentos de compliance e legislação trabalhista',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [
      {
        titulo: 'Portaria MTE nº 1.419/2024 - Atualização da NR-1',
        url: 'https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2024/Novembro/empresas-brasileiras-terao-que-avaliar-riscos-psicossociais-a-partir-de-2025',
        fonte: 'Ministério do Trabalho e Emprego'
      },
      {
        titulo: 'Portaria MTE nº 765/2025 - Prorrogação do prazo',
        url: 'https://www.anamt.org.br/portal/2025/05/19/fatores-psicossociais-mte-estende-prazo-para-vigencia-de-mudanca-na-nr-1/',
        fonte: 'ANAMT'
      }
    ],
    conteudo: post1Content
  },
  {
    slug: 'como-identificar-riscos-psicossociais-empresa-guia-pratico',
    titulo: 'Como Identificar Riscos Psicossociais na Sua Empresa',
    subtitulo: 'Um guia prático e completo para profissionais de RH e segurança do trabalho',
    resumo: 'Aprenda a identificar os principais fatores de risco psicossocial, conheça as metodologias cientificamente validadas e saiba como estruturar um programa de avaliação eficaz.',
    data: '15 Dez 2024',
    dataISO: '2024-12-15',
    categoria: 'Guia Prático',
    tags: ['Riscos Psicossociais', 'COPSOQ', 'Avaliação', 'RH', 'SST'],
    tempo: '10 min',
    imagem: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
    imagemAlt: 'Profissional de RH analisando relatórios de avaliação de riscos',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [
      {
        titulo: 'COPSOQ II - Metodologia de Avaliação',
        url: 'https://www.copsoq-network.org/assets/Uploads/COPSOQ-Manual-Portugal2013.pdf',
        fonte: 'COPSOQ International Network'
      }
    ],
    conteudo: post2Content
  },
  {
    slug: 'burnout-cid-11-doenca-ocupacional-responsabilidade-empresas',
    titulo: 'Burnout: A Síndrome que se Tornou Doença Ocupacional',
    subtitulo: 'Entenda a CID-11, as implicações legais e a responsabilidade das empresas',
    resumo: 'Com a adoção da CID-11 no Brasil em 2025, o burnout é oficialmente uma doença ocupacional. Saiba o que isso significa para empresas e trabalhadores.',
    data: '10 Dez 2024',
    dataISO: '2024-12-10',
    categoria: 'Saúde Mental',
    tags: ['Burnout', 'CID-11', 'OMS', 'Doença Ocupacional', 'Saúde Mental'],
    tempo: '8 min',
    imagem: 'https://images.unsplash.com/photo-1616077168712-fc6c788db4af?w=800&q=80',
    imagemAlt: 'Pessoa exausta no trabalho representando burnout ocupacional',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [
      {
        titulo: 'Burnout é um fenômeno ocupacional - OPAS/OMS',
        url: 'https://www.paho.org/pt/noticias/28-5-2019-cid-burnout-e-um-fenomeno-ocupacional',
        fonte: 'OPAS/OMS'
      }
    ],
    conteudo: post3Content
  },
  {
    slug: 'copsoq-ii-metodologia-avaliacao-riscos-psicossociais',
    titulo: 'COPSOQ II: A Metodologia Padrão-Ouro para Avaliação de Riscos',
    subtitulo: 'Conheça o instrumento cientificamente validado mais utilizado no mundo',
    resumo: 'Entenda por que o Copenhagen Psychosocial Questionnaire é considerado a referência internacional para avaliação de riscos psicossociais.',
    data: '05 Dez 2024',
    dataISO: '2024-12-05',
    categoria: 'Metodologia',
    tags: ['COPSOQ', 'Metodologia', 'Avaliação', 'Pesquisa', 'Validação'],
    tempo: '9 min',
    imagem: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    imagemAlt: 'Dashboard de análise de dados e métricas de avaliação',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [
      {
        titulo: 'Manual COPSOQ - Portugal 2013',
        url: 'https://www.copsoq-network.org/assets/Uploads/COPSOQ-Manual-Portugal2013.pdf',
        fonte: 'COPSOQ International Network'
      }
    ],
    conteudo: post4Content
  },
  {
    slug: 'gro-pgr-programa-gerenciamento-riscos-ocupacionais-implementacao',
    titulo: 'GRO e PGR: Como Implementar na Sua Empresa',
    subtitulo: 'Guia completo sobre Gerenciamento de Riscos Ocupacionais e Programa de Gerenciamento de Riscos',
    resumo: 'Entenda o que são GRO e PGR, quem está obrigado, como implementar e qual a relação com os riscos psicossociais exigidos pela nova NR-1.',
    data: '28 Nov 2024',
    dataISO: '2024-11-28',
    categoria: 'Compliance',
    tags: ['GRO', 'PGR', 'NR-1', 'Compliance', 'SST'],
    tempo: '11 min',
    imagem: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    imagemAlt: 'Documentos de compliance e gestão de riscos sobre mesa de escritório',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [
      {
        titulo: 'Programa de Gerenciamento de Riscos - MTE',
        url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/pgr',
        fonte: 'Ministério do Trabalho e Emprego'
      }
    ],
    conteudo: post5Content
  },
  {
    slug: 'cultura-organizacional-prevencao-adoecimento-mental',
    titulo: 'Cultura Organizacional: A Primeira Linha de Defesa',
    subtitulo: 'Como a cultura da empresa impacta diretamente na saúde mental dos colaboradores',
    resumo: 'Descubra como elementos da cultura organizacional podem tanto proteger quanto prejudicar a saúde mental, e aprenda a construir um ambiente psicologicamente seguro.',
    data: '20 Nov 2024',
    dataISO: '2024-11-20',
    categoria: 'Cultura',
    tags: ['Cultura Organizacional', 'Saúde Mental', 'Liderança', 'Prevenção', 'Bem-estar'],
    tempo: '7 min',
    imagem: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    imagemAlt: 'Equipe de trabalho colaborando em ambiente corporativo saudável',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [
      {
        titulo: 'Saúde mental no centro das relações de trabalho',
        url: 'https://www.conjur.com.br/2025-jan-30/saude-mental-no-centro-das-relacoes-de-trabalho-entenda-a-alteracao-na-norma-regulamentadora-no-1/',
        fonte: 'Consultor Jurídico'
      }
    ],
    conteudo: post6Content
  },
  // Novos artigos adicionados
  {
    slug: 'saude-mental-trabalho-remoto-hibrido-desafios-solucoes',
    titulo: 'Saúde Mental no Trabalho Remoto e Híbrido',
    subtitulo: 'Desafios e estratégias para manter equipes saudáveis à distância',
    resumo: 'O trabalho remoto trouxe flexibilidade, mas também novos desafios para a saúde mental. Descubra como identificar sinais de alerta e criar um ambiente virtual saudável.',
    data: '15 Nov 2024',
    dataISO: '2024-11-15',
    categoria: 'Saúde Mental',
    tags: ['Trabalho Remoto', 'Home Office', 'Saúde Mental', 'Híbrido', 'Bem-estar'],
    tempo: '8 min',
    imagem: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    imagemAlt: 'Profissional trabalhando em home office com laptop',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [],
    conteudo: `## O novo normal do trabalho

O trabalho remoto e híbrido se consolidou como realidade permanente para milhões de brasileiros. Com ele, surgem novos desafios para a saúde mental que precisam ser endereçados.

## Principais riscos psicossociais no trabalho remoto

### 1. Isolamento Social
A falta de contato presencial pode levar a sentimentos de solidão e desconexão com a equipe.

### 2. Dificuldade em Separar Trabalho e Vida Pessoal
Sem fronteiras físicas claras, muitos profissionais trabalham mais horas e têm dificuldade em "desligar".

### 3. Comunicação Assíncrona
Mal-entendidos são mais frequentes quando a comunicação não é face a face.

## Estratégias de Proteção

- Estabelecer horários fixos de trabalho
- Criar rituais de início e fim do expediente
- Manter contato regular com colegas
- Reservar espaço físico dedicado ao trabalho
- Praticar pausas regulares

---

*O PsicoMapa oferece avaliações específicas para equipes remotas e híbridas.*`
  },
  {
    slug: 'lideranca-humanizada-prevencao-riscos-psicossociais',
    titulo: 'Liderança Humanizada: O Papel dos Gestores na Prevenção',
    subtitulo: 'Como líderes podem criar ambientes psicologicamente seguros',
    resumo: 'A liderança é o fator mais determinante para a saúde mental das equipes. Aprenda práticas de gestão que previnem o adoecimento e promovem bem-estar.',
    data: '10 Nov 2024',
    dataISO: '2024-11-10',
    categoria: 'Liderança',
    tags: ['Liderança', 'Gestão', 'Saúde Mental', 'Prevenção', 'Equipes'],
    tempo: '9 min',
    imagem: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    imagemAlt: 'Líder conduzindo reunião de equipe em ambiente colaborativo',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [],
    conteudo: `## O impacto da liderança na saúde mental

Estudos mostram que a qualidade da liderança é responsável por até 70% da variação no engajamento e bem-estar das equipes.

## Características da Liderança Humanizada

### Escuta Ativa
Líderes que ouvem genuinamente criam ambientes de confiança.

### Feedback Construtivo
Feedback frequente e respeitoso promove desenvolvimento sem gerar ansiedade.

### Flexibilidade
Adaptar-se às necessidades individuais dos colaboradores.

### Reconhecimento
Valorizar esforços e conquistas de forma consistente.

## Sinais de Alerta para Líderes

- Aumento de conflitos na equipe
- Queda de produtividade
- Afastamentos frequentes
- Alta rotatividade

---

*Capacite sua liderança com o PsicoMapa. Oferecemos diagnósticos e treinamentos.*`
  },
  {
    slug: 'assedio-moral-trabalho-identificar-prevenir-combater',
    titulo: 'Assédio Moral no Trabalho: Como Identificar e Combater',
    subtitulo: 'Guia completo sobre prevenção e responsabilização',
    resumo: 'O assédio moral é uma das principais causas de adoecimento no trabalho. Saiba como identificar, prevenir e criar políticas eficazes de combate.',
    data: '05 Nov 2024',
    dataISO: '2024-11-05',
    categoria: 'Compliance',
    tags: ['Assédio Moral', 'Compliance', 'Prevenção', 'RH', 'Legislação'],
    tempo: '10 min',
    imagem: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80',
    imagemAlt: 'Ambiente corporativo representando relações de trabalho',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [],
    conteudo: `## O que é Assédio Moral?

Assédio moral é a exposição repetida e prolongada a situações humilhantes e constrangedoras no ambiente de trabalho.

## Formas de Assédio Moral

### Vertical Descendente
Do superior para o subordinado (mais comum).

### Vertical Ascendente
Do subordinado para o superior.

### Horizontal
Entre colegas do mesmo nível hierárquico.

### Organizacional
Práticas institucionalizadas pela própria empresa.

## Como Identificar

- Críticas constantes sem fundamento
- Isolamento do colaborador
- Sobrecarga ou retirada de tarefas
- Humilhações públicas
- Ameaças veladas

## Responsabilidade da Empresa

A empresa é responsável por manter um ambiente livre de assédio, podendo responder civilmente por danos causados.

---

*O PsicoMapa inclui avaliação de comportamentos ofensivos em seu diagnóstico.*`
  },
  {
    slug: 'pesquisa-clima-organizacional-guia-implementacao',
    titulo: 'Pesquisa de Clima: Guia de Implementação',
    subtitulo: 'Passo a passo para diagnosticar a saúde da sua organização',
    resumo: 'A pesquisa de clima é ferramenta essencial para entender a realidade da empresa. Aprenda a planejar, aplicar e agir sobre os resultados.',
    data: '01 Nov 2024',
    dataISO: '2024-11-01',
    categoria: 'Guia Prático',
    tags: ['Pesquisa de Clima', 'Diagnóstico', 'RH', 'Engajamento', 'Metodologia'],
    tempo: '11 min',
    imagem: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    imagemAlt: 'Gráficos e dados de pesquisa organizacional em tela de computador',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [],
    conteudo: `## Por que fazer Pesquisa de Clima?

A pesquisa de clima organizacional é a ferramenta mais eficaz para ouvir colaboradores de forma estruturada e anônima.

## Etapas da Implementação

### 1. Planejamento
- Defina objetivos claros
- Escolha a metodologia adequada
- Planeje a comunicação

### 2. Sensibilização
- Comunique lideranças
- Engaje colaboradores
- Garanta confidencialidade

### 3. Aplicação
- Use plataformas digitais
- Defina prazo adequado (7-14 dias)
- Monitore adesão

### 4. Análise
- Interprete por departamento
- Identifique padrões
- Priorize áreas críticas

### 5. Ação
- Desenvolva plano de ação
- Comunique resultados
- Monitore implementação

---

*O PsicoMapa oferece pesquisas de clima integradas à avaliação de riscos psicossociais.*`
  },
  {
    slug: 'indicadores-saude-mental-empresas-metricas-essenciais',
    titulo: 'Indicadores de Saúde Mental nas Empresas',
    subtitulo: 'Métricas essenciais para monitorar o bem-estar organizacional',
    resumo: 'O que não se mede não se gerencia. Conheça os principais indicadores para acompanhar a saúde mental da sua organização.',
    data: '25 Out 2024',
    dataISO: '2024-10-25',
    categoria: 'Metodologia',
    tags: ['Indicadores', 'Métricas', 'Saúde Mental', 'Gestão', 'RH'],
    tempo: '8 min',
    imagem: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80',
    imagemAlt: 'Dashboard de indicadores e métricas empresariais',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [],
    conteudo: `## A importância de medir

Indicadores de saúde mental permitem identificar problemas antes que se tornem críticos e avaliar a eficácia das ações implementadas.

## Indicadores Quantitativos

### Absenteísmo
Taxa de faltas relacionadas a problemas de saúde mental.

### Turnover
Rotatividade de pessoal, especialmente em áreas críticas.

### Afastamentos INSS
Número de afastamentos por CID F (transtornos mentais).

### Sinistralidade do Plano de Saúde
Uso de serviços de saúde mental.

## Indicadores Qualitativos

### eNPS (Employee Net Promoter Score)
Satisfação e lealdade dos colaboradores.

### Índice de Engajamento
Medido através de pesquisas de clima.

### Scores COPSOQ
Avaliação sistemática de riscos psicossociais.

---

*O PsicoMapa gera dashboards completos com todos estes indicadores.*`
  },
  {
    slug: 'retorno-investimento-saude-mental-roi',
    titulo: 'ROI da Saúde Mental: Investir em Pessoas Dá Retorno',
    subtitulo: 'Dados e cases que comprovam o valor do investimento em bem-estar',
    resumo: 'Investir em saúde mental não é custo, é investimento com retorno comprovado. Veja dados e estudos que demonstram o ROI de programas de bem-estar.',
    data: '20 Out 2024',
    dataISO: '2024-10-20',
    categoria: 'Gestão',
    tags: ['ROI', 'Investimento', 'Saúde Mental', 'Produtividade', 'Custos'],
    tempo: '7 min',
    imagem: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    imagemAlt: 'Gráfico de crescimento financeiro representando retorno sobre investimento',
    autor: {
      nome: 'Equipe PsicoMapa',
      cargo: 'Especialistas em Saúde Ocupacional',
    },
    referencias: [],
    conteudo: `## O custo de não investir

A OMS estima que transtornos de ansiedade e depressão custam à economia global US$ 1 trilhão por ano em perda de produtividade.

## Retorno Comprovado

### Dados da OMS
Para cada US$ 1 investido em tratamento de transtornos mentais, há um retorno de US$ 4 em melhoria de saúde e produtividade.

### Redução de Custos
- Diminuição de afastamentos: até 30%
- Redução do turnover: até 25%
- Menor sinistralidade: até 20%

### Ganhos de Produtividade
Colaboradores saudáveis são até 21% mais produtivos.

## Cases de Sucesso

Empresas que implementaram programas de saúde mental reportam:
- Aumento de 15% no engajamento
- Redução de 40% em conflitos
- Melhoria de 25% no clima organizacional

---

*Calcule o ROI potencial da sua empresa com o simulador do PsicoMapa.*`
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return blogPosts.sort((a, b) =>
    new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime()
  );
}

export function getPostsByCategory(categoria: string): BlogPost[] {
  return blogPosts
    .filter(post => post.categoria === categoria)
    .sort((a, b) => new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime());
}

export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts
    .filter(post => post.tags.includes(tag))
    .sort((a, b) => new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime());
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find(post => post.destaque);
}

export function getCategories(): string[] {
  const categories = new Set(blogPosts.map(post => post.categoria));
  return Array.from(categories);
}

export function getAllTags(): string[] {
  const tags = new Set(blogPosts.flatMap(post => post.tags));
  return Array.from(tags);
}
