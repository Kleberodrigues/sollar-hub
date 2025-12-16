"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, etc.)
    // For now, just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-risk-high-bg rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-risk-high" />
          </div>
          <CardTitle className="text-2xl text-text-heading">
            Algo deu errado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-text-secondary text-center">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e está
            trabalhando para resolver o problema.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1" variant="primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              className="flex-1"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
