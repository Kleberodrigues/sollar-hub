/**
 * Pricing Cards Component - NR-1 Focused Plans
 * Displays all 3 plans (Base, Intermediario, Avancado) with employee ranges
 * Includes terms acceptance before checkout
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Building, Building2, Factory, Loader2, Users, Shield, FileText, Scale } from "lucide-react";
import { toast } from "sonner";
import { PLANS, type PlanType } from "@/lib/stripe/config";
import Link from "next/link";

interface PricingCardsProps {
  organizationId: string;
  currentPlan: string | null;
  autoCheckoutPlan?: string;
}

const plans: Array<{
  id: PlanType;
  name: string;
  description: string;
  objective: string;
  icon: typeof Building;
  color: "terracotta" | "olive" | "sage";
  popular?: boolean;
  employeeRange: string;
  yearlyPrice: number;
  features: string[];
}> = [
  {
    id: "base",
    name: "Base",
    description: "50 a 120 colaboradores",
    objective: "14 Relatórios anuais",
    icon: Building,
    color: "terracotta",
    employeeRange: "50-120",
    yearlyPrice: PLANS.base.priceAmount.yearly,
    features: ["6 Relatórios de Clima (bimestrais)", "4 Relatórios Técnicos de Riscos Psicossociais (trimestrais)", "4 Relatórios de Plano de Ação (trimestrais)", "Dashboards automáticos", "Análise de dados completa", "Relatório técnico personalizado", "Plano de ação orientado à prevenção"],
  },
  {
    id: "intermediario",
    name: "Intermediário",
    description: "121 a 250 colaboradores",
    objective: "24 Relatórios anuais",
    icon: Building2,
    color: "olive",
    popular: true,
    employeeRange: "121-250",
    yearlyPrice: PLANS.intermediario.priceAmount.yearly,
    features: ["Tudo do plano Base", "4 Relatórios Comparativos entre ciclos (trimestrais)", "6 Relatórios Executivos para liderança (bimestrais)"],
  },
  {
    id: "avancado",
    name: "Avançado",
    description: "251 a 400 colaboradores",
    objective: "28 Relatórios anuais",
    icon: Factory,
    color: "sage",
    employeeRange: "251-400",
    yearlyPrice: PLANS.avancado.priceAmount.yearly,
    features: ["Tudo do plano Intermediário", "4 Relatórios de Correlação entre fatores organizacionais (trimestrais)", "Apresentação de 2 relatórios pela equipe PsicoMapa", "Condição exclusiva para Plano de Ação Completo pela Consultoria"],
  },
];

const colorMap = {
  terracotta: {
    border: "border-pm-terracotta/30 hover:border-pm-terracotta/60",
    borderActive: "border-pm-terracotta",
    bg: "bg-pm-terracotta/5",
    icon: "bg-pm-terracotta/10 text-pm-terracotta",
    button: "bg-pm-terracotta hover:bg-pm-terracotta-hover text-white",
    check: "text-pm-terracotta",
    badge: "bg-pm-terracotta/10 text-pm-terracotta",
  },
  olive: {
    border: "border-pm-olive/30 hover:border-pm-olive/60",
    borderActive: "border-pm-olive",
    bg: "bg-white",
    icon: "bg-pm-olive/10 text-pm-olive",
    button: "bg-pm-olive hover:bg-pm-olive-dark text-white",
    check: "text-pm-olive",
    badge: "bg-pm-olive/10 text-pm-olive",
  },
  sage: {
    border: "border-pm-olive/30 hover:border-pm-olive/60",
    borderActive: "border-pm-olive",
    bg: "bg-white",
    icon: "bg-pm-olive/10 text-pm-olive",
    button: "bg-pm-olive hover:bg-pm-olive-dark text-white",
    check: "text-pm-olive",
    badge: "bg-pm-olive/10 text-pm-olive",
  },
};

export function PricingCards({ organizationId, currentPlan, autoCheckoutPlan }: PricingCardsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const canProceed = termsAccepted && privacyAccepted;

  // Auto-open checkout dialog if plan is specified in URL
  useEffect(() => {
    if (autoCheckoutPlan && ['base', 'intermediario', 'avancado'].includes(autoCheckoutPlan)) {
      const plan = autoCheckoutPlan as PlanType;
      if (plan !== currentPlan) {
        setSelectedPlan(plan);
        setShowTermsDialog(true);
      }
    }
  }, [autoCheckoutPlan, currentPlan]);

  const openCheckoutDialog = (plan: PlanType) => {
    if (plan === currentPlan) return;
    setSelectedPlan(plan);
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setShowTermsDialog(true);
  };

  const closeDialog = () => {
    setShowTermsDialog(false);
    setSelectedPlan(null);
    setTermsAccepted(false);
    setPrivacyAccepted(false);
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !canProceed) return;

    console.log("[Checkout] Starting checkout", { organizationId, selectedPlan });
    setIsLoading(selectedPlan);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          plan: selectedPlan,
          termsAccepted: true,
          acceptedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      console.log("[Checkout] Response:", { status: response.status, data });

      if (!response.ok) {
        console.error("[Checkout] Error:", data);
        throw new Error(data.message || "Erro ao iniciar checkout");
      }

      if (!data.url) {
        console.error("[Checkout] No URL returned:", data);
        throw new Error("URL de checkout não retornada");
      }

      console.log("[Checkout] Redirecting to:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error("[Checkout] Exception:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao iniciar checkout");
    } finally {
      setIsLoading(null);
      closeDialog();
    }
  };

  const formatPrice = (amountCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountCents / 100);
  };

  const formatMonthlyEquivalent = (yearlyAmountCents: number) => {
    const monthly = yearlyAmountCents / 12 / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monthly);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm text-text-muted">
          Planos anuais com foco em conformidade NR-1 e gestão de riscos psicossociais
        </p>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          const isPopular = plan.popular;
          const colors = colorMap[plan.color];

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col rounded-xl border-2 ${
                isCurrent ? colors.borderActive : colors.border
              } ${colors.bg} p-5 transition-all duration-300 ${
                isPopular ? "md:-mt-2 md:pb-7 shadow-lg" : ""
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold bg-pm-olive text-white rounded-full shadow-sm">
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute -top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-white border-2 border-gray-300 rounded-full shadow-sm">
                    Atual
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-heading">{plan.name}</h3>
                  <p className="text-xs text-text-muted">{plan.objective}</p>
                </div>
              </div>

              {/* Employee Range Badge */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${colors.badge} text-xs font-medium w-fit mb-3`}>
                <Users className="w-3.5 h-3.5" />
                <span>{plan.description}</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${plan.color === 'terracotta' ? 'text-pm-terracotta' : plan.color === 'olive' ? 'text-pm-olive' : 'text-text-heading'}`}>
                    {formatPrice(plan.yearlyPrice)}
                  </span>
                  <span className="text-sm text-text-muted">/ano</span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Equivalente a {formatMonthlyEquivalent(plan.yearlyPrice)}/mês
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-5 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full ${colors.button} transition-all mt-auto`}
                size="default"
                onClick={() => openCheckoutDialog(plan.id)}
                disabled={isLoading !== null || isCurrent}
              >
                {isLoading === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  "Plano Atual"
                ) : (
                  `Assinar ${plan.name}`
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Terms Acceptance Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-pm-terracotta" />
              Confirmar Assinatura
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <span>
                  Plano <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> - {" "}
                  {formatPrice(plans.find(p => p.id === selectedPlan)?.yearlyPrice || 0)}/ano
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-text-muted">
              Para prosseguir com a assinatura, por favor leia e aceite os termos abaixo:
            </p>

            {/* Terms of Service */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-pm-olive" />
                  Termos de Uso
                </label>
                <p className="text-xs text-text-muted mt-1">
                  Li e concordo com os{" "}
                  <Link
                    href="/termos"
                    target="_blank"
                    className="text-pm-terracotta hover:underline font-medium"
                  >
                    Termos de Uso
                  </Link>{" "}
                  da plataforma PsicoMapa.
                </p>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label
                  htmlFor="privacy"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Scale className="w-4 h-4 text-pm-olive" />
                  Privacidade e LGPD
                </label>
                <p className="text-xs text-text-muted mt-1">
                  Li e concordo com a{" "}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    className="text-pm-terracotta hover:underline font-medium"
                  >
                    Política de Privacidade
                  </Link>{" "}
                  e{" "}
                  <Link
                    href="/lgpd"
                    target="_blank"
                    className="text-pm-terracotta hover:underline font-medium"
                  >
                    conformidade LGPD
                  </Link>.
                </p>
              </div>
            </div>

            {/* Info Note */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Importante:</strong> Ao prosseguir, você será redirecionado para o Stripe,
                nosso processador de pagamentos seguro. O pagamento é anual e pode ser cancelado a qualquer momento.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeDialog} disabled={isLoading !== null}>
              Cancelar
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={!canProceed || isLoading !== null}
              className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Prosseguir para Pagamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Info */}
      <div className="text-center space-y-2">
        <p className="text-xs text-text-muted">
          Garantia de 7 dias • Contrato anual (12 meses) • Sem taxas ocultas
        </p>
        <p className="text-xs text-text-muted">
          Para organizações com mais de 400 colaboradores,{" "}
          <a href="mailto:contato@psicomapa.cloud" className="text-pm-terracotta hover:underline">
            entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
