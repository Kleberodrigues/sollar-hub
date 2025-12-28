'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Award, GraduationCap, Heart, Sparkles } from 'lucide-react';

const teamMembers = [
  {
    name: 'Julia Kalil',
    role: 'Co-fundadora',
    tagline: 'Conectando Pessoas e Propósitos por meio do PsicoMapa',
    image: '/images/julia.jpeg',
    bio: [
      'Com mais de 6 anos de experiência em Gestão de Pessoas em multinacionais, minha paixão sempre foi ir além dos processos. Eu uni estratégia e sensibilidade ao longo da construção do PsicoMapa — uma plataforma que transforma percepções do dia a dia em dados claros, com método, linguagem humana e conexão com a realidade do negócio.',
      'Meu propósito é claro: ajudar a criar ambientes mais leves, engajados e com propósito, onde cada colaborador se sinta valorizado e possa prosperar.',
      'Tenho experiência em traduzir temas complexos de cultura, liderança e bem-estar em perguntas objetivas, indicadores e leituras acionáveis, gerando clareza, escuta e evolução contínua dentro das organizações.',
    ],
    certifications: [
      'Formação em Relações Públicas pela UNESP',
      'Certificação em Oratória',
      'Certificação em Comunicação Não Violenta',
      'Certificação em Treinamento & Desenvolvimento em Saúde Mental',
    ],
    color: 'pm-terracotta',
  },
  {
    name: 'Laura Nogueira',
    role: 'Co-fundadora',
    tagline: 'PsicoMapa e o meu olhar',
    image: '/images/laura.jpeg',
    bio: [
      'Psicóloga com mais de 6 anos de experiência em Saúde Mental e Recursos Humanos, o que me permite integrar o olhar clínico à prática organizacional.',
      'No PsicoMapa, ajudei a construir a base do produto com sensibilidade e rigor técnico — porque, por trás de cada resposta, existe uma pessoa e a forma como o trabalho atravessa sua vida.',
      'Acredito que empresas se transformam quando enxergam suas pessoas com verdade. Meu compromisso, dentro da plataforma, é garantir que ela ajude líderes e equipes a construírem ambientes mais seguros, leves e emocionalmente saudáveis — com linguagem humana, leitura clara e foco em ações reais.',
    ],
    certifications: [
      'Formação em Psicologia pela PUC Campinas',
      'Especialização em Gestalt Terapia',
      'Certificação em Saúde Mental nas Organizações e a Nova NR 01',
      'Certificação em IA aplicada a negócios',
    ],
    color: 'pm-olive',
  },
];

export default function SobrePage() {
  return (
    <>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pm-olive/10 to-white py-16 lg:py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-pm-green-dark mb-6">
                Quem <span className="text-pm-terracotta">Somos</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary">
                Conheça as pessoas por trás do PsicoMapa — profissionais que uniram
                experiência, sensibilidade e tecnologia para transformar a forma como
                as organizações cuidam de suas pessoas.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Team Members */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-6">
            <div className="space-y-16 lg:space-y-24">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex flex-col ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } gap-8 lg:gap-12`}
                >
                  {/* Photo */}
                  <div className="w-full lg:w-2/5 flex-shrink-0">
                    <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 ${
                      member.color === 'pm-terracotta'
                        ? 'border-pm-terracotta/20'
                        : 'border-pm-olive/20'
                    }`}>
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                      {/* Name overlay */}
                      <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t ${
                        member.color === 'pm-terracotta'
                          ? 'from-pm-terracotta to-transparent'
                          : 'from-pm-olive to-transparent'
                      }`}>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                          {member.name}
                        </h2>
                        <p className="text-white/90 text-sm font-medium">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="w-full lg:w-3/5 flex flex-col justify-between">
                    {/* Top section: Tagline + Bio */}
                    <div className="space-y-4">
                      {/* Tagline */}
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                        member.color === 'pm-terracotta'
                          ? 'bg-pm-terracotta/10 text-pm-terracotta'
                          : 'bg-pm-olive/10 text-pm-olive'
                      }`}>
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium text-sm">{member.tagline}</span>
                      </div>

                      {/* Bio */}
                      <div className="space-y-4">
                        {member.bio.map((paragraph, i) => (
                          <p key={i} className="text-text-secondary leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Bottom section: Certifications */}
                    <div className={`p-6 lg:p-8 rounded-xl mt-6 ${
                      member.color === 'pm-terracotta'
                        ? 'bg-pm-terracotta/5 border border-pm-terracotta/10'
                        : 'bg-pm-olive/5 border border-pm-olive/10'
                    }`}>
                      <div className="flex items-center gap-2 mb-5">
                        <GraduationCap className={`w-6 h-6 ${
                          member.color === 'pm-terracotta' ? 'text-pm-terracotta' : 'text-pm-olive'
                        }`} />
                        <h3 className="font-display text-lg font-semibold text-text-heading">
                          Formação e certificações
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {member.certifications.map((cert, i) => (
                          <li key={i} className="flex items-start gap-3 text-base text-text-secondary">
                            <Award className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              member.color === 'pm-terracotta' ? 'text-pm-terracotta' : 'text-pm-olive'
                            }`} />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 lg:py-16 bg-bg-sage">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
                O que nos <span className="text-pm-terracotta">move</span>
              </h2>
              <p className="text-text-secondary">
                Acreditamos que ambientes de trabalho saudáveis são a base para
                organizações mais produtivas, inovadoras e humanas.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Heart,
                  title: 'Cuidado com Pessoas',
                  description: 'Por trás de cada dado, existe uma pessoa. Nossa missão é garantir que ela seja ouvida e cuidada.',
                  color: 'pm-terracotta',
                },
                {
                  icon: Sparkles,
                  title: 'Clareza e Ação',
                  description: 'Transformamos complexidade em clareza, e clareza em ações concretas que fazem diferença.',
                  color: 'pm-olive',
                },
                {
                  icon: Award,
                  title: 'Rigor Técnico',
                  description: 'Metodologia validada cientificamente, combinada com sensibilidade e experiência prática.',
                  color: 'pm-green-dark',
                },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm text-center"
                >
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    value.color === 'pm-terracotta' ? 'bg-pm-terracotta/10' :
                    value.color === 'pm-olive' ? 'bg-pm-olive/10' : 'bg-pm-green-dark/10'
                  }`}>
                    <value.icon className={`w-6 h-6 ${
                      value.color === 'pm-terracotta' ? 'text-pm-terracotta' :
                      value.color === 'pm-olive' ? 'text-pm-olive' : 'text-pm-green-dark'
                    }`} />
                  </div>
                  <h3 className="font-display font-semibold text-text-heading mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16 bg-pm-brown text-white">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Quer conhecer mais sobre o PsicoMapa?
              </h2>
              <p className="text-white/80 mb-8">
                Agende uma conversa com nossa equipe e descubra como podemos ajudar
                sua organização a cuidar melhor das pessoas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contato"
                  className="inline-flex items-center justify-center bg-pm-olive-light text-pm-brown font-medium px-6 py-3 rounded-lg hover:bg-white transition-colors"
                >
                  Agendar Conversa
                </Link>
                <Link
                  href="/#planos"
                  className="inline-flex items-center justify-center border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white hover:text-pm-brown transition-colors"
                >
                  Ver Planos
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
    </>
  );
}
