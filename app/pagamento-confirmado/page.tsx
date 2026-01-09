"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { CheckCircle, Mail, Loader2, ArrowRight, PartyPopper, Sparkles } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti effect after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-sage to-bg-cream flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Confetti/celebration effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 animate-bounce delay-100">
            <Sparkles className="w-6 h-6 text-pm-gold opacity-60" />
          </div>
          <div className="absolute top-20 right-1/4 animate-bounce delay-300">
            <Sparkles className="w-8 h-8 text-pm-terracotta opacity-60" />
          </div>
          <div className="absolute top-16 left-1/3 animate-bounce delay-500">
            <Sparkles className="w-5 h-5 text-pm-olive opacity-60" />
          </div>
        </div>
      )}

      <Card className="w-full max-w-lg text-center shadow-xl border-0">
        <CardHeader className="pb-4 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>

          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 relative">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-pm-gold rounded-full flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
          </div>

          <CardTitle className="text-3xl text-green-700 mb-2">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-lg text-text-secondary">
            Sua assinatura do PsicoMapa foi ativada com sucesso.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          {/* Email notification - prominent */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-blue-800 text-lg mb-1">
                  Verifique seu email!
                </p>
                <p className="text-sm text-blue-700">
                  Enviamos um email de boas-vindas com o link para definir sua senha e acessar a plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="text-left space-y-4 bg-bg-cream/50 rounded-xl p-5">
            <p className="font-semibold text-text-heading flex items-center gap-2">
              <span className="w-6 h-6 bg-pm-olive rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </span>
              Proximos passos:
            </p>
            <ol className="space-y-3 text-sm text-text-secondary ml-2">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-pm-olive/20 text-pm-olive rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Abra seu email e procure por uma mensagem do <strong>PsicoMapa</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-pm-olive/20 text-pm-olive rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Clique no botao <strong>&quot;Definir Minha Senha&quot;</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-pm-olive/20 text-pm-olive rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Crie sua senha e acesse o <strong>dashboard</strong></span>
              </li>
            </ol>
          </div>

          {/* Spam notice */}
          <p className="text-xs text-text-muted bg-amber-50 border border-amber-200 rounded-lg p-3">
            <strong>Nao recebeu o email?</strong> Verifique sua pasta de spam ou lixo eletronico.
            O email pode levar ate 5 minutos para chegar.
          </p>

          {/* Session info for debugging (hidden in production) */}
          {sessionId && process.env.NODE_ENV === "development" && (
            <p className="text-xs text-text-muted font-mono bg-gray-100 p-2 rounded">
              Session: {sessionId.substring(0, 30)}...
            </p>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <Link href="/login" className="block">
              <Button className="w-full" size="lg">
                <Mail className="w-4 h-4 mr-2" />
                Ja defini minha senha - Fazer Login
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Voltar ao site
              </Button>
            </Link>
          </div>

          {/* Support */}
          <p className="text-xs text-text-muted pt-2">
            Precisa de ajuda? Entre em contato: <a href="mailto:suporte@psicomapa.cloud" className="text-pm-olive hover:underline">suporte@psicomapa.cloud</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-text-muted">
        <Logo size="lg" />
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Confirmando pagamento...</span>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoConfirmadoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
