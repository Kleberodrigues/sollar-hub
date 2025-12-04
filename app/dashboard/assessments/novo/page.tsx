import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AssessmentWizard } from '@/components/assessments/assessment-wizard';

export default async function NewAssessmentPage() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.organization_id) {
    redirect('/dashboard');
  }

  // Apenas admins e managers podem criar assessments
  if (!['admin', 'manager'].includes(profile.role)) {
    redirect('/dashboard/assessments');
  }

  const organizationId = profile.organization_id;

  // Buscar questionários disponíveis
  const { data: questionnaires } = await supabase
    .from('questionnaires')
    .select(
      `
      id,
      title,
      questions (
        id,
        text,
        type,
        category
      )
    `
    )
    .order('created_at', { ascending: false });

  // Buscar departamentos
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <AssessmentWizard
        organizationId={organizationId}
        questionnaires={questionnaires || []}
        departments={departments || []}
      />
    </div>
  );
}
