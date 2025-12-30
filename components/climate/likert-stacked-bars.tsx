"use client";

interface LikertDistribution {
  label: string;
  percentage: number;
  count: number;
}

interface LikertQuestion {
  questionId: string;
  questionText: string;
  distribution: LikertDistribution[];
}

interface LikertStackedBarsProps {
  data: LikertQuestion[];
}

// Group Likert responses into 3 colors
// Red: Nunca, Raramente
// Yellow: Às vezes
// Green: Quase sempre, Sempre
function groupDistribution(distribution: LikertDistribution[]) {
  const negative = distribution
    .filter((d) => d.label === "Nunca" || d.label === "Raramente")
    .reduce((acc, d) => acc + d.percentage, 0);

  const neutral = distribution
    .filter((d) => d.label === "Às vezes")
    .reduce((acc, d) => acc + d.percentage, 0);

  const positive = distribution
    .filter((d) => d.label === "Quase sempre" || d.label === "Sempre")
    .reduce((acc, d) => acc + d.percentage, 0);

  return { negative, neutral, positive };
}

export function LikertStackedBars({ data }: LikertStackedBarsProps) {
  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm justify-center pb-2 border-b border-border-light">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-text-secondary">Nunca / Raramente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-text-secondary">Às vezes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-text-secondary">Quase sempre / Sempre</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-5">
        {data.map((question, index) => {
          const grouped = groupDistribution(question.distribution);
          const questionNumber = index + 2; // Q2 to Q8

          return (
            <div key={question.questionId} className="space-y-2">
              {/* Question text */}
              <p className="text-sm text-text-primary leading-relaxed">
                <span className="font-bold text-pm-terracotta mr-2">
                  Q{questionNumber}
                </span>
                {question.questionText}
              </p>

              {/* Stacked bar */}
              <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100">
                {grouped.negative > 0 && (
                  <div
                    className="bg-red-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500 hover:opacity-90"
                    style={{ width: `${grouped.negative}%` }}
                    title={`Nunca/Raramente: ${grouped.negative.toFixed(0)}%`}
                  >
                    {grouped.negative >= 10 && `${grouped.negative.toFixed(0)}%`}
                  </div>
                )}
                {grouped.neutral > 0 && (
                  <div
                    className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500 hover:opacity-90"
                    style={{ width: `${grouped.neutral}%` }}
                    title={`Às vezes: ${grouped.neutral.toFixed(0)}%`}
                  >
                    {grouped.neutral >= 10 && `${grouped.neutral.toFixed(0)}%`}
                  </div>
                )}
                {grouped.positive > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500 hover:opacity-90"
                    style={{ width: `${grouped.positive}%` }}
                    title={`Quase sempre/Sempre: ${grouped.positive.toFixed(0)}%`}
                  >
                    {grouped.positive >= 10 && `${grouped.positive.toFixed(0)}%`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
