import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWebhookStats, getEventTypes, getWebhookEvents } from './actions';
import { WebhooksContent } from './WebhooksContent';

export const metadata = {
  title: 'Webhooks - Sollar Insight Hub',
  description: 'Monitor Stripe webhook events',
};

export default async function WebhooksPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as any;

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch initial data
  const [stats, eventTypes, initialEvents] = await Promise.all([
    getWebhookStats(),
    getEventTypes(),
    getWebhookEvents(1, 20),
  ]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-heading">
          Monitoramento de Webhooks
        </h1>
        <p className="text-text-muted mt-1">
          Visualize os eventos de webhook do Stripe processados pelo sistema
        </p>
      </div>

      <WebhooksContent
        initialStats={stats}
        initialEvents={initialEvents}
        eventTypes={eventTypes}
      />
    </div>
  );
}
