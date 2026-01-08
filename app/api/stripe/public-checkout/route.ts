/**
 * Public Stripe Checkout API Route
 * Creates checkout sessions for NEW users (no authentication required)
 * User account is created via webhook after successful payment
 */

import { NextRequest, NextResponse } from "next/server";
import { createPublicCheckoutSession } from "@/lib/stripe";
import { preCheckoutSchema } from "@/lib/validations/checkout";
import { checkRateLimit, getClientIP, rateLimitConfigs } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting - 5 checkout sessions per 5 minutes (same as authenticated checkout)
  const clientIP = getClientIP(request.headers);
  const rateLimit = checkRateLimit(
    `stripe:public-checkout:${clientIP}`,
    rateLimitConfigs.stripeCheckout
  );

  if (!rateLimit.success) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests", message: `Aguarde ${retryAfter} segundos.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = preCheckoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      email,
      fullName,
      companyName,
      industry,
      size,
      plan,
    } = validation.data;

    // Create public checkout session (no auth required)
    const { url, sessionId, error } = await createPublicCheckoutSession({
      email,
      fullName,
      companyName,
      industry: industry || undefined,
      size: size || undefined,
      plan,
      termsAcceptedAt: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json(
        { error: "Checkout creation failed", message: error },
        { status: 400 }
      );
    }

    return NextResponse.json({ url, sessionId });
  } catch (error) {
    console.error("[Public Checkout] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
