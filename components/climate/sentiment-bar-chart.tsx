"use client";

interface SentimentData {
  label: string;
  count: number;
  color: string;
}

interface SentimentBarChartProps {
  data: SentimentData[];
  compareData?: SentimentData[];
  compareLabel?: string;
}

export function SentimentBarChart({
  data,
  compareData,
  compareLabel,
}: SentimentBarChartProps) {
  const maxCount = Math.max(
    ...data.map((d) => d.count),
    ...(compareData?.map((d) => d.count) || [0])
  );

  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative flex justify-around gap-2 pt-8">
        {data.map((item, index) => {
          const height =
            maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const compareHeight =
            compareData && maxCount > 0
              ? (compareData[index]?.count / maxCount) * 100
              : 0;
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center"
            >
              {/* Bar container - fixed height, bars align at bottom */}
              <div className="relative w-full h-[140px] flex items-end justify-center gap-1">
                {/* Main bar */}
                <div
                  className="w-10 rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                  style={{
                    height: `${height}%`,
                    backgroundColor: item.color,
                    minHeight: item.count > 0 ? "24px" : "0",
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.count} ({percentage}%)
                  </div>
                  {/* Count label */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-text-primary whitespace-nowrap">
                    {item.count}
                  </span>
                </div>

                {/* Compare bar */}
                {compareData && (
                  <div
                    className="w-6 rounded-t-lg transition-all duration-500 opacity-50 border-2 border-dashed"
                    style={{
                      height: `${compareHeight}%`,
                      borderColor: item.color,
                      backgroundColor: "transparent",
                      minHeight:
                        compareData[index]?.count > 0 ? "24px" : "0",
                    }}
                  />
                )}
              </div>

              {/* Label - fixed height container for alignment */}
              <div className="h-10 flex items-start justify-center pt-2">
                <span className="text-xs text-text-muted text-center leading-tight">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare legend */}
      {compareData && compareLabel && (
        <div className="flex items-center justify-center gap-4 text-xs text-text-muted pt-2 border-t border-border-light">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-pm-terracotta rounded" />
            <span>Atual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 border-2 border-dashed border-pm-terracotta rounded" />
            <span>{compareLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
