const fs = require('fs');

const content = `import Link from 'next/link'
import { SlideUp, FadeIn } from '@/components/animated'
import { Clock, ArrowRight, Calendar, Tag, BookOpen, TrendingUp } from 'lucide-react'
import { getAllPosts, getFeaturedPost, getCategories } from '@/lib/blog/posts'

export const metadata = {
  title: 'Blog | PsicoMapa - NR-1, Riscos Psicossociais e Saúde Mental',
  description: 'Artigos especializados sobre NR-1, riscos psicossociais, burnout, COPSOQ II e saúde mental no trabalho.',
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Legislação': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'Guia Prático': { bg: 'bg-green-50', text: 'text-green-700' },
  'Saúde Mental': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Metodologia': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Compliance': { bg: 'bg-red-50', text: 'text-red-700' },
  'Cultura': { bg: 'bg-teal-50', text: 'text-teal-700' },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featuredPost = getFeaturedPost()
  const categories = getCategories()
  const regularPosts = posts.filter(p => !p.destaque)

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-tertiary to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pm-brown via-pm-brown to-pm-green-dark py-16 lg:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-pm-olive rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pm-terracotta rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SlideUp className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              Conteúdo Especializado
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Blog <span className="text-pm-olive-light">PsicoMapa</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Artigos técnicos sobre <strong>NR-1</strong>, riscos psicossociais,
              saúde mental no trabalho e melhores práticas para gestão de pessoas.
            </p>
          </SlideUp>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          <FadeIn>
            <Link href={\`/blog/\${featuredPost.slug}\`} className="block group">
              <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="grid lg:grid-cols-5 gap-0">
                  <div className="lg:col-span-2 bg-gradient-to-br from-pm-terracotta to-pm-terracotta-active p-8 lg:p-12 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium mb-4 w-fit">
                      <TrendingUp className="w-3 h-3" />
                      Artigo em Destaque
                    </div>
                    <span className={\`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-4 w-fit \${categoryColors[featuredPost.categoria]?.bg || 'bg-gray-100'} \${categoryColors[featuredPost.categoria]?.text || 'text-gray-700'}\`}>
                      {featuredPost.categoria}
                    </span>
                    <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:underline decoration-2 underline-offset-4">
                      {featuredPost.titulo}
                    </h2>
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.data}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {featuredPost.tempo} de leitura
                      </span>
                    </div>
                  </div>
                  <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                    <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                      {featuredPost.subtitulo}
                    </p>
                    <p className="text-text-secondary mb-6">
                      {featuredPost.resumo}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-text-muted">
                        Por <span className="font-medium text-text-primary">{featuredPost.autor.nome}</span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-pm-terracotta font-semibold group-hover:gap-3 transition-all">
                        Ler artigo completo
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </FadeIn>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-text-muted mr-2">Categorias:</span>
            {categories.map(cat => (
              <span
                key={cat}
                className={\`px-4 py-2 rounded-full text-sm font-medium \${categoryColors[cat]?.bg || 'bg-gray-100'} \${categoryColors[cat]?.text || 'text-gray-700'}\`}
              >
                {cat}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <FadeIn key={post.slug} delay={0.1 * (index + 1)}>
              <Link href={\`/blog/\${post.slug}\`} className="group block h-full">
                <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-lg hover:border-pm-terracotta/20 transition-all duration-300 hover:-translate-y-1">
                  <div className={\`px-6 py-3 \${categoryColors[post.categoria]?.bg || 'bg-gray-50'}\`}>
                    <span className={\`text-xs font-semibold uppercase tracking-wider \${categoryColors[post.categoria]?.text || 'text-gray-600'}\`}>
                      {post.categoria}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-display text-xl font-bold text-pm-green-dark mb-3 group-hover:text-pm-terracotta transition-colors line-clamp-2">
                      {post.titulo}
                    </h2>
                    <p className="text-text-secondary text-sm mb-4 flex-1 line-clamp-3">
                      {post.resumo}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
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
                      <ArrowRight className="w-5 h-5 text-pm-terracotta opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-br from-pm-olive/10 to-pm-sage/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-pm-green-dark mb-4">
                Fique por dentro das novidades
              </h2>
              <p className="text-text-secondary mb-8">
                Receba nossos artigos sobre NR-1, saúde mental e gestão de riscos psicossociais.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pm-olive focus:border-transparent outline-none"
                />
                <button className="px-6 py-3 bg-pm-terracotta text-white font-medium rounded-lg hover:bg-pm-terracotta-hover transition-colors">
                  Inscrever-se
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
`;

fs.writeFileSync('app/(public)/blog/page.tsx', content, 'utf8');
console.log('Blog page created successfully');
