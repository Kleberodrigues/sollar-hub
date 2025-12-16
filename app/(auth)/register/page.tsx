"use client";

import { useState } from "react";
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
import { registerUser } from "./actions";
import { registerSchema } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validação de senhas iguais
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setPasswordMatch(false);
      setLoading(false);
      return;
    }

    // Validação Zod client-side
    const validation = registerSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: password,
      organizationName: formData.get("organizationName"),
      industry: formData.get("industry") || "",
      size: formData.get("size") || "",
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(formData);

      if (result.error) {
        setError(result.error);
      } else {
        // Sucesso - redirecionar
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Criar Conta</CardTitle>
            <CardDescription>
              Comece a usar o Sollar Insight Hub gratuitamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-risk-high-bg border border-risk-high-border rounded-md">
                  <p className="text-sm text-risk-high">{error}</p>
                </div>
              )}

              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-heading">
                  Dados Pessoais
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="João Silva"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="joao@empresa.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                      onChange={() => setPasswordMatch(true)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Digite novamente"
                      required
                      disabled={loading}
                      className={!passwordMatch ? "border-risk-high" : ""}
                      onChange={() => setPasswordMatch(true)}
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Organização */}
              <div className="space-y-4 pt-4 border-t border-border-light">
                <h3 className="text-lg font-semibold text-text-heading">
                  Dados da Organização
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Nome da Empresa *</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    placeholder="Minha Empresa LTDA"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor (Opcional)</Label>
                    <Input
                      id="industry"
                      name="industry"
                      type="text"
                      placeholder="Ex: Tecnologia, Saúde..."
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Tamanho (Opcional)</Label>
                    <select
                      id="size"
                      name="size"
                      className="flex h-10 w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:border-transparent transition-sollar"
                      disabled={loading}
                    >
                      <option value="">Selecione...</option>
                      <option value="1-50">1-50 funcionários</option>
                      <option value="51-200">51-200 funcionários</option>
                      <option value="201-500">201-500 funcionários</option>
                      <option value="500+">Mais de 500 funcionários</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col">
            <p className="text-sm text-text-secondary text-center">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-pm-green-dark hover:text-pm-green-dark-hover font-medium transition-sollar"
              >
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
