/**
 * Stripe Checkout API Route
 * Creates checkout sessions for subscription purchases
 * Updated: 2025-12-14 - New plan structure (Base/Intermediario/Avancado)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";
import { checkRateLimit, getClientIP, rateLimitConfigs } from "@/lib/rate-limit";

// Request validation schema - Only yearly billing available
const checkoutSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  plan: z.enum(["base", "intermediario", "avancado"], {
    errorMap: () => ({ message: "Plan must be 'base', 'intermediario', or 'avancado'" }),
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Terms must be accepted to proceed",
  }),
  acceptedAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting - 5 checkout sessions per 5 minutes
  const clientIP = getClientIP(request.headers);
  const rateLimit = checkRateLimit(`stripe:checkout:${clientIP}`, rateLimitConfigs.stripeCheckout);
  
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
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { organizationId, plan, acceptedAt } = validation.data;
    // termsAccepted is validated by zod schema (must be true to proceed)

    // Verify user is admin of organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("user_profiles") as any)
      .select("role, organization_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.organization_id !== organizationId || profile.role !== "responsavel_empresa") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Apenas responsáveis da empresa podem gerenciar assinaturas",
        },
        { status: 403 }
      );
    }

    // Create checkout session (yearly only)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { url, sessionId, error } = await createCheckoutSession({
      organizationId,
      plan,
      userEmail: user.email!,
      successUrl: `${baseUrl}/dashboard/configuracoes/billing?success=true`,
      cancelUrl: `${baseUrl}/dashboard/configuracoes/billing?canceled=true`,
      termsAcceptedAt: acceptedAt || new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json(
        { error: "Checkout creation failed", message: error },
        { status: 400 }
      );
    }

    return NextResponse.json({ url, sessionId });
  } catch (error) {
    console.error("[Stripe Checkout] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
