'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animated";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-sage font-serif">
      {/* Header */}
      <FadeIn>
        <header className="bg-sollar-green-dark text-white shadow-md">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center">
                <span className="text-2xl font-bold font-display">S</span>
              </div>
              <span className="text-xl font-semibold font-display">Sollar Insight Hub</span>
            </div>
            <nav className="flex gap-6 items-center font-sans">
              <Link
                href="/precos"
                className="hover:text-sollar-olive-light transition-sollar"
              >
                Preços
              </Link>
              <Link
                href="/sobre"
                className="hover:text-sollar-olive-light transition-sollar"
              >
                Sobre
              </Link>
              <Link
                href="/privacidade"
                className="hover:text-sollar-olive-light transition-sollar"
              >
                Privacidade
              </Link>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-sans" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
            </nav>
          </div>
        </header>
      </FadeIn>

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-6 py-24">
          <SlideUp className="max-w-3xl" delay={0.2}>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-sollar-green-dark mb-6 leading-tight">
              Diagnóstico de Riscos Psicossociais para sua Organização
            </h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Plataforma completa para aplicar diagnósticos NR-1, analisar
              resultados e gerar relatórios executivos em poucos cliques.
            </p>
            <div className="flex gap-4 font-sans">
              <Button
                size="lg"
                className="bg-sollar-terracotta hover:bg-sollar-terracotta-hover"
                asChild
              >
                <Link href="/register">Começar Gratuitamente</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-sollar-olive text-sollar-olive hover:bg-sollar-olive hover:text-white"
                asChild
              >
                <Link href="/sobre">Saiba Mais</Link>
              </Button>
            </div>
          </SlideUp>
        </section>

        {/* Features */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <FadeIn delay={0.4}>
              <h2 className="font-display text-4xl font-bold text-sollar-green-dark mb-12 text-center">
                Funcionalidades Principais
              </h2>
            </FadeIn>
            <StaggerContainer staggerDelay={0.15} delayChildren={0.5} className="grid md:grid-cols-3 gap-8">
              <StaggerItem
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-sollar-olive/10 rounded-md flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-sollar-olive"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <CardTitle className="font-display text-xl mb-2">Diagnósticos Personalizados</CardTitle>
                    <CardDescription className="text-base">
                      Crie diagnósticos NR-1, pulse surveys ou questionários
                      customizados para sua realidade.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>

              <StaggerItem
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-sollar-terracotta/10 rounded-md flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-sollar-terracotta"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <CardTitle className="font-display text-xl mb-2">Análise em Tempo Real</CardTitle>
                    <CardDescription className="text-base">
                      Visualize resultados, identifique riscos e tome decisões com
                      base em dados confiáveis.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>

              <StaggerItem
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-sollar-green-dark/10 rounded-md flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-sollar-green-dark"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <CardTitle className="font-display text-xl mb-2">Relatórios Automáticos</CardTitle>
                    <CardDescription className="text-base">
                      Gere relatórios executivos em PDF com gráficos, métricas e
                      recomendações.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>
      </main>

      {/* Footer */}
      <FadeIn delay={0.8}>
        <footer className="bg-sollar-brown text-white py-8">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-sans">
                © {new Date().getFullYear()} Sollar Insight Hub. Todos os direitos reservados.
              </p>
              <Link
                href="/privacidade"
                className="text-sm hover:text-sollar-olive-light transition-colors font-sans"
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </footer>
      </FadeIn>
    </div>
  );
}
