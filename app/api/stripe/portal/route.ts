/**
 * Stripe Customer Portal API Route
 * Creates portal sessions for managing subscriptions
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe";
import { z } from "zod";
import { checkRateLimit, getClientIP, rateLimitConfigs } from "@/lib/rate-limit";

// Request validation schema
const portalSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
});

export async function POST(request: NextRequest) {
  // Rate limiting - 10 requests per minute
  const clientIP = getClientIP(request.headers);
  const rateLimit = checkRateLimit(`stripe:portal:${clientIP}`, rateLimitConfigs.stripe);
  if (!rateLimit.success) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests", message: `Aguarde ${retryAfter} segundos.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
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
    const validation = portalSchema.safeParse(body);

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

    // Create portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { url, error } = await createPortalSession(
      organizationId,
      `${baseUrl}/dashboard/configuracoes/billing`
    );

    if (error) {
      return NextResponse.json(
        { error: "Portal creation failed", message: error },
        { status: 400 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[Stripe Portal] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
