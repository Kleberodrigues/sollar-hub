import { SlideUp } from '@/components/animated'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Blog | PsicoMapa',
  description: 'Artigos e insights sobre saúde mental no trabalho e riscos psicossociais',
}

const posts = [
  {
    titulo: 'O que muda com a NR-1 em 2025?',
    resumo: 'Entenda as principais mudanças na Norma Regulamentadora e como se preparar.',
    data: '10 Dez 2024',
    categoria: 'Legislação',
    tempo: '5 min',
  },
  {
    titulo: 'Como identificar riscos psicossociais na sua empresa',
    resumo: 'Um guia prático para RH sobre identificação e prevenção de riscos.',
    data: '05 Dez 2024',
    categoria: 'Guia Prático',
    tempo: '8 min',
  },
  {
    titulo: 'Burnout: prevenção começa pela cultura',
    resumo: 'Como a cultura organizacional impacta na saúde mental dos colaboradores.',
    data: '28 Nov 2024',
    categoria: 'Saúde Mental',
    tempo: '6 min',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <SlideUp className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-pm-green-dark mb-4">
            Blog
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Insights, guias e novidades sobre saúde mental no trabalho e gestão de riscos psicossociais.
          </p>
        </SlideUp>

        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.titulo} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-pm-green/10 text-pm-green text-xs font-medium rounded-full">
                  {post.categoria}
                </span>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  {post.tempo}
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold text-pm-green-dark mb-2">
                {post.titulo}
              </h2>
              <p className="text-text-secondary mb-4">
                {post.resumo}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{post.data}</span>
                <span className="flex items-center gap-1 text-pm-terracotta font-medium text-sm">
                  Ler mais
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-muted">
            Mais artigos em breve...
          </p>
        </div>
      </div>
    </div>
  )
}
