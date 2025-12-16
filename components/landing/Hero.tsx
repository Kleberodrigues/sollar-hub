'use client';

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Shield,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SunIcon } from "@/components/Logo";

// Data for each risk level
const riskData = {
  low: {
    title: "Baixo Risco",
    percentage: "72%",
    trend: "+5%",
    trendDirection: "up" as const,
    description: "108 colaboradores em zona segura",
    categories: [
      { name: "Liderança", score: 4.1, color: "bg-green-500" },
      { name: "Relações", score: 4.5, color: "bg-green-500" },
      { name: "Autonomia", score: 3.8, color: "bg-green-400" },
      { name: "Equilíbrio", score: 4.2, color: "bg-green-500" },
    ],
  },
  medium: {
    title: "Risco Médio",
    percentage: "21%",
    trend: "-2%",
    trendDirection: "down" as const,
    description: "32 colaboradores precisam atenção",
    categories: [
      { name: "Demandas", score: 3.2, color: "bg-yellow-500" },
      { name: "Clareza", score: 2.8, color: "bg-yellow-500" },
      { name: "Mudanças", score: 3.0, color: "bg-yellow-400" },
      { name: "Comunicação", score: 2.9, color: "bg-yellow-500" },
    ],
  },
  high: {
    title: "Alto Risco",
    percentage: "7%",
    trend: "-1%",
    trendDirection: "down" as const,
    description: "10 colaboradores em risco crítico",
    categories: [
      { name: "Sobrecarga", score: 4.2, color: "bg-red-500" },
      { name: "Assédio", score: 3.8, color: "bg-red-400" },
      { name: "Violência", score: 3.5, color: "bg-red-400" },
      { name: "Estresse", score: 4.0, color: "bg-red-500" },
    ],
  },
  default: {
    title: "Visão Geral",
    percentage: "150",
    trend: "total",
    trendDirection: "up" as const,
    description: "Colaboradores avaliados",
    categories: [
      { name: "Demandas", score: 3.2, color: "bg-pm-terracotta" },
      { name: "Autonomia", score: 2.5, color: "bg-yellow-500" },
      { name: "Liderança", score: 4.1, color: "bg-green-500" },
      { name: "Relações", score: 4.5, color: "bg-pm-olive" },
    ],
  },
};

type RiskLevel = "low" | "medium" | "high" | "default";

export function Hero() {
  const [hoveredRisk, setHoveredRisk] = useState<RiskLevel>("default");
  const currentData = riskData[hoveredRisk];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-sage via-white to-[#fff5e9]">
        {/* Decorative sun pattern */}
        <div className="absolute top-20 right-10 opacity-[0.15]">
          <SunIcon size={400} className="text-pm-terracotta" />
        </div>
        <div className="absolute bottom-20 left-10 opacity-5">
          <SunIcon size={300} className="text-pm-olive" />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pm-olive/10 rounded-full text-pm-olive text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-pm-olive rounded-full animate-pulse" />
              Conforme NR-1 e NR-17
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-heading leading-tight mb-6">
              Diagnóstico de{" "}
              <span className="text-pm-terracotta">Riscos Psicossociais</span>{" "}
              para sua Organização
            </h1>

            <p className="text-lg md:text-xl text-text-secondary mb-4 max-w-xl mx-auto lg:mx-0">
              Plataforma completa para aplicar diagnósticos, analisar resultados
              e gerar relatórios executivos em poucos cliques.
            </p>

            {/* Slogan */}
            <p className="text-pm-olive font-medium mb-8 flex items-center justify-center lg:justify-start gap-2">
              <SunIcon size={20} className="text-pm-terracotta" />
              mapeando o bem-estar &bull; transformando organizações
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-pm-terracotta hover:bg-pm-terracotta-hover text-lg px-8 py-6"
                asChild
              >
                <Link href="/register">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pm-olive text-pm-olive hover:bg-pm-olive hover:text-white text-lg px-8 py-6"
                asChild
              >
                <Link href="/sobre">
                  <Play className="mr-2 w-5 h-5" />
                  Ver Demonstração
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Illustration / Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Dashboard mockup - Enterprise Version */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SunIcon size={24} className="text-pm-terracotta" />
                    <span className="font-semibold text-gray-800 text-sm">Dashboard NR-1</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-gray-500">Ao Vivo</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pm-terracotta to-pm-terracotta-600 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">KR</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-5 space-y-4">
                  {/* Risk Metric Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Low Risk Card */}
                    <div
                      onMouseEnter={() => setHoveredRisk("low")}
                      onMouseLeave={() => setHoveredRisk("default")}
                      className={`bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-3 border-2 cursor-pointer transition-all duration-200 ${
                        hoveredRisk === "low" ? "border-green-400 shadow-lg shadow-green-200/50 scale-105 z-10" : "border-green-200/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Baixo Risco</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700 mb-1">72%</div>
                      <div className="w-full h-1.5 bg-green-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "72%" }} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>+5%</span>
                      </div>
                    </div>

                    {/* Medium Risk Card */}
                    <div
                      onMouseEnter={() => setHoveredRisk("medium")}
                      onMouseLeave={() => setHoveredRisk("default")}
                      className={`bg-gradient-to-br from-yellow-50 to-amber-100/50 rounded-xl p-3 border-2 cursor-pointer transition-all duration-200 ${
                        hoveredRisk === "medium" ? "border-yellow-400 shadow-lg shadow-yellow-200/50 scale-105 z-10" : "border-yellow-200/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">Médio</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-700 mb-1">21%</div>
                      <div className="w-full h-1.5 bg-yellow-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: "21%" }} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <TrendingDown className="w-3 h-3" />
                        <span>-2%</span>
                      </div>
                    </div>

                    {/* High Risk Card */}
                    <div
                      onMouseEnter={() => setHoveredRisk("high")}
                      onMouseLeave={() => setHoveredRisk("default")}
                      className={`bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-3 border-2 cursor-pointer transition-all duration-200 ${
                        hoveredRisk === "high" ? "border-red-400 shadow-lg shadow-red-200/50 scale-105 z-10" : "border-red-200/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Alto</span>
                      </div>
                      <div className="text-2xl font-bold text-red-700 mb-1">7%</div>
                      <div className="w-full h-1.5 bg-red-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: "7%" }} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <TrendingDown className="w-3 h-3" />
                        <span>-1%</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Category Chart */}
                  <div
                    className={`rounded-xl p-4 border transition-colors duration-300 ${
                      hoveredRisk === "low" ? "bg-green-50/80 border-green-200" :
                      hoveredRisk === "medium" ? "bg-yellow-50/80 border-yellow-200" :
                      hoveredRisk === "high" ? "bg-red-50/80 border-red-200" :
                      "bg-gray-50/80 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-gray-700">
                        {hoveredRisk === "default" ? "Pontuação por Categoria" : currentData.title}
                      </div>
                      {hoveredRisk !== "default" && (
                        <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                          hoveredRisk === "low" ? "bg-green-200 text-green-700" :
                          hoveredRisk === "medium" ? "bg-yellow-200 text-yellow-700" :
                          "bg-red-200 text-red-700"
                        }`}>
                          {currentData.description}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {currentData.categories.map((item) => (
                        <div key={`${hoveredRisk}-${item.name}`} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-20 truncate">{item.name}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} rounded-full transition-all duration-300`}
                              style={{ width: `${(item.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-6">{item.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Last Assessment Card */}
                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-pm-olive" />
                        <span className="text-xs font-medium text-gray-600">Última Avaliação</span>
                      </div>
                      <div className="text-sm font-bold text-gray-800">12 Dez 2024</div>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Concluída</span>
                      </div>
                    </div>

                    {/* Participation Card */}
                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-pm-terracotta" />
                        <span className="text-xs font-medium text-gray-600">Participação</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Mini donut chart */}
                        <div className="relative w-10 h-10">
                          <svg className="w-10 h-10 transform -rotate-90">
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="4"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              fill="none"
                              stroke="#789750"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray="100.53"
                              strokeDashoffset={100.53 * 0.15}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">85%</span>
                        </div>
                        <div className="text-xs text-gray-500">127/150<br/>respostas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
