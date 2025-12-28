import { redirect } from 'next/navigation';

// Plano de Ação foi centralizado no Analytics
// Redireciona para a página de análise de riscos com seção de action plan aberta
export default function ActionPlanPage() {
  redirect('/dashboard/analytics?section=action');
}
