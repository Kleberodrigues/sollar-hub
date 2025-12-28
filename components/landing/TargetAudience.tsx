'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  TrendingDown,
  AlertTriangle,
  Users,
  Clock,
  HelpCircle,
  Timer,
  Target,
  BarChart3,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const painPoints = [
  {
    icon: TrendingDown,
    text: "Turnover alto — e o custo real vai muito além da rescisão",
  },
  {
    icon: AlertTriangle,
    text: "Riscos e processos trabalhistas que poderiam ser evitados",
  },
  {
    icon: Users,
    text: "Liderança sem preparo gerando conflitos, retrabalho e desgaste",
  },
  {
    icon: Clock,
    text: "RH no modo emergência, sem tempo para atuar no estratégico",
  },
  {
    icon: HelpCircle,
    text: "Falta de dados confiáveis — decisões no \"achismo\"",
  },
  {
    icon: Timer,
    text: "Pesquisas tradicionais de clima demorando semanas para sair",
  },
];

const audiences = [
  {
    title: "RHs e CEOs",
    subtitle: "Ideal para empresas que precisam de:",
    color: "pm-terracotta",
    benefits: [
      { icon: Target, text: "Clareza rápida" },
      { icon: BarChart3, text: "Diagnósticos recorrentes" },
      { icon: CheckCircle, text: "Decisões baseadas em dados" },
      { icon: MessageSquare, text: "Comunicação assertiva" },
      { icon: Shield, text: "Prevenção de riscos" },
    ],
  },
  {
    title: "Consultores",
    subtitle: "Perfeito para quem precisa entregar diagnósticos confiáveis e profissionais.",
    color: "pm-olive",
    benefits: [
      { icon: Zap, text: "Velocidade" },
      { icon: FileText, text: "Padronização" },
      { icon: BarChart3, text: "Entrega automática" },
    ],
  },
];

export function TargetAudience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="para-quem" className="py-12 lg:py-16 bg-white scroll-mt-20" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Pain Points Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-6">
            Se você cuida de <span className="text-pm-terracotta">pessoas e resultados</span>,
            <br />talvez reconheça estes sinais:
          </h2>
        </motion.div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full border-l-4 border-l-red-400 bg-red-50/30 hover:bg-red-50/50 transition-colors">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">
                      {point.text}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center pt-6 pb-12 lg:pt-8 lg:pb-16"
        >
          <blockquote className="text-xl md:text-2xl font-display font-semibold text-pm-olive italic">
            &ldquo;Um único desligamento pode custar mais do que meses de prevenção.&rdquo;
          </blockquote>
        </motion.div>

        {/* For Whom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mb-10"
        >
          <h3 className="font-display text-2xl md:text-3xl font-bold text-text-heading">
            Para quem é o <span className="text-pm-terracotta">PsicoMapa</span>?
          </h3>
        </motion.div>

        {/* Audience Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <Card className={`h-full border-t-4 ${
                audience.color === "pm-terracotta"
                  ? "border-t-pm-terracotta bg-gradient-to-b from-pm-terracotta/5 to-white"
                  : "border-t-pm-olive bg-gradient-to-b from-pm-olive/5 to-white"
              }`}>
                <CardContent className="p-6">
                  <h4 className={`font-display text-xl font-bold mb-2 ${
                    audience.color === "pm-terracotta" ? "text-pm-terracotta" : "text-pm-olive"
                  }`}>
                    {audience.title}
                  </h4>
                  <p className="text-text-secondary text-sm mb-4">
                    {audience.subtitle}
                  </p>
                  <ul className="space-y-2">
                    {audience.benefits.map((benefit, i) => {
                      const BenefitIcon = benefit.icon;
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <BenefitIcon className={`w-4 h-4 ${
                            audience.color === "pm-terracotta" ? "text-pm-terracotta" : "text-pm-olive"
                          }`} />
                          <span className="text-text-primary text-sm">{benefit.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
