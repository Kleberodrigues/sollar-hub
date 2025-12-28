"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  DollarSign,
  Shield,
  Database,
  Server,
  Globe,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { PLAN_PRICES_ANNUAL_CENTS, PLAN_PRICES_MONTHLY_CENTS, formatCurrency } from "@/types/admin.types";

// Plan features configuration
const PLAN_FEATURES = {
  base: {
    name: "Base",
    price: PLAN_PRICES_ANNUAL_CENTS.base,
    monthlyPrice: PLAN_PRICES_MONTHLY_CENTS.base,
    features: [
      { name: "Até 50 colaboradores", included: true },
      { name: "1 avaliação por vez", included: true },
      { name: "Relatório básico", included: true },
      { name: "Suporte por email", included: true },
      { name: "Múltiplos departamentos", included: false },
      { name: "Relatório detalhado", included: false },
      { name: "API de integração", included: false },
    ],
  },
  intermediario: {
    name: "Intermediário",
    price: PLAN_PRICES_ANNUAL_CENTS.intermediario,
    monthlyPrice: PLAN_PRICES_MONTHLY_CENTS.intermediario,
    features: [
      { name: "Até 200 colaboradores", included: true },
      { name: "3 avaliações simultâneas", included: true },
      { name: "Relatório detalhado", included: true },
      { name: "Suporte prioritário", included: true },
      { name: "Múltiplos departamentos", included: true },
      { name: "Exportação PDF/Excel", included: true },
      { name: "API de integração", included: false },
    ],
  },
  avancado: {
    name: "Avançado",
    price: PLAN_PRICES_ANNUAL_CENTS.avancado,
    monthlyPrice: PLAN_PRICES_MONTHLY_CENTS.avancado,
    features: [
      { name: "Colaboradores ilimitados", included: true },
      { name: "Avaliações ilimitadas", included: true },
      { name: "Relatório executivo", included: true },
      { name: "Suporte dedicado", included: true },
      { name: "Múltiplos departamentos", included: true },
      { name: "Exportação completa", included: true },
      { name: "API de integração", included: true },
    ],
  },
};

// Platform info
const PLATFORM_INFO = {
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development",
  apiUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado" : "Não configurado",
  stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "Produção" : "Teste",
};

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pm-brown flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações da Plataforma
        </h1>
        <p className="text-text-muted mt-1">
          Visualize as configurações e informações da plataforma
        </p>
      </div>

      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status da Plataforma
          </CardTitle>
          <CardDescription>
            Informações sobre a infraestrutura e ambiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">Ambiente</span>
              </div>
              <Badge variant={PLATFORM_INFO.environment === "production" ? "success" : "warning"}>
                {PLATFORM_INFO.environment === "production" ? "Produção" : "Desenvolvimento"}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">Supabase</span>
              </div>
              <Badge variant={PLATFORM_INFO.supabaseUrl === "Configurado" ? "success" : "danger"}>
                {PLATFORM_INFO.supabaseUrl}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">Stripe</span>
              </div>
              <Badge variant={PLATFORM_INFO.stripeMode === "Produção" ? "success" : "warning"}>
                {PLATFORM_INFO.stripeMode}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">Versão</span>
              </div>
              <p className="font-medium text-pm-brown">{PLATFORM_INFO.version}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">URL da Aplicação</span>
              </div>
              <p className="font-mono text-sm text-pm-brown truncate">{PLATFORM_INFO.apiUrl}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Configurações de segurança da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <div>
                <p className="font-medium text-pm-brown">Row Level Security (RLS)</p>
                <p className="text-sm text-text-muted">Isolamento de dados por organização</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <div>
                <p className="font-medium text-pm-brown">Autenticação Supabase</p>
                <p className="text-sm text-text-muted">Login via email/senha</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <div>
                <p className="font-medium text-pm-brown">Super Admin Flag</p>
                <p className="text-sm text-text-muted">Campo is_super_admin em user_profiles</p>
              </div>
              <Badge variant="success">Configurado</Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-pm-brown">Webhooks Stripe</p>
                <p className="text-sm text-text-muted">Sincronização de pagamentos</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Planos e Preços
          </CardTitle>
          <CardDescription>
            Configuração dos planos disponíveis na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLAN_FEATURES).map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-xl border-2 p-5 ${
                  key === "avancado"
                    ? "border-pm-terracotta bg-pm-terracotta/5"
                    : "border-border-light"
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-pm-brown">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-pm-brown">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-text-muted">/ano</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    ou {formatCurrency(plan.monthlyPrice)}/mês
                  </p>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                      <span className={feature.included ? "text-pm-brown" : "text-text-muted"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integrações
          </CardTitle>
          <CardDescription>
            Serviços e APIs conectados à plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-pm-brown">Supabase</p>
                  <p className="text-sm text-text-muted">Banco de dados e autenticação</p>
                </div>
              </div>
              <Badge variant="success">Conectado</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-pm-olive/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-pm-olive" />
                </div>
                <div>
                  <p className="font-medium text-pm-brown">Stripe</p>
                  <p className="text-sm text-text-muted">Processamento de pagamentos</p>
                </div>
              </div>
              <Badge variant="success">Conectado</Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-pm-brown">Vercel</p>
                  <p className="text-sm text-text-muted">Hospedagem e deploy</p>
                </div>
              </div>
              <Badge variant="success">Conectado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
