/**
 * Cron Job: Retry Failed Webhooks
 * Runs every 15 minutes via Vercel Cron
 *
 * Vercel Cron requires the endpoint to be protected.
 * The CRON_SECRET environment variable should be set in Vercel.
 */

import { NextRequest, NextResponse } from "next/server";
import { retryFailedEvents } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret for Vercel Cron jobs
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, require CRON_SECRET
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    if (!cronSecret) {
      console.error("[Cron Retry] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Cron Retry] Unauthorized cron request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    console.log("[Cron Retry] Starting webhook retry job...");

    const retriedCount = await retryFailedEvents(3);

    console.log(`[Cron Retry] Completed. Retried ${retriedCount} events.`);

    return NextResponse.json({
      success: true,
      retried: retriedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Cron Retry] Job failed:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
