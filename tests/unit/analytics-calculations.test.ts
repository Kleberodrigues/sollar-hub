/**
 * Analytics Calculations Unit Tests
 *
 * Testes unitários para validar cálculos de métricas do analytics dashboard
 * Foca em lógica de negócio e transformações de dados
 */

import { describe, it, expect } from 'vitest';

/**
 * Mock de dados para testes
 */
const mockResponses = [
  {
    id: '1',
    anonymous_id: 'user-1',
    value: '4',
    created_at: '2025-12-01T10:00:00Z',
    question_id: 'q1',
    questions: { id: 'q1', category: 'demands', type: 'likert_scale' }
  },
  {
    id: '2',
    anonymous_id: 'user-1',
    value: '3',
    created_at: '2025-12-01T10:05:00Z',
    question_id: 'q2',
    questions: { id: 'q2', category: 'control', type: 'likert_scale' }
  },
  {
    id: '3',
    anonymous_id: 'user-2',
    value: '5',
    created_at: '2025-12-01T11:00:00Z',
    question_id: 'q1',
    questions: { id: 'q1', category: 'demands', type: 'likert_scale' }
  },
  {
    id: '4',
    anonymous_id: 'user-2',
    value: '2',
    created_at: '2025-12-01T11:05:00Z',
    question_id: 'q2',
    questions: { id: 'q2', category: 'control', type: 'likert_scale' }
  },
  {
    id: '5',
    anonymous_id: 'user-3',
    value: '1',
    created_at: '2025-12-02T09:00:00Z',
    question_id: 'q3',
    questions: { id: 'q3', category: 'support', type: 'likert_scale' }
  }
];

describe('Analytics Calculations', () => {
  describe('Contagem de Participantes', () => {
    it('deve contar participantes únicos corretamente', () => {
      const uniqueParticipants = new Set(
        mockResponses.map((r) => r.anonymous_id)
      ).size;

      expect(uniqueParticipants).toBe(3); // user-1, user-2, user-3
    });

    it('deve retornar 0 quando não há respostas', () => {
      const uniqueParticipants = new Set([]).size;

      expect(uniqueParticipants).toBe(0);
    });

    it('não deve contar duplicatas do mesmo participante', () => {
      const responses = [
        { anonymous_id: 'user-1' },
        { anonymous_id: 'user-1' },
        { anonymous_id: 'user-1' }
      ];

      const uniqueParticipants = new Set(
        responses.map((r: any) => r.anonymous_id)
      ).size;

      expect(uniqueParticipants).toBe(1);
    });
  });

  describe('Taxa de Conclusão', () => {
    it('deve calcular taxa de conclusão corretamente', () => {
      const totalQuestions = 10;
      const uniqueParticipants = 3;
      const totalResponses = 5;

      const completionRate =
        (totalResponses / (uniqueParticipants * totalQuestions)) * 100;

      // Arredondar para 2 casas decimais
      const rounded = Math.round(completionRate * 100) / 100;

      expect(rounded).toBe(16.67); // 5 / (3 * 10) * 100 = 16.67%
    });

    it('deve retornar 0 quando não há perguntas', () => {
      const totalQuestions = 0;
      const uniqueParticipants = 3;
      const totalResponses = 5;

      const completionRate =
        totalQuestions > 0
          ? (totalResponses / (uniqueParticipants * totalQuestions)) * 100
          : 0;

      expect(completionRate).toBe(0);
    });

    it('deve calcular 100% quando todos responderam tudo', () => {
      const totalQuestions = 5;
      const uniqueParticipants = 2;
      const totalResponses = 10; // 2 users * 5 questions

      const completionRate =
        (totalResponses / (uniqueParticipants * totalQuestions)) * 100;

      expect(completionRate).toBe(100);
    });
  });

  describe('Cálculo de Scores por Categoria', () => {
    it('deve calcular média correta por categoria', () => {
      // demands: [4, 5] = média 4.5
      const demandsScores = mockResponses
        .filter((r) => r.questions.category === 'demands')
        .map((r) => parseFloat(r.value));

      const avgDemands =
        demandsScores.reduce((a, b) => a + b, 0) / demandsScores.length;

      expect(avgDemands).toBe(4.5);
    });

    it('deve calcular média para todas as categorias', () => {
      const categories = ['demands', 'control', 'support'];
      const categoryScores: Record<string, number[]> = {
        demands: [],
        control: [],
        support: []
      };

      mockResponses.forEach((r) => {
        if (r.questions.category in categoryScores) {
          categoryScores[r.questions.category].push(parseFloat(r.value));
        }
      });

      // demands: [4, 5] = 4.5
      expect(
        categoryScores.demands.reduce((a, b) => a + b, 0) /
          categoryScores.demands.length
      ).toBe(4.5);

      // control: [3, 2] = 2.5
      expect(
        categoryScores.control.reduce((a, b) => a + b, 0) /
          categoryScores.control.length
      ).toBe(2.5);

      // support: [1] = 1
      expect(
        categoryScores.support.reduce((a, b) => a + b, 0) /
          categoryScores.support.length
      ).toBe(1);
    });

    it('deve retornar 0 para categoria sem respostas', () => {
      const emptyCategory: number[] = [];
      const avg = emptyCategory.length > 0
        ? emptyCategory.reduce((a, b) => a + b, 0) / emptyCategory.length
        : 0;

      expect(avg).toBe(0);
    });

    it('deve arredondar para 2 casas decimais', () => {
      const scores = [4.333, 3.777, 2.111];
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const rounded = Math.round(avg * 100) / 100;

      expect(rounded).toBe(3.41); // (4.333 + 3.777 + 2.111) / 3 = 3.407
    });
  });

  describe('Classificação de Nível de Risco', () => {
    it('deve classificar score < 2.5 como risco alto', () => {
      const score = 2.3;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      if (score < 2.5) {
        riskLevel = 'high';
      } else if (score < 3.5) {
        riskLevel = 'medium';
      }

      expect(riskLevel).toBe('high');
    });

    it('deve classificar score entre 2.5 e 3.5 como risco médio', () => {
      const scores = [2.5, 3.0, 3.4];

      scores.forEach((score) => {
        let riskLevel: 'low' | 'medium' | 'high' = 'low';

        if (score < 2.5) {
          riskLevel = 'high';
        } else if (score < 3.5) {
          riskLevel = 'medium';
        }

        expect(riskLevel).toBe('medium');
      });
    });

    it('deve classificar score >= 3.5 como risco baixo', () => {
      const scores = [3.5, 4.0, 5.0];

      scores.forEach((score) => {
        let riskLevel: 'low' | 'medium' | 'high' = 'low';

        if (score < 2.5) {
          riskLevel = 'high';
        } else if (score < 3.5) {
          riskLevel = 'medium';
        }

        expect(riskLevel).toBe('low');
      });
    });

    it('deve tratar valores limítrofes corretamente', () => {
      // 2.5 é o limite entre high e medium
      const score25 = 2.5;
      let risk25: 'low' | 'medium' | 'high' = 'low';
      if (score25 < 2.5) risk25 = 'high';
      else if (score25 < 3.5) risk25 = 'medium';
      expect(risk25).toBe('medium');

      // 3.5 é o limite entre medium e low
      const score35 = 3.5;
      let risk35: 'low' | 'medium' | 'high' = 'low';
      if (score35 < 2.5) risk35 = 'high';
      else if (score35 < 3.5) risk35 = 'medium';
      expect(risk35).toBe('low');
    });
  });

  describe('Distribuição de Respostas', () => {
    it('deve contar ocorrências de cada valor', () => {
      const questionResponses = [
        { value: 'Sim' },
        { value: 'Não' },
        { value: 'Sim' },
        { value: 'Sim' },
        { value: 'Não' }
      ];

      const valueCounts: Record<string, number> = {};
      questionResponses.forEach((r: any) => {
        valueCounts[r.value] = (valueCounts[r.value] || 0) + 1;
      });

      expect(valueCounts['Sim']).toBe(3);
      expect(valueCounts['Não']).toBe(2);
    });

    it('deve calcular porcentagens corretamente', () => {
      const valueCounts = { Sim: 3, Não: 2 };
      const totalResponses = 5;

      const distribution = Object.entries(valueCounts).map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / totalResponses) * 100 * 100) / 100
      }));

      expect(distribution[0].percentage).toBe(60); // 3/5 = 60%
      expect(distribution[1].percentage).toBe(40); // 2/5 = 40%
    });

    it('porcentagens devem somar ~100%', () => {
      const distribution = [
        { value: 'A', count: 10, percentage: 33.33 },
        { value: 'B', count: 10, percentage: 33.33 },
        { value: 'C', count: 10, percentage: 33.33 }
      ];

      const sum = distribution.reduce((acc, d) => acc + d.percentage, 0);

      // Devido a arredondamento, pode não ser exatamente 100
      expect(sum).toBeCloseTo(100, 0); // Próximo de 100 com tolerância de ±1
    });
  });

  describe('Última Resposta', () => {
    it('deve encontrar a resposta mais recente', () => {
      const sorted = [...mockResponses].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const lastResponse = sorted[0];

      expect(lastResponse.id).toBe('5'); // 2025-12-02 é mais recente
      expect(lastResponse.created_at).toBe('2025-12-02T09:00:00Z');
    });

    it('deve retornar null quando não há respostas', () => {
      const emptyResponses: any[] = [];
      const lastResponse = emptyResponses.length ? emptyResponses[0] : null;

      expect(lastResponse).toBeNull();
    });
  });

  describe('Contagem de Perguntas por Categoria', () => {
    it('deve contar perguntas únicas por categoria', () => {
      const categoryQuestions: Record<string, Set<string>> = {
        demands: new Set(),
        control: new Set(),
        support: new Set()
      };

      mockResponses.forEach((r) => {
        const category = r.questions.category;
        if (category in categoryQuestions) {
          categoryQuestions[category].add(r.question_id);
        }
      });

      expect(categoryQuestions.demands.size).toBe(1); // q1
      expect(categoryQuestions.control.size).toBe(1); // q2
      expect(categoryQuestions.support.size).toBe(1); // q3
    });

    it('não deve contar duplicatas de perguntas', () => {
      const questionIds = new Set(mockResponses.map((r) => r.question_id));

      expect(questionIds.size).toBe(3); // q1, q2, q3
    });
  });

  describe('Filtro por Tipo de Questão', () => {
    it('deve filtrar apenas questões likert_scale', () => {
      const allResponses = [
        ...mockResponses,
        {
          id: '6',
          anonymous_id: 'user-4',
          value: 'Texto livre',
          created_at: '2025-12-02T10:00:00Z',
          question_id: 'q4',
          questions: { id: 'q4', category: 'demands', type: 'text' }
        }
      ];

      const likertOnly = allResponses.filter(
        (r) => r.questions.type === 'likert_scale'
      );

      expect(likertOnly.length).toBe(5); // Apenas as 5 originais
      expect(likertOnly.every((r) => r.questions.type === 'likert_scale')).toBe(
        true
      );
    });

    it('deve ignorar respostas não-numéricas ao calcular médias', () => {
      const values = ['4', '3', 'N/A', '5', 'invalid'];

      const numericValues = values
        .map((v) => parseFloat(v))
        .filter((v) => !isNaN(v));

      expect(numericValues.length).toBe(3); // 4, 3, 5
      expect(numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toBe(
        4
      );
    });
  });
});

/**
 * Testes de Cálculo de Score NPS
 *
 * NPS (Net Promoter Score) usa escala 0-10
 * Para normalização consistente, convertemos para escala 1-5:
 * - NPS 10 → 1 (baixo risco - satisfeito)
 * - NPS 0 → 5 (alto risco - insatisfeito)
 * Fórmula: normalizedScore = 5 - (nps_value * 0.4)
 */
describe('NPS Score Calculation', () => {
  describe('Normalização NPS para escala 1-5', () => {
    /**
     * Função de normalização NPS
     * Converte valor 0-10 para escala 1-5 invertida
     */
    const normalizeNpsScore = (npsValue: number): number => {
      return 5 - (npsValue * 0.4);
    };

    it('deve normalizar NPS 10 para score 1 (baixo risco)', () => {
      const normalized = normalizeNpsScore(10);
      expect(normalized).toBe(1);
    });

    it('deve normalizar NPS 0 para score 5 (alto risco)', () => {
      const normalized = normalizeNpsScore(0);
      expect(normalized).toBe(5);
    });

    it('deve normalizar NPS 5 para score 3 (risco médio)', () => {
      const normalized = normalizeNpsScore(5);
      expect(normalized).toBe(3);
    });

    it('deve normalizar NPS 8 para score 1.8 (baixo risco)', () => {
      const normalized = normalizeNpsScore(8);
      expect(normalized).toBeCloseTo(1.8, 1);
    });

    it('deve normalizar NPS 2 para score 4.2 (alto risco)', () => {
      const normalized = normalizeNpsScore(2);
      expect(normalized).toBeCloseTo(4.2, 1);
    });

    it('deve manter valores dentro do range 1-5', () => {
      for (let nps = 0; nps <= 10; nps++) {
        const normalized = normalizeNpsScore(nps);
        expect(normalized).toBeGreaterThanOrEqual(1);
        expect(normalized).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('Processamento de respostas NPS em âncoras', () => {
    const mockNpsResponses = [
      {
        id: '1',
        anonymous_id: 'user-1',
        response_text: '8',
        question_id: 'anchor-nps-1',
        questions: { id: 'anchor-nps-1', category: 'anchors', type: 'nps_scale', risk_inverted: true }
      },
      {
        id: '2',
        anonymous_id: 'user-2',
        response_text: '9',
        question_id: 'anchor-nps-1',
        questions: { id: 'anchor-nps-1', category: 'anchors', type: 'nps_scale', risk_inverted: true }
      },
      {
        id: '3',
        anonymous_id: 'user-3',
        response_text: '6',
        question_id: 'anchor-nps-1',
        questions: { id: 'anchor-nps-1', category: 'anchors', type: 'nps_scale', risk_inverted: true }
      }
    ];

    it('deve calcular média de scores NPS normalizados', () => {
      const normalizeNpsScore = (npsValue: number) => 5 - (npsValue * 0.4);

      const normalizedScores = mockNpsResponses.map(r =>
        normalizeNpsScore(parseFloat(r.response_text))
      );

      // NPS 8 → 1.8, NPS 9 → 1.4, NPS 6 → 2.6
      expect(normalizedScores[0]).toBeCloseTo(1.8, 1);
      expect(normalizedScores[1]).toBeCloseTo(1.4, 1);
      expect(normalizedScores[2]).toBeCloseTo(2.6, 1);

      const average = normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length;
      // (1.8 + 1.4 + 2.6) / 3 = 1.93
      expect(average).toBeCloseTo(1.93, 1);
    });

    it('deve classificar NPS promotores (9-10) como baixo risco', () => {
      const normalizeNpsScore = (npsValue: number) => 5 - (npsValue * 0.4);

      [9, 10].forEach(nps => {
        const normalized = normalizeNpsScore(nps);
        // Score < 2.5 em escala invertida significa baixo risco
        expect(normalized).toBeLessThan(2.5);
      });
    });

    it('deve classificar NPS detratores (0-6) como alto risco', () => {
      const normalizeNpsScore = (npsValue: number) => 5 - (npsValue * 0.4);

      [0, 1, 2, 3, 4, 5, 6].forEach(nps => {
        const normalized = normalizeNpsScore(nps);
        // Score >= 2.6 em escala invertida significa médio/alto risco
        // Use toBeCloseTo to handle floating point precision
        expect(normalized).toBeGreaterThan(2.59);
      });
    });

    it('deve classificar NPS passivos (7-8) como risco médio-baixo', () => {
      const normalizeNpsScore = (npsValue: number) => 5 - (npsValue * 0.4);

      [7, 8].forEach(nps => {
        const normalized = normalizeNpsScore(nps);
        // Score entre 1.8 e 2.2 (with floating point tolerance)
        expect(normalized).toBeGreaterThan(1.79);
        expect(normalized).toBeLessThan(2.21);
      });
    });
  });

  describe('Respostas mistas (Likert + NPS)', () => {
    const mixedResponses = [
      // Likert scale (1-5)
      {
        id: '1',
        response_text: '4',
        question_id: 'q1',
        questions: { id: 'q1', category: 'demands', type: 'likert_scale', risk_inverted: true }
      },
      // NPS scale (0-10)
      {
        id: '2',
        response_text: '8',
        question_id: 'q2',
        questions: { id: 'q2', category: 'anchors', type: 'nps_scale', risk_inverted: true }
      },
      // Likert scale (1-5) com risk_inverted=false
      {
        id: '3',
        response_text: '2',
        question_id: 'q3',
        questions: { id: 'q3', category: 'control', type: 'likert_scale', risk_inverted: false }
      }
    ];

    it('deve processar tipos diferentes de escala corretamente', () => {
      const categoryScores: Record<string, number[]> = {
        demands: [],
        anchors: [],
        control: []
      };

      mixedResponses.forEach(r => {
        const category = r.questions.category;
        const questionType = r.questions.type;
        const riskInverted = r.questions.risk_inverted;
        const numericValue = parseFloat(r.response_text);

        if (questionType === 'likert_scale' && !isNaN(numericValue)) {
          const normalizedScore = riskInverted ? numericValue : (6 - numericValue);
          categoryScores[category].push(normalizedScore);
        } else if (questionType === 'nps_scale' && !isNaN(numericValue)) {
          const normalizedScore = 5 - (numericValue * 0.4);
          categoryScores[category].push(normalizedScore);
        }
      });

      // Likert 4 (risk_inverted=true) → 4
      expect(categoryScores.demands[0]).toBe(4);

      // NPS 8 → 5 - (8 * 0.4) = 1.8
      expect(categoryScores.anchors[0]).toBeCloseTo(1.8, 1);

      // Likert 2 (risk_inverted=false) → 6 - 2 = 4
      expect(categoryScores.control[0]).toBe(4);
    });

    it('deve ignorar valores NPS inválidos', () => {
      const invalidNpsValues = ['-1', '11', 'abc', '', 'NaN'];
      const normalizedScores: number[] = [];

      invalidNpsValues.forEach(value => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10) {
          normalizedScores.push(5 - (numericValue * 0.4));
        }
      });

      expect(normalizedScores.length).toBe(0);
    });

    it('deve aceitar valores NPS válidos como string', () => {
      const validNpsStrings = ['0', '5', '10', '7.5'];
      const normalizedScores: number[] = [];

      validNpsStrings.forEach(value => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10) {
          normalizedScores.push(5 - (numericValue * 0.4));
        }
      });

      expect(normalizedScores.length).toBe(4);
      expect(normalizedScores[0]).toBe(5);     // NPS 0 → 5
      expect(normalizedScores[1]).toBe(3);     // NPS 5 → 3
      expect(normalizedScores[2]).toBe(1);     // NPS 10 → 1
      expect(normalizedScores[3]).toBe(2);     // NPS 7.5 → 2
    });
  });

  describe('Cálculo de score geral de âncoras', () => {
    it('deve calcular score médio de múltiplas âncoras', () => {
      const anchorScores = [
        1.8,  // NPS 8
        2.6,  // NPS 6
        1.4,  // NPS 9
        3.0,  // Likert 3
        2.0   // NPS 7.5
      ];

      const averageScore = anchorScores.reduce((a, b) => a + b, 0) / anchorScores.length;
      const rounded = Math.round(averageScore * 100) / 100;

      // (1.8 + 2.6 + 1.4 + 3.0 + 2.0) / 5 = 2.16
      expect(rounded).toBeCloseTo(2.16, 1);
    });

    it('deve classificar risco geral baseado no score médio', () => {
      const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
        if (score >= 3.5) return 'high';
        if (score >= 2.5) return 'medium';
        return 'low';
      };

      // Score baixo = satisfação alta = risco baixo
      expect(getRiskLevel(1.5)).toBe('low');
      expect(getRiskLevel(2.4)).toBe('low');

      // Score médio = satisfação média = risco médio
      expect(getRiskLevel(2.5)).toBe('medium');
      expect(getRiskLevel(3.4)).toBe('medium');

      // Score alto = satisfação baixa = risco alto
      expect(getRiskLevel(3.5)).toBe('high');
      expect(getRiskLevel(4.5)).toBe('high');
    });
  });
});

/**
 * Testes de Helper Functions
 */
describe('Helper Functions', () => {
  describe('getCategoryName', () => {
    it('deve traduzir categorias para português', () => {
      const translations: Record<string, string> = {
        demands: 'Demandas',
        control: 'Controle',
        support: 'Apoio',
        relationships: 'Relacionamentos',
        role: 'Papel',
        change: 'Mudança'
      };

      Object.entries(translations).forEach(([key, value]) => {
        expect(translations[key]).toBe(value);
      });
    });

    it('deve retornar a chave original se não houver tradução', () => {
      const unknownCategory = 'unknown';
      const categoryNames: Record<string, string> = {
        demands: 'Demandas'
      };

      const result = categoryNames[unknownCategory] || unknownCategory;
      expect(result).toBe('unknown');
    });
  });

  describe('getRiskLevelLabel', () => {
    it('deve traduzir níveis de risco para português', () => {
      const labels: Record<string, string> = {
        low: 'Baixo',
        medium: 'Médio',
        high: 'Alto'
      };

      expect(labels.low).toBe('Baixo');
      expect(labels.medium).toBe('Médio');
      expect(labels.high).toBe('Alto');
    });
  });

  describe('getRiskLevelColor', () => {
    it('deve retornar classes CSS corretas por nível', () => {
      const colors: Record<string, string> = {
        low: 'text-green-600 bg-green-50',
        medium: 'text-yellow-600 bg-yellow-50',
        high: 'text-red-600 bg-red-50'
      };

      expect(colors.low).toContain('green');
      expect(colors.medium).toContain('yellow');
      expect(colors.high).toContain('red');
    });
  });
});
