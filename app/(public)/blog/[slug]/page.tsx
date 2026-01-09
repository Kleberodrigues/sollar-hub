import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SlideUp, FadeIn } from '@/components/animated'
import { Clock, Calendar, ArrowLeft, ExternalLink, User } from 'lucide-react'
import { getPostBySlug, getAllPosts } from '@/lib/blog/posts'
import ReactMarkdown from 'react-markdown'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Artigo nao encontrado | PsicoMapa',
    }
  }

  return {
    title: post.titulo + ' | Blog PsicoMapa',
    description: post.resumo,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.titulo,
      description: post.resumo,
      type: 'article',
      publishedTime: post.dataISO,
      authors: [post.autor.nome],
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllPosts()
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.categoria === post.categoria)
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-bg-tertiary">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-pm-olive/10 to-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SlideUp className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <Link href="/blog" className="inline-flex items-center gap-2 text-pm-terracotta hover:text-pm-terracotta-hover text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Blog
            </Link>

            {/* Category */}
            <div className="mb-4">
              <span className="inline-flex px-4 py-1.5 rounded-full text-sm font-medium bg-pm-olive/10 text-pm-olive">
                {post.categoria}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-pm-green-dark mb-4 leading-tight">
              {post.titulo}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              {post.subtitulo}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-text-muted text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-pm-terracotta/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-pm-terracotta" />
                </div>
                <div>
                  <div className="text-pm-green-dark font-medium">{post.autor.nome}</div>
                  <div className="text-text-muted text-xs">{post.autor.cargo}</div>
                </div>
              </div>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.data}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.tempo} de leitura
              </span>
            </div>
          </SlideUp>
        </div>
      </header>

      {/* Article Content */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-100">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-text-muted text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Content */}
              <div className="prose prose-lg prose-gray max-w-none prose-headings:font-display prose-headings:text-pm-green-dark prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-text-secondary prose-p:leading-relaxed prose-li:text-text-secondary prose-strong:text-pm-green-dark prose-blockquote:border-l-pm-terracotta prose-blockquote:bg-pm-olive/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-table:border prose-th:bg-gray-50 prose-th:p-3 prose-td:p-3 prose-td:border">
                <ReactMarkdown>{post.conteudo}</ReactMarkdown>
              </div>

              {/* References */}
              {post.referencias && post.referencias.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="font-display text-xl font-bold text-pm-green-dark mb-6">
                    Referencias e Fontes
                  </h3>
                  <div className="space-y-4">
                    {post.referencias.map((ref, index) => (
                      <a
                        key={index}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-4 rounded-lg bg-pm-olive/5 hover:bg-pm-olive/10 transition-colors group"
                      >
                        <ExternalLink className="w-5 h-5 text-pm-terracotta mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-pm-green-dark group-hover:text-pm-terracotta transition-colors">
                            {ref.titulo}
                          </div>
                          <div className="text-sm text-text-muted">
                            {ref.fonte}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </FadeIn>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="font-display text-2xl font-bold text-pm-green-dark mb-8 text-center">
                Artigos Relacionados
              </h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {relatedPosts.map(related => (
                  <Link key={related.slug} href={`/blog/${related.slug}`} className="group">
                    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-pm-terracotta/20 transition-all h-full">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3 bg-pm-olive/10 text-pm-olive">
                        {related.categoria}
                      </span>
                      <h3 className="font-display text-lg font-bold text-pm-green-dark mb-2 group-hover:text-pm-terracotta transition-colors">
                        {related.titulo}
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-2">
                        {related.resumo}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-pm-brown py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Pronto para avaliar os riscos psicossociais?
              </h2>
              <p className="text-white/80 mb-8">
                O PsicoMapa oferece diagnostico completo baseado no COPSOQ II-BR, em conformidade com a NR-1.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#planos"
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
      </section>
    </div>
  )
}
