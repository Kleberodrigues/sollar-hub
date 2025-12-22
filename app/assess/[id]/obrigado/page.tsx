import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Heart } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-sage via-bg-warm to-[#fff5e9] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-green-200 bg-white shadow-xl">
        <CardContent className="py-12 text-center">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 left-0 right-0 mx-auto w-fit">
              <Heart className="w-6 h-6 text-pm-terracotta fill-pm-terracotta animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-text-heading mb-3">
            Obrigado por Participar!
          </h1>

          {/* Message */}
          <p className="text-text-secondary mb-6 leading-relaxed">
            Suas respostas foram registradas de forma{" "}
            <span className="font-medium text-pm-olive">anônima e segura</span>.
            <br />
            Sua participação é muito importante para nós.
          </p>

          {/* Additional Info */}
          <div className="bg-bg-sage/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-text-muted">
              As informações coletadas serão utilizadas exclusivamente para fins
              de análise e melhoria do ambiente organizacional, em conformidade
              com a LGPD.
            </p>
          </div>

          {/* Close Instructions */}
          <p className="text-sm text-text-muted">
            Você pode fechar esta página.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
