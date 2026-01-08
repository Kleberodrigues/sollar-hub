'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Check, Building, Building2, Factory, Users } from "lucide-react";

const plans = [
  {
    id: 'base',
    name: 'Base',
    description: '50 a 120 colaboradores',
    objective: '14 Relatórios anuais',
    icon: Building,
    color: 'terracotta' as const,
    yearlyPrice: 'R$ 3.970',
    monthlyEquivalent: 'Equivalente a R$ 330,83/mês',
    features: ['6 Relatórios de Clima (bimestrais)', '4 Relatórios Técnicos de Riscos Psicossociais (trimestrais)', '4 Relatórios de Plano de Ação (trimestrais)', 'Dashboards automáticos', 'Análise de dados completa', 'Relatório técnico personalizado', 'Plano de ação orientado à prevenção'],
    highlighted: false,
  },
  {
    id: 'intermediario',
    name: 'Intermediário',
    description: '121 a 250 colaboradores',
    objective: '24 Relatórios anuais',
    icon: Building2,
    color: 'olive' as const,
    yearlyPrice: 'R$ 4.970',
    monthlyEquivalent: 'Equivalente a R$ 414,17/mês',
    features: ['Tudo do plano Base', '4 Relatórios Comparativos entre ciclos (trimestrais)', '6 Relatórios Executivos para liderança (bimestrais)'],
    highlighted: true,
  },
  {
    id: 'avancado',
    name: 'Avançado',
    description: '251 a 400 colaboradores',
    objective: '28 Relatórios anuais',
    icon: Factory,
    color: 'sage' as const,
    yearlyPrice: 'R$ 5.970',
    monthlyEquivalent: 'Equivalente a R$ 497,50/mês',
    features: ['Tudo do plano Intermediário', '4 Relatórios de Correlação entre fatores organizacionais (trimestrais)', 'Apresentação de 2 relatórios pela equipe PsicoMapa', 'Condição exclusiva para Plano de Ação Completo pela Consultoria'],
    highlighted: false,
  },
];

const colorMap = {
  terracotta: {
    border: 'border-pm-terracotta/30 hover:border-pm-terracotta/60',
    borderHighlight: 'border-pm-terracotta',
    bg: 'bg-pm-terracotta/5',
    icon: 'bg-pm-terracotta/10 text-pm-terracotta',
    button: 'bg-pm-terracotta hover:bg-pm-terracotta-hover text-white',
    check: 'text-pm-terracotta',
    badge: 'bg-pm-terracotta/10 text-pm-terracotta',
    price: 'text-pm-terracotta',
  },
  olive: {
    border: 'border-pm-olive/30 hover:border-pm-olive/60',
    borderHighlight: 'border-pm-olive',
    bg: 'bg-white',
    icon: 'bg-pm-olive/10 text-pm-olive',
    button: 'bg-pm-terracotta hover:bg-pm-terracotta-hover text-white',
    check: 'text-pm-olive',
    badge: 'bg-pm-olive/10 text-pm-olive',
    price: 'text-pm-olive',
  },
  sage: {
    border: 'border-pm-olive/30 hover:border-pm-olive/60',
    borderHighlight: 'border-pm-olive',
    bg: 'bg-white',
    icon: 'bg-pm-olive/10 text-pm-olive',
    button: 'bg-pm-olive hover:bg-pm-olive-dark text-white',
    check: 'text-pm-olive',
    badge: 'bg-pm-olive/10 text-pm-olive',
    price: 'text-pm-olive',
  },
};

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
          className="text-center max-w-3xl mx-auto mb-8"
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
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const colors = colorMap[plan.color];

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col rounded-xl border-2 ${
                  plan.highlighted ? colors.borderHighlight : colors.border
                } ${colors.bg} p-5 transition-all duration-300 ${
                  plan.highlighted ? 'md:-mt-2 md:pb-7 shadow-lg' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-semibold bg-pm-olive text-white rounded-full shadow-sm">
                      Mais Popular
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
                    <span className={`text-3xl font-bold ${colors.price}`}>
                      {plan.yearlyPrice}
                    </span>
                    <span className="text-sm text-text-muted">/ano</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {plan.monthlyEquivalent}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={`/checkout/${plan.id}`}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors mt-auto ${colors.button}`}
                >
                  Assinar {plan.name}
                </Link>
              </motion.div>
            );
          })}
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
                  <Factory className="w-6 h-6 text-pm-olive-light" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-1">
                    Enterprise
                  </h3>
                  <p className="text-white/80 text-sm">
                    Sua empresa tem mais de 400 colaboradores? Fale conosco e feche um plano personalizado.
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
