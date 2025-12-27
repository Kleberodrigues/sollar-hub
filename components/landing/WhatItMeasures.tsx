'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Activity,
  Compass,
  Award,
  Users,
  Scale,
  ShieldAlert,
  Smile,
  MessageCircle,
  Gauge,
  Lock,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const psychosocialRisks = [
  {
    icon: Activity,
    title: "Demandas e Ritmo de Trabalho",
    description: "Avalia sobrecarga, pressão por prazos e intensidade do trabalho",
  },
  {
    icon: Compass,
    title: "Autonomia, Clareza e Mudanças",
    description: "Mede liberdade para decidir, clareza de funções e adaptação a mudanças",
  },
  {
    icon: Award,
    title: "Liderança e Reconhecimento",
    description: "Analisa qualidade da gestão, feedback e valorização profissional",
  },
  {
    icon: Users,
    title: "Relações, Clima e Comunicação",
    description: "Examina relacionamentos interpessoais e fluxo de informações",
  },
  {
    icon: Scale,
    title: "Equilíbrio Trabalho–Vida e Saúde",
    description: "Identifica impactos na vida pessoal e bem-estar físico/mental",
  },
  {
    icon: ShieldAlert,
    title: "Violência, Assédio e Medo de Repressão",
    description: "Detecta situações de risco, intimidação e insegurança",
  },
];

const climateFactors = [
  { icon: Smile, title: "Satisfação", description: "Nível de contentamento geral" },
  { icon: MessageCircle, title: "Comunicação", description: "Clareza e transparência" },
  { icon: Gauge, title: "Carga de Trabalho", description: "Volume e distribuição" },
  { icon: Lock, title: "Segurança Psicológica", description: "Liberdade para se expressar" },
  { icon: UserCheck, title: "Liderança", description: "Qualidade da gestão" },
];

export function WhatItMeasures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="o-que-mede" className="py-24 bg-bg-sage scroll-mt-20" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
            O que o <span className="text-pm-terracotta">PsicoMapa</span> mede?
          </h2>
          <p className="text-lg text-text-secondary">
            Duas abordagens complementares para um diagnóstico completo da saúde organizacional.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Psychosocial Risks Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-t-4 border-t-pm-terracotta">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl text-pm-terracotta flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6" />
                  Diagnóstico de Riscos Psicossociais
                </CardTitle>
                <p className="text-sm text-text-muted">
                  Baseado no COPSOQ II-BR — Referência internacional
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {psychosocialRisks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/60 hover:bg-white transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-pm-terracotta/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-pm-terracotta" />
                      </div>
                      <div>
                        <h4 className="font-medium text-text-heading text-sm">
                          {item.title}
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Climate Survey Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full border-t-4 border-t-pm-olive">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl text-pm-olive flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Pesquisa de Clima Contínua
                </CardTitle>
                <p className="text-sm text-text-muted">
                  Acompanhamento bimestral do clima organizacional
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {climateFactors.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/60 hover:bg-white transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-pm-olive/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-pm-olive" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-text-heading text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-text-muted">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Highlight Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-pm-olive/10 to-pm-olive/5 border border-pm-olive/20">
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold text-pm-olive">Relatórios bimestrais</span> que
                    acompanham a evolução do clima e identificam tendências antes que se tornem problemas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-text-secondary">
            Todos os diagnósticos geram{" "}
            <span className="font-semibold text-pm-terracotta">dashboards automáticos</span> e{" "}
            <span className="font-semibold text-pm-olive">relatórios interpretados</span> em até 24 horas.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
