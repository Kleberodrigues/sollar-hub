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

// Get sentiment color based on theme - Sollar Design System
function getThemeColor(theme: string): { pill: string; bar: string } {
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
    // Terracotta para temas negativos
    return {
      pill: "bg-sollar-terracotta-100 text-sollar-terracotta-700 border-sollar-terracotta-200",
      bar: "bg-sollar-terracotta-500"
    };
  }
  if (positiveThemes.some((t) => theme.includes(t))) {
    // Olive para temas positivos
    return {
      pill: "bg-sollar-olive-100 text-sollar-olive-700 border-sollar-olive-200",
      bar: "bg-sollar-olive-500"
    };
  }
  // Neutro
  return {
    pill: "bg-gray-100 text-gray-700 border-gray-200",
    bar: "bg-gray-400"
  };
}

export function ThemeList({ themes }: ThemeListProps) {
  const maxCount = Math.max(...themes.map((t) => t.count));

  return (
    <div className="space-y-3">
      {themes.map((theme, index) => {
        const barWidth = maxCount > 0 ? (theme.count / maxCount) * 100 : 0;
        const colors = getThemeColor(theme.theme);

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
                className={`absolute inset-y-0 left-0 rounded-lg opacity-30 transition-all duration-500 ${colors.bar}`}
                style={{ width: `${barWidth}%` }}
              />

              {/* Content */}
              <div
                className={`relative flex items-center justify-between px-4 py-2.5 rounded-lg border ${colors.pill}`}
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
