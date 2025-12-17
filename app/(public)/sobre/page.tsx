import { SlideUp, StaggerContainer, StaggerItem } from '@/components/animated'
import { Shield, Users, Brain, Target, Award, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Sobre | PsicoMapa',
  description: 'Conheça o PsicoMapa - Plataforma de diagnóstico de riscos psicossociais para organizações conforme NR-1',
}

const values = [
  {
    icon: Shield,
    title: 'Conformidade',
    description: 'Garantimos que sua organização esteja em total conformidade com a NR-1 e demais regulamentações.',
  },
  {
    icon: Brain,
    title: 'Inteligência',
    description: 'IA especializada em riscos psicossociais para análises precisas e recomendações assertivas.',
  },
  {
    icon: Users,
    title: 'Cuidado',
    description: 'Foco no bem-estar dos colaboradores como base para organizações mais saudáveis e produtivas.',
  },
  {
    icon: Target,
    title: 'Precisão',
    description: 'Metodologia validada cientificamente para diagnósticos confiáveis e acionáveis.',
  },
  {
    icon: Award,
    title: 'Excelência',
    description: 'Comprometimento com a qualidade em cada etapa do processo de diagnóstico.',
  },
  {
    icon: Heart,
    title: 'Empatia',
    description: 'Entendemos as necessidades únicas de cada organização e seus colaboradores.',
  },
]

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <SlideUp className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-pm-green-dark mb-4">
            Sobre o PsicoMapa
          </h1>
          <p className="font-serif text-lg text-text-secondary max-w-2xl mx-auto">
            Transformando a gestão de riscos psicossociais em organizações brasileiras através de tecnologia e expertise.
          </p>
        </SlideUp>

        {/* Mission Section */}
        <StaggerContainer staggerDelay={0.15} delayChildren={0.2}>
          <StaggerItem
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm mb-12"
          >
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              Nossa Missão
            </h2>
            <p className="font-serif text-base leading-relaxed text-text-primary mb-4">
              O PsicoMapa nasceu da necessidade de oferecer às organizações brasileiras uma ferramenta completa e acessível para diagnóstico e gestão de riscos psicossociais, em conformidade com a NR-1.
            </p>
            <p className="font-serif text-base leading-relaxed text-text-primary mb-4">
              Nossa plataforma combina inteligência artificial especializada com metodologias validadas cientificamente para identificar, analisar e propor ações preventivas relacionadas aos fatores de risco psicossocial no ambiente de trabalho.
            </p>
            <p className="font-serif text-base leading-relaxed text-text-primary">
              Acreditamos que ambientes de trabalho saudáveis são a base para organizações mais produtivas, inovadoras e sustentáveis.
            </p>
          </StaggerItem>

          {/* Values Grid */}
          <StaggerItem
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-8 text-center">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-pm-green/10 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-pm-green" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                    {value.title}
                  </h3>
                  <p className="font-serif text-sm text-text-secondary">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* NR-1 Section */}
          <StaggerItem
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-pm-green-dark text-white rounded-2xl p-8 shadow-sm mb-12"
          >
            <h2 className="font-display text-2xl font-semibold mb-4">
              Conformidade com a NR-1
            </h2>
            <p className="font-serif text-base leading-relaxed opacity-90 mb-4">
              A Norma Regulamentadora nº 1 (NR-1) estabelece disposições gerais sobre segurança e saúde no trabalho, incluindo a obrigatoriedade de identificação e gestão de riscos psicossociais.
            </p>
            <p className="font-serif text-base leading-relaxed opacity-90">
              O PsicoMapa foi desenvolvido especificamente para atender a esses requisitos, oferecendo uma metodologia estruturada em 8 blocos de avaliação que cobrem todos os aspectos relevantes para o diagnóstico de riscos psicossociais.
            </p>
          </StaggerItem>

          {/* CTA Section */}
          <StaggerItem
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              Pronto para começar?
            </h2>
            <p className="font-serif text-text-secondary mb-6">
              Conheça nossos planos e comece a transformar a gestão de riscos psicossociais na sua organização.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/precos"
                className="inline-block bg-pm-terracotta text-white px-6 py-3 rounded-lg font-medium hover:bg-pm-terracotta-hover transition-colors"
              >
                Ver Planos
              </Link>
              <Link
                href="/register"
                className="inline-block bg-pm-green text-white px-6 py-3 rounded-lg font-medium hover:bg-pm-green-dark transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Contact */}
        <SlideUp delay={0.6} className="mt-16 text-center">
          <p className="font-serif text-sm text-text-muted">
            Dúvidas? Entre em contato:{' '}
            <a
              href="mailto:contato@psicomapa.com.br"
              className="text-pm-terracotta hover:text-pm-terracotta-hover underline transition-colors"
            >
              contato@psicomapa.com.br
            </a>
          </p>
        </SlideUp>
      </div>
    </div>
  )
}
