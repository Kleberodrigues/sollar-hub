'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ClipboardList,
  BarChart3,
  FileText,
  Shield,
  Bell,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: ClipboardList,
    title: "Diagnósticos Personalizados",
    description:
      "Crie diagnósticos NR-1, pulse surveys ou questionários customizados para sua realidade organizacional.",
    color: "pm-olive",
  },
  {
    icon: BarChart3,
    title: "Análise em Tempo Real",
    description:
      "Visualize resultados instantaneamente, identifique riscos e tome decisões baseadas em dados confiáveis.",
    color: "pm-terracotta",
  },
  {
    icon: FileText,
    title: "Relatórios Automáticos",
    description:
      "Gere relatórios executivos em PDF com gráficos, métricas e recomendações em poucos cliques.",
    color: "pm-green-dark",
  },
  {
    icon: Shield,
    title: "Privacidade Garantida",
    description:
      "Respostas anônimas com criptografia de ponta a ponta. Conformidade total com LGPD.",
    color: "pm-olive",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description:
      "Receba notificações automáticas quando indicadores de risco ultrapassarem limites definidos.",
    color: "pm-terracotta",
  },
  {
    icon: Zap,
    title: "Integração Fácil",
    description:
      "Conecte com suas ferramentas favoritas via webhooks e API. Automatize fluxos de trabalho.",
    color: "pm-green-dark",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  "pm-olive": {
    bg: "bg-pm-olive/10",
    text: "text-pm-olive",
    border: "group-hover:border-pm-olive",
  },
  "pm-terracotta": {
    bg: "bg-pm-terracotta/10",
    text: "text-pm-terracotta",
    border: "group-hover:border-pm-terracotta",
  },
  "pm-green-dark": {
    bg: "bg-pm-green-dark/10",
    text: "text-pm-green-dark",
    border: "group-hover:border-pm-green-dark",
  },
};

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-bg-sage" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
            Tudo que você precisa para gerenciar{" "}
            <span className="text-pm-terracotta">riscos psicossociais</span>
          </h2>
          <p className="text-lg text-text-secondary">
            Uma plataforma completa para diagnosticar, analisar e agir sobre a
            saúde mental e bem-estar dos seus colaboradores.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`group h-full transition-all duration-300 hover:shadow-lg border-2 border-transparent ${colors.border}`}
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                    >
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <CardTitle className="font-display text-xl mb-2 text-text-heading">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base text-text-secondary">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
