import { SlideUp, StaggerContainer, StaggerItem } from '@/components/animated'
import { Check } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Preços | PsicoMapa',
  description: 'Conheça os planos do PsicoMapa para diagnóstico de riscos psicossociais conforme NR-1',
}

const plans = [
  {
    name: 'Base',
    description: 'Para empresas de 50 a 120 colaboradores',
    objective: 'Cumprir a NR-1 com clareza',
    price: 'R$ 3.970',
    pricePerMonth: 'R$ 330,83/mês',
    features: [
      'IA vertical em riscos psicossociais',
      'Dashboards automáticos',
      'Relatório técnico personalizado',
      'Plano de ação orientado à prevenção',
      'Análise por clusters de risco',
      'Avaliações ilimitadas',
      'Export PDF e CSV',
      'Suporte por email',
    ],
    highlighted: false,
  },
  {
    name: 'Intermediário',
    description: 'Para empresas de 121 a 250 colaboradores',
    objective: 'Apoiar decisões gerenciais',
    price: 'R$ 4.970',
    pricePerMonth: 'R$ 414,17/mês',
    features: [
      'Tudo do plano Base',
      'Análise comparativa entre ciclos',
      'Priorização de riscos por impacto organizacional',
      'Dashboards comparativos (tempo/áreas)',
      'Relatório executivo para liderança',
      'Branding personalizado',
      'Suporte prioritário',
    ],
    highlighted: true,
  },
  {
    name: 'Avançado',
    description: 'Para empresas de 251 a 400 colaboradores',
    objective: 'Atender organizações de maior complexidade',
    price: 'R$ 5.970',
    pricePerMonth: 'R$ 497,50/mês',
    features: [
      'Tudo do plano Intermediário',
      'Análise sistêmica dos riscos psicossociais',
      'Correlação entre fatores organizacionais',
      'Alertas de atenção elevada',
      'Relatório técnico estruturado para gestão de riscos',
      'Acesso à API',
      'Export XLSX',
      'Suporte dedicado',
    ],
    highlighted: false,
  },
]

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <SlideUp className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-pm-green-dark mb-4">
            Planos e Preços
          </h1>
          <p className="font-serif text-lg text-text-secondary max-w-2xl mx-auto">
            Escolha o plano ideal para sua organização. Todos incluem diagnóstico completo de riscos psicossociais conforme NR-1.
          </p>
          <p className="mt-4 text-sm text-text-muted">
            Pagamento anual • Sem taxas ocultas • Cancele quando quiser
          </p>
        </SlideUp>

        {/* Pricing Cards */}
        <StaggerContainer staggerDelay={0.15} delayChildren={0.2}>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <StaggerItem
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-white rounded-2xl shadow-sm overflow-hidden ${
                  plan.highlighted ? 'ring-2 ring-pm-terracotta' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-pm-terracotta text-white text-center py-2 text-sm font-medium">
                    Mais Popular
                  </div>
                )}

                <div className={`p-8 ${plan.highlighted ? 'pt-14' : ''}`}>
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-semibold text-pm-green-dark">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">
                      {plan.description}
                    </p>
                    <p className="text-xs text-pm-terracotta mt-2 font-medium">
                      {plan.objective}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold text-pm-green-dark">
                      {plan.price}
                    </span>
                    <span className="text-text-secondary">/ano</span>
                    <p className="text-sm text-text-muted mt-1">
                      equivalente a {plan.pricePerMonth}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/register"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.highlighted
                        ? 'bg-pm-terracotta text-white hover:bg-pm-terracotta-hover'
                        : 'bg-pm-green text-white hover:bg-pm-green-dark'
                    }`}
                  >
                    Começar Agora
                  </Link>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pm-green flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-text-primary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* FAQ or Additional Info */}
        <SlideUp delay={0.6} className="mt-16 text-center">
          <p className="font-serif text-text-secondary">
            Precisa de mais de 400 colaboradores?{' '}
            <a
              href="mailto:contato@psicomapa.com.br"
              className="text-pm-terracotta hover:text-pm-terracotta-hover underline transition-colors"
            >
              Entre em contato
            </a>{' '}
            para um plano personalizado.
          </p>
        </SlideUp>
      </div>
    </div>
  )
}
