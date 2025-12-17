"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-pm-terracotta" />
        </div>
        <h2 className="text-xl font-semibold text-pm-brown mb-2">
          Algo deu errado
        </h2>
        <p className="text-text-muted mb-6">
          Ocorreu um erro ao carregar o painel administrativo. Por favor, tente
          novamente.
        </p>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
        {error.digest && (
          <p className="text-xs text-text-muted mt-4">
            Código do erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
