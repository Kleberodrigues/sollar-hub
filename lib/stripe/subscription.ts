/**
 * Stripe subscription management functions
 * Updated: 2025-12-14 - New plan structure (Base/Intermediario/Avancado)
 * Updated: 2026-01-08 - Fixed NEXT_PUBLIC_APP_URL for production (removed newline)
 */

import {
  stripe,
  getPriceId,
  getPlanFromPriceId,
  type PlanType,
} from "./config";
import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

interface CreateCheckoutParams {
  organizationId: string;
  plan: PlanType;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  termsAcceptedAt?: string; // ISO date when terms were accepted
}

interface CreateCheckoutResult {
  url: string | null;
  sessionId?: string;
  error?: string;
}

interface SubscriptionData {
  id: string;
  organization_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: PlanType | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

// ============================================
// Checkout Session
// ============================================

/**
 * Create Stripe Checkout Session for subscription
 * Only yearly billing is available
 */
export async function createCheckoutSession({
  organizationId,
  plan,
  userEmail,
  successUrl,
  cancelUrl,
  termsAcceptedAt,
}: CreateCheckoutParams): Promise<CreateCheckoutResult> {
  if (!stripe) {
    return { url: null, error: "Stripe not configured" };
  }

  const supabase = await createClient();

  // Only yearly prices available
  const priceId = getPriceId(plan);
  if (!priceId) {
    return { url: null, error: "Invalid plan or price not configured" };
  }

  try {
    // Get or create Stripe customer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: customer } = await (supabase as any)
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("organization_id", organizationId)
      .single();

    let stripeCustomerId = customer?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          organization_id: organizationId,
          source: "sollar-insight-hub",
        },
      });

      stripeCustomerId = stripeCustomer.id;

      // Save to database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("billing_customers").insert({
        organization_id: organizationId,
        stripe_customer_id: stripeCustomerId,
        email: userEmail,
      });
    }

    // Create checkout session (yearly only)
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          organization_id: organizationId,
          plan,
          interval: "yearly",
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      locale: "pt-BR",
      metadata: {
        organization_id: organizationId,
        plan,
        interval: "yearly",
        terms_accepted_at: termsAcceptedAt || new Date().toISOString(),
      },
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("[Stripe] Checkout session creation failed:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to create checkout",
    };
  }
}

// ============================================
// Public Checkout Session (No Auth Required)
// ============================================

interface CreatePublicCheckoutParams {
  email: string;
  fullName: string;
  companyName: string;
  industry?: string;
  size?: string;
  plan: PlanType;
  termsAcceptedAt: string;
}

/**
 * Create Stripe Checkout Session for NEW users (payment-first flow)
 * Does NOT require authentication - user/org created after payment via webhook
 */
export async function createPublicCheckoutSession({
  email,
  fullName,
  companyName,
  industry,
  size,
  plan,
  termsAcceptedAt,
}: CreatePublicCheckoutParams): Promise<CreateCheckoutResult> {
  if (!stripe) {
    return { url: null, error: "Stripe not configured" };
  }

  const priceId = getPriceId(plan);
  if (!priceId) {
    return { url: null, error: "Invalid plan" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://psicomapa.cloud";

  try {
    // Create new Stripe customer (no Supabase org yet)
    const stripeCustomer = await stripe.customers.create({
      email,
      name: fullName,
      metadata: {
        company_name: companyName,
        source: "sollar-public-checkout",
      },
    });

    // Create checkout session with all user data in metadata
    // Webhook will use this data to create user + org after payment
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/pagamento-confirmado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/${plan}`,
      subscription_data: {
        metadata: {
          plan,
          interval: "yearly",
          // organization_id will be added after creation
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      locale: "pt-BR",
      metadata: {
        // Flag to indicate this is a new signup (not an upgrade)
        is_new_signup: "true",
        // User data for account creation
        email,
        full_name: fullName,
        company_name: companyName,
        industry: industry || "",
        size: size || "",
        plan,
        terms_accepted_at: termsAcceptedAt,
      },
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("[Stripe] Public checkout session creation failed:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to create checkout",
    };
  }
}

// ============================================
// Customer Portal
// ============================================

/**
 * Create Customer Portal session for managing subscription
 */
export async function createPortalSession(
  organizationId: string,
  returnUrl: string
): Promise<{ url: string | null; error?: string }> {
  if (!stripe) {
    return { url: null, error: "Stripe not configured" };
  }

  const supabase = await createClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: customer } = await (supabase as any)
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("organization_id", organizationId)
      .single();

    if (!customer?.stripe_customer_id) {
      return { url: null, error: "No billing customer found" };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error("[Stripe] Portal session creation failed:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to create portal session",
    };
  }
}

// ============================================
// Subscription Management
// ============================================

/**
 * Get current subscription for organization
 * Returns null plan if no active subscription (no free tier)
 */
export async function getSubscription(
  organizationId: string
): Promise<SubscriptionData | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription, error } = await (supabase as any)
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .single();

  if (error || !subscription) {
    // No subscription found - return null (no free tier)
    return null;
  }

  return subscription as SubscriptionData;
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  if (!stripe) {
    return { success: false, error: "Stripe not configured" };
  }

  const supabase = await createClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase as any)
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("organization_id", organizationId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return { success: false, error: "No active subscription found" };
    }

    // Cancel on Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);

    return { success: true };
  } catch (error) {
    console.error("[Stripe] Cancel subscription failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel",
    };
  }
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  if (!stripe) {
    return { success: false, error: "Stripe not configured" };
  }

  const supabase = await createClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase as any)
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("organization_id", organizationId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return { success: false, error: "No subscription found" };
    }

    // Resume on Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("subscriptions")
      .update({
        cancel_at_period_end: false,
        canceled_at: null,
      })
      .eq("organization_id", organizationId);

    return { success: true };
  } catch (error) {
    console.error("[Stripe] Resume subscription failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resume",
    };
  }
}

// ============================================
// Webhook Handlers
// ============================================

/**
 * Handle subscription creation/update from webhook
 */
export async function handleSubscriptionUpdate(
  subscription: {
    id: string;
    customer: string;
    status: string;
    items: { data: Array<{ price: { id: string } }> };
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    canceled_at: number | null;
    metadata: { organization_id?: string };
  }
): Promise<void> {
  const supabase = await createClient();
  const organizationId = subscription.metadata.organization_id;

  if (!organizationId) {
    console.error("[Stripe Webhook] No organization_id in subscription metadata");
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("subscriptions").upsert({
    organization_id: organizationId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
  });
}

/**
 * Handle subscription deletion from webhook
 * Sets subscription to canceled status (no downgrade to free - free tier removed)
 */
export async function handleSubscriptionDeleted(
  subscription: {
    id: string;
    metadata: { organization_id?: string };
  }
): Promise<void> {
  const supabase = await createClient();
  const organizationId = subscription.metadata.organization_id;

  if (!organizationId) {
    console.error("[Stripe Webhook] No organization_id in subscription metadata");
    return;
  }

  // Mark subscription as canceled (no free tier fallback)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("subscriptions")
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      status: "canceled",
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId);
}
