"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setError(
        message || "Erro ao enviar email de recuperação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6">
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
              <CardTitle className="text-2xl">Email Enviado!</CardTitle>
              <CardDescription>
                Verifique sua caixa de entrada e spam
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-text-secondary mb-4">
                Enviamos um link de recuperação de senha para:
              </p>
              <p className="text-base font-medium text-text-primary mb-6">
                {email}
              </p>
              <p className="text-sm text-text-muted">
                O link expira em 1 hora. Se não receber o email, verifique sua
                pasta de spam.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Voltar para Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber um link de recuperação
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-text-muted">
                  Enviaremos um link para redefinir sua senha
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
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
    </div>
  );
}
