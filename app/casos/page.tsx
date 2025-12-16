import { SlideUp } from '@/components/animated'
import { Building2, TrendingDown, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Casos de Sucesso | PsicoMapa',
  description: 'Conheça empresas que transformaram sua gestão de saúde mental com o PsicoMapa',
}

const casos = [
  {
    empresa: 'TechCorp Brasil',
    setor: 'Tecnologia',
    colaboradores: 450,
    resultado: '40% de redução em afastamentos',
    descricao: 'Em 6 meses, a TechCorp conseguiu identificar e tratar os principais fatores de estresse, reduzindo significativamente os afastamentos por questões psicológicas.',
  },
  {
    empresa: 'Indústria ABC',
    setor: 'Manufatura',
    colaboradores: 280,
    resultado: '92% de participação nos diagnósticos',
    descricao: 'Com a garantia de anonimato do PsicoMapa, a empresa alcançou taxa recorde de participação em suas avaliações de clima.',
  },
  {
    empresa: 'Varejo XYZ',
    setor: 'Varejo',
    colaboradores: 1200,
    resultado: 'Conformidade total com NR-1',
    descricao: 'Rede de lojas conseguiu implementar diagnósticos em todas as unidades e gerar relatórios consolidados para a matriz.',
  },
]

export default function CasosPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Casos de Sucesso
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Conheça empresas que transformaram sua gestão de saúde mental com o PsicoMapa.
          </p>
        </SlideUp>

        <div className="space-y-6 mb-12">
          {casos.map((caso) => (
            <div key={caso.empresa} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-pm-green/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-pm-green" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-pm-green-dark">
                    {caso.empresa}
                  </h3>
                  <div className="flex gap-3 text-sm text-text-muted mt-1">
                    <span>{caso.setor}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {caso.colaboradores} colaboradores
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-pm-terracotta/5 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-pm-terracotta font-semibold">
                  <TrendingDown className="w-5 h-5" />
                  {caso.resultado}
                </div>
              </div>

              <p className="text-text-secondary">
                {caso.descricao}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-pm-green rounded-xl p-8 text-center text-white">
          <h3 className="font-display text-2xl font-semibold mb-4">
            Sua empresa pode ser o próximo caso de sucesso
          </h3>
          <p className="text-white/80 mb-6">
            Comece hoje mesmo a transformar a saúde organizacional da sua empresa.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pm-green font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Começar Agora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
