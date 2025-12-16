import { SlideUp, StaggerContainer, StaggerItem } from '@/components/animated'
import {
  ClipboardCheck,
  BarChart3,
  FileText,
  Shield,
  Bell,
  Webhook,
  Brain,
  Users,
  TrendingUp,
  Lock
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Funcionalidades | PsicoMapa',
  description: 'Conheça todas as funcionalidades da plataforma PsicoMapa para diagnóstico de riscos psicossociais',
}

const funcionalidades = [
  {
    icon: ClipboardCheck,
    title: 'Diagnósticos NR-1',
    description: 'Questionários pré-configurados em conformidade com a NR-1 e NR-17, prontos para aplicação.',
    destaque: true,
  },
  {
    icon: Brain,
    title: 'IA Especializada',
    description: 'Inteligência artificial treinada especificamente para análise de riscos psicossociais.',
    destaque: true,
  },
  {
    icon: BarChart3,
    title: 'Dashboards em Tempo Real',
    description: 'Visualize resultados instantaneamente com gráficos interativos e métricas claras.',
    destaque: false,
  },
  {
    icon: FileText,
    title: 'Relatórios Automáticos',
    description: 'Gere relatórios executivos em PDF com um clique, prontos para apresentação.',
    destaque: false,
  },
  {
    icon: Users,
    title: 'Gestão de Equipes',
    description: 'Organize colaboradores por departamentos, unidades e centros de custo.',
    destaque: false,
  },
  {
    icon: TrendingUp,
    title: 'Análise Comparativa',
    description: 'Compare resultados entre períodos, departamentos e ciclos de avaliação.',
    destaque: false,
  },
  {
    icon: Shield,
    title: 'Anonimato Garantido',
    description: 'Respostas completamente anônimas com criptografia de ponta a ponta.',
    destaque: false,
  },
  {
    icon: Bell,
    title: 'Alertas Inteligentes',
    description: 'Receba notificações quando indicadores ultrapassarem limites definidos.',
    destaque: false,
  },
  {
    icon: Webhook,
    title: 'Integrações',
    description: 'Conecte com suas ferramentas via webhooks e API RESTful.',
    destaque: false,
  },
  {
    icon: Lock,
    title: 'LGPD Compliant',
    description: 'Total conformidade com a Lei Geral de Proteção de Dados.',
    destaque: false,
  },
]

export default function FuncionalidadesPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-pm-green-dark mb-4">
            Funcionalidades
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Tudo que você precisa para diagnosticar, analisar e gerenciar riscos psicossociais na sua organização.
          </p>
        </SlideUp>

        <StaggerContainer staggerDelay={0.1} delayChildren={0.2}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funcionalidades.map((func) => (
              <StaggerItem
                key={func.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
                  func.destaque ? 'ring-2 ring-pm-terracotta' : ''
                }`}
              >
                {func.destaque && (
                  <span className="inline-block px-2 py-1 bg-pm-terracotta/10 text-pm-terracotta text-xs font-medium rounded mb-3">
                    Destaque
                  </span>
                )}
                <func.icon className="w-10 h-10 text-pm-green mb-4" />
                <h3 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                  {func.title}
                </h3>
                <p className="text-text-secondary">
                  {func.description}
                </p>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <SlideUp delay={0.5} className="mt-16 text-center">
          <p className="text-text-secondary mb-6">
            Pronto para transformar a saúde organizacional da sua empresa?
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-4 bg-pm-terracotta text-white font-medium rounded-lg hover:bg-pm-terracotta-hover transition-colors"
          >
            Começar Gratuitamente
          </Link>
        </SlideUp>
      </div>
    </div>
  )
}
