'use client';

/**
 * Report Generation Page Component
 *
 * Página para geração de relatórios do PsicoMapa
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  BarChart3,
  Target,
  Users,
  GitBranch,
  Loader2,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  checkAssessmentClosed,
  generateRiscosPsicossociaisReport,
  generateClimaMensalReport,
  getReportHistory,
  type AssessmentClosureCheck,
  type GeneratedReport,
  type ReportType,
} from '@/app/dashboard/analytics/reports';

// Tipos de relatório disponíveis
const REPORT_TYPES = [
  {
    id: 'riscos_psicossociais' as ReportType,
    title: 'Relatório Riscos Psicossociais',
    description: 'Análise completa COPSOQ II-BR com narrativas por bloco',
    icon: BarChart3,
    frequency: 'Trimestral',
    applicableTo: ['nr1'],
    features: [
      'Análise por bloco (1-6)',
      'NLP de questões abertas',
      'Hipóteses organizacionais',
      'Âncoras como efeitos',
    ],
  },
  {
    id: 'clima_mensal' as ReportType,
    title: 'Relatório Mensal de Clima',
    description: 'Pulso mensal com voz do colaborador',
    icon: Users,
    frequency: 'Mensal',
    applicableTo: ['clima'],
    features: [
      'Narrativa por eixo',
      'Voz do colaborador (Q10)',
      '3 aprendizados + 3 preocupações',
    ],
  },
  {
    id: 'plano_acao' as ReportType,
    title: 'Relatório Plano de Ação',
    description: 'Prioridades com evidências e backlog temático',
    icon: Target,
    frequency: 'Trimestral',
    applicableTo: ['nr1', 'clima'],
    features: ['3-5 prioridades', 'Backlog por tema', 'Estrutura de governança'],
    comingSoon: true,
  },
  {
    id: 'executivo_lideranca' as ReportType,
    title: 'Relatório Executivo para Liderança',
    description: 'Resumo focado em líderes com roteiro de conversa',
    icon: FileText,
    frequency: 'Bimestral',
    applicableTo: ['nr1', 'clima'],
    features: ['5 bullets do período', 'Top 3 focos', 'Roteiro de conversa'],
    comingSoon: true,
  },
  {
    id: 'correlacao' as ReportType,
    title: 'Relatório de Correlação',
    description: 'Mapa de relação Clima → Riscos → Âncoras',
    icon: GitBranch,
    frequency: 'Trimestral',
    applicableTo: ['nr1'],
    features: ['Mapa de correlação', 'Conclusões de alavancas'],
    comingSoon: true,
  },
];

interface ReportGenerationPageProps {
  assessmentId: string;
  assessmentTitle: string;
  questionnaireType: 'nr1' | 'clima';
}

export function ReportGenerationPage({
  assessmentId,
  assessmentTitle,
  questionnaireType,
}: ReportGenerationPageProps) {
  const [closureStatus, setClosureStatus] = useState<AssessmentClosureCheck | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar status e histórico
  useEffect(() => {
    async function loadData() {
      try {
        const [status, reportHistory] = await Promise.all([
          checkAssessmentClosed(assessmentId),
          getReportHistory(assessmentId),
        ]);
        setClosureStatus(status);
        setHistory(reportHistory);
      } catch (err) {
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assessmentId]);

  // Filtrar relatórios aplicáveis
  const applicableReports = REPORT_TYPES.filter((report) =>
    report.applicableTo.includes(questionnaireType)
  );

  // Gerar relatório
  const handleGenerateReport = async (reportType: ReportType) => {
    setGenerating(reportType);
    setError(null);
    setSuccess(null);

    try {
      let result;

      switch (reportType) {
        case 'riscos_psicossociais':
          result = await generateRiscosPsicossociaisReport(assessmentId);
          break;
        case 'clima_mensal':
          result = await generateClimaMensalReport(assessmentId);
          break;
        default:
          throw new Error('Tipo de relatório não implementado');
      }

      if (result.success) {
        setSuccess(`Relatório gerado com sucesso!`);
        // Recarregar histórico
        const newHistory = await getReportHistory(assessmentId);
        setHistory(newHistory);
      } else {
        setError(result.error || 'Erro ao gerar relatório');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status do Assessment */}
      <Card
        className={
          closureStatus?.canGenerateReport
            ? 'border-green-200 bg-green-50'
            : 'border-yellow-200 bg-yellow-50'
        }
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {closureStatus?.canGenerateReport ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p className="font-medium">
                {closureStatus?.canGenerateReport
                  ? 'Assessment encerrado - Relatórios disponíveis'
                  : 'Assessment em andamento'}
              </p>
              <p className="text-sm text-muted-foreground">
                {closureStatus?.message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagens de feedback */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-700">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {applicableReports.map((report) => {
          const Icon = report.icon;
          const isDisabled =
            !closureStatus?.canGenerateReport || report.comingSoon;
          const isGenerating = generating === report.id;

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`h-full ${
                  isDisabled ? 'opacity-60' : 'hover:shadow-md transition-shadow'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2 rounded-lg ${
                        report.comingSoon ? 'bg-gray-100' : 'bg-terracotta/10'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          report.comingSoon ? 'text-gray-400' : 'text-terracotta'
                        }`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {report.frequency}
                      </Badge>
                      {report.comingSoon && (
                        <Badge variant="default" className="text-xs">
                          Em breve
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base mt-3">{report.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {report.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-olive" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      disabled={isDisabled || isGenerating}
                      onClick={() => handleGenerateReport(report.id)}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Gerar Relatório
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Histórico de Relatórios */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Relatórios Gerados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{report.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        report.status === 'completed' ? 'success' : 'outline'
                      }
                    >
                      {report.status === 'completed' ? 'Concluído' : report.status}
                    </Badge>
                    {report.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ReportGenerationPage;
