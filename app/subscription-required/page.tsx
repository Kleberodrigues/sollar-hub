"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle, CreditCard, LogOut, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SubscriptionRequiredPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-700">
            Assinatura Necessária
          </CardTitle>
          <CardDescription className="text-base">
            Para acessar o dashboard do PsicoMapa, você precisa ter uma assinatura ativa.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Sua assinatura expirou ou foi cancelada</p>
                <p>
                  Para continuar usando o PsicoMapa, escolha um plano e realize o pagamento.
                  Todos os seus dados estão salvos e serão restaurados assim que você assinar.
                </p>
              </div>
            </div>
          </div>

          {/* Plans summary */}
          <div className="text-left space-y-2">
            <p className="font-medium text-text-heading">Nossos planos:</p>
            <ul className="space-y-1 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pm-terracotta rounded-full"></span>
                <span><strong>Base</strong> - 50 a 120 colaboradores - R$ 3.970/ano</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pm-olive rounded-full"></span>
                <span><strong>Intermediário</strong> - 121 a 250 colaboradores - R$ 4.970/ano</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pm-olive rounded-full"></span>
                <span><strong>Avançado</strong> - 251 a 400 colaboradores - R$ 5.970/ano</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex-col space-y-3">
          <Link href="/#planos" className="w-full">
            <Button className="w-full" size="lg">
              <ArrowRight className="w-4 h-4 mr-2" />
              Ver Planos e Assinar
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>

          <p className="text-xs text-text-muted pt-2">
            Dúvidas? Entre em contato pelo email{" "}
            <a href="mailto:suporte@psicomapa.cloud" className="text-pm-olive hover:underline">
              suporte@psicomapa.cloud
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
