import { SlideUp, StaggerContainer, StaggerItem } from '@/components/animated'
import { Check, Building2 } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Planos e Preços | PsicoMapa',
  description: 'Escolha o plano ideal para diagnóstico de riscos psicossociais e pesquisa de clima contínua conforme NR-1',
}

const plans = [
  {
    name: 'Base',
    description: '50 a 120 colaboradores',
    monthlyPrice: 'R$ 330,83',
    yearlyPrice: 'R$ 3.970/ano',
    reportsCount: '14 Relatórios anuais',
    reports: [
      '6 Relatórios de Clima (bimestrais)',
      '4 Relatórios Técnicos de Riscos Psicossociais (trimestrais)',
      '4 Relatórios de Plano de Ação (trimestrais)',
    ],
    features: [
      'Dashboards automáticos',
      'Análise de dados completa',
      'Relatório técnico personalizado',
      'Plano de ação orientado à prevenção',
      'Export PDF e CSV',
      'Suporte por email',
    ],
    highlighted: false,
  },
  {
    name: 'Intermediário',
    description: '121 a 250 colaboradores',
    monthlyPrice: 'R$ 414,17',
    yearlyPrice: 'R$ 4.970/ano',
    reportsCount: '24 Relatórios anuais',
    reports: [
      'Tudo do plano Base',
      '+ 4 Relatórios Comparativos entre ciclos (trimestrais)',
      '+ 6 Relatórios Executivos para liderança (bimestrais)',
    ],
    features: [
      'Dashboards comparativos (tempo/áreas)',
      'Priorização de riscos por impacto',
      'Branding personalizado',
      'Suporte prioritário',
    ],
    highlighted: true,
  },
  {
    name: 'Avançado',
    description: '251 a 400 colaboradores',
    monthlyPrice: 'R$ 497,50',
    yearlyPrice: 'R$ 5.970/ano',
    reportsCount: '28 Relatórios anuais',
    reports: [
      'Tudo do plano Intermediário',
      '+ 4 Relatórios de Correlação entre fatores (trimestrais)',
    ],
    features: [
      'Apresentação de 2 relatórios pela equipe PsicoMapa',
      'Condição exclusiva para Plano de Ação pela Consultoria',
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
            Diagnóstico de riscos psicossociais + pesquisa de clima contínua.
            Todos os planos incluem relatórios automáticos prontos em até 24 horas.
          </p>
          <p className="mt-4 text-sm text-text-muted">
            Pagamento anual • Sem taxas ocultas • Cancele quando quiser
          </p>
        </SlideUp>

        {/* Pricing Cards */}
        <StaggerContainer staggerDelay={0.15} delayChildren={0.2}>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                  </div>

                  {/* Price - Yearly first */}
                  <div className="mb-4">
                    <span className="font-display text-4xl font-bold text-pm-green-dark">
                      {plan.yearlyPrice.replace('/ano', '')}
                    </span>
                    <span className="text-text-secondary">/ano</span>
                    <p className="text-sm text-text-muted mt-1">
                      Equivalente a {plan.monthlyPrice}/mês
                    </p>
                  </div>

                  {/* Reports Count Badge */}
                  <div className="mb-6 inline-block bg-pm-olive/10 text-pm-olive text-sm font-medium px-3 py-1 rounded-full">
                    {plan.reportsCount}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/contato"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.highlighted
                        ? 'bg-pm-terracotta text-white hover:bg-pm-terracotta-hover'
                        : 'bg-pm-green text-white hover:bg-pm-green-dark'
                    }`}
                  >
                    Começar Agora
                  </Link>

                  {/* Reports */}
                  <div className="mt-6 mb-4">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                      Relatórios inclusos
                    </p>
                    <ul className="space-y-2">
                      {plan.reports.map((report) => (
                        <li key={report} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-pm-terracotta flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-text-primary">{report}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features */}
                  <div className="pt-4 border-t border-border-light">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                      Funcionalidades
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-pm-green flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Enterprise Plan */}
        <SlideUp delay={0.5}>
          <div className="bg-pm-brown rounded-2xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-pm-olive-light" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">
                    Enterprise
                  </h3>
                  <p className="text-white/80 max-w-xl">
                    Para empresas com mais de 400 colaboradores. Plano personalizado com
                    consultoria dedicada e suporte premium.
                  </p>
                </div>
              </div>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center bg-pm-olive-light text-pm-brown font-medium px-8 py-4 rounded-lg hover:bg-white transition-colors whitespace-nowrap"
              >
                Fale com Especialista
              </Link>
            </div>
          </div>
        </SlideUp>

        {/* Additional Info */}
        <SlideUp delay={0.6} className="mt-12 text-center">
          <p className="font-serif text-text-secondary">
            Dúvidas sobre qual plano escolher?{' '}
            <a
              href="mailto:contato@psicomapa.cloud"
              className="text-pm-terracotta hover:text-pm-terracotta-hover underline transition-colors"
            >
              contato@psicomapa.cloud
            </a>
          </p>
        </SlideUp>
      </div>
    </div>
  )
}
