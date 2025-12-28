/**
 * Pricing Cards Component - NR-1 Focused Plans
 * Displays all 3 plans (Base, Intermediario, Avancado) with employee ranges
 * Updated: 2025-12-28 - Simplified design matching landing page style
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PLANS, type PlanType } from "@/lib/stripe/config";
import Link from "next/link";

interface PricingCardsProps {
  organizationId: string;
  currentPlan: string | null;
}

const plans: Array<{
  id: PlanType;
  name: string;
  description: string;
  yearlyPrice: number;
  reportsCount: string;
  features: string[];
  highlighted?: boolean;
}> = [
  {
    id: "base",
    name: "Base",
    description: "50 a 120 colaboradores",
    yearlyPrice: PLANS.base.priceAmount.yearly,
    reportsCount: "14 Relatórios anuais",
    features: [
      "Dashboards automáticos",
      "Relatório técnico personalizado",
      "Plano de ação orientado à prevenção",
      "Export PDF e CSV",
      "Suporte por email",
    ],
    highlighted: false,
  },
  {
    id: "intermediario",
    name: "Intermediário",
    description: "121 a 250 colaboradores",
    yearlyPrice: PLANS.intermediario.priceAmount.yearly,
    reportsCount: "24 Relatórios anuais",
    features: [
      "Tudo do plano Base",
      "Dashboards comparativos",
      "Priorização de riscos por impacto",
      "Branding personalizado",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    id: "avancado",
    name: "Avançado",
    description: "251 a 400 colaboradores",
    yearlyPrice: PLANS.avancado.priceAmount.yearly,
    reportsCount: "28 Relatórios anuais",
    features: [
      "Tudo do plano Intermediário",
      "Análise sistêmica dos riscos",
      "Acesso à API",
      "Export XLSX",
      "Suporte dedicado",
    ],
    highlighted: false,
  },
];

export function PricingCards({ organizationId, currentPlan }: PricingCardsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCheckout = async (plan: PlanType) => {
    if (plan === currentPlan) return;

    if (!termsAccepted) {
      toast.error("Você precisa aceitar os termos para continuar");
      return;
    }

    setIsLoading(plan);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          plan,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao iniciar checkout");
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao iniciar checkout");
    } finally {
      setIsLoading(null);
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
          Pagamento anual • Sem taxas ocultas • Cancele quando quiser
        </p>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan, index) => {
          const isCurrent = currentPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${
                plan.highlighted ? "border-pm-terracotta" : "border-border-light"
              }`}
            >
              {/* Mais Popular Banner */}
              {plan.highlighted && (
                <div className="bg-pm-terracotta text-white text-center py-2 text-sm font-medium">
                  Mais Popular
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-2 py-1 text-xs font-medium bg-pm-green text-white rounded-full shadow-sm">
                    Plano Atual
                  </span>
                </div>
              )}

              <div className={`p-6 flex flex-col flex-grow ${plan.highlighted ? "" : ""}`}>
                {/* Plan Header */}
                <div className="mb-4">
                  <h3 className="font-display text-xl font-semibold text-pm-green-dark">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="font-display text-3xl font-bold text-pm-green-dark">
                    {formatPrice(plan.yearlyPrice)}
                  </span>
                  <span className="text-text-secondary">/ano</span>
                  <p className="text-xs text-text-muted mt-1">
                    Equivalente a {formatMonthlyEquivalent(plan.yearlyPrice)}/mês
                  </p>
                </div>

                {/* Reports Count Badge */}
                <div className="mb-4 inline-block bg-pm-olive/10 text-pm-olive text-sm font-medium px-3 py-1 rounded-full w-fit">
                  {plan.reportsCount}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full transition-all ${
                    plan.highlighted
                      ? "bg-pm-terracotta hover:bg-pm-terracotta-hover text-white"
                      : "bg-pm-green hover:bg-pm-green-dark text-white"
                  } ${!termsAccepted && !isCurrent ? "opacity-60" : ""}`}
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading !== null || isCurrent || !termsAccepted}
                >
                  {isLoading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    "Plano Atual"
                  ) : (
                    "Começar Agora"
                  )}
                </Button>

                {/* Features */}
                <ul className="mt-6 space-y-2 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-pm-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Terms Acceptance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-bg-secondary rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="terms"
            className="text-sm text-text-secondary leading-relaxed cursor-pointer"
          >
            Li e aceito os{" "}
            <Link href="/termos" className="text-pm-terracotta hover:underline">
              Termos de Uso
            </Link>
            ,{" "}
            <Link href="/termos" className="text-pm-terracotta hover:underline">
              Termos Comerciais
            </Link>
            {" "}e{" "}
            <Link href="/privacidade" className="text-pm-terracotta hover:underline">
              Política de Privacidade
            </Link>
            {" "}e declaro que tenho poderes para contratar em nome da empresa.
          </label>
        </div>
      </motion.div>

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
