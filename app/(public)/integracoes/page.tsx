import { SlideUp } from '@/components/animated'
import { Webhook, Code, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Integrações | PsicoMapa',
  description: 'Integre o PsicoMapa com suas ferramentas favoritas via webhooks e API',
}

const integracoes = [
  {
    nome: 'Webhooks',
    descricao: 'Receba notificações em tempo real quando eventos importantes acontecerem.',
    icon: Webhook,
  },
  {
    nome: 'API RESTful',
    descricao: 'Acesso programático completo a todos os recursos da plataforma.',
    icon: Code,
  },
  {
    nome: 'Automações',
    descricao: 'Configure fluxos automatizados com n8n, Zapier e outras ferramentas.',
    icon: Zap,
  },
]

export default function IntegracoesPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Integrações
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Conecte o PsicoMapa às suas ferramentas favoritas e automatize seus processos de RH.
          </p>
        </SlideUp>

        <div className="grid gap-6 mb-12">
          {integracoes.map((integracao) => (
            <div key={integracao.nome} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-pm-green/10 rounded-lg">
                  <integracao.icon className="w-6 h-6 text-pm-green" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                    {integracao.nome}
                  </h3>
                  <p className="text-text-secondary">
                    {integracao.descricao}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <h3 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
            Documentação da API
          </h3>
          <p className="text-text-secondary mb-6">
            Acesse nossa documentação completa para integrar o PsicoMapa ao seu sistema.
          </p>
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pm-green text-white font-medium rounded-lg hover:bg-pm-green-dark transition-colors"
          >
            Ver Documentação
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
