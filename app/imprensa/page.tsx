import { SlideUp } from '@/components/animated'
import { Newspaper, Download, Mail, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Imprensa | PsicoMapa',
  description: 'Área de imprensa e materiais para mídia do PsicoMapa',
}

const noticias = [
  {
    veiculo: 'Valor Econômico',
    titulo: 'Startups de saúde mental crescem com novas exigências da NR-1',
    data: 'Dez 2024',
  },
  {
    veiculo: 'Exame',
    titulo: 'Como a tecnologia está ajudando empresas a cuidar da saúde mental',
    data: 'Nov 2024',
  },
  {
    veiculo: 'Folha de S.Paulo',
    titulo: 'Empresas investem em diagnósticos de riscos psicossociais',
    data: 'Out 2024',
  },
]

export default function ImprensaPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Imprensa
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Materiais para mídia, releases e informações sobre o PsicoMapa.
          </p>
        </SlideUp>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6">
            Materiais para Download
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                Logo e Marca
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Logos em diversos formatos e cores para uso em publicações.
              </p>
              <button className="flex items-center gap-2 text-pm-terracotta hover:underline font-medium">
                <Download className="w-4 h-4" />
                Baixar Kit de Marca
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                Press Release
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Release oficial com informações sobre a empresa e produto.
              </p>
              <button className="flex items-center gap-2 text-pm-terracotta hover:underline font-medium">
                <Download className="w-4 h-4" />
                Baixar Release
              </button>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6">
            Na Mídia
          </h2>
          <div className="space-y-4">
            {noticias.map((noticia) => (
              <div key={noticia.titulo} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Newspaper className="w-6 h-6 text-pm-green flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-text-muted">{noticia.veiculo} • {noticia.data}</span>
                    <h3 className="font-display text-lg font-semibold text-pm-green-dark mt-1">
                      {noticia.titulo}
                    </h3>
                  </div>
                  <ExternalLink className="w-5 h-5 text-text-muted cursor-pointer hover:text-pm-terracotta" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <Mail className="w-8 h-8 text-pm-terracotta flex-shrink-0" />
            <div>
              <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                Contato para Imprensa
              </h3>
              <p className="text-text-secondary mb-4">
                Para entrevistas, informações ou materiais adicionais, entre em contato com nossa assessoria.
              </p>
              <a
                href="mailto:imprensa@psicomapa.com.br"
                className="text-pm-terracotta hover:underline font-medium"
              >
                imprensa@psicomapa.com.br
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
