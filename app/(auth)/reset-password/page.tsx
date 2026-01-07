"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const supabase = createClient();

  // Função para verificar autenticação
  const checkAuth = useCallback(async () => {
    setChecking(true);

    try {
      // 1. Verificar se já existe uma sessão válida (pode ter sido estabelecida pelo hash)
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidToken(true);
        setError(null);
        setChecking(false);
        return;
      }

      // 2. Verificar hash fragment (onde o Supabase envia o token)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (accessToken && type === "recovery") {
          // Token encontrado no hash - o Supabase deve processar automaticamente
          // Aguardar um momento para o Supabase processar o hash
          await new Promise(resolve => setTimeout(resolve, 500));

          // Verificar sessão novamente
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession) {
            setIsValidToken(true);
            setError(null);
            setChecking(false);
            return;
          }
        }
      }

      // 3. Verificar query params como fallback
      const accessToken = searchParams.get("access_token");
      if (accessToken) {
        setIsValidToken(true);
        setError(null);
        setChecking(false);
        return;
      }

      // Nenhum token válido encontrado
      setError("Link de recuperação inválido ou expirado. Solicite um novo link.");
      setIsValidToken(false);
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setError("Erro ao verificar link de recuperação.");
      setIsValidToken(false);
    } finally {
      setChecking(false);
    }
  }, [supabase, searchParams]);

  // Verificar autenticação e ouvir eventos de recuperação de senha
  useEffect(() => {
    checkAuth();

    // Ouvir eventos de autenticação (incluindo PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidToken(true);
        setError(null);
        setChecking(false);
      } else if (event === "SIGNED_IN" && session) {
        setIsValidToken(true);
        setError(null);
        setChecking(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações client-side
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setPasswordMatch(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Atualizar senha do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setError(
        message ||
          "Erro ao redefinir senha. O link pode ter expirado. Tente solicitar um novo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Estado de verificação inicial
  if (checking) {
    return (
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verificando Link...</CardTitle>
            <CardDescription>
              Aguarde enquanto validamos seu link de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pm-green-dark"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-risk-low-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-risk-low"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi atualizada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-text-secondary mb-4">
              Você será redirecionado para o dashboard em instantes...
            </p>
            <p className="text-xs text-text-muted">
              Ou clique no botão abaixo para ir agora
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/dashboard">Ir para Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Nova Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-risk-high-bg border border-risk-high-border rounded-md">
                <p className="text-sm text-risk-high">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setPasswordMatch(true);
                }}
                disabled={loading || !isValidToken}
              />
              <p className="text-xs text-text-muted">
                Escolha uma senha forte com pelo menos 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite novamente"
                required
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  });
                  setPasswordMatch(true);
                }}
                disabled={loading || !isValidToken}
                className={!passwordMatch ? "border-risk-high" : ""}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !isValidToken}
            >
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Link
            href="/login"
            className="text-sm text-pm-green-dark hover:text-pm-green-dark-hover transition-sollar"
          >
            ← Voltar para Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Carregando...</CardTitle>
          <CardDescription>
            Aguarde enquanto preparamos a página
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pm-green-dark"></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6">
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
