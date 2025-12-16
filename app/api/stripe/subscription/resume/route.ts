/**
 * Resume Subscription API Route
 * Resumes a subscription that was scheduled to cancel
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { z } from "zod";
import { checkRateLimit, getClientIP, rateLimitConfigs } from "@/lib/rate-limit";

const resumeSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request.headers);
  const rateLimit = checkRateLimit(`stripe:resume:${clientIP}`, rateLimitConfigs.stripe);
  if (!rateLimit.success) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests", message: `Aguarde ${retryAfter} segundos.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = resumeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { organizationId } = validation.data;

    // Verify user is admin of organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("user_profiles") as any)
      .select("role, organization_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.organization_id !== organizationId || profile.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only organization admins can manage billing",
        },
        { status: 403 }
      );
    }

    // Get subscription from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase.from("subscriptions") as any)
      .select("stripe_subscription_id, cancel_at_period_end")
      .eq("organization_id", organizationId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Not found", message: "No active subscription found" },
        { status: 404 }
      );
    }

    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: "Invalid state", message: "Subscription is not scheduled to cancel" },
        { status: 400 }
      );
    }

    // Resume subscription in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("subscriptions") as any)
      .update({ cancel_at_period_end: false })
      .eq("organization_id", organizationId);

    return NextResponse.json({
      success: true,
      message: "Subscription resumed successfully",
    });
  } catch (error) {
    console.error("[Stripe Resume] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
