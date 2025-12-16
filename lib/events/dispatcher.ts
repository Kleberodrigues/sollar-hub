/**
 * Event dispatcher for n8n webhook integration
 * Handles event creation, delivery, and retry logic
 */

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  SollarEventPayload,
  DispatchOptions,
  DispatchResult,
} from "./types";

// Environment configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

// ============================================
// Signature Generation
// ============================================

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify incoming webhook signature
 * In production, signature verification is REQUIRED
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || N8N_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  // In production, secret MUST be configured
  if (!webhookSecret) {
    if (isProduction) {
      console.error("[EventDispatcher] SECURITY ERROR: N8N_WEBHOOK_SECRET not configured in production");
      return false; // BLOCK in production
    }
    console.warn("[EventDispatcher] WARNING: N8N_WEBHOOK_SECRET not configured in development");
    return true; // Allow in development
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// ============================================
// Event Dispatcher
// ============================================

/**
 * Dispatch an event to n8n webhook
 *
 * @param options - Event dispatch options
 * @returns Result with success status and event ID
 *
 * @example
 * ```typescript
 * await dispatchEvent({
 *   organizationId: "uuid",
 *   eventType: "diagnostic.activated",
 *   data: {
 *     diagnostic_id: "uuid",
 *     title: "Assessment Title",
 *     public_url: "https://...",
 *   },
 * });
 * ```
 */
export async function dispatchEvent<T extends Record<string, unknown>>({
  organizationId,
  eventType,
  data,
  metadata,
}: DispatchOptions<T>): Promise<DispatchResult> {
  const supabase = createAdminClient();

  // Determine environment
  const environment =
    process.env.VERCEL_ENV === "production"
      ? "production"
      : process.env.VERCEL_ENV === "preview"
        ? "staging"
        : "development";

  // Build event payload
  const payload: SollarEventPayload<T> = {
    event: eventType,
    timestamp: new Date().toISOString(),
    organization_id: organizationId,
    data,
    metadata: {
      source: "pm-insight-hub",
      version: "1.0.0",
      environment,
      ...metadata,
    },
  };

  // Store event in database first (for audit and retry)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventRecord, error: insertError } = await (supabase as any)
    .from("webhook_events")
    .insert({
      organization_id: organizationId,
      event_type: eventType,
      payload,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    console.error("[EventDispatcher] Failed to store webhook event:", insertError);
    return { success: false, error: "Failed to store event" };
  }

  // If no webhook URL configured, mark as skipped
  if (!N8N_WEBHOOK_URL) {
    console.warn("[EventDispatcher] N8N_WEBHOOK_URL not configured, skipping dispatch");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("webhook_events")
      .update({
        status: "failed",
        error_message: "N8N_WEBHOOK_URL not configured",
      })
      .eq("id", eventRecord.id);

    return {
      success: false,
      eventId: eventRecord.id,
      error: "Webhook URL not configured",
    };
  }

  // Validate secret configuration before sending
  const isProduction = environment === "production";
  if (!N8N_WEBHOOK_SECRET) {
    if (isProduction) {
      console.error("[EventDispatcher] SECURITY ERROR: Cannot send webhook in production without N8N_WEBHOOK_SECRET");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("webhook_events")
        .update({
          status: "failed",
          error_message: "N8N_WEBHOOK_SECRET not configured in production",
        })
        .eq("id", eventRecord.id);

      return {
        success: false,
        eventId: eventRecord.id,
        error: "Webhook secret required in production",
      };
    }
    console.warn("[EventDispatcher] WARNING: Sending webhook without signature in development");
  }

  // Send webhook
  try {
    const payloadString = JSON.stringify(payload);
    const signature = N8N_WEBHOOK_SECRET
      ? generateSignature(payloadString, N8N_WEBHOOK_SECRET)
      : undefined;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Sollar-Webhook/1.0",
        "X-Event-Type": eventType,
        "X-Event-ID": eventRecord.id,
        "X-Organization-ID": organizationId,
        ...(signature && { "X-Webhook-Signature": signature }),
      },
      body: payloadString,
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("webhook_events")
        .update({
          status: "sent",
          attempts: 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", eventRecord.id);

      console.log(
        `[EventDispatcher] Event ${eventType} dispatched successfully`,
        { eventId: eventRecord.id }
      );

      return { success: true, eventId: eventRecord.id };
    } else {
      const errorText = await response.text();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("webhook_events")
        .update({
          status: "failed",
          attempts: 1,
          last_attempt_at: new Date().toISOString(),
          error_message: `HTTP ${response.status}: ${errorText.slice(0, 500)}`,
        })
        .eq("id", eventRecord.id);

      console.error(
        `[EventDispatcher] Event ${eventType} failed with HTTP ${response.status}`,
        { eventId: eventRecord.id, error: errorText.slice(0, 200) }
      );

      return {
        success: false,
        eventId: eventRecord.id,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("webhook_events")
      .update({
        status: "failed",
        attempts: 1,
        last_attempt_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", eventRecord.id);

    console.error(`[EventDispatcher] Event ${eventType} failed with error`, {
      eventId: eventRecord.id,
      error: errorMessage,
    });

    return { success: false, eventId: eventRecord.id, error: errorMessage };
  }
}

// ============================================
// Retry Failed Events
// ============================================

/**
 * Retry failed webhook events
 *
 * @param maxAttempts - Maximum number of retry attempts (default: 3)
 * @returns Number of successfully retried events
 */
export async function retryFailedEvents(maxAttempts: number = 3): Promise<number> {
  const supabase = createAdminClient();

  // Get failed events that haven't exceeded max attempts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: failedEvents } = await (supabase as any)
    .from("webhook_events")
    .select("*")
    .eq("status", "failed")
    .lt("attempts", maxAttempts)
    .order("created_at", { ascending: true })
    .limit(10);

  if (!failedEvents || failedEvents.length === 0) {
    return 0;
  }

  if (!N8N_WEBHOOK_URL) {
    console.warn("[EventDispatcher] Cannot retry: N8N_WEBHOOK_URL not configured");
    return 0;
  }

  // Check secret configuration in production
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (!N8N_WEBHOOK_SECRET && isProduction) {
    console.error("[EventDispatcher] Cannot retry in production: N8N_WEBHOOK_SECRET not configured");
    return 0;
  }

  let retriedCount = 0;

  for (const event of failedEvents) {
    try {
      const payloadString = JSON.stringify(event.payload);
      const signature = N8N_WEBHOOK_SECRET
        ? generateSignature(payloadString, N8N_WEBHOOK_SECRET)
        : undefined;

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Sollar-Webhook/1.0",
          "X-Event-Type": event.event_type,
          "X-Event-ID": event.id,
          "X-Retry-Attempt": String(event.attempts + 1),
          ...(signature && { "X-Webhook-Signature": signature }),
        },
        body: payloadString,
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("webhook_events")
          .update({
            status: "sent",
            attempts: event.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", event.id);

        retriedCount++;
        console.log(`[EventDispatcher] Retry successful for event ${event.id}`);
      } else {
        const errorText = await response.text();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("webhook_events")
          .update({
            attempts: event.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            error_message: `HTTP ${response.status}: ${errorText.slice(0, 500)}`,
          })
          .eq("id", event.id);

        console.warn(
          `[EventDispatcher] Retry failed for event ${event.id}: HTTP ${response.status}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("webhook_events")
        .update({
          attempts: event.attempts + 1,
          last_attempt_at: new Date().toISOString(),
          error_message: errorMessage,
        })
        .eq("id", event.id);

      console.error(
        `[EventDispatcher] Retry error for event ${event.id}:`,
        errorMessage
      );
    }

    // Small delay between retries to avoid overwhelming the endpoint
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return retriedCount;
}

// ============================================
// Mark Event as Delivered
// ============================================

/**
 * Mark an event as delivered (called by n8n callback)
 */
export async function markEventDelivered(eventId: string): Promise<boolean> {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("webhook_events")
    .update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) {
    console.error("[EventDispatcher] Failed to mark event as delivered:", error);
    return false;
  }

  return true;
}

// ============================================
// Get Event Statistics
// ============================================

/**
 * Get webhook event statistics for an organization
 */
export async function getEventStats(organizationId: string) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (supabase as any)
    .from("webhook_events")
    .select("status")
    .eq("organization_id", organizationId);

  if (!events) {
    return {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
    };
  }

  return {
    total: events.length,
    pending: events.filter((e) => e.status === "pending").length,
    sent: events.filter((e) => e.status === "sent").length,
    delivered: events.filter((e) => e.status === "delivered").length,
    failed: events.filter((e) => e.status === "failed").length,
  };
}
