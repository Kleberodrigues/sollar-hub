/**
 * Reports and AI Action Plans Unit Tests
 *
 * Testes unitários para validar lógica de geração de relatórios e planos de ação com IA
 * Foca em validações de dados, cálculos de risco e tratamento de erros
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==========================================
// Mock Data
// ==========================================

const mockAssessmentData = {
  assessmentId: 'test-assessment-123',
  assessmentTitle: 'Avaliação NR-1 Q4 2025',
  organizationId: 'org-123',
  organizationName: 'Empresa Teste',
  questionnaireType: 'nr1' as const,
  startDate: '2025-10-01',
  endDate: '2025-12-31',
  totalParticipants: 50,
  totalResponses: 500,
  responseRate: 85,
  isClosed: true,
  closureReason: 'expired' as const,
};

const mockEmptyAssessmentData = {
  ...mockAssessmentData,
  totalParticipants: 0,
  totalResponses: 0,
  responseRate: 0,
};

const mockLowParticipantData = {
  ...mockAssessmentData,
  totalParticipants: 2,
  totalResponses: 20,
  responseRate: 100,
};

const mockCategoryScores = [
  {
    category: 'demands_and_pace',
    categoryName: 'Exigências e Ritmo de Trabalho',
    avgScore: 2.1,
    riskLevel: 'high' as const,
    responseCount: 150,
    questionCount: 5,
  },
  {
    category: 'autonomy_clarity_change',
    categoryName: 'Autonomia, Clareza e Mudanças',
    avgScore: 3.2,
    riskLevel: 'medium' as const,
    responseCount: 150,
    questionCount: 5,
  },
  {
    category: 'leadership_recognition',
    categoryName: 'Liderança e Reconhecimento',
    avgScore: 4.1,
    riskLevel: 'low' as const,
    responseCount: 150,
    questionCount: 5,
  },
  {
    category: 'relationships_communication',
    categoryName: 'Relações e Comunicação',
    avgScore: 3.8,
    riskLevel: 'low' as const,
    responseCount: 150,
    questionCount: 5,
  },
  {
    category: 'work_life_health',
    categoryName: 'Equilíbrio Trabalho-Vida e Saúde',
    avgScore: 2.8,
    riskLevel: 'medium' as const,
    responseCount: 150,
    questionCount: 5,
  },
  {
    category: 'violence_harassment',
    categoryName: 'Violência e Assédio',
    avgScore: 4.5,
    riskLevel: 'low' as const,
    responseCount: 150,
    questionCount: 5,
  },
];

const mockHighRiskCategories = [
  { category: 'demands_and_pace', score: 2.1 },
  { category: 'work_life_health', score: 2.8 },
];

const mockResponses = [
  {
    id: '1',
    anonymousId: 'user-1',
    questionId: 'q1',
    questionText: 'Você sente sobrecarga de trabalho?',
    questionCategory: 'demands_and_pace',
    questionType: 'likert_scale',
    value: '2',
    responseText: null,
    riskInverted: false,
  },
  {
    id: '2',
    anonymousId: 'user-1',
    questionId: 'q2',
    questionText: 'Sua liderança oferece suporte adequado?',
    questionCategory: 'leadership_recognition',
    questionType: 'likert_scale',
    value: '4',
    responseText: null,
    riskInverted: false,
  },
  {
    id: '3',
    anonymousId: 'user-2',
    questionId: 'q1',
    questionText: 'Você sente sobrecarga de trabalho?',
    questionCategory: 'demands_and_pace',
    questionType: 'likert_scale',
    value: '1',
    responseText: null,
    riskInverted: false,
  },
];

// ==========================================
// Helper Functions (extracted from source)
// ==========================================

function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 2.5) return 'high';
  if (score < 3.5) return 'medium';
  return 'low';
}

function calculateAverageScore(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateDistribution(scores: number[]): Record<string, number> {
  const dist = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  for (const score of scores) {
    const rounded = Math.round(score);
    if (rounded >= 1 && rounded <= 5) {
      dist[rounded.toString() as keyof typeof dist]++;
    }
  }

  return dist;
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 3) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return 0;

  return numerator / denominator;
}

function interpretCorrelation(r: number): string {
  const absR = Math.abs(r);
  const direction = r >= 0 ? 'positiva' : 'negativa';

  if (absR >= 0.7) return `Correlação ${direction} forte`;
  if (absR >= 0.4) return `Correlação ${direction} moderada`;
  if (absR >= 0.2) return `Correlação ${direction} fraca`;
  return 'Correlação negligível';
}

function checkInsufficientData(totalParticipants: number): boolean {
  return totalParticipants === 0;
}

function checkMinimumAnonymity(totalParticipants: number): boolean {
  return totalParticipants < 3;
}

function checkMinimumCorrelation(totalParticipants: number): boolean {
  return totalParticipants < 10;
}

// ==========================================
// Tests: Risk Level Classification
// ==========================================

describe('Risk Level Classification', () => {
  describe('getRiskLevel', () => {
    it('deve classificar score < 2.5 como alto risco', () => {
      expect(getRiskLevel(1.0)).toBe('high');
      expect(getRiskLevel(2.0)).toBe('high');
      expect(getRiskLevel(2.4)).toBe('high');
    });

    it('deve classificar score 2.5-3.4 como risco médio', () => {
      expect(getRiskLevel(2.5)).toBe('medium');
      expect(getRiskLevel(3.0)).toBe('medium');
      expect(getRiskLevel(3.4)).toBe('medium');
    });

    it('deve classificar score >= 3.5 como baixo risco', () => {
      expect(getRiskLevel(3.5)).toBe('low');
      expect(getRiskLevel(4.0)).toBe('low');
      expect(getRiskLevel(5.0)).toBe('low');
    });

    it('deve lidar com valores extremos', () => {
      expect(getRiskLevel(0)).toBe('high');
      expect(getRiskLevel(5)).toBe('low');
    });
  });
});

// ==========================================
// Tests: Score Calculations
// ==========================================

describe('Score Calculations', () => {
  describe('calculateAverageScore', () => {
    it('deve calcular média corretamente', () => {
      const scores = [1, 2, 3, 4, 5];
      expect(calculateAverageScore(scores)).toBe(3);
    });

    it('deve retornar 0 para array vazio', () => {
      expect(calculateAverageScore([])).toBe(0);
    });

    it('deve calcular média com decimais', () => {
      const scores = [2.5, 3.5, 4.0];
      const avg = calculateAverageScore(scores);
      expect(avg).toBeCloseTo(3.33, 1);
    });

    it('deve lidar com valores únicos', () => {
      expect(calculateAverageScore([4])).toBe(4);
    });
  });

  describe('calculateDistribution', () => {
    it('deve calcular distribuição corretamente', () => {
      const scores = [1, 2, 2, 3, 3, 3, 4, 4, 5];
      const dist = calculateDistribution(scores);

      expect(dist['1']).toBe(1);
      expect(dist['2']).toBe(2);
      expect(dist['3']).toBe(3);
      expect(dist['4']).toBe(2);
      expect(dist['5']).toBe(1);
    });

    it('deve retornar zeros para array vazio', () => {
      const dist = calculateDistribution([]);

      expect(dist['1']).toBe(0);
      expect(dist['2']).toBe(0);
      expect(dist['3']).toBe(0);
      expect(dist['4']).toBe(0);
      expect(dist['5']).toBe(0);
    });

    it('deve arredondar valores decimais', () => {
      const scores = [1.4, 2.6, 3.5];
      const dist = calculateDistribution(scores);

      expect(dist['1']).toBe(1); // 1.4 rounds to 1
      expect(dist['3']).toBe(1); // 2.6 rounds to 3
      expect(dist['4']).toBe(1); // 3.5 rounds to 4
    });

    it('deve ignorar valores fora do range 1-5', () => {
      const scores = [0, 6, 3, -1, 10];
      const dist = calculateDistribution(scores);

      expect(dist['3']).toBe(1);
      // Other values should remain 0
      expect(dist['1']).toBe(0);
      expect(dist['5']).toBe(0);
    });
  });
});

// ==========================================
// Tests: Correlation Analysis
// ==========================================

describe('Correlation Analysis', () => {
  describe('calculatePearsonCorrelation', () => {
    it('deve calcular correlação perfeita positiva', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [1, 2, 3, 4, 5];
      expect(calculatePearsonCorrelation(x, y)).toBeCloseTo(1, 2);
    });

    it('deve calcular correlação perfeita negativa', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [5, 4, 3, 2, 1];
      expect(calculatePearsonCorrelation(x, y)).toBeCloseTo(-1, 2);
    });

    it('deve retornar 0 para arrays muito curtos', () => {
      const x = [1, 2];
      const y = [3, 4];
      expect(calculatePearsonCorrelation(x, y)).toBe(0);
    });

    it('deve retornar 0 para arrays de tamanhos diferentes', () => {
      const x = [1, 2, 3];
      const y = [1, 2];
      expect(calculatePearsonCorrelation(x, y)).toBe(0);
    });

    it('deve calcular correlação moderada', () => {
      const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const y = [2, 1, 4, 3, 6, 5, 8, 7, 10, 9];
      const r = calculatePearsonCorrelation(x, y);
      expect(r).toBeGreaterThan(0.5);
      expect(r).toBeLessThan(1);
    });

    it('deve retornar 0 quando não há variação', () => {
      const x = [3, 3, 3, 3, 3];
      const y = [1, 2, 3, 4, 5];
      expect(calculatePearsonCorrelation(x, y)).toBe(0);
    });
  });

  describe('interpretCorrelation', () => {
    it('deve interpretar correlação forte positiva', () => {
      expect(interpretCorrelation(0.8)).toBe('Correlação positiva forte');
    });

    it('deve interpretar correlação forte negativa', () => {
      expect(interpretCorrelation(-0.75)).toBe('Correlação negativa forte');
    });

    it('deve interpretar correlação moderada', () => {
      expect(interpretCorrelation(0.5)).toBe('Correlação positiva moderada');
      expect(interpretCorrelation(-0.45)).toBe('Correlação negativa moderada');
    });

    it('deve interpretar correlação fraca', () => {
      expect(interpretCorrelation(0.3)).toBe('Correlação positiva fraca');
      expect(interpretCorrelation(-0.25)).toBe('Correlação negativa fraca');
    });

    it('deve interpretar correlação negligível', () => {
      expect(interpretCorrelation(0.1)).toBe('Correlação negligível');
      expect(interpretCorrelation(-0.05)).toBe('Correlação negligível');
      expect(interpretCorrelation(0)).toBe('Correlação negligível');
    });
  });
});

// ==========================================
// Tests: Insufficient Data Validation
// ==========================================

describe('Insufficient Data Validation', () => {
  describe('checkInsufficientData', () => {
    it('deve retornar true quando não há participantes', () => {
      expect(checkInsufficientData(0)).toBe(true);
    });

    it('deve retornar false quando há participantes', () => {
      expect(checkInsufficientData(1)).toBe(false);
      expect(checkInsufficientData(10)).toBe(false);
      expect(checkInsufficientData(100)).toBe(false);
    });
  });

  describe('checkMinimumAnonymity', () => {
    it('deve retornar true quando há menos de 3 participantes', () => {
      expect(checkMinimumAnonymity(0)).toBe(true);
      expect(checkMinimumAnonymity(1)).toBe(true);
      expect(checkMinimumAnonymity(2)).toBe(true);
    });

    it('deve retornar false quando há 3 ou mais participantes', () => {
      expect(checkMinimumAnonymity(3)).toBe(false);
      expect(checkMinimumAnonymity(10)).toBe(false);
      expect(checkMinimumAnonymity(100)).toBe(false);
    });
  });

  describe('checkMinimumCorrelation', () => {
    it('deve retornar true quando há menos de 10 participantes', () => {
      expect(checkMinimumCorrelation(0)).toBe(true);
      expect(checkMinimumCorrelation(5)).toBe(true);
      expect(checkMinimumCorrelation(9)).toBe(true);
    });

    it('deve retornar false quando há 10 ou mais participantes', () => {
      expect(checkMinimumCorrelation(10)).toBe(false);
      expect(checkMinimumCorrelation(50)).toBe(false);
      expect(checkMinimumCorrelation(100)).toBe(false);
    });
  });
});

// ==========================================
// Tests: Action Plan Template Generation
// ==========================================

describe('Action Plan Template Generation', () => {
  const actionTemplates: Record<string, { title: string; timeline: string }[]> = {
    demands_and_pace: [
      { title: 'Revisão da distribuição de tarefas', timeline: '2-4 semanas' },
      { title: 'Implementar pausas programadas', timeline: '1-2 semanas' },
    ],
    autonomy_clarity_change: [
      { title: 'Definir papéis e responsabilidades', timeline: '3-4 semanas' },
    ],
    leadership_recognition: [
      { title: 'Programa de feedback contínuo', timeline: '4-6 semanas' },
    ],
    relationships_communication: [
      { title: 'Workshops de comunicação', timeline: '4-8 semanas' },
    ],
    work_life_health: [
      { title: 'Política de desconexão', timeline: '2-3 semanas' },
    ],
    violence_harassment: [
      { title: 'Canal de denúncias confidencial', timeline: '1-2 semanas' },
    ],
  };

  function generateTemplateActionPlan(highRiskCategories: { category: string; score: number }[]) {
    const actions: { category: string; title: string; timeline: string }[] = [];

    highRiskCategories.forEach(({ category }) => {
      const categoryActions = actionTemplates[category] || [];
      categoryActions.forEach(action => {
        actions.push({
          category,
          title: action.title,
          timeline: action.timeline,
        });
      });
    });

    if (actions.length === 0) {
      actions.push({
        category: 'general',
        title: 'Manter monitoramento contínuo',
        timeline: 'Contínuo',
      });
    }

    return actions;
  }

  it('deve gerar ações para categorias de alto risco', () => {
    const actions = generateTemplateActionPlan(mockHighRiskCategories);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.category === 'demands_and_pace')).toBe(true);
    expect(actions.some(a => a.category === 'work_life_health')).toBe(true);
  });

  it('deve retornar ação padrão quando não há categorias de risco', () => {
    const actions = generateTemplateActionPlan([]);

    expect(actions.length).toBe(1);
    expect(actions[0].category).toBe('general');
    expect(actions[0].title).toBe('Manter monitoramento contínuo');
  });

  it('deve incluir timeline em todas as ações', () => {
    const actions = generateTemplateActionPlan(mockHighRiskCategories);

    actions.forEach(action => {
      expect(action.timeline).toBeDefined();
      expect(action.timeline.length).toBeGreaterThan(0);
    });
  });

  it('deve gerar múltiplas ações para categoria demands_and_pace', () => {
    const actions = generateTemplateActionPlan([{ category: 'demands_and_pace', score: 2.0 }]);

    const demandActions = actions.filter(a => a.category === 'demands_and_pace');
    expect(demandActions.length).toBe(2);
  });

  it('deve lidar com categoria desconhecida', () => {
    const actions = generateTemplateActionPlan([{ category: 'unknown_category', score: 1.5 }]);

    // Should still return default action
    expect(actions.length).toBe(1);
    expect(actions[0].category).toBe('general');
  });
});

// ==========================================
// Tests: Report Validation Logic
// ==========================================

describe('Report Validation Logic', () => {
  interface ValidationResult {
    canGenerate: boolean;
    error?: string;
  }

  interface AssessmentDataInput {
    assessmentId: string;
    assessmentTitle: string;
    organizationId: string;
    organizationName: string;
    questionnaireType: 'nr1' | 'clima';
    startDate: string;
    endDate: string;
    totalParticipants: number;
    totalResponses: number;
    responseRate: number;
    isClosed: boolean;
    closureReason: 'expired' | 'manual' | 'completed';
  }

  function validateReportGeneration(
    assessmentData: AssessmentDataInput,
    reportType: 'riscos_psicossociais' | 'correlacao' | 'clima_mensal' | 'executivo_lideranca' | 'plano_acao'
  ): ValidationResult {
    // Check for no data
    if (assessmentData.totalParticipants === 0) {
      return { canGenerate: false, error: 'INSUFFICIENT_DATA' };
    }

    // Check report-specific requirements
    if (reportType === 'riscos_psicossociais') {
      if (assessmentData.questionnaireType !== 'nr1') {
        return { canGenerate: false, error: 'Este relatório é específico para avaliações NR-1' };
      }
      if (assessmentData.totalParticipants < 3) {
        return { canGenerate: false, error: 'É necessário pelo menos 3 participantes para garantir anonimato' };
      }
    }

    if (reportType === 'correlacao') {
      if (assessmentData.questionnaireType !== 'nr1') {
        return { canGenerate: false, error: 'Este relatório requer avaliação NR-1' };
      }
      if (assessmentData.totalParticipants < 10) {
        return { canGenerate: false, error: 'São necessários pelo menos 10 participantes para análise de correlação' };
      }
    }

    return { canGenerate: true };
  }

  describe('Validação de dados insuficientes', () => {
    it('deve rejeitar relatório sem participantes', () => {
      const result = validateReportGeneration(mockEmptyAssessmentData, 'riscos_psicossociais');

      expect(result.canGenerate).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_DATA');
    });

    it('deve aceitar relatório com participantes suficientes', () => {
      const result = validateReportGeneration(mockAssessmentData, 'riscos_psicossociais');

      expect(result.canGenerate).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Validação de anonimato (mínimo 3 participantes)', () => {
    it('deve rejeitar relatório de riscos com menos de 3 participantes', () => {
      const result = validateReportGeneration(mockLowParticipantData, 'riscos_psicossociais');

      expect(result.canGenerate).toBe(false);
      expect(result.error).toContain('3 participantes');
    });

    it('deve aceitar relatório executivo com 2 participantes', () => {
      const result = validateReportGeneration(mockLowParticipantData, 'executivo_lideranca');

      // Executivo doesn't have the 3-participant requirement
      expect(result.canGenerate).toBe(true);
    });
  });

  describe('Validação de correlação (mínimo 10 participantes)', () => {
    it('deve rejeitar relatório de correlação com menos de 10 participantes', () => {
      const lowData = { ...mockAssessmentData, totalParticipants: 5 };
      const result = validateReportGeneration(lowData, 'correlacao');

      expect(result.canGenerate).toBe(false);
      expect(result.error).toContain('10 participantes');
    });

    it('deve aceitar relatório de correlação com 10+ participantes', () => {
      const result = validateReportGeneration(mockAssessmentData, 'correlacao');

      expect(result.canGenerate).toBe(true);
    });
  });

  describe('Validação de tipo de questionário', () => {
    it('deve rejeitar relatório NR-1 para questionário clima', () => {
      const climaData = { ...mockAssessmentData, questionnaireType: 'clima' as const };
      const result = validateReportGeneration(climaData, 'riscos_psicossociais');

      expect(result.canGenerate).toBe(false);
      expect(result.error).toContain('NR-1');
    });

    it('deve aceitar relatório clima para questionário clima', () => {
      const climaData = { ...mockAssessmentData, questionnaireType: 'clima' as const };
      const result = validateReportGeneration(climaData, 'clima_mensal');

      expect(result.canGenerate).toBe(true);
    });
  });
});

// ==========================================
// Tests: Category Score Aggregation
// ==========================================

describe('Category Score Aggregation', () => {
  function aggregateCategoryScores(
    responses: typeof mockResponses
  ): Record<string, { scores: number[]; avgScore: number; riskLevel: 'low' | 'medium' | 'high' }> {
    const categoryData: Record<string, number[]> = {};

    for (const r of responses) {
      if (r.questionType !== 'likert_scale') continue;

      const value = parseFloat(r.value || '0');
      if (isNaN(value)) continue;

      if (!categoryData[r.questionCategory]) {
        categoryData[r.questionCategory] = [];
      }

      categoryData[r.questionCategory].push(value);
    }

    const result: Record<string, { scores: number[]; avgScore: number; riskLevel: 'low' | 'medium' | 'high' }> = {};

    for (const [category, scores] of Object.entries(categoryData)) {
      const avgScore = calculateAverageScore(scores);
      result[category] = {
        scores,
        avgScore: Math.round(avgScore * 100) / 100,
        riskLevel: getRiskLevel(avgScore),
      };
    }

    return result;
  }

  it('deve agregar scores por categoria corretamente', () => {
    const result = aggregateCategoryScores(mockResponses);

    expect(result['demands_and_pace']).toBeDefined();
    expect(result['leadership_recognition']).toBeDefined();
  });

  it('deve calcular média correta por categoria', () => {
    const result = aggregateCategoryScores(mockResponses);

    // demands_and_pace: values are 2 and 1, avg = 1.5
    expect(result['demands_and_pace'].avgScore).toBe(1.5);

    // leadership_recognition: value is 4, avg = 4
    expect(result['leadership_recognition'].avgScore).toBe(4);
  });

  it('deve classificar risco corretamente', () => {
    const result = aggregateCategoryScores(mockResponses);

    // 1.5 < 2.5 = high risk
    expect(result['demands_and_pace'].riskLevel).toBe('high');

    // 4 >= 3.5 = low risk
    expect(result['leadership_recognition'].riskLevel).toBe('low');
  });

  it('deve retornar objeto vazio para respostas vazias', () => {
    const result = aggregateCategoryScores([]);

    expect(Object.keys(result).length).toBe(0);
  });
});

// ==========================================
// Tests: NPS Calculation
// ==========================================

describe('NPS Calculation', () => {
  function calculateNPS(scores: number[]): {
    score: number;
    promoters: number;
    passives: number;
    detractors: number;
  } {
    if (scores.length === 0) {
      return { score: 0, promoters: 0, passives: 0, detractors: 0 };
    }

    const promoters = scores.filter(v => v >= 9).length;
    const passives = scores.filter(v => v >= 7 && v < 9).length;
    const detractors = scores.filter(v => v < 7).length;

    const npsScore = ((promoters - detractors) / scores.length) * 100;

    return {
      score: Math.round(npsScore),
      promoters,
      passives,
      detractors,
    };
  }

  it('deve calcular NPS positivo corretamente', () => {
    // 7 promoters, 2 passives, 1 detractor
    const scores = [10, 10, 9, 9, 9, 9, 9, 8, 8, 5];
    const result = calculateNPS(scores);

    // (7 - 1) / 10 * 100 = 60
    expect(result.score).toBe(60);
    expect(result.promoters).toBe(7);
    expect(result.passives).toBe(2);
    expect(result.detractors).toBe(1);
  });

  it('deve calcular NPS negativo corretamente', () => {
    // 1 promoter, 2 passives, 7 detractors
    const scores = [10, 8, 7, 5, 4, 3, 2, 1, 6, 6];
    const result = calculateNPS(scores);

    // (1 - 7) / 10 * 100 = -60
    expect(result.score).toBe(-60);
    expect(result.detractors).toBe(7);
  });

  it('deve retornar zeros para array vazio', () => {
    const result = calculateNPS([]);

    expect(result.score).toBe(0);
    expect(result.promoters).toBe(0);
    expect(result.passives).toBe(0);
    expect(result.detractors).toBe(0);
  });

  it('deve lidar com todos promoters', () => {
    const scores = [10, 10, 9, 9, 10];
    const result = calculateNPS(scores);

    expect(result.score).toBe(100);
    expect(result.promoters).toBe(5);
    expect(result.detractors).toBe(0);
  });

  it('deve lidar com todos detractors', () => {
    const scores = [1, 2, 3, 4, 5];
    const result = calculateNPS(scores);

    expect(result.score).toBe(-100);
    expect(result.detractors).toBe(5);
    expect(result.promoters).toBe(0);
  });
});

// ==========================================
// Tests: Response Rate Calculation
// ==========================================

describe('Response Rate Calculation', () => {
  function calculateResponseRate(
    uniqueResponders: number,
    expectedParticipants: number
  ): number {
    if (expectedParticipants === 0) return 0;
    return Math.round((uniqueResponders / expectedParticipants) * 100);
  }

  it('deve calcular taxa de resposta corretamente', () => {
    expect(calculateResponseRate(85, 100)).toBe(85);
    expect(calculateResponseRate(50, 100)).toBe(50);
    expect(calculateResponseRate(100, 100)).toBe(100);
  });

  it('deve arredondar resultado', () => {
    expect(calculateResponseRate(33, 100)).toBe(33);
    expect(calculateResponseRate(67, 100)).toBe(67);
  });

  it('deve retornar 0 quando não há participantes esperados', () => {
    expect(calculateResponseRate(0, 0)).toBe(0);
    expect(calculateResponseRate(10, 0)).toBe(0);
  });

  it('deve permitir taxa acima de 100% (mais respostas que esperado)', () => {
    expect(calculateResponseRate(120, 100)).toBe(120);
  });
});

// ==========================================
// Tests: Priority Sorting
// ==========================================

describe('Priority Sorting', () => {
  function sortByRisk(
    categories: { category: string; avgScore: number; riskLevel: 'low' | 'medium' | 'high' }[]
  ) {
    const riskOrder = { high: 0, medium: 1, low: 2 };

    return [...categories].sort((a, b) => {
      // First by risk level
      const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      if (riskDiff !== 0) return riskDiff;

      // Then by score (lower score = higher priority)
      return a.avgScore - b.avgScore;
    });
  }

  it('deve ordenar alto risco primeiro', () => {
    const categories = [
      { category: 'a', avgScore: 4.0, riskLevel: 'low' as const },
      { category: 'b', avgScore: 2.0, riskLevel: 'high' as const },
      { category: 'c', avgScore: 3.0, riskLevel: 'medium' as const },
    ];

    const sorted = sortByRisk(categories);

    expect(sorted[0].riskLevel).toBe('high');
    expect(sorted[1].riskLevel).toBe('medium');
    expect(sorted[2].riskLevel).toBe('low');
  });

  it('deve ordenar por score dentro do mesmo nível de risco', () => {
    const categories = [
      { category: 'a', avgScore: 2.3, riskLevel: 'high' as const },
      { category: 'b', avgScore: 2.0, riskLevel: 'high' as const },
      { category: 'c', avgScore: 2.1, riskLevel: 'high' as const },
    ];

    const sorted = sortByRisk(categories);

    expect(sorted[0].category).toBe('b'); // 2.0
    expect(sorted[1].category).toBe('c'); // 2.1
    expect(sorted[2].category).toBe('a'); // 2.3
  });

  it('deve manter array original inalterado', () => {
    const categories = [
      { category: 'a', avgScore: 4.0, riskLevel: 'low' as const },
      { category: 'b', avgScore: 2.0, riskLevel: 'high' as const },
    ];

    const originalFirst = categories[0].category;
    sortByRisk(categories);

    expect(categories[0].category).toBe(originalFirst);
  });
});
