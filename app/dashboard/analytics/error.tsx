"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, RefreshCw, LayoutDashboard } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalyticsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    if (process.env.NODE_ENV === "development") {
      console.error("Analytics error:", error);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-risk-medium-bg rounded-full w-fit">
            <BarChart3 className="h-8 w-8 text-risk-medium" />
          </div>
          <CardTitle className="text-xl text-text-heading">
            Erro nos Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-text-secondary text-center">
            Não foi possível carregar os dados de analytics. Isso pode ser
            temporário, tente novamente em alguns instantes.
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
              Recarregar dados
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
