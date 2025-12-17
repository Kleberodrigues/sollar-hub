import { SlideUp } from '@/components/animated'
import { FileText, Download, Clock } from 'lucide-react'

export const metadata = {
  title: 'Guias | PsicoMapa',
  description: 'Guias e materiais educativos sobre riscos psicossociais e NR-1',
}

const guias = [
  {
    titulo: 'Guia Completo da NR-1',
    descricao: 'Tudo sobre a Norma Regulamentadora e como implementar na sua empresa.',
    formato: 'PDF',
    paginas: 45,
  },
  {
    titulo: 'Checklist de Conformidade',
    descricao: 'Verifique se sua empresa está em conformidade com as exigências legais.',
    formato: 'PDF',
    paginas: 12,
  },
  {
    titulo: 'Manual de Aplicação de Diagnósticos',
    descricao: 'Passo a passo para aplicar questionários e interpretar resultados.',
    formato: 'PDF',
    paginas: 28,
  },
]

export default function GuiasPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Guias e Materiais
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Materiais educativos gratuitos para ajudar sua empresa na gestão de riscos psicossociais.
          </p>
        </SlideUp>

        <div className="space-y-4">
          {guias.map((guia) => (
            <div key={guia.titulo} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-pm-terracotta/10 rounded-lg">
                  <FileText className="w-6 h-6 text-pm-terracotta" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                    {guia.titulo}
                  </h3>
                  <p className="text-text-secondary mb-3">
                    {guia.descricao}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span>{guia.formato}</span>
                    <span>•</span>
                    <span>{guia.paginas} páginas</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-pm-green text-white rounded-lg hover:bg-pm-green-dark transition-colors">
                  <Download className="w-4 h-4" />
                  Baixar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-pm-green/5 rounded-xl p-8 text-center border border-pm-green/20">
          <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
            Quer acesso a todos os materiais?
          </h3>
          <p className="text-text-secondary mb-4">
            Crie uma conta gratuita para acessar nossa biblioteca completa de guias e materiais.
          </p>
          <a
            href="/register"
            className="inline-flex items-center px-6 py-3 bg-pm-terracotta text-white font-medium rounded-lg hover:bg-pm-terracotta-hover transition-colors"
          >
            Criar Conta Gratuita
          </a>
        </div>
      </div>
    </div>
  )
}
