import { SlideUp } from '@/components/animated'
import { Briefcase, MapPin, Heart, Rocket, Users } from 'lucide-react'

export const metadata = {
  title: 'Carreiras | PsicoMapa',
  description: 'Trabalhe conosco e ajude a transformar a saúde mental no trabalho',
}

const beneficios = [
  { icon: Heart, titulo: 'Saúde em primeiro lugar', descricao: 'Plano de saúde completo e auxílio terapia' },
  { icon: Rocket, titulo: 'Crescimento', descricao: 'Plano de desenvolvimento individual' },
  { icon: Users, titulo: 'Cultura inclusiva', descricao: 'Ambiente diverso e acolhedor' },
]

const vagas = [
  {
    titulo: 'Desenvolvedor(a) Full Stack',
    tipo: 'CLT',
    local: 'Remoto',
    area: 'Engenharia',
  },
  {
    titulo: 'Product Designer',
    tipo: 'CLT',
    local: 'Remoto',
    area: 'Design',
  },
  {
    titulo: 'Customer Success',
    tipo: 'CLT',
    local: 'São Paulo/Híbrido',
    area: 'Comercial',
  },
]

export default function CarreirasPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Carreiras
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Faça parte do time que está transformando a saúde mental no trabalho.
          </p>
        </SlideUp>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6 text-center">
            Por que trabalhar no PsicoMapa?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {beneficios.map((beneficio) => (
              <div key={beneficio.titulo} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <beneficio.icon className="w-10 h-10 text-pm-terracotta mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                  {beneficio.titulo}
                </h3>
                <p className="text-text-secondary text-sm">
                  {beneficio.descricao}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6">
            Vagas Abertas
          </h2>
          <div className="space-y-4">
            {vagas.map((vaga) => (
              <div key={vaga.titulo} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 bg-pm-green/10 text-pm-green text-xs font-medium rounded mb-2">
                      {vaga.area}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-pm-green-dark">
                      {vaga.titulo}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {vaga.tipo}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vaga.local}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-pm-terracotta text-white rounded-lg hover:bg-pm-terracotta-hover transition-colors">
                    Candidatar-se
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm text-center">
          <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
            Não encontrou sua vaga?
          </h3>
          <p className="text-text-secondary mb-4">
            Envie seu currículo para nosso banco de talentos.
          </p>
          <a
            href="mailto:carreiras@psicomapa.com.br"
            className="text-pm-terracotta hover:underline font-medium"
          >
            carreiras@psicomapa.com.br
          </a>
        </div>
      </div>
    </div>
  )
}
