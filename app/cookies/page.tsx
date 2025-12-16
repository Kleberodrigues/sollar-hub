import { SlideUp } from '@/components/animated'
import { Cookie } from 'lucide-react'

export const metadata = {
  title: 'Política de Cookies | PsicoMapa',
  description: 'Política de Cookies da plataforma PsicoMapa',
}

const tiposCookies = [
  {
    tipo: 'Essenciais',
    descricao: 'Necessários para o funcionamento básico do site. Incluem cookies de autenticação e segurança.',
    exemplos: ['Manutenção da sessão de login', 'Proteção contra CSRF', 'Preferências de idioma'],
    obrigatorio: true,
  },
  {
    tipo: 'Funcionais',
    descricao: 'Permitem funcionalidades avançadas e personalização da experiência.',
    exemplos: ['Lembrar preferências de exibição', 'Manter filtros selecionados', 'Configurações do dashboard'],
    obrigatorio: false,
  },
  {
    tipo: 'Analíticos',
    descricao: 'Coletam informações sobre como você usa nosso site para melhorarmos nossos serviços.',
    exemplos: ['Páginas visitadas', 'Tempo de navegação', 'Origem do acesso'],
    obrigatorio: false,
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pm-terracotta/10 mb-6">
            <Cookie className="w-8 h-8 text-pm-terracotta" />
          </div>
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Política de Cookies
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Utilizamos cookies para melhorar sua experiência em nossa plataforma.
            Saiba mais sobre como e por que os utilizamos.
          </p>
        </SlideUp>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              O que são Cookies?
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-text-primary">
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site.
                Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente,
                bem como para fornecer informações aos proprietários do site.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6">
              Tipos de Cookies que Utilizamos
            </h2>
            <div className="space-y-4">
              {tiposCookies.map((cookie) => (
                <div key={cookie.tipo} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-pm-green-dark">
                      {cookie.tipo}
                    </h3>
                    {cookie.obrigatorio ? (
                      <span className="px-3 py-1 bg-pm-green/10 text-pm-green text-xs font-medium rounded-full">
                        Obrigatório
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-text-secondary text-xs font-medium rounded-full">
                        Opcional
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary mb-3">
                    {cookie.descricao}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cookie.exemplos.map((exemplo) => (
                      <span
                        key={exemplo}
                        className="px-2 py-1 bg-bg-tertiary text-text-muted text-xs rounded"
                      >
                        {exemplo}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              Como Gerenciar Cookies
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-text-primary mb-4">
                Você pode controlar e/ou excluir cookies conforme sua preferência. A maioria dos navegadores
                permite que você:
              </p>
              <ul className="space-y-2 text-text-primary">
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Visualize quais cookies estão armazenados e exclua-os individualmente</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Bloqueie cookies de terceiros</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Bloqueie todos os cookies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Exclua todos os cookies ao fechar o navegador</span>
                </li>
              </ul>
              <p className="text-text-secondary mt-4 text-sm">
                Nota: Bloquear cookies essenciais pode afetar o funcionamento do site e impedir o uso de alguns recursos.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              Contato
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-text-primary">
                Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato:
                <a href="mailto:contato@psicomapa.com.br" className="text-pm-terracotta hover:underline ml-1">
                  contato@psicomapa.com.br
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
