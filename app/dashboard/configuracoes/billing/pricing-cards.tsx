/**
 * Pricing Cards Component - NR-1 Focused Plans
 * Displays all 3 plans (Base, Intermediario, Avancado) with employee ranges
 * Updated: 2025-12-14 - New plan structure focused on NR-1 compliance
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Building, Building2, Factory, Loader2, Users } from "lucide-react";
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
    objective: "Cumprir a NR-1 com clareza",
    icon: Building,
    color: "terracotta",
    employeeRange: "50-120",
    yearlyPrice: PLANS.base.priceAmount.yearly,
    features: [
      "IA vertical em riscos psicossociais",
      "Dashboards automaticos",
      "Relatorio tecnico personalizado",
      "Plano de acao orientado a prevencao",
      "Analise por clusters de risco",
      "Assessments ilimitados",
      "Export PDF e CSV",
    ],
  },
  {
    id: "intermediario",
    name: "Intermediario",
    description: "121 a 250 colaboradores",
    objective: "Apoiar decisoes gerenciais",
    icon: Building2,
    color: "olive",
    popular: true,
    employeeRange: "121-250",
    yearlyPrice: PLANS.intermediario.priceAmount.yearly,
    features: [
      "Tudo do plano Base",
      "Analise comparativa entre ciclos",
      "Priorizacao por impacto organizacional",
      "Dashboards comparativos (tempo/areas)",
      "Relatorio executivo para lideranca",
      "Branding personalizado",
      "Suporte prioritario",
    ],
  },
  {
    id: "avancado",
    name: "Avancado",
    description: "251 a 400 colaboradores",
    objective: "Atender maior complexidade",
    icon: Factory,
    color: "sage",
    employeeRange: "251-400",
    yearlyPrice: PLANS.avancado.priceAmount.yearly,
    features: [
      "Tudo do plano Intermediario",
      "Analise sistemica dos riscos",
      "Correlacao entre fatores organizacionais",
      "Alertas de atencao elevada",
      "Relatorio tecnico para gestao de riscos",
      "Acesso a API",
      "Export XLSX",
      "Suporte dedicado",
    ],
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
    bg: "bg-pm-olive/5",
    icon: "bg-pm-olive/10 text-pm-olive",
    button: "bg-pm-olive hover:bg-pm-olive-dark text-white",
    check: "text-pm-olive",
    badge: "bg-pm-olive/10 text-pm-olive",
  },
  sage: {
    border: "border-bg-sage/50 hover:border-bg-sage",
    borderActive: "border-bg-sage",
    bg: "bg-bg-sage/30",
    icon: "bg-bg-sage/50 text-text-heading",
    button: "bg-text-heading hover:bg-text-heading/90 text-white",
    check: "text-text-heading",
    badge: "bg-bg-sage/50 text-text-heading",
  },
};

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
          Planos anuais com foco em conformidade NR-1 e gestao de riscos psicossociais
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
                  <span className="text-3xl font-bold text-text-heading">
                    {formatPrice(plan.yearlyPrice)}
                  </span>
                  <span className="text-sm text-text-muted">/ano</span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Equivalente a {formatMonthlyEquivalent(plan.yearlyPrice)}/mes
                </p>
              </div>

              {/* Features - flex-grow to push button to bottom */}
              <ul className="space-y-2 mb-5 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button - always at bottom */}
              <Button
                className={`w-full ${colors.button} transition-all mt-auto ${
                  !termsAccepted && !isCurrent ? "opacity-60" : ""
                }`}
                size="sm"
                onClick={() => handleCheckout(plan.id)}
                disabled={isLoading !== null || isCurrent || !termsAccepted}
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
          Garantia de 30 dias - Cancele quando quiser - Sem taxas ocultas
        </p>
        <p className="text-xs text-text-muted">
          Para organizacoes com mais de 400 colaboradores,{" "}
          <a href="mailto:contato@sollar.com" className="text-pm-terracotta hover:underline">
            entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
