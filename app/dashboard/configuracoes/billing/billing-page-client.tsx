"use client";

import { ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Receipt, Calendar, AlertTriangle, Settings } from "lucide-react";
import { BillingActions } from "./billing-actions";
import { PricingCards } from "./pricing-cards";
import { PlanBadge, StatusIndicator, getStatusLabel } from "./billing-components";

interface Subscription {
  plan: string | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
}

interface BillingPageClientProps {
  subscription: Subscription | null;
  organizationName: string;
  organizationId: string;
  isAdmin: boolean;
  showSuccess: boolean;
  showCanceled: boolean;
  autoCheckoutPlan?: string;
  paymentHistorySlot: ReactNode;
}

export function BillingPageClient({
  subscription,
  organizationName,
  organizationId,
  isAdmin,
  showSuccess,
  showCanceled,
  autoCheckoutPlan,
  paymentHistorySlot,
}: BillingPageClientProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className="p-6 pb-12 space-y-6 flex-1 bg-gradient-to-b from-white to-bg-sage/20"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-heading">Faturamento</h1>
          <p className="text-sm text-text-muted mt-0.5">{organizationName}</p>
        </div>
        {isAdmin && subscription?.stripe_subscription_id && (
          <BillingActions
            organizationId={organizationId}
            currentPlan={subscription?.plan || "free"}
            hasStripeSubscription={!!subscription?.stripe_subscription_id}
            cancelAtPeriodEnd={subscription?.cancel_at_period_end || false}
          />
        )}
      </motion.div>

      {/* Alerts */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-sm text-green-800 font-medium">
            ✓ Assinatura realizada com sucesso!
          </p>
        </motion.div>
      )}

      {showCanceled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p className="text-sm text-amber-800 font-medium">
            Checkout cancelado. Nenhuma cobrança foi realizada.
          </p>
        </motion.div>
      )}

      {/* Current Subscription Status */}
      <motion.div variants={item}>
        <Card className="border border-border-light bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Plan */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pm-terracotta/20 to-pm-olive/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-pm-terracotta" />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Plano</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-heading capitalize">
                      {subscription?.plan || "Free"}
                    </span>
                    <PlanBadge plan={subscription?.plan || "free"} />
                  </div>
                </div>
              </div>

              <div className="w-px h-10 bg-border-light hidden sm:block" />

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <StatusIndicator status={subscription?.status || "active"} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Status</p>
                  <span className="font-semibold text-text-heading">
                    {getStatusLabel(subscription?.status || "active")}
                  </span>
                </div>
              </div>

              {/* Next Billing */}
              {subscription?.current_period_end && (
                <>
                  <div className="w-px h-10 bg-border-light hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide">
                        {subscription.cancel_at_period_end ? "Expira em" : "Próxima cobrança"}
                      </p>
                      <span className="font-semibold text-text-heading">
                        {new Date(subscription.current_period_end).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Cancel Warning */}
              {subscription?.cancel_at_period_end && (
                <>
                  <div className="w-px h-10 bg-border-light hidden sm:block" />
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800 font-medium">
                      Cancelamento agendado
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Section - Always visible */}
      {isAdmin && (
        <motion.div variants={item}>
          <Card className="border border-border-light bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-lg font-semibold text-text-heading flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Planos disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <PricingCards
                organizationId={organizationId}
                currentPlan={subscription?.plan || "free"}
                autoCheckoutPlan={autoCheckoutPlan}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div variants={item}>
        <Card className="border border-border-light bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-lg font-semibold text-text-heading flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Histórico de pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {paymentHistorySlot}
          </CardContent>
        </Card>
      </motion.div>

      {/* Non-admin notice */}
      {!isAdmin && (
        <motion.div variants={item}>
          <p className="text-sm text-text-muted text-center py-4 bg-bg-sage/30 rounded-lg">
            Apenas administradores podem gerenciar a assinatura.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
