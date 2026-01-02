/**
 * Billing Dashboard Page
 * Displays subscription status, pricing plans, and payment history
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/stripe";
import { BillingPageClient } from "./billing-page-client";
import { PaymentHistoryTable } from "./payment-history";
import { PaymentHistorySkeleton } from "./billing-components";

// Re-export shared components for backwards compatibility
export { PlanBadge, StatusIndicator, getStatusLabel, PaymentHistorySkeleton } from "./billing-components";

export const dynamic = "force-dynamic";

// ============================================
// Helper Functions
// ============================================

async function getOrganizationId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's organization from user_profiles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: membership } = await (supabase
    .from("user_profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single() as any);

  if (!membership) {
    redirect("/onboarding");
  }

  return {
    organizationId: membership.organization_id,
    // Support both old "admin" role and new "responsavel_empresa" role
    isAdmin: membership.role === "admin" || membership.role === "responsavel_empresa",
    userId: user.id,
  };
}

// ============================================
// Page Component
// ============================================

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; checkout?: string }>;
}) {
  const { organizationId, isAdmin } = await getOrganizationId();
  const subscription = await getSubscription(organizationId);
  const params = await searchParams;

  // Get organization name
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .single() as any);

  return (
    <BillingPageClient
      subscription={subscription}
      organizationName={org?.name || "Sua organizacao"}
      organizationId={organizationId}
      isAdmin={isAdmin}
      showSuccess={!!params.success}
      showCanceled={!!params.canceled}
      autoCheckoutPlan={params.checkout}
      paymentHistorySlot={
        <Suspense fallback={<PaymentHistorySkeleton />}>
          <PaymentHistoryTable organizationId={organizationId} />
        </Suspense>
      }
    />
  );
}
