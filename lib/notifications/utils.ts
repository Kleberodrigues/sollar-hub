/**
 * Get notification time label (e.g., "5 min atrás", "1 hora atrás")
 */
export function getNotificationTimeLabel(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "Agora";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min atrás`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hora" : "horas"} atrás`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "dia" : "dias"} atrás`;
  } else {
    return created.toLocaleDateString("pt-BR");
  }
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string): string {
  switch (type) {
    case "assessment_progress":
      return "📊";
    case "assessment_deadline":
      return "⏰";
    case "assessment_completed":
      return "✅";
    case "action_overdue":
      return "⚠️";
    case "action_reminder":
      return "🔔";
    case "action_completed":
      return "🎉";
    case "system":
    default:
      return "ℹ️";
  }
}
