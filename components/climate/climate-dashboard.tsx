"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, GitCompare, AlertCircle, TrendingUp } from "lucide-react";
import { SentimentBarChart } from "./sentiment-bar-chart";
import { SatisfactionGauge } from "./satisfaction-gauge";
import { LikertStackedBars } from "./likert-stacked-bars";
import { ThemeList } from "./theme-list";
import { createClient } from "@/lib/supabase/client";

interface Assessment {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface ClimateDashboardProps {
  organizationId: string;
  assessments: Assessment[];
}

interface ClimateData {
  q1Responses: { label: string; count: number; color: string }[];
  q2to8Responses: {
    questionId: string;
    questionText: string;
    distribution: { label: string; percentage: number; count: number }[];
  }[];
  q9Score: number;
  q9Distribution: { detractors: number; passives: number; promoters: number };
  q9ResponseCount: number;
  q10Themes: { theme: string; count: number }[];
  totalResponses: number;
}

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Fev" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Abr" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Ago" },
  { value: "09", label: "Set" },
  { value: "10", label: "Out" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dez" },
];

// Cores alinhadas com Sollar Design System
const SENTIMENT_COLORS = {
  "Muito mal": "#DC3545",     // sollar-risk-critical (vermelho)
  "Mal": "#B85C38",           // sollar-terracotta (risco alto)
  "Mais ou menos": "#E8A849", // sollar-warning (âmbar)
  "Bem": "#97B376",           // sollar-olive-400
  "Muito bem": "#789750",     // sollar-olive-500 (sucesso)
};

export function ClimateDashboard({
  organizationId: _organizationId,
  assessments,
}: ClimateDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, "0");
  });
  const [selectedYear, _setSelectedYear] = useState<string>(() => {
    return String(new Date().getFullYear());
  });
  const [compareMode, setCompareMode] = useState(false);
  const [compareMonth, setCompareMonth] = useState<string | null>(null);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [compareData, setCompareData] = useState<ClimateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Find assessment for the selected month
  const findAssessmentForMonth = useCallback(
    (month: string, year: string) => {
      return assessments.find((a) => {
        const startDate = new Date(a.start_date);
        return (
          startDate.getMonth() + 1 === parseInt(month) &&
          startDate.getFullYear() === parseInt(year)
        );
      });
    },
    [assessments]
  );

  // Fetch climate data for an assessment
  const fetchClimateData = useCallback(
    async (assessmentId: string): Promise<ClimateData | null> => {
      const supabase = createClient();

      // Get questions first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: questions } = (await supabase
        .from("questions")
        .select("id, text, type, order_index, options")
        .eq("questionnaire_id", "b2222222-2222-2222-2222-222222222222")
        .order("order_index")) as any;

      if (!questions) return null;

      // Get all responses for this assessment (one row per question per respondent)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: responses, error } = (await supabase
        .from("responses")
        .select("id, question_id, response_text, value, anonymous_id")
        .eq("assessment_id", assessmentId)) as any;

      if (error || !responses?.length) {
        return null;
      }

      // Build question lookup map
      const questionMap: Record<string, { order_index: number; text: string }> = {};
      questions.forEach((q: { id: string; order_index: number; text: string }) => {
        questionMap[q.id] = { order_index: q.order_index, text: q.text };
      });

      // Initialize counters
      const q1Counts: Record<string, number> = {
        "Muito mal": 0,
        "Mal": 0,
        "Mais ou menos": 0,
        "Bem": 0,
        "Muito bem": 0,
      };

      const q2to8Questions = questions.filter(
        (q: { order_index: number }) => q.order_index >= 2 && q.order_index <= 8
      );
      const likertCounts: Record<
        string,
        { text: string; counts: Record<string, number> }
      > = {};

      q2to8Questions.forEach((q: { id: string; text: string }) => {
        likertCounts[q.id] = {
          text: q.text,
          counts: {
            Nunca: 0,
            Raramente: 0,
            "Às vezes": 0,
            "Quase sempre": 0,
            Sempre: 0,
          },
        };
      });

      const q9Scores: number[] = [];
      const themeCounts: Record<string, number> = {};
      const uniqueRespondents = new Set<string>();

      // Process each response row
      responses.forEach(
        (r: { question_id: string; response_text: string; value: number | null; anonymous_id: string }) => {
          const question = questionMap[r.question_id];
          if (!question) return;

          uniqueRespondents.add(r.anonymous_id);

          if (question.order_index === 1) {
            // Q1 - Sentiment
            if (q1Counts[r.response_text] !== undefined) {
              q1Counts[r.response_text]++;
            }
          } else if (question.order_index >= 2 && question.order_index <= 8) {
            // Q2-Q8 - Likert
            if (likertCounts[r.question_id]?.counts[r.response_text] !== undefined) {
              likertCounts[r.question_id].counts[r.response_text]++;
            }
          } else if (question.order_index === 9) {
            // Q9 - NPS
            const score = r.value ?? Number(r.response_text);
            if (!isNaN(score)) {
              q9Scores.push(score);
            }
          } else if (question.order_index === 10) {
            // Q10 - Themes
            const text = r.response_text?.toLowerCase() || "";
            const keywords = [
              "excesso de trabalho",
              "sobrecarga",
              "falta de reconhecimento",
              "reconhecimento",
              "liderança",
              "comunicação",
              "equipe",
              "ambiente",
              "salário",
              "benefícios",
              "crescimento",
              "flexibilidade",
              "pressão",
              "estresse",
            ];
            let matched = false;
            keywords.forEach((keyword) => {
              if (text.includes(keyword)) {
                themeCounts[keyword] = (themeCounts[keyword] || 0) + 1;
                matched = true;
              }
            });
            if (text.length > 0 && !matched) {
              themeCounts["outros comentários"] =
                (themeCounts["outros comentários"] || 0) + 1;
            }
          }
        }
      );

      // Calculate Q9 metrics
      const q9Avg =
        q9Scores.length > 0
          ? q9Scores.reduce((a, b) => a + b, 0) / q9Scores.length
          : 0;
      const detractors = q9Scores.filter((s) => s <= 6).length;
      const passives = q9Scores.filter((s) => s >= 7 && s <= 8).length;
      const promoters = q9Scores.filter((s) => s >= 9).length;

      return {
        q1Responses: Object.entries(q1Counts).map(([label, count]) => ({
          label,
          count,
          color: SENTIMENT_COLORS[label as keyof typeof SENTIMENT_COLORS] || "#888",
        })),
        q2to8Responses: Object.entries(likertCounts).map(([questionId, data]) => {
          const total = Object.values(data.counts).reduce((a, b) => a + b, 0);
          return {
            questionId,
            questionText: data.text,
            distribution: Object.entries(data.counts).map(([label, count]) => ({
              label,
              percentage: total > 0 ? (count / total) * 100 : 0,
              count,
            })),
          };
        }),
        q9Score: Math.round(q9Avg * 10) / 10,
        q9Distribution: {
          detractors,
          passives,
          promoters,
        },
        q9ResponseCount: q9Scores.length,
        q10Themes: Object.entries(themeCounts)
          .map(([theme, count]) => ({ theme, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        totalResponses: uniqueRespondents.size,
      };
    },
    []
  );

  // Load data when month changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const assessment = findAssessmentForMonth(selectedMonth, selectedYear);

      if (assessment) {
        const data = await fetchClimateData(assessment.id);
        setClimateData(data);
      } else {
        setClimateData(null);
      }

      // Load compare data if in compare mode
      if (compareMode && compareMonth) {
        const compareAssessment = findAssessmentForMonth(
          compareMonth,
          selectedYear
        );
        if (compareAssessment) {
          const data = await fetchClimateData(compareAssessment.id);
          setCompareData(data);
        } else {
          setCompareData(null);
        }
      } else {
        setCompareData(null);
      }

      setIsLoading(false);
    };

    loadData();
  }, [
    selectedMonth,
    selectedYear,
    compareMode,
    compareMonth,
    findAssessmentForMonth,
    fetchClimateData,
  ]);

  // Get available months from assessments
  const availableMonths = assessments
    .map((a) => {
      const d = new Date(a.start_date);
      return {
        month: String(d.getMonth() + 1).padStart(2, "0"),
        year: String(d.getFullYear()),
      };
    })
    .filter(
      (m, i, arr) =>
        arr.findIndex((x) => x.month === m.month && x.year === m.year) === i
    );

  if (assessments.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pm-olive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Nenhuma pesquisa de clima encontrada
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Crie uma nova avaliação usando o questionário &quot;Pesquisa de Clima&quot;
              para começar a acompanhar o bem-estar da sua equipe.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-text-muted" />
              <span className="text-sm font-medium text-text-secondary">
                Mês:
              </span>
              <div className="flex gap-1">
                {MONTHS.map((month) => {
                  const hasData = availableMonths.some(
                    (m) => m.month === month.value && m.year === selectedYear
                  );
                  return (
                    <Button
                      key={month.value}
                      variant={selectedMonth === month.value ? "primary" : "ghost"}
                      size="sm"
                      className={`px-3 ${
                        selectedMonth === month.value
                          ? "bg-pm-terracotta text-white hover:bg-pm-terracotta-hover"
                          : hasData
                          ? "text-text-primary hover:bg-pm-olive/10"
                          : "text-text-muted opacity-50"
                      }`}
                      onClick={() => setSelectedMonth(month.value)}
                      disabled={!hasData}
                    >
                      {month.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Compare Toggle */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={compareMode ? "primary" : "outline"}
                size="sm"
                className={
                  compareMode
                    ? "bg-pm-olive text-white hover:bg-pm-olive-hover"
                    : ""
                }
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (!compareMode) {
                    // Set compare month to previous month
                    const prevMonth = String(
                      parseInt(selectedMonth) - 1 || 12
                    ).padStart(2, "0");
                    setCompareMonth(prevMonth);
                  }
                }}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Comparar com outro mês
              </Button>

              {compareMode && (
                <select
                  value={compareMonth || ""}
                  onChange={(e) => setCompareMonth(e.target.value)}
                  className="px-3 py-2 text-sm border border-border-light rounded-lg bg-white"
                >
                  {MONTHS.filter((m) =>
                    availableMonths.some(
                      (am) => am.month === m.value && am.year === selectedYear
                    )
                  ).map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pm-terracotta mx-auto"></div>
          <p className="text-text-muted mt-4">Carregando dados...</p>
        </div>
      ) : !climateData ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-heading mb-2">
                Sem dados para este mês
              </h3>
              <p className="text-text-secondary">
                Não há respostas de pesquisa de clima para{" "}
                {MONTHS.find((m) => m.value === selectedMonth)?.label}/
                {selectedYear}.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Response Count */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <TrendingUp className="w-4 h-4" />
            <span>
              <strong className="text-text-primary">
                {climateData.totalResponses}
              </strong>{" "}
              respostas em{" "}
              {MONTHS.find((m) => m.value === selectedMonth)?.label}/
              {selectedYear}
            </span>
          </div>

          {/* Top Row - Q1 and Q9 side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Q1 - Sentiment Chart */}
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display text-sollar-terracotta-600">
                  Como você está se sentindo no trabalho este mês?
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[340px]">
                <SentimentBarChart
                  data={climateData.q1Responses}
                  compareData={compareData?.q1Responses}
                  compareLabel={
                    compareMonth
                      ? MONTHS.find((m) => m.value === compareMonth)?.label
                      : undefined
                  }
                />
              </CardContent>
            </Card>

            {/* Q9 - Satisfaction Gauge */}
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display text-sollar-terracotta-600">
                  De 0 a 10, quão satisfeito(a) você está?
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[340px]">
                <SatisfactionGauge
                  score={climateData.q9Score}
                  distribution={climateData.q9Distribution}
                  responseCount={climateData.q9ResponseCount}
                  compareScore={compareData?.q9Score}
                />
              </CardContent>
            </Card>
          </div>

          {/* Q2-Q8 - Likert Stacked Bars */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display text-sollar-terracotta-600">
                Avaliação por Dimensão
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LikertStackedBars data={climateData.q2to8Responses} />
            </CardContent>
          </Card>

          {/* Q10 - Theme List */}
          {climateData.q10Themes.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display text-sollar-terracotta-600">
                  Motivos das notas (temas identificados)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeList themes={climateData.q10Themes} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
