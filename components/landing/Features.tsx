'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Relatórios Automáticos",
    description:
      "Dashboards + relatórios interpretados automaticamente, com indicadores críticos destacados. Tudo pronto em até 24 horas.",
    color: "pm-terracotta",
  },
  {
    icon: Shield,
    title: "Totalmente Anônimo e Seguro",
    description:
      "Sem identificação individual. Dados agregados por áreas e sem visualização de respostas abertas por relatório. Conformidade LGPD.",
    color: "pm-olive",
  },
  {
    icon: Sparkles,
    title: "Interface Simples",
    description:
      "Você entende tudo rapidamente, mesmo sem experiência. Zero curva de aprendizado, resultados imediatos.",
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
    <section className="py-12 lg:py-16 bg-bg-sage" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-6"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
            Por que escolher o{" "}
            <span className="text-pm-terracotta">PsicoMapa</span>?
          </h2>
          <p className="text-lg text-text-secondary">
            Simplicidade, segurança e resultados automáticos para sua organização.
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

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-lg px-8 py-6"
            asChild
          >
            <Link href="/#planos">
              Comece Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
