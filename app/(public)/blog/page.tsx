import Link from 'next/link'
import { SlideUp, FadeIn, StaggerContainer, StaggerItem } from '@/components/animated'
import { Clock, ArrowRight, Calendar, BookOpen } from 'lucide-react'
import { getAllPosts, getFeaturedPost } from '@/lib/blog/posts'

export const metadata = {
  title: 'Blog | PsicoMapa - NR-1, Riscos Psicossociais e Saúde Mental',
  description: 'Artigos especializados sobre NR-1, riscos psicossociais, burnout, COPSOQ II e saúde mental no trabalho.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featuredPost = getFeaturedPost()
  const regularPosts = posts.filter(p => !p.destaque)

  return (
    <div className="min-h-screen bg-bg-tertiary">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pm-olive/10 to-white py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SlideUp className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pm-terracotta/10 text-pm-terracotta text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Conteudo Especializado
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-pm-green-dark mb-6">
              Blog
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              Artigos tecnicos sobre NR-1, riscos psicossociais, saude mental no trabalho
              e melhores praticas para gestao de pessoas.
            </p>
          </SlideUp>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <FadeIn className="mb-12">
            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left side - Content */}
                  <div className="p-8 lg:p-10 flex flex-col justify-center order-2 lg:order-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-pm-terracotta/10 text-pm-terracotta">
                        Em Destaque
                      </span>
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-pm-olive/10 text-pm-olive">
                        {featuredPost.categoria}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl lg:text-3xl font-bold text-pm-green-dark mb-4 group-hover:text-pm-terracotta transition-colors">
                      {featuredPost.titulo}
                    </h2>

                    <p className="text-text-secondary mb-4 leading-relaxed">
                      {featuredPost.subtitulo}
                    </p>

                    <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                      {featuredPost.resumo}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {featuredPost.data}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {featuredPost.tempo} de leitura
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-pm-terracotta font-medium text-sm group-hover:gap-3 transition-all">
                        Ler artigo
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Right side - Visual */}
                  <div className="bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 p-8 lg:p-10 flex items-center justify-center order-1 lg:order-2 min-h-[200px] lg:min-h-0">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-pm-terracotta" />
                      </div>
                      <p className="text-sm text-pm-green-dark font-medium">
                        Artigo em Destaque
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </FadeIn>
        )}

        {/* Posts Grid */}
        <StaggerContainer staggerDelay={0.1} delayChildren={0.2}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <StaggerItem
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-md hover:border-pm-terracotta/20 transition-all duration-300">
                    {/* Category header */}
                    <div className="px-6 py-3 bg-pm-olive/5 border-b border-gray-100">
                      <span className="text-xs font-medium text-pm-olive uppercase tracking-wider">
                        {post.categoria}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="font-display text-xl font-bold text-pm-green-dark mb-3 group-hover:text-pm-terracotta transition-colors line-clamp-2">
                        {post.titulo}
                      </h2>

                      <p className="text-text-secondary text-sm mb-4 flex-1 line-clamp-3">
                        {post.resumo}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 text-text-muted text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.data}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.tempo}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-pm-terracotta opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                  </article>
                </Link>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* CTA Section */}
        <FadeIn delay={0.3} className="mt-16">
          <div className="bg-pm-brown rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
              Pronto para avaliar os riscos psicossociais?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              O PsicoMapa oferece diagnostico completo baseado no COPSOQ II-BR,
              em conformidade com a NR-1.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/precos"
                className="inline-flex items-center justify-center px-6 py-3 bg-pm-olive-light text-pm-brown font-medium rounded-lg hover:bg-white transition-colors"
              >
                Conhecer Planos
              </Link>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-pm-brown transition-colors"
              >
                Falar com Especialista
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

