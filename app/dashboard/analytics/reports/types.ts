/**
 * Report System Types
 *
 * Tipos compartilhados para o sistema de geração de relatórios PsicoMapa
 */

// Tipos de relatório disponíveis
export type ReportType =
  | 'riscos_psicossociais'
  | 'clima_mensal'
  | 'plano_acao'
  | 'executivo_lideranca'
  | 'correlacao';

// Status de geração do relatório
export type ReportStatus = 'generating' | 'completed' | 'failed' | 'archived';

// Níveis de risco
export type RiskLevel = 'low' | 'medium' | 'high';

// Sentimento para análise NLP
export type Sentiment = 'positive' | 'neutral' | 'negative';

// Metadados do relatório
export interface ReportMetadata {
  type: ReportType;
  title: string;
  organizationName: string;
  assessmentTitle: string;
  period: {
    start: string;
    end: string;
  };
  participants: number;
  responseRate: number;
  segmentation?: SegmentInfo[];
  generatedAt: string;
  aiModel?: string;
}

// Informação de segmento
export interface SegmentInfo {
  name: string;
  count: number;
  percentage: number;
}

// Resultado da geração de relatório
export interface ReportGenerationResult {
  success: boolean;
  reportId?: string;
  content?: ReportContent;
  pdfBlob?: Blob;
  error?: string;
}

// Conteúdo genérico do relatório
export interface ReportContent {
  metadata: ReportMetadata;
  sections: ReportSection[];
}

// Seção do relatório
export interface ReportSection {
  id: string;
  title: string;
  type: 'narrative' | 'metrics' | 'chart' | 'table' | 'action_items' | 'themes';
  content: unknown;
}

// ==========================================
// Tipos para Análise NLP
// ==========================================

export interface NLPTheme {
  theme: string;
  count: number;
  percentage: number;
  examples: string[];
  sentiment: Sentiment;
}

export interface NLPAnalysisResult {
  themes: NLPTheme[];
  totalResponses: number;
  analyzedAt: string;
}

// ==========================================
// Tipos para Análise de Bloco
// ==========================================

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  avgScore: number;
  responseCount: number;
  riskLevel: RiskLevel;
  distribution: ScoreDistribution;
}

export interface ScoreDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface BlockAnalysis {
  blockId: string;
  blockName: string;
  blockCategory: string;
  averageScore: number;
  riskLevel: RiskLevel;
  narrative: string;
  questions: QuestionAnalysis[];
  responseCount: number;
}

// Análise especial do Bloco 6 (Violência)
export interface ViolenceBlockAnalysis extends BlockAnalysis {
  preferNotToAnswer: {
    count: number;
    percentage: number;
    alert: boolean; // true se > 10%
  };
}

// Análise das Âncoras (Bloco 7)
export interface AnchorAnalysis {
  nps: {
    score: number;
    promoters: number;
    passives: number;
    detractors: number;
  };
  satisfaction: {
    average: number;
    distribution: ScoreDistribution;
  };
  permanence: {
    stayPercentage: number;
    leavePercentage: number;
    undecidedPercentage: number;
  };
  health: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

// ==========================================
// Tipos para Relatório 1: Riscos Psicossociais
// ==========================================

export interface RiscosPsicossociaisReport {
  metadata: ReportMetadata;
  executiveSummary: string;
  introduction: string; // Texto sobre COPSOQ II-BR e NR-1
  blocks: BlockAnalysis[]; // Blocos 1-5
  violenceBlock: ViolenceBlockAnalysis; // Bloco 6 especial
  nlpThemes: Record<string, NLPTheme[]>; // Temas das abertas Q1.A-Q6.A
  organizationalHypotheses: string[];
  anchors: AnchorAnalysis; // Bloco 7 como efeitos
  systemicView: string; // Visão sistêmica entre blocos
  recommendations: Recommendation[];
}

// ==========================================
// Tipos para Relatório 2: Clima Mensal
// ==========================================

export interface AxisAnalysis {
  axisId: string;
  axisName: string;
  questionText: string;
  average: number;
  trend?: 'up' | 'down' | 'stable';
  narrative: string;
}

export interface ClimaMensalReport {
  metadata: ReportMetadata;
  opening: {
    n: number;
    responseRate: number;
    segments: SegmentInfo[];
  };
  axes: AxisAnalysis[]; // Q1-Q9 narrativas
  essentialNumbers: {
    overallAverage: number;
    highestScore: { axis: string; score: number };
    lowestScore: { axis: string; score: number };
  };
  voiceOfEmployee: NLPTheme[]; // Q10 temas via NLP
  insights: {
    learnings: string[]; // 3 aprendizados
    concerns: string[]; // 3 preocupações
  };
}

// ==========================================
// Tipos para Relatório 3: Plano de Ação
// ==========================================

export interface ActionPriority {
  id: string;
  priority: number; // 1-5
  theme: string;
  description: string;
  evidence: string[];
  responsible?: string;
  deadline?: string;
  indicator?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface BacklogItem {
  id: string;
  theme: string;
  items: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface GovernanceStructure {
  sponsor: string;
  committee: string[];
  reviewFrequency: string;
  escalationPath: string;
}

export interface PlanoAcaoReport {
  metadata: ReportMetadata;
  summary: string;
  priorities: ActionPriority[]; // 3-5 prioridades com evidências
  backlog: BacklogItem[]; // Por tema
  governance: GovernanceStructure;
  feedback: string; // Devolutiva
}

// ==========================================
// Tipos para Relatório 4: Executivo Liderança
// ==========================================

export interface FocusArea {
  area: string;
  why: string;
  action: string;
}

export interface RiskSignal {
  category: string;
  signal: string;
  severity: 'attention' | 'alert' | 'critical';
}

export interface ConversationScript {
  opening: string;
  keyQuestions: string[];
  closingGuidance: string;
}

export interface ExecutivoLiderancaReport {
  metadata: ReportMetadata;
  pulseOfPeriod: string[]; // 5 bullets
  topFocusAreas: FocusArea[]; // Top 3
  riskSignals: RiskSignal[];
  teamConversationScript: ConversationScript;
}

// ==========================================
// Tipos para Relatório 5: Correlação (Futuro)
// ==========================================

export interface CorrelationPoint {
  climaMetric: string;
  riskMetric: string;
  anchorMetric: string;
  correlationStrength: number; // -1 a 1
  interpretation: string;
}

export interface CorrelacaoReport {
  metadata: ReportMetadata;
  relationshipMap: CorrelationPoint[];
  expectedCorrelations: {
    question: string;
    expectedWith: string;
    actualCorrelation: number;
  }[];
  leverConclusions: string[];
}

// ==========================================
// Tipos Auxiliares
// ==========================================

export interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  timeline: string;
  responsible: string;
  indicator?: string;
}

// Dados brutos do assessment para geração
export interface AssessmentDataForReport {
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
  closureReason?: 'expired' | 'all_responses' | 'manual';
}

// Configuração para geração de relatório
export interface ReportGenerationConfig {
  assessmentId: string;
  reportType: ReportType;
  includeNLP: boolean;
  includeAIAnalysis: boolean;
  language: 'pt-BR';
}
