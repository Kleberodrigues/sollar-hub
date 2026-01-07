'use client';
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  BarChart3,
  Users,
  Plus,
  ArrowRight,
  Target
} from "lucide-react";
interface DashboardMetrics {
  questionnairesCount?: number; // deprecated - not shown
  assessmentsCount: number;
  responsesCount: number;
  teamCount: number;
}
interface UserProfile {
  full_name: string;
  role: string;
  created_at: string;
  organizations?: {
    name: string;
  };
}
interface DashboardContentProps {
  metrics: DashboardMetrics;
  profile: UserProfile | null;
  userEmail: string;
}
const metricsConfig = [
  {
    key: "assessmentsCount",
    title: "Avaliações Ativas",
    icon: ClipboardList,
    color: "text-pm-terracotta",
    bgColor: "bg-pm-terracotta/10",
    borderColor: "hover:border-pm-terracotta",
  },
  {
    key: "responsesCount",
    title: "Respostas Coletadas",
    icon: BarChart3,
    color: "text-pm-green-dark",
    bgColor: "bg-pm-green-dark/10",
    borderColor: "hover:border-pm-green-dark",
  },
  {
    key: "teamCount",
    title: "Membros da Equipe",
    icon: Users,
    color: "text-pm-olive-light",
    bgColor: "bg-pm-olive-light/10",
    borderColor: "hover:border-pm-olive-light",
  },
];
export function DashboardContent({ metrics, profile, userEmail }: DashboardContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  const firstName = profile?.full_name?.split(" ")[0] || "Usuário";
  return (
    <div ref={ref} className="p-6 pb-12 space-y-8 flex-1 bg-white/50">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-bg-sage via-white to-[#fff5e9] rounded-2xl p-8 border border-border-light"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-text-heading">
              {getGreeting()}, {firstName}!
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              Acompanhe a saúde organizacional da sua empresa
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-white"
            >
              <Link href="/dashboard/assessments/new">
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-pm-olive text-pm-olive hover:bg-pm-olive/10"
            >
              <Link href="/dashboard/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Análises
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricsConfig.map((metric, index) => {
          const Icon = metric.icon;
          const value = metrics[metric.key as keyof DashboardMetrics] || 0;
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`group transition-all duration-300 hover:shadow-lg border-2 border-transparent ${metric.borderColor}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-muted">
                        {metric.title}
                      </p>
                      <p className="text-4xl font-bold text-text-heading mt-2">
                        {value}
                      </p>
                    </div>
                    <div
                      className={`w-14 h-14 rounded-xl ${metric.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                    >
                      <Icon className={`w-7 h-7 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="h-full border-l-4 border-l-pm-olive bg-gradient-to-r from-white to-bg-sage/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl text-text-heading">
                <Target className="w-5 h-5 text-pm-olive" />
                Primeiros Passos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {[
                  "Escolha qual pesquisa você gostaria de ativar: Fatores de Riscos Psicossociais ou Clima Mensal",
                  "Selecione os participantes que irão receber o e-mail",
                  "Envie o convite do questionário automaticamente",
                  "Acompanhe as respostas e análises de riscos",
                  "Crie e edite as ações do Plano de Ação",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pm-olive/10 text-pm-olive flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Button
                asChild
                variant="link"
                className="mt-4 p-0 text-pm-terracotta hover:text-pm-terracotta-hover"
              >
                <Link href="/dashboard/assessments/new">
                  Começar agora <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
        </Card>
      </motion.div>
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-white to-bg-sage/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl text-text-heading">
              <Users className="w-5 h-5 text-pm-olive" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { label: "Nome", value: profile?.full_name },
                { label: "Email", value: userEmail },
                { label: "Perfil de Acesso", value: profile?.role, capitalize: true },
                { label: "Organização", value: profile?.organizations?.name },
                {
                  label: "Membro desde",
                  value: profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("pt-BR")
                    : "-"
                },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className={`text-sm font-medium text-text-primary mt-1 ${item.capitalize ? "capitalize" : ""}`}>
                    {item.value || "-"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
