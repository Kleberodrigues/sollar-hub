/**
 * API Route: Get current user's plan
 * Returns the subscription plan for the authenticated user's organization
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type PlanType } from '@/lib/stripe/config';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { plan: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single() as any);

    if (!profile?.organization_id) {
      return NextResponse.json({ plan: null });
    }

    // Get organization's subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('organization_id', profile.organization_id)
      .single() as any);

    // Only return plan if subscription is active
    if (subscription?.status === 'active' && subscription?.plan) {
      return NextResponse.json({
        plan: subscription.plan as PlanType,
        status: subscription.status,
      });
    }

    // No active subscription
    return NextResponse.json({ plan: null, status: subscription?.status || null });
  } catch (error) {
    console.error('[API /user/plan] Error:', error);
    return NextResponse.json(
      { plan: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
