'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Check, Building2 } from "lucide-react";

const plans = [
  {
    name: 'Base',
    description: '50 a 120 colaboradores',
    yearlyPrice: 'R$ 3.970',
    monthlyEquivalent: 'Equivalente a R$ 330,83/mês',
    reportsCount: '14 Relatórios anuais',
    features: [
      'Dashboards automáticos',
      'Relatório técnico personalizado',
      'Plano de ação orientado à prevenção',
      'Export PDF e CSV',
      'Suporte por email',
    ],
    highlighted: false,
  },
  {
    name: 'Intermediário',
    description: '121 a 250 colaboradores',
    yearlyPrice: 'R$ 4.970',
    monthlyEquivalent: 'Equivalente a R$ 414,17/mês',
    reportsCount: '24 Relatórios anuais',
    features: [
      'Tudo do plano Base',
      'Dashboards comparativos',
      'Priorização de riscos por impacto',
      'Branding personalizado',
      'Suporte prioritário',
    ],
    highlighted: true,
  },
  {
    name: 'Avançado',
    description: '251 a 400 colaboradores',
    yearlyPrice: 'R$ 5.970',
    monthlyEquivalent: 'Equivalente a R$ 497,50/mês',
    reportsCount: '28 Relatórios anuais',
    features: [
      'Tudo do plano Intermediário',
      'Análise sistêmica dos riscos',
      'Acesso à API',
      'Export XLSX',
      'Suporte dedicado',
    ],
    highlighted: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="planos" className="py-12 lg:py-16 bg-white scroll-mt-20" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-6"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
            Planos e <span className="text-pm-terracotta">Preços</span>
          </h2>
          <p className="text-lg text-text-secondary">
            Diagnóstico de riscos psicossociais + pesquisa de clima contínua.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Pagamento anual • Sem taxas ocultas • Cancele quando quiser
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${
                plan.highlighted ? 'border-pm-terracotta' : 'border-border-light'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-pm-terracotta text-white text-center py-2 text-sm font-medium">
                  Mais Popular
                </div>
              )}

              <div className={`p-6 ${plan.highlighted ? 'pt-12' : ''}`}>
                {/* Plan Header */}
                <div className="mb-4">
                  <h3 className="font-display text-xl font-semibold text-pm-green-dark">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {plan.description}
                  </p>
                </div>

                {/* Price - Yearly Format */}
                <div className="mb-4">
                  <span className="font-display text-3xl font-bold text-pm-green-dark">
                    {plan.yearlyPrice}
                  </span>
                  <span className="text-text-secondary">/ano</span>
                  <p className="text-xs text-text-muted mt-1">
                    {plan.monthlyEquivalent}
                  </p>
                </div>

                {/* Reports Count Badge */}
                <div className="mb-4 inline-block bg-pm-olive/10 text-pm-olive text-sm font-medium px-3 py-1 rounded-full">
                  {plan.reportsCount}
                </div>

                {/* CTA Button */}
                <Link
                  href="/contato"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-pm-terracotta text-white hover:bg-pm-terracotta-hover'
                      : 'bg-pm-green text-white hover:bg-pm-green-dark'
                  }`}
                >
                  Começar Agora
                </Link>

                {/* Features */}
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-pm-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-pm-brown rounded-2xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-pm-olive-light" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-1">
                    Enterprise
                  </h3>
                  <p className="text-white/80 text-sm">
                    Para empresas com mais de 400 colaboradores. Plano personalizado.
                  </p>
                </div>
              </div>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center bg-pm-olive-light text-pm-brown font-medium px-6 py-3 rounded-lg hover:bg-white transition-colors whitespace-nowrap"
              >
                Fale com Especialista
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
