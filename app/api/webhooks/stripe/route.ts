/**
 * Stripe Webhook Handler
 * Processes subscription and payment events from Stripe
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import {
  stripe,
  getPlanFromPriceId,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { dispatchEvent } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error("[Stripe Webhook] Stripe not configured");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  if (!webhookSecret) {
    console.error("[Stripe Webhook] Webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    // Sanitized log - don't expose signature details
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  // ============================================
  // Idempotency Check
  // ============================================
  const eventId = event.id;

  try {
    // Check if event already processed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingEvent, error: checkError } = await (supabase as any)
      .from("stripe_webhook_events")
      .select("id, processed_at")
      .eq("stripe_event_id", eventId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = not found, which is fine
      // Sanitized log - only log error code, not full details
      console.error(`[Stripe Webhook] Error checking event: ${checkError.code || 'unknown'}`);
      // Continue processing despite check error
    }

    if (existingEvent) {
      console.log(
        `[Stripe Webhook] Event ${eventId} already processed at ${existingEvent.processed_at}. Skipping.`
      );
      return NextResponse.json({
        received: true,
        duplicate: true,
        event_id: eventId,
      });
    }

    // Record event as being processed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from("stripe_webhook_events")
      .insert({
        stripe_event_id: eventId,
        event_type: event.type,
        processed_at: new Date().toISOString(),
      });

    if (insertError) {
      // If insert fails due to unique constraint, it means another request is processing this
      if (insertError.code === "23505") {
        // Unique violation
        console.log(
          `[Stripe Webhook] Event ${eventId} is being processed by another request. Skipping.`
        );
        return NextResponse.json({
          received: true,
          duplicate: true,
          event_id: eventId,
        });
      }
      // Sanitized log - only log error code
      console.error(`[Stripe Webhook] Error recording event: ${insertError.code || 'unknown'}`);
      // Continue processing despite insert error
    }
  } catch (error) {
    // Sanitized log - only log error type
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Stripe Webhook] Idempotency check error: ${message}`);
    // Continue processing despite check error
  }

  try {
    console.log(`[Stripe Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      // ============================================
      // Checkout Events
      // ============================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      // ============================================
      // Subscription Events
      // ============================================
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await handleSubscriptionUpdate(subscription as any);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await handleSubscriptionDeleted(subscription as any);

        // Dispatch event
        const orgId = subscription.metadata.organization_id;
        if (orgId) {
          await dispatchEvent({
            organizationId: orgId,
            eventType: "subscription.canceled",
            data: {
              subscription_id: subscription.id,
              canceled_at: new Date().toISOString(),
              plan: getPlanFromPriceId(subscription.items.data[0]?.price.id || ""),
            },
          });
        }
        break;
      }

      // ============================================
      // Invoice Events
      // ============================================
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(supabase, invoice);
        break;
      }

      // ============================================
      // Other Events (log but don't process)
      // ============================================
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Sanitized log - don't expose internal details in production
    const message = error instanceof Error ? error.message : "Unknown error";
    if (process.env.NODE_ENV === "development") {
      console.error("[Stripe Webhook] Handler error:", error);
    } else {
      console.error(`[Stripe Webhook] Handler error for ${event.type}: ${message}`);
    }
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================
// Event Handlers
// ============================================

async function handleCheckoutCompleted(
  supabase: Awaited<ReturnType<typeof createClient>>,
  session: Stripe.Checkout.Session
) {
  const organizationId = session.metadata?.organization_id;
  const plan = session.metadata?.plan;
  const interval = session.metadata?.interval;

  if (!organizationId) {
    console.error("[Stripe Webhook] No organization_id in checkout session");
    return;
  }

  console.log(
    `[Stripe Webhook] Checkout completed for org ${organizationId}, plan: ${plan}`
  );

  // Dispatch event (no PII in payload)
  await dispatchEvent({
    organizationId,
    eventType: "subscription.created",
    data: {
      session_id: session.id,
      // customer_email removed - PII should not be in event payload
      plan: plan || "pro",
      interval: interval || "monthly",
    },
  });
}

async function handleInvoicePaid(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  // Find organization by Stripe customer ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: customer } = await (supabase.from("billing_customers") as any)
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!customer) {
    console.warn(
      `[Stripe Webhook] No organization found for customer ${customerId}`
    );
    return;
  }

  const orgId = customer.organization_id as string;

  // Record payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("payment_history") as any).insert({
    organization_id: orgId,
    stripe_invoice_id: invoice.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stripe_payment_intent_id: typeof (invoice as any).payment_intent === 'string'
      ? (invoice as any).payment_intent
      : ((invoice as any).payment_intent?.id || null),
    amount_cents: invoice.amount_paid,
    currency: invoice.currency,
    status: "paid",
    invoice_pdf_url: invoice.invoice_pdf,
    receipt_url: invoice.hosted_invoice_url,
  });

  // Dispatch event
  await dispatchEvent({
    organizationId: orgId,
    eventType: "payment.succeeded",
    data: {
      invoice_id: invoice.id,
      amount_cents: invoice.amount_paid,
      currency: invoice.currency,
      invoice_url: invoice.invoice_pdf,
    },
  });

  console.log(
    `[Stripe Webhook] Invoice paid: ${invoice.id} for org ${orgId}`
  );
}

async function handleInvoiceFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  // Find organization by Stripe customer ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: customer } = await (supabase.from("billing_customers") as any)
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!customer) {
    console.warn(
      `[Stripe Webhook] No organization found for customer ${customerId}`
    );
    return;
  }

  const orgId = customer.organization_id as string;

  // Record failed payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("payment_history") as any).insert({
    organization_id: orgId,
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_due,
    currency: invoice.currency,
    status: "failed",
    failure_message: "Payment failed",
  });

  // Dispatch event
  await dispatchEvent({
    organizationId: orgId,
    eventType: "payment.failed",
    data: {
      invoice_id: invoice.id,
      amount_cents: invoice.amount_due,
      currency: invoice.currency,
      failure_reason: "Payment failed",
    },
  });

  console.log(
    `[Stripe Webhook] Invoice failed: ${invoice.id} for org ${orgId}`
  );
}
