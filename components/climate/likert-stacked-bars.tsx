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
      {/* Legend - Sollar Design System colors */}
      <div className="flex flex-wrap gap-6 text-sm justify-center pb-2 border-b border-border-light">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-sollar-terracotta-500" />
          <span className="text-text-secondary">Nunca / Raramente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#E8A849" }} />
          <span className="text-text-secondary">Às vezes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-sollar-olive-500" />
          <span className="text-text-secondary">Quase sempre / Sempre</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-5">
        {data.map((question) => {
          const grouped = groupDistribution(question.distribution);

          return (
            <div key={question.questionId} className="space-y-2">
              {/* Question text */}
              <p className="text-sm text-text-primary leading-relaxed">
                {question.questionText}
              </p>

              {/* Stacked bar - Sollar Design System colors */}
              <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100">
                {grouped.negative > 0 && (
                  <div
                    className="bg-sollar-terracotta-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500 hover:opacity-90"
                    style={{ width: `${grouped.negative}%` }}
                    title={`Nunca/Raramente: ${grouped.negative.toFixed(0)}%`}
                  >
                    {grouped.negative >= 10 && `${grouped.negative.toFixed(0)}%`}
                  </div>
                )}
                {grouped.neutral > 0 && (
                  <div
                    className="flex items-center justify-center text-white text-xs font-medium transition-all duration-500 hover:opacity-90"
                    style={{ width: `${grouped.neutral}%`, backgroundColor: "#E8A849" }}
                    title={`Às vezes: ${grouped.neutral.toFixed(0)}%`}
                  >
                    {grouped.neutral >= 10 && `${grouped.neutral.toFixed(0)}%`}
                  </div>
                )}
                {grouped.positive > 0 && (
                  <div
                    className="bg-sollar-olive-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500 hover:opacity-90"
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
