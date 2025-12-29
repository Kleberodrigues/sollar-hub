"use client";

import { MessageSquare } from "lucide-react";

interface Theme {
  theme: string;
  count: number;
}

interface ThemeListProps {
  themes: Theme[];
}

// Capitalize first letter
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get sentiment color based on theme
function getThemeColor(theme: string): string {
  const negativeThemes = [
    "excesso de trabalho",
    "sobrecarga",
    "falta de reconhecimento",
    "pressão",
    "estresse",
  ];
  const positiveThemes = [
    "reconhecimento",
    "equipe",
    "ambiente",
    "crescimento",
    "flexibilidade",
  ];

  if (negativeThemes.some((t) => theme.includes(t))) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (positiveThemes.some((t) => theme.includes(t))) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export function ThemeList({ themes }: ThemeListProps) {
  const maxCount = Math.max(...themes.map((t) => t.count));

  return (
    <div className="space-y-3">
      {themes.map((theme, index) => {
        const barWidth = maxCount > 0 ? (theme.count / maxCount) * 100 : 0;
        const colorClass = getThemeColor(theme.theme);

        return (
          <div key={theme.theme} className="flex items-center gap-3">
            {/* Rank */}
            <span className="text-sm font-medium text-text-muted w-6 text-right">
              {index + 1}.
            </span>

            {/* Theme pill with bar background */}
            <div className="flex-1 relative">
              {/* Background bar */}
              <div
                className={`absolute inset-y-0 left-0 rounded-lg opacity-30 transition-all duration-500 ${colorClass.split(" ")[0]}`}
                style={{ width: `${barWidth}%` }}
              />

              {/* Content */}
              <div
                className={`relative flex items-center justify-between px-4 py-2.5 rounded-lg border ${colorClass}`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 opacity-60" />
                  <span className="font-medium">{capitalize(theme.theme)}</span>
                </div>
                <span className="text-sm font-semibold">
                  {theme.count} {theme.count === 1 ? "menção" : "menções"}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {themes.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum comentário registrado neste mês</p>
        </div>
      )}
    </div>
  );
}
