import Link from 'next/link'
import Image from 'next/image'
import { SlideUp, FadeIn, StaggerContainer, StaggerItem } from '@/components/animated'
import { Clock, ArrowRight, Calendar, BookOpen, Tag, ChevronRight, TrendingUp, Users, Shield, FileText } from 'lucide-react'
import { getAllPosts, getFeaturedPost, getCategories } from '@/lib/blog/posts'

export const metadata = {
  title: 'Blog | PsicoMapa - NR-1, Riscos Psicossociais e Saúde Mental',
  description: 'Artigos especializados sobre NR-1, riscos psicossociais, burnout, COPSOQ II e saúde mental no trabalho.',
}

// Category icons mapping
const categoryIcons: Record<string, React.ElementType> = {
  'Legislação': FileText,
  'Guia Prático': BookOpen,
  'Saúde Mental': Users,
  'Metodologia': TrendingUp,
  'Compliance': Shield,
  'Cultura': Users,
  'Liderança': Users,
  'Gestão': TrendingUp,
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featuredPost = getFeaturedPost()
  const regularPosts = posts.filter(p => !p.destaque)
  const categories = getCategories()

  // Get latest 3 posts for "Mais Lidos" section
  const latestPosts = posts.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pm-cream to-white">
      {/* Hero Section with Featured Article */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-pm-olive/5 via-transparent to-pm-terracotta/5 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SlideUp className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pm-terracotta/10 text-pm-terracotta text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Conteúdo Especializado
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-pm-green-dark">Blog </span>
              <span className="text-pm-olive">Psico</span>
              <span className="text-pm-terracotta">Mapa</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              Artigos técnicos, notícias e guias práticos sobre NR-1, riscos psicossociais
              e saúde mental no trabalho.
            </p>
          </SlideUp>

          {/* Featured Article with Image */}
          {featuredPost && (
            <FadeIn className="max-w-6xl mx-auto">
              <Link href={`/blog/${featuredPost.slug}`} className="block group">
                <article className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Image Side */}
                    <div className="relative h-64 lg:h-auto lg:min-h-[400px] overflow-hidden">
                      <Image
                        src={featuredPost.imagem}
                        alt={featuredPost.imagemAlt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:hidden" />
                      <div className="absolute bottom-4 left-4 lg:hidden">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-pm-terracotta text-white">
                          Em Destaque
                        </span>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="hidden lg:inline-flex px-4 py-1.5 rounded-full text-sm font-semibold bg-pm-terracotta text-white">
                          Em Destaque
                        </span>
                        <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-pm-olive/10 text-pm-olive">
                          {featuredPost.categoria}
                        </span>
                      </div>

                      <h2 className="font-display text-2xl lg:text-3xl xl:text-4xl font-bold text-pm-green-dark mb-4 group-hover:text-pm-terracotta transition-colors leading-tight">
                        {featuredPost.titulo}
                      </h2>

                      <p className="text-text-secondary text-lg mb-4 leading-relaxed">
                        {featuredPost.subtitulo}
                      </p>

                      <p className="text-text-muted mb-6 line-clamp-2">
                        {featuredPost.resumo}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-6 text-sm text-text-muted">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {featuredPost.data}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {featuredPost.tempo} de leitura
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 text-pm-terracotta font-semibold group-hover:gap-3 transition-all">
                          Ler artigo
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Main Posts Grid - 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-pm-green-dark">
                Todos os Artigos
              </h2>
              <span className="text-sm text-text-muted">
                {regularPosts.length} artigos
              </span>
            </div>

            <StaggerContainer staggerDelay={0.08} delayChildren={0.1}>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <StaggerItem
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-lg hover:border-pm-terracotta/20 transition-all duration-300">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.imagem}
                            alt={post.imagemAlt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-pm-olive">
                              {post.categoria}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-display text-lg font-bold text-pm-green-dark mb-2 group-hover:text-pm-terracotta transition-colors line-clamp-2 leading-snug">
                            {post.titulo}
                          </h3>

                          <p className="text-text-secondary text-sm mb-4 flex-1 line-clamp-2">
                            {post.resumo}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded bg-pm-cream text-text-muted text-xs">
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
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Categories */}
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-display text-lg font-bold text-pm-green-dark mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-pm-terracotta" />
                  Categorias
                </h3>
                <ul className="space-y-2">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category] || BookOpen
                    const count = posts.filter(p => p.categoria === category).length
                    return (
                      <li key={category}>
                        <Link
                          href={`/blog?categoria=${encodeURIComponent(category)}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-pm-cream transition-colors group"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-pm-olive" />
                            <span className="text-text-secondary group-hover:text-pm-green-dark text-sm">
                              {category}
                            </span>
                          </span>
                          <span className="text-xs bg-pm-olive/10 text-pm-olive px-2 py-1 rounded-full">
                            {count}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </FadeIn>

            {/* Most Read */}
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-display text-lg font-bold text-pm-green-dark mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pm-terracotta" />
                  Mais Lidos
                </h3>
                <ul className="space-y-4">
                  {latestPosts.map((post, index) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex gap-4 group"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pm-olive/10 text-pm-olive font-bold text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-pm-green-dark group-hover:text-pm-terracotta transition-colors line-clamp-2 leading-snug">
                            {post.titulo}
                          </h4>
                          <span className="text-xs text-text-muted mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.tempo}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* CTA Card */}
            <FadeIn delay={0.2}>
              <div className="bg-pm-olive/10 rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-pm-green-dark mb-2">
                  Avalie sua Empresa
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Diagnóstico de riscos psicossociais em conformidade com a NR-1.
                </p>
                <Link
                  href="/#planos"
                  className="inline-flex items-center gap-2 text-pm-terracotta font-semibold text-sm hover:gap-3 transition-all"
                >
                  Conhecer planos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          </aside>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <FadeIn>
        <section className="bg-pm-brown py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto para avaliar os riscos psicossociais?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                O PsicoMapa oferece diagnóstico completo baseado no COPSOQ II-BR,
                em conformidade com a NR-1.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#planos"
                  className="inline-flex items-center justify-center px-8 py-4 bg-pm-olive-light text-pm-brown font-semibold rounded-xl hover:bg-white transition-colors"
                >
                  Conhecer Planos
                </Link>
                <Link
                  href="/contato"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-pm-brown transition-colors"
                >
                  Falar com Especialista
                </Link>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
