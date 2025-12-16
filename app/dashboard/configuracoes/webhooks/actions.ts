'use server';

/**
 * Server Actions for Webhook Events Management
 * Allows admins to monitor Stripe webhook events
 */

import { createClient } from '@/lib/supabase/server';

export interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed_at: string;
  created_at: string;
}

export interface WebhookEventsResponse {
  events: WebhookEvent[];
  total: number;
  hasMore: boolean;
  error?: string;
}

export interface WebhookStats {
  totalEvents: number;
  last24Hours: number;
  last7Days: number;
  eventsByType: Record<string, number>;
}

/**
 * Get paginated list of webhook events (admin only)
 */
export async function getWebhookEvents(
  page: number = 1,
  limit: number = 20,
  eventType?: string
): Promise<WebhookEventsResponse> {
  const supabase = await createClient();

  // Check authentication and admin role
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { events: [], total: 0, hasMore: false, error: 'Unauthorized' };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (profile?.role !== 'admin') {
    return { events: [], total: 0, hasMore: false, error: 'Only admins can view webhook events' };
  }

  try {
    // Build query
    let query = supabase
      .from('stripe_webhook_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('[Webhooks] Error fetching events:', error);
      return { events: [], total: 0, hasMore: false, error: error.message };
    }

    return {
      events: data || [],
      total: count || 0,
      hasMore: (count || 0) > page * limit,
    };
  } catch (error) {
    console.error('[Webhooks] Error:', error);
    return { events: [], total: 0, hasMore: false, error: 'Failed to fetch webhook events' };
  }
}

/**
 * Get webhook event statistics (admin only)
 */
export async function getWebhookStats(): Promise<WebhookStats | null> {
  const supabase = await createClient();

  // Check authentication and admin role
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (profile?.role !== 'admin') {
    return null;
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total count
    const { count: totalEvents } = await supabase
      .from('stripe_webhook_events')
      .select('*', { count: 'exact', head: true });

    // Get last 24 hours count
    const { count: last24Hours } = await supabase
      .from('stripe_webhook_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24h.toISOString());

    // Get last 7 days count
    const { count: last7Days } = await supabase
      .from('stripe_webhook_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7d.toISOString());

    // Get events by type (last 30 days)
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { data: eventsByTypeData } = await supabase
      .from('stripe_webhook_events')
      .select('event_type')
      .gte('created_at', last30d.toISOString());

    const eventsByType: Record<string, number> = {};
    eventsByTypeData?.forEach((event: { event_type: string }) => {
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
    });

    return {
      totalEvents: totalEvents || 0,
      last24Hours: last24Hours || 0,
      last7Days: last7Days || 0,
      eventsByType,
    };
  } catch (error) {
    console.error('[Webhooks] Error fetching stats:', error);
    return null;
  }
}

/**
 * Get unique event types for filtering
 */
export async function getEventTypes(): Promise<string[]> {
  const supabase = await createClient();

  // Check authentication and admin role
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (profile?.role !== 'admin') {
    return [];
  }

  try {
    const { data } = await supabase
      .from('stripe_webhook_events')
      .select('event_type')
      .order('event_type');

    if (!data) return [];

    // Get unique event types
    const uniqueTypes = [...new Set(data.map((e: { event_type: string }) => e.event_type))];
    return uniqueTypes;
  } catch {
    return [];
  }
}
