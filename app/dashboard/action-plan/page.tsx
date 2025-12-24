import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getActionPlans } from './actions';
import { ActionPlanContent } from '@/components/action-plan/ActionPlanContent';

interface ActionPlanPageProps {
  searchParams: Promise<{ assessment?: string; risk_block?: string }>;
}

export default async function ActionPlanPage({ searchParams }: ActionPlanPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get user's organization and role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase
    .from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single() as any);

  if (!profile?.organization_id) {
    redirect('/onboarding');
  }

  const actionPlans = await getActionPlans(params.assessment);
  const canEdit = ['admin', 'manager'].includes(profile.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-heading">Plano de Ação</h1>
        <p className="text-sm text-text-muted mt-1">
          Gerencie as ações de melhoria baseadas nos resultados da análise de riscos
        </p>
      </div>

      <Suspense fallback={<ActionPlanSkeleton />}>
        <ActionPlanContent
          actionPlans={actionPlans}
          canEdit={canEdit}
          assessmentId={params.assessment}
          prefilledRiskBlock={params.risk_block}
        />
      </Suspense>
    </div>
  );
}

function ActionPlanSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
