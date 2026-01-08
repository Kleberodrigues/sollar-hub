"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { CheckCircle, Loader2, PartyPopper } from "lucide-react";

function SetPasswordForm() {
  const router = useRouter();
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
  // Suporta tanto PKCE (sessão via cookies) quanto implicit flow (hash fragments)
  const checkAuth = useCallback(async () => {
    setChecking(true);

    try {
      // 1. Primeiro verificar se já existe sessão (PKCE flow - veio do /auth/callback)
      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (existingSession) {
        console.log("Sessão válida encontrada via cookies!");
        setIsValidToken(true);
        setError(null);
        setChecking(false);
        return;
      }

      // 2. Verificar hash fragment (implicit flow - veio direto do email)
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        console.log("Hash encontrado:", { hasAccessToken: !!accessToken, type });

        if (accessToken && type === "recovery") {
          console.log("Token de recuperação encontrado no hash, estabelecendo sessão...");

          // Estabelecer sessão com os tokens do hash
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || accessToken,
          });

          if (data.session && !sessionError) {
            console.log("Sessão estabelecida com sucesso!");
            setIsValidToken(true);
            setError(null);
            // Limpar hash da URL
            window.history.replaceState(null, "", window.location.pathname);
            setChecking(false);
            return;
          } else {
            console.error("Erro ao estabelecer sessão:", sessionError?.message);
          }
        }
      }

      // 3. Nenhum método funcionou
      console.log("Nenhuma sessão ou token válido encontrado");
      setError("Link inválido ou expirado. Verifique seu email para um novo link.");
      setIsValidToken(false);
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setError("Erro ao verificar link.");
      setIsValidToken(false);
    } finally {
      setChecking(false);
    }
  }, [supabase]);

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
          "Erro ao definir senha. O link pode ter expirado."
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
            <CardTitle className="text-2xl">Verificando...</CardTitle>
            <CardDescription>
              Aguarde enquanto validamos seu acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pm-olive" />
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Tudo Pronto!</CardTitle>
            <CardDescription>
              Sua conta está configurada e pronta para uso
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-text-secondary mb-4">
              Você será redirecionado para o dashboard em instantes...
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/dashboard">Acessar Dashboard</Link>
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
          <div className="w-16 h-16 bg-pm-olive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-pm-olive" />
          </div>
          <CardTitle className="text-3xl">Bem-vindo ao PsicoMapa!</CardTitle>
          <CardDescription>
            Sua assinatura está ativa. Defina uma senha para acessar sua conta.
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
              <Label htmlFor="password">Criar Senha</Label>
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
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
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
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Configurando...
                </>
              ) : (
                "Definir Senha e Acessar"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-xs text-text-muted text-center">
            Ao definir sua senha, você terá acesso completo à plataforma PsicoMapa.
          </p>
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
          <Loader2 className="h-8 w-8 animate-spin text-pm-olive" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6">
      <Suspense fallback={<LoadingFallback />}>
        <SetPasswordForm />
      </Suspense>
    </div>
  );
}
