/* eslint-disable no-console */
/**
 * n8n Webhook Handler
 * Receives callbacks and delivery confirmations from n8n workflows
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySignature, markEventDelivered } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Handle incoming webhooks from n8n
 *
 * Supported actions:
 * - delivery_confirmation: Mark event as delivered
 * - Custom actions defined in n8n workflows
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-webhook-signature");
    const eventId = request.headers.get("x-event-id");
    const action = request.headers.get("x-n8n-action");

    // In production, signature is REQUIRED
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

    if (isProduction && !signature) {
      console.error("[n8n Webhook] SECURITY ERROR: Missing signature in production");
      return NextResponse.json(
        { error: "Signature required in production" },
        { status: 401 }
      );
    }

    // Verify signature
    if (signature && !verifySignature(body, signature)) {
      console.warn("[n8n Webhook] Invalid signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Warn in development if signature is missing
    if (!isProduction && !signature) {
      console.warn("[n8n Webhook] WARNING: No signature provided in development");
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(body);
    } catch {
      // Body might not be JSON for some callbacks
    }

    // Handle delivery confirmation
    if (action === "delivery_confirmation" && eventId) {
      const success = await markEventDelivered(eventId);

      if (success) {
        console.log(`[n8n Webhook] Event ${eventId} marked as delivered`);
        return NextResponse.json({
          success: true,
          action: "delivery_confirmed",
          eventId,
        });
      } else {
        return NextResponse.json(
          { error: "Failed to mark event as delivered" },
          { status: 500 }
        );
      }
    }

    // Handle other n8n callbacks
    // Example: n8n sending back processed data or notifications

    // Log callback for debugging
    console.log("[n8n Webhook] Received callback", {
      action: action || "unknown",
      eventId,
      hasPayload: Object.keys(payload).length > 0,
    });

    // Acknowledge receipt
    return NextResponse.json({
      success: true,
      received: true,
      timestamp: new Date().toISOString(),
      action: action || "generic",
    });
  } catch (error) {
    console.error("[n8n Webhook] Handler error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for n8n webhook
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "pm-n8n-webhook",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
