import { SlideUp, StaggerContainer, StaggerItem } from '@/components/animated'

export const metadata = {
  title: 'Política de Privacidade | PsicoMapa',
  description: 'Política de Privacidade do PsicoMapa - Saiba como protegemos suas informações pessoais em conformidade com a LGPD',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-pm-green-dark mb-4">
            Política de Privacidade
          </h1>
          <p className="font-serif text-lg text-text-secondary max-w-2xl mx-auto">
            A sua privacidade é importante para nós. Esta Política de Privacidade descreve como coletamos, usamos e protegemos as informações pessoais dos visitantes do site do PsicoMapa.
          </p>
        </SlideUp>

        {/* Content Sections */}
        <StaggerContainer staggerDelay={0.15} delayChildren={0.2}>
          <article className="space-y-12 font-serif text-text-primary">
            {/* Section 1 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                1. Coleta de informações
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Coletamos informações pessoais fornecidas voluntariamente por você ao preencher formulários de contato em nosso site, como nome, e-mail, telefone e outras informações que você escolher compartilhar.
              </p>
              <p className="text-base leading-relaxed">
                Esses dados são utilizados exclusivamente para que possamos entrar em contato e oferecer informações sobre nossos serviços.
              </p>
            </StaggerItem>

            {/* Section 2 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                2. Uso das informações
              </h2>
              <p className="text-base leading-relaxed mb-4">
                As informações coletadas são utilizadas para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
                <li>Entrar em contato com você após o envio do formulário;</li>
                <li>Fornecer informações sobre nossos serviços e treinamentos;</li>
                <li>Melhorar sua experiência no site e otimizar nossas campanhas de anúncios.</li>
              </ul>
            </StaggerItem>

            {/* Section 3 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                3. Tecnologias de rastreamento
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Nosso site utiliza cookies e pixels de rastreamento (como o Pixel do Facebook e Google Ads) para analisar o desempenho de nossas campanhas e oferecer anúncios mais relevantes.
              </p>
              <p className="text-base leading-relaxed">
                Essas ferramentas não coletam informações pessoais identificáveis, mas ajudam a entender seu comportamento de navegação para fins de marketing e estatísticas.
              </p>
            </StaggerItem>

            {/* Section 4 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                4. Armazenamento e segurança dos dados
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Os dados são armazenados em ambiente seguro, com tecnologia SSL (Secure Socket Layer), que garante a criptografia das informações transmitidas entre o seu navegador e o nosso site.
              </p>
              <p className="text-base leading-relaxed">
                A plataforma PsicoMapa segue rigorosos padrões de segurança e conformidade com a Lei Geral de Proteção de Dados (LGPD).
              </p>
            </StaggerItem>

            {/* Section 5 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                5. Compartilhamento de informações
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Não compartilhamos, vendemos ou alugamos suas informações pessoais a terceiros.
              </p>
              <p className="text-base leading-relaxed">
                Os dados poderão ser compartilhados apenas com plataformas de anúncios (como Meta, Google e TikTok), de forma anonimizada, para fins de análise e otimização de campanhas.
              </p>
            </StaggerItem>

            {/* Section 6 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                6. Direitos do titular dos dados
              </h2>
              <p className="text-base leading-relaxed mb-4">
                De acordo com a LGPD, você tem o direito de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed mb-4">
                <li>Solicitar acesso, correção ou exclusão de seus dados pessoais;</li>
                <li>Revogar o consentimento para o uso de suas informações;</li>
                <li>Solicitar a portabilidade dos dados, quando aplicável.</li>
              </ul>
              <p className="text-base leading-relaxed">
                Para exercer qualquer um desses direitos, entre em contato conosco pelo e-mail:{' '}
                <a
                  href="mailto:contato@psicomapa.cloud"
                  className="text-pm-terracotta hover:text-pm-terracotta-hover underline transition-colors"
                >
                  contato@psicomapa.cloud
                </a>
              </p>
            </StaggerItem>

            {/* Section 7 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                7. Alterações nesta política
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas.
              </p>
              <p className="text-base leading-relaxed">
                Recomendamos que você consulte esta página regularmente para se manter informado(a) sobre como protegemos suas informações.
              </p>
            </StaggerItem>

            {/* Section 8 */}
            <StaggerItem
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
                8. Contato
              </h2>
              <p className="text-base leading-relaxed">
                Se tiver dúvidas sobre esta Política de Privacidade ou sobre o uso dos seus dados, entre em contato com nossa equipe através do e-mail:{' '}
                <a
                  href="mailto:contato@psicomapa.cloud"
                  className="text-pm-terracotta hover:text-pm-terracotta-hover underline transition-colors"
                >
                  contato@psicomapa.cloud
                </a>
              </p>
            </StaggerItem>
          </article>
        </StaggerContainer>

        {/* Footer Note */}
        <SlideUp delay={0.8} className="mt-12 text-center">
          <p className="font-serif text-sm text-text-muted">
            Última atualização: Janeiro de 2025
          </p>
        </SlideUp>
      </div>
    </div>
  )
}
