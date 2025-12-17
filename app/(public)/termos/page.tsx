import { SlideUp } from '@/components/animated'

export const metadata = {
  title: 'Termos de Uso | PsicoMapa',
  description: 'Termos de Uso da plataforma PsicoMapa para diagnóstico de riscos psicossociais',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Termos de Uso
          </h1>
          <p className="text-text-secondary">
            Última atualização: Dezembro de 2024
          </p>
        </SlideUp>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="text-text-primary mb-4">
              Ao acessar e utilizar a plataforma PsicoMapa, você concorda com estes Termos de Uso.
              Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              2. Descrição do Serviço
            </h2>
            <p className="text-text-primary mb-4">
              O PsicoMapa é uma plataforma de diagnóstico e gestão de riscos psicossociais no ambiente de trabalho,
              oferecendo ferramentas para aplicação de questionários, análise de dados e geração de relatórios
              em conformidade com as Normas Regulamentadoras NR-1 e NR-17.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              3. Cadastro e Conta
            </h2>
            <p className="text-text-primary mb-4">
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas e atualizadas.
              Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades
              realizadas em sua conta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              4. Uso Adequado
            </h2>
            <p className="text-text-primary mb-4">
              Você concorda em utilizar a plataforma apenas para fins legítimos e em conformidade com a legislação aplicável.
              É proibido utilizar o serviço para atividades ilegais, fraudulentas ou que violem direitos de terceiros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              5. Propriedade Intelectual
            </h2>
            <p className="text-text-primary mb-4">
              Todo o conteúdo da plataforma, incluindo software, design, textos e gráficos, é protegido por direitos
              autorais e outras leis de propriedade intelectual. Você não pode copiar, modificar ou distribuir
              qualquer parte do serviço sem autorização prévia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              6. Limitação de Responsabilidade
            </h2>
            <p className="text-text-primary mb-4">
              O PsicoMapa não se responsabiliza por decisões tomadas com base nas análises geradas pela plataforma.
              Os relatórios e recomendações são ferramentas de apoio e não substituem a avaliação de profissionais
              qualificados em saúde e segurança do trabalho.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              7. Alterações nos Termos
            </h2>
            <p className="text-text-primary mb-4">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão
              comunicadas por email ou através de aviso na plataforma. O uso continuado após as alterações constitui
              aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              8. Contato
            </h2>
            <p className="text-text-primary mb-4">
              Para questões relacionadas a estes Termos de Uso, entre em contato pelo email:
              <a href="mailto:contato@psicomapa.com.br" className="text-pm-terracotta hover:underline ml-1">
                contato@psicomapa.com.br
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
