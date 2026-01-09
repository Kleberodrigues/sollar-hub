"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Building, Building2, Factory, Loader2, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { PLAN_INFO, isValidPlan, preCheckoutSchema } from "@/lib/validations/checkout";

// Plan icons mapping
const planIcons = {
  base: Building,
  intermediario: Building2,
  avancado: Factory,
};

const planColors = {
  base: "text-pm-terracotta bg-pm-terracotta/10",
  intermediario: "text-pm-olive bg-pm-olive/10",
  avancado: "text-pm-olive bg-pm-olive/10",
};

export default function PreCheckoutPage() {
  const params = useParams();
  const planId = params.plan as string;

  // Hooks must be called before any conditional returns
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Validate plan - render invalid state if needed
  if (!isValidPlan(planId)) {
    return (
      <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-text-heading mb-2">Plano inválido</h2>
            <p className="text-text-muted mb-4">O plano selecionado não existe.</p>
            <Link href="/#planos">
              <Button>Ver planos disponíveis</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = PLAN_INFO[planId];
  const Icon = planIcons[planId];
  const colorClasses = planColors[planId];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data = {
      email: formData.get("email") as string,
      fullName: formData.get("fullName") as string,
      companyName: formData.get("companyName") as string,
      industry: formData.get("industry") as string || "",
      size: formData.get("size") as string || "",
      plan: planId,
      termsAccepted,
      privacyAccepted,
    };

    // Validate with Zod
    const validation = preCheckoutSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      setError(firstError.message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/stripe/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Erro ao processar");
      }

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pagamento");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-sage flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <Link
          href="/#planos"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos planos
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Finalizar Assinatura</CardTitle>
            <CardDescription>
              Preencha seus dados para prosseguir com o pagamento
            </CardDescription>

            {/* Selected Plan Display */}
            <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-heading">Plano {plan.name}</p>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-lg text-text-heading">{plan.price}</p>
                  <p className="text-xs text-text-muted">/ano</p>
                </div>
              </div>
            </div>
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
                  <p className="text-xs text-text-muted">
                    Você receberá um email para definir sua senha após o pagamento
                  </p>
                </div>
              </div>

              {/* Dados da Organização */}
              <div className="space-y-4 pt-4 border-t border-border-light">
                <h3 className="text-lg font-semibold text-text-heading">
                  Dados da Organização
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
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

              {/* Termos e Condições */}
              <div className="space-y-4 pt-4 border-t border-border-light">
                <h3 className="text-lg font-semibold text-text-heading">
                  Termos e Condições
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                      disabled={loading}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-text-secondary cursor-pointer leading-relaxed"
                    >
                      Li e aceito os{" "}
                      <Link
                        href="/termos"
                        target="_blank"
                        className="text-pm-olive hover:underline font-medium"
                      >
                        Termos de Uso
                      </Link>{" "}
                      da plataforma PsicoMapa.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="privacy"
                      checked={privacyAccepted}
                      onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                      disabled={loading}
                    />
                    <label
                      htmlFor="privacy"
                      className="text-sm text-text-secondary cursor-pointer leading-relaxed"
                    >
                      Li e aceito a{" "}
                      <Link
                        href="/privacidade"
                        target="_blank"
                        className="text-pm-olive hover:underline font-medium"
                      >
                        Política de Privacidade
                      </Link>{" "}
                      e os termos da{" "}
                      <Link
                        href="/lgpd"
                        target="_blank"
                        className="text-pm-olive hover:underline font-medium"
                      >
                        LGPD
                      </Link>
                      .
                    </label>
                  </div>
                </div>

                {/* Info box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Pagamento Seguro</p>
                      <p>
                        Você será redirecionado para o Stripe, nossa plataforma de pagamento segura.
                        A cobrança é anual e pode ser cancelada a qualquer momento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !termsAccepted || !privacyAccepted}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Prosseguir para Pagamento
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-text-muted">
                Equivalente a {plan.pricePerMonth}/mês
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Already have account */}
        <p className="text-sm text-text-secondary text-center mt-6">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-pm-green-dark hover:text-pm-green-dark-hover font-medium transition-sollar"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
