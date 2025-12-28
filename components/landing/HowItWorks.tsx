'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PenTool, Send, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Send,
    title: "Envie o questionário",
    description:
      "Envie o link do questionário para sua equipe em poucos cliques. Sem instalação, 100% online.",
  },
  {
    number: "02",
    icon: PenTool,
    title: "Colaboradores respondem",
    description:
      "Eles respondem em 15–20 minutos, de forma anônima e segura. Você acompanha a participação em tempo real.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Receba os resultados",
    description:
      "A partir das respostas, você recebe dashboards e relatórios de forma automática em até 24 horas.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="como-funciona" className="py-12 lg:py-16 bg-white scroll-mt-20" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-6"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-text-secondary">
            Em três passos simples, você terá um diagnóstico completo da saúde
            organizacional da sua empresa.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line (desktop) */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-pm-olive via-pm-terracotta to-pm-green-dark" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Step Number Circle */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-white border-4 border-pm-olive rounded-full flex items-center justify-center shadow-lg relative z-20">
                    <Icon className="w-8 h-8 text-pm-olive" />
                  </div>
                  <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/3 w-12 h-12 bg-pm-terracotta text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg z-10">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-text-heading mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary max-w-xs mx-auto">
                  {step.description}
                </p>

                {/* Arrow (mobile) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-6">
                    <ArrowRight className="w-6 h-6 text-pm-olive rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-pm-terracotta font-medium mt-10"
        >
          Nada de planilhas. Nada de análise manual. Nada de esperar semanas.
        </motion.p>
      </div>
    </section>
  );
}
