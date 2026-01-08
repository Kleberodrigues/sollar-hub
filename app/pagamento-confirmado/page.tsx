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
import { CheckCircle, Mail, Loader2, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer for visual feedback
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-base">
            Sua assinatura do PsicoMapa foi ativada com sucesso.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email notification */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold text-blue-800 mb-1">
                  Verifique seu email
                </p>
                <p className="text-sm text-blue-700">
                  Enviamos um link para você definir sua senha e acessar a plataforma.
                  O email pode levar alguns minutos para chegar.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="text-left space-y-3">
            <p className="font-medium text-text-heading">Próximos passos:</p>
            <ol className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-pm-olive text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <span>Abra seu email e procure por uma mensagem do PsicoMapa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-pm-olive text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <span>Clique no link para definir sua senha</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-pm-olive text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                <span>Acesse o dashboard e comece a usar o PsicoMapa</span>
              </li>
            </ol>
          </div>

          {/* Spam notice */}
          <p className="text-xs text-text-muted">
            Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.
            Se ainda não encontrar, entre em contato com nosso suporte.
          </p>

          {/* Session info for debugging (hidden in production) */}
          {sessionId && process.env.NODE_ENV === "development" && (
            <p className="text-xs text-text-muted font-mono">
              Session: {sessionId.substring(0, 20)}...
            </p>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <Link href="/login" className="block">
              <Button className="w-full" size="lg">
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para Login
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Voltar ao site
              </Button>
            </Link>
          </div>

          {/* Visual countdown */}
          {countdown > 0 && (
            <p className="text-xs text-text-muted flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processando sua conta...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
      <div className="flex items-center gap-2 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Carregando...</span>
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
