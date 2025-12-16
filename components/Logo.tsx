/**
 * PsicoMapa Logo Component
 * Supports different variants and sizes
 */

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "olive" | "terracotta" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { fontSize: "text-lg", iconSize: 14 },
  md: { fontSize: "text-xl", iconSize: 16 },
  lg: { fontSize: "text-2xl", iconSize: 20 },
  xl: { fontSize: "text-3xl", iconSize: 24 },
};

export function Logo({
  variant = "default",
  size = "md",
  showText = true,
  className
}: LogoProps) {
  const config = sizeMap[size];

  const getColors = () => {
    switch (variant) {
      case "olive":
        return { psico: "text-pm-olive", mapa: "text-pm-olive", icon: "text-pm-olive" };
      case "terracotta":
        return { psico: "text-pm-terracotta", mapa: "text-pm-terracotta", icon: "text-pm-terracotta" };
      case "white":
        return { psico: "text-white", mapa: "text-white", icon: "text-white" };
      default:
        return { psico: "text-pm-olive", mapa: "text-pm-terracotta", icon: "text-pm-terracotta" };
    }
  };

  const colors = getColors();

  if (!showText) {
    return (
      <div className={cn("flex items-center", className)}>
        <SunIcon size={config.iconSize * 2} className={colors.icon} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <span className={cn("font-display font-bold tracking-tight relative", config.fontSize)}>
        <span className={colors.psico}>Psico</span>
        <span className={colors.mapa}>Mapa</span>
        <SunIcon
          size={config.iconSize}
          className={cn("absolute -top-1 -right-4", colors.icon)}
        />
      </span>
    </div>
  );
}

// Icon-only version (renamed but keeping old name for compatibility)
export function SollarIcon({
  size = 32,
  className
}: {
  size?: number;
  className?: string;
}) {
  return <SunIcon size={size} className={className} />;
}

// Alias for new name
export function PsicoMapaIcon({
  size = 32,
  className
}: {
  size?: number;
  className?: string;
}) {
  return <SunIcon size={size} className={className} />;
}

// SVG Sun Icon (inline, for animations)
export function SunIcon({
  className,
  size = 24
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="18"/>
      <path d="M50 5 L58 20 L50 28 L42 20 Z"/>
      <path d="M82 18 L78 36 L68 36 L72 22 Z"/>
      <path d="M95 50 L80 58 L72 50 L80 42 Z"/>
      <path d="M82 82 L72 78 L68 68 L78 64 Z"/>
      <path d="M50 95 L42 80 L50 72 L58 80 Z"/>
      <path d="M18 82 L22 72 L32 68 L28 78 Z"/>
      <path d="M5 50 L20 42 L28 50 L20 58 Z"/>
      <path d="M18 18 L28 22 L32 32 L22 36 Z"/>
    </svg>
  );
}
