import { SlideUp } from '@/components/animated'
import { Shield, Lock, Eye, Trash2, Download, UserCheck } from 'lucide-react'

export const metadata = {
  title: 'LGPD | PsicoMapa',
  description: 'Compromisso do PsicoMapa com a Lei Geral de Proteção de Dados (LGPD)',
}

const direitos = [
  {
    icon: Eye,
    title: 'Acesso aos Dados',
    description: 'Você pode solicitar uma cópia de todos os dados pessoais que armazenamos sobre você.',
  },
  {
    icon: UserCheck,
    title: 'Correção',
    description: 'Você pode solicitar a correção de dados pessoais incompletos, inexatos ou desatualizados.',
  },
  {
    icon: Trash2,
    title: 'Exclusão',
    description: 'Você pode solicitar a exclusão dos seus dados pessoais, respeitando obrigações legais de retenção.',
  },
  {
    icon: Download,
    title: 'Portabilidade',
    description: 'Você pode solicitar a transferência dos seus dados para outro fornecedor de serviço.',
  },
]

export default function LGPDPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pm-green/10 mb-6">
            <Shield className="w-8 h-8 text-pm-green" />
          </div>
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Compromisso com a LGPD
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            O PsicoMapa está em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            Sua privacidade é nossa prioridade.
          </p>
        </SlideUp>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Como Protegemos Seus Dados
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <ul className="space-y-3 text-text-primary">
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Criptografia de ponta a ponta em todas as transmissões de dados</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Armazenamento seguro em servidores certificados</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Anonimização de respostas em questionários de diagnóstico</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Controle de acesso rigoroso com autenticação em múltiplos fatores</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">•</span>
                  <span>Auditorias regulares de segurança e conformidade</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-6">
              Seus Direitos
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {direitos.map((direito) => (
                <div key={direito.title} className="bg-white rounded-xl p-6 shadow-sm">
                  <direito.icon className="w-8 h-8 text-pm-terracotta mb-3" />
                  <h3 className="font-display text-lg font-semibold text-pm-green-dark mb-2">
                    {direito.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {direito.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              Base Legal para Tratamento
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-text-primary mb-4">
                O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais:
              </p>
              <ul className="space-y-3 text-text-primary">
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">1.</span>
                  <span><strong>Execução de contrato:</strong> Para prestação dos serviços contratados</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">2.</span>
                  <span><strong>Consentimento:</strong> Para envio de comunicações de marketing (quando autorizado)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">3.</span>
                  <span><strong>Obrigação legal:</strong> Para cumprimento de obrigações regulatórias</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pm-green font-bold">4.</span>
                  <span><strong>Legítimo interesse:</strong> Para melhoria contínua dos serviços</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              Encarregado de Dados (DPO)
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-text-primary mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais,
                entre em contato com nosso Encarregado de Proteção de Dados:
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-text-primary">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:dpo@psicomapa.com.br" className="text-pm-terracotta hover:underline">
                    dpo@psicomapa.com.br
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
