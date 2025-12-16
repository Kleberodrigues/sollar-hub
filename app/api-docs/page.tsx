import { SlideUp } from '@/components/animated'
import { Code, Key, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Documentação da API | PsicoMapa',
  description: 'Documentação da API RESTful do PsicoMapa',
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pm-green/10 mb-6">
            <Code className="w-8 h-8 text-pm-green" />
          </div>
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Documentação da API
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Integre o PsicoMapa ao seu sistema utilizando nossa API RESTful.
          </p>
        </SlideUp>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <Key className="w-6 h-6 text-pm-terracotta mt-1" />
              <div>
                <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                  Autenticação
                </h3>
                <p className="text-text-secondary mb-4">
                  A API utiliza autenticação via API Keys. Você pode gerar suas chaves no painel de configurações.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100">
                  <code>Authorization: Bearer sua_api_key</code>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <BookOpen className="w-6 h-6 text-pm-terracotta mt-1" />
              <div>
                <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                  Endpoints Disponíveis
                </h3>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/v1/assessments</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">POST</span>
                    <code className="text-sm">/api/v1/assessments</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/v1/responses</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                    <code className="text-sm">/api/v1/reports</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-pm-green/5 rounded-xl p-6 border border-pm-green/20">
            <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
              Acesso à API
            </h3>
            <p className="text-text-secondary mb-4">
              O acesso à API está disponível no plano Avançado. Entre em contato para mais informações.
            </p>
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 text-pm-terracotta hover:underline font-medium"
            >
              Falar com Vendas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
