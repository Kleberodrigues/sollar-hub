const fs = require('fs');
const path = require('path');

const content = `import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SlideUp, FadeIn } from '@/components/animated'
import { Clock, Calendar, ArrowLeft, Tag, ExternalLink, User, Share2 } from 'lucide-react'
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
      title: 'Artigo não encontrado | PsicoMapa',
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

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Legislação': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'Guia Prático': { bg: 'bg-green-50', text: 'text-green-700' },
  'Saúde Mental': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Metodologia': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Compliance': { bg: 'bg-red-50', text: 'text-red-700' },
  'Cultura': { bg: 'bg-teal-50', text: 'text-teal-700' },
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
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-br from-pm-brown via-pm-brown to-pm-green-dark py-12 lg:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-pm-olive rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pm-terracotta rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SlideUp className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Blog
            </Link>

            {/* Category */}
            <div className="mb-4">
              <span className={\`inline-flex px-4 py-1.5 rounded-full text-sm font-medium \${categoryColors[post.categoria]?.bg || 'bg-gray-100'} \${categoryColors[post.categoria]?.text || 'text-gray-700'}\`}>
                {post.categoria}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {post.titulo}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              {post.subtitulo}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{post.autor.nome}</div>
                  <div className="text-white/60 text-xs">{post.autor.cargo}</div>
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
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-100">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm">
                  <Tag className="w-3.5 h-3.5" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-gray max-w-none prose-headings:font-display prose-headings:text-pm-green-dark prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-text-secondary prose-p:leading-relaxed prose-li:text-text-secondary prose-strong:text-pm-green-dark prose-blockquote:border-l-pm-terracotta prose-blockquote:bg-pm-terracotta/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-table:border prose-th:bg-gray-50 prose-th:p-3 prose-td:p-3 prose-td:border">
              <ReactMarkdown>{post.conteudo}</ReactMarkdown>
            </div>

            {/* References */}
            {post.referencias && post.referencias.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="font-display text-xl font-bold text-pm-green-dark mb-6">
                  Referências e Fontes
                </h3>
                <div className="space-y-4">
                  {post.referencias.map((ref, index) => (
                    <a
                      key={index}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
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

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-text-muted">Compartilhe este artigo</span>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Compartilhar no LinkedIn">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Compartilhar no Twitter">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Copiar link">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="font-display text-2xl font-bold text-pm-green-dark mb-8 text-center">
                Artigos Relacionados
              </h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {relatedPosts.map(related => (
                  <Link key={related.slug} href={\`/blog/\${related.slug}\`} className="group">
                    <article className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all h-full">
                      <span className={\`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3 \${categoryColors[related.categoria]?.bg || 'bg-gray-100'} \${categoryColors[related.categoria]?.text || 'text-gray-700'}\`}>
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
      <section className="bg-gradient-to-br from-pm-terracotta to-pm-terracotta-active py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Pronto para avaliar os riscos psicossociais da sua empresa?
              </h2>
              <p className="text-white/90 mb-8">
                O PsicoMapa oferece diagnóstico completo baseado no COPSOQ II-BR, em conformidade com a NR-1.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/precos"
                  className="px-8 py-3 bg-white text-pm-terracotta font-semibold rounded-lg hover:bg-white/90 transition-colors"
                >
                  Conhecer Planos
                </Link>
                <Link
                  href="/contato"
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pm-terracotta transition-colors"
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
`;

const dir = 'app/(public)/blog/[slug]';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
fs.writeFileSync(path.join(dir, 'page.tsx'), content, 'utf8');
console.log('Blog post page created successfully');
