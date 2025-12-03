import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAssessmentAnalytics,
  getAllQuestionsDistribution,
  getCategoryName,
  getRiskLevelLabel,
  getRiskLevelColor,
} from "@/app/dashboard/analytics/actions";
import { CategoryScoresChart } from "./category-scores-chart";
import { QuestionDistributionCharts } from "./question-distribution-charts";
import { Users, FileText, TrendingUp, Calendar } from "lucide-react";

interface AnalyticsDashboardProps {
  assessmentId: string;
}

export async function AnalyticsDashboard({
  assessmentId,
}: AnalyticsDashboardProps) {
  // Fetch analytics data
  const analytics = await getAssessmentAnalytics(assessmentId);
  const questionDistributions = await getAllQuestionsDistribution(assessmentId);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-text-secondary">
            Não foi possível carregar os dados de análise.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasResponses = analytics.totalParticipants > 0;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Participants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Participantes
            </CardTitle>
            <Users className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-heading">
              {analytics.totalParticipants}
            </div>
            <p className="text-xs text-text-muted mt-1">
              Total de respondentes
            </p>
          </CardContent>
        </Card>

        {/* Total Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Perguntas
            </CardTitle>
            <FileText className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-heading">
              {analytics.totalQuestions}
            </div>
            <p className="text-xs text-text-muted mt-1">
              No questionário
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Taxa de Conclusão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-heading">
              {analytics.completionRate}%
            </div>
            <p className="text-xs text-text-muted mt-1">
              Respostas completas
            </p>
          </CardContent>
        </Card>

        {/* Last Response */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Última Resposta
            </CardTitle>
            <Calendar className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-heading">
              {analytics.lastResponseDate
                ? new Date(analytics.lastResponseDate).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                    }
                  )
                : "N/A"}
            </div>
            <p className="text-xs text-text-muted mt-1">
              {analytics.lastResponseDate
                ? new Date(analytics.lastResponseDate).toLocaleTimeString(
                    "pt-BR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "Sem respostas"}
            </p>
          </CardContent>
        </Card>
      </div>

      {hasResponses ? (
        <>
          {/* Risk Levels by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Níveis de Risco por Categoria NR-1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.responsesByCategory.map((category) => (
                  <div
                    key={category.category}
                    className="p-4 rounded-lg border border-border bg-background-secondary"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-text-heading">
                        {getCategoryName(category.category)}
                      </h3>
                      <Badge
                        className={getRiskLevelColor(category.riskLevel)}
                        variant="secondary"
                      >
                        {getRiskLevelLabel(category.riskLevel)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-text-heading">
                        {category.averageScore.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {category.responseCount} respostas em{" "}
                        {category.questionCount} perguntas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Scores Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Pontuação Média por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryScoresChart categories={analytics.responsesByCategory} />
            </CardContent>
          </Card>

          {/* Question Distribution Charts */}
          {questionDistributions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Respostas por Pergunta</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionDistributionCharts
                  distributions={questionDistributions}
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-lg text-text-secondary mb-2">
                Ainda não há respostas para este assessment
              </p>
              <p className="text-sm text-text-muted">
                Os gráficos e análises aparecerão quando houver respostas
                coletadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
