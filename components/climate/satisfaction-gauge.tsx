"use client";

interface SatisfactionGaugeProps {
  score: number;
  distribution: {
    detractors: number;
    passives: number;
    promoters: number;
  };
  responseCount: number;
  compareScore?: number;
}

export function SatisfactionGauge({
  score,
  distribution,
  responseCount,
  compareScore,
}: SatisfactionGaugeProps) {
  // Calculate gauge rotation (0-10 maps to -90 to 90 degrees)
  const rotation = (score / 10) * 180 - 90;

  // Get score color
  const getScoreColor = (s: number) => {
    if (s <= 4) return "#DC2626"; // Red
    if (s <= 6) return "#F97316"; // Orange
    if (s <= 7) return "#EAB308"; // Yellow
    return "#22C55E"; // Green
  };

  const total = distribution.detractors + distribution.passives + distribution.promoters;
  const detractorPct = total > 0 ? (distribution.detractors / total) * 100 : 0;
  const passivePct = total > 0 ? (distribution.passives / total) * 100 : 0;
  const promoterPct = total > 0 ? (distribution.promoters / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Gauge background arc */}
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            style={{ transform: "rotate(0deg)" }}
          >
            {/* Background arc segments */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="40%" stopColor="#F97316" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="80%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>

            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Tick marks */}
            {[0, 2, 4, 6, 8, 10].map((tick) => {
              const angle = (tick / 10) * 180 - 90;
              const rad = (angle * Math.PI) / 180;
              const innerRadius = 70;
              const outerRadius = 85;
              const x1 = 100 + Math.cos(rad) * innerRadius;
              const y1 = 100 + Math.sin(rad) * innerRadius;
              const x2 = 100 + Math.cos(rad) * outerRadius;
              const y2 = 100 + Math.sin(rad) * outerRadius;
              return (
                <g key={tick}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#9CA3AF"
                    strokeWidth="2"
                  />
                  <text
                    x={100 + Math.cos(rad) * 55}
                    y={100 + Math.sin(rad) * 55}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] fill-gray-500"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Needle */}
          <div
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
            }}
          >
            <div
              className="w-1 h-16 rounded-full"
              style={{ backgroundColor: getScoreColor(score) }}
            />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: getScoreColor(score) }}
            />
          </div>
        </div>

        {/* Score display */}
        <div className="text-center -mt-2">
          <div className="flex items-baseline justify-center gap-1">
            <span
              className="text-4xl font-bold"
              style={{ color: getScoreColor(score) }}
            >
              {score.toFixed(1)}
            </span>
            <span className="text-lg text-text-muted">/10</span>
          </div>
          <p className="text-sm text-text-muted">Índice de Satisfação Médio</p>
          <p className="text-xs text-text-muted mt-1">
            {responseCount} respostas
          </p>
          {compareScore !== undefined && (
            <p className="text-xs mt-2">
              <span
                className={
                  score > compareScore
                    ? "text-green-600"
                    : score < compareScore
                    ? "text-red-600"
                    : "text-text-muted"
                }
              >
                {score > compareScore
                  ? `+${(score - compareScore).toFixed(1)}`
                  : score < compareScore
                  ? (score - compareScore).toFixed(1)
                  : "="}{" "}
                vs mês anterior
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Distribution bar */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">
          Distribuição das respostas:
        </p>
        <div className="flex h-8 rounded-lg overflow-hidden">
          {detractorPct > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-white text-xs font-medium transition-all"
              style={{ width: `${detractorPct}%` }}
            >
              {distribution.detractors}
            </div>
          )}
          {passivePct > 0 && (
            <div
              className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium transition-all"
              style={{ width: `${passivePct}%` }}
            >
              {distribution.passives}
            </div>
          )}
          {promoterPct > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-medium transition-all"
              style={{ width: `${promoterPct}%` }}
            >
              {distribution.promoters}
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>Detratores (0-6)</span>
          <span>Neutros (7-8)</span>
          <span>Promotores (9-10)</span>
        </div>
      </div>
    </div>
  );
}
