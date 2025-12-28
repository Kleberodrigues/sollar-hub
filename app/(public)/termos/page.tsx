import { SlideUp } from '@/components/animated'

export const metadata = {
  title: 'Termo de Aceite e Condições de Uso | PsicoMapa',
  description: 'Termo de Aceite e Condições de Uso da plataforma PsicoMapa para diagnóstico de riscos psicossociais',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Termo de Aceite e Condições de Uso
          </h1>
          <p className="text-text-secondary">
            Versão: v1.0 — Data de vigência: 18/12/2025
          </p>
        </SlideUp>

        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <p className="text-text-primary mb-6 leading-relaxed">
            Ao clicar em &quot;Aceito&quot;, contratar e/ou utilizar a plataforma PsicoMapa (&quot;Plataforma&quot;),
            a empresa contratante (&quot;Contratante&quot;) declara que leu, compreendeu e concorda com este Termo,
            reconhecendo que o aceite eletrônico constitui evidência válida do consentimento e da contratação.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              1. Natureza do serviço
            </h2>
            <p className="text-text-primary mb-4">
              <strong>1.1.</strong> A Plataforma é um software automatizado, disponibilizado como serviço (SaaS),
              que coleta, organiza e processa informações fornecidas e/ou coletadas pela Contratante e por seus
              usuários autorizados, gerando dashboards, análises e relatórios.
            </p>
            <p className="text-text-primary">
              <strong>1.2.</strong> A Plataforma é destinada a apoiar a gestão e a tomada de decisão interna,
              inclusive para fins de planejamento e priorização de ações.
            </p>
          </section>

          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              2. Limitações e ausência de assessoria técnica/jurídica
            </h2>
            <p className="text-text-primary mb-4">
              <strong>2.1.</strong> A Contratante reconhece que a Contratada não presta por meio da Plataforma:
            </p>
            <ul className="list-disc list-inside text-text-primary mb-4 space-y-1 ml-4">
              <li>(a) consultoria personalizada;</li>
              <li>(b) assessoria jurídica;</li>
              <li>(c) laudo técnico;</li>
              <li>(d) perícia;</li>
              <li>(e) auditoria oficial;</li>
              <li>(f) parecer profissional com responsabilidade técnica.</li>
            </ul>
            <p className="text-text-primary">
              <strong>2.2.</strong> Os Relatórios são gerados de forma automatizada, a partir de modelos e
              metodologias parametrizadas, e dependem diretamente da qualidade, veracidade, completude e
              atualidade das informações fornecidas e do contexto organizacional.
            </p>
          </section>

          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              3. Responsabilidades da Contratante
            </h2>
            <p className="text-text-primary mb-4">
              <strong>3.1.</strong> A Contratante é exclusivamente responsável por:
            </p>
            <ul className="list-disc list-inside text-text-primary mb-4 space-y-1 ml-4">
              <li>(a) garantir a veracidade e adequação das informações inseridas/importadas;</li>
              <li>(b) definir escopo, população-alvo, comunicações internas e regras de aplicação de pesquisas/levantamentos;</li>
              <li>(c) interpretar os Relatórios à luz de sua realidade e, quando necessário, buscar validação técnica e/ou jurídica;</li>
              <li>(d) decidir, implementar e acompanhar planos de ação e medidas corretivas/preventivas;</li>
              <li>(e) cumprir obrigações legais, regulatórias e normativas aplicáveis ao seu negócio.</li>
            </ul>
            <p className="text-text-primary">
              <strong>3.2.</strong> A Contratante reconhece que o sucesso de qualquer programa de melhoria
              depende de gestão contínua, participação dos envolvidos e execução interna.
            </p>
          </section>

          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              4. Ausência de garantia de conformidade e de resultado
            </h2>
            <p className="text-text-primary">
              <strong>4.1.</strong> A Contratante reconhece e aceita que a Contratada não garante compliance,
              ausência de fiscalizações, autuações, multas, penalidades, condenações ou qualquer resultado
              específico, pois tais eventos podem decorrer de múltiplos fatores fora do controle da Plataforma
              (inclusive condutas, processos, cultura, documentos e governança da Contratante).
            </p>
          </section>

          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              5. Registro e prova do aceite
            </h2>
            <p className="text-text-primary">
              <strong>5.1.</strong> A Contratante concorda que o aceite seja registrado eletronicamente,
              incluindo, quando aplicável: data/hora, identificação do usuário, empresa/CNPJ, IP, user-agent,
              versão do termo e demais metadados técnicos, para fins de auditoria e evidência.
            </p>
          </section>

          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              6. Declaração de poderes
            </h2>
            <p className="text-text-primary">
              <strong>6.1.</strong> O usuário que aceita este Termo declara possuir poderes para vincular a
              Contratante, assumindo que sua manifestação representa a concordância da empresa.
            </p>
          </section>

          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-pm-green-dark mb-4">
              Contato
            </h2>
            <p className="text-text-primary">
              Para questões relacionadas a este Termo de Aceite, entre em contato pelo email:
              <a href="mailto:contato@psicomapa.cloud" className="text-pm-terracotta hover:underline ml-1">
                contato@psicomapa.cloud
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
