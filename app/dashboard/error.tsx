"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard error:", error);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-risk-medium-bg rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-risk-medium" />
          </div>
          <CardTitle className="text-xl text-text-heading">
            Erro no Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-text-secondary text-center">
            Ocorreu um erro ao carregar esta seção. Tente atualizar a página ou
            volte para o dashboard principal.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-700 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1" variant="primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="flex-1"
              variant="outline"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
