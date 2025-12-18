"use server";

import { createClient } from "@/lib/supabase/server";

// Note: The notifications table was added recently. Using 'any' type assertions
// until Supabase types are regenerated with: npx supabase gen types typescript

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

/**
 * Get notifications for the current user
 */
export async function getNotifications(
  limit: number = 10,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<NotificationsResponse> {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { notifications: [], unreadCount: 0, total: 0 };
    }

    // Build query - using 'any' until types are regenerated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data: notifications, count, error } = await query;

    if (error) {
      console.error("[Notifications] Error fetching notifications:", error);
      return { notifications: [], unreadCount: 0, total: 0 };
    }

    // Get unread count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: unreadCount } = await (supabase as any)
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);

    return {
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      total: count || 0,
    };
  } catch (error) {
    console.error("[Notifications] Unexpected error:", error);
    return { notifications: [], unreadCount: 0, total: 0 };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Notifications] Error marking as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Notifications] Unexpected error:", error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      console.error("[Notifications] Error marking all as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Notifications] Unexpected error:", error);
    return false;
  }
}
