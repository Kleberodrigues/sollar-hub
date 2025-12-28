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
  Info,
} from "lucide-react";

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
