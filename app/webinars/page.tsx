import { SlideUp } from '@/components/animated'
import { Video, Calendar, Clock, Users } from 'lucide-react'

export const metadata = {
  title: 'Webinars | PsicoMapa',
  description: 'Webinars e eventos online sobre saúde mental no trabalho',
}

const webinars = [
  {
    titulo: 'NR-1 na Prática: Implementando a Nova Norma',
    data: '20 Jan 2025',
    horario: '14:00 BRT',
    palestrante: 'Dra. Ana Paula Silva',
    status: 'upcoming',
  },
  {
    titulo: 'Indicadores de Saúde Mental: O que Medir?',
    data: '15 Fev 2025',
    horario: '10:00 BRT',
    palestrante: 'Dr. Carlos Mendes',
    status: 'upcoming',
  },
]

const gravados = [
  {
    titulo: 'Introdução aos Riscos Psicossociais',
    duracao: '45 min',
    visualizacoes: 1250,
  },
  {
    titulo: 'Como Interpretar Resultados de Diagnósticos',
    duracao: '60 min',
    visualizacoes: 890,
  },
]

export default function WebinarsPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Webinars
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Eventos online gratuitos com especialistas em saúde mental no trabalho.
          </p>
        </SlideUp>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6">
            Próximos Eventos
          </h2>
          <div className="space-y-4">
            {webinars.map((webinar) => (
              <div key={webinar.titulo} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pm-terracotta/10 rounded-lg">
                    <Video className="w-6 h-6 text-pm-terracotta" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mb-2">
                      Em breve
                    </span>
                    <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                      {webinar.titulo}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {webinar.data}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {webinar.horario}
                      </span>
                      <span>{webinar.palestrante}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-pm-terracotta text-white rounded-lg hover:bg-pm-terracotta-hover transition-colors">
                    Inscrever-se
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6">
            Gravações Disponíveis
          </h2>
          <div className="space-y-4">
            {gravados.map((webinar) => (
              <div key={webinar.titulo} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Video className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                      {webinar.titulo}
                    </h3>
                    <div className="flex gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {webinar.duracao}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {webinar.visualizacoes.toLocaleString()} visualizações
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-pm-green text-pm-green rounded-lg hover:bg-pm-green/10 transition-colors">
                    Assistir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
