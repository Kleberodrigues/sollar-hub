/**
 * Billing Actions Component
 * Provides buttons for managing subscription (upgrade, cancel, resume, portal access)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExternalLink, CreditCard, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BillingActionsProps {
  organizationId: string;
  currentPlan: string;
  hasStripeSubscription: boolean;
  cancelAtPeriodEnd: boolean;
}

export function BillingActions({
  organizationId,
  currentPlan,
  hasStripeSubscription,
  cancelAtPeriodEnd,
}: BillingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Open Stripe Customer Portal
  const handleOpenPortal = async () => {
    setIsLoading("portal");
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao abrir portal");
      }

      // Redirect to Stripe Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("[BillingActions] Portal error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao abrir portal de pagamentos"
      );
    } finally {
      setIsLoading(null);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    setIsLoading("cancel");
    try {
      const response = await fetch("/api/stripe/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cancelar assinatura");
      }

      toast.success("Assinatura será cancelada ao final do período atual");
      router.refresh();
    } catch (error) {
      console.error("[BillingActions] Cancel error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao cancelar assinatura"
      );
    } finally {
      setIsLoading(null);
    }
  };

  // Resume subscription (undo cancellation)
  const handleResumeSubscription = async () => {
    setIsLoading("resume");
    try {
      const response = await fetch("/api/stripe/subscription/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao reativar assinatura");
      }

      toast.success("Assinatura reativada com sucesso!");
      router.refresh();
    } catch (error) {
      console.error("[BillingActions] Resume error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao reativar assinatura"
      );
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Stripe Portal Button - Always shown if has subscription */}
      {hasStripeSubscription && (
        <Button
          variant="outline"
          onClick={handleOpenPortal}
          disabled={isLoading !== null}
          className="gap-2"
        >
          {isLoading === "portal" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Gerenciar no Stripe
        </Button>
      )}

      {/* Cancel/Resume buttons for paid plans */}
      {currentPlan !== "free" && hasStripeSubscription && (
        <>
          {cancelAtPeriodEnd ? (
            // Resume button if cancellation is pending
            <Button
              variant="primary"
              onClick={handleResumeSubscription}
              disabled={isLoading !== null}
              className="gap-2 bg-pm-olive hover:bg-pm-olive/90"
            >
              {isLoading === "resume" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Reativar Assinatura
            </Button>
          ) : (
            // Cancel button
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  disabled={isLoading !== null}
                >
                  {isLoading === "cancel" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Cancelar Assinatura
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sua assinatura continuará ativa até o final do período atual.
                    Após isso, você será movido para o plano Free e perderá acesso
                    aos recursos premium.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar cancelamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}

      {/* Upgrade button for free plan */}
      {currentPlan === "free" && (
        <Button
          onClick={() => {
            // Scroll to pricing section
            document.getElementById("pricing-section")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className="gap-2 bg-pm-terracotta hover:bg-pm-terracotta/90"
        >
          <CreditCard className="h-4 w-4" />
          Fazer Upgrade
        </Button>
      )}
    </div>
  );
}
