"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";

function CanceladoContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "base";

  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription>
            O processo de pagamento foi interrompido. Nenhuma cobrança foi realizada.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-text-muted">
            Se você teve algum problema ou dúvida durante o checkout,
            entre em contato conosco pelo email{" "}
            <a
              href="mailto:suporte@sollartreinamentos.com.br"
              className="text-pm-olive hover:underline"
            >
              suporte@sollartreinamentos.com.br
            </a>
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <Link href={`/checkout/${plan}`}>
              <Button className="w-full">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </Link>

            <Link href="/#planos">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver Outros Planos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutCanceladoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-sage flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Carregando...</div>
      </div>
    }>
      <CanceladoContent />
    </Suspense>
  );
}
