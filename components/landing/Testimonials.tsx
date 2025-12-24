'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote:
      "O PsicoMapa transformou nossa abordagem de saúde ocupacional. Em 3 meses, conseguimos reduzir em 40% os afastamentos por questões psicológicas.",
    author: "Maria Silva",
    role: "Diretora de RH",
    company: "TechCorp Brasil",
    image: "/images/avatar-1.jpg",
  },
  {
    quote:
      "O diagnóstico NR-1 ficou muito mais simples. Antes levávamos semanas, agora em poucos dias temos um panorama completo com ações recomendadas.",
    author: "Carlos Santos",
    role: "Gerente de Segurança do Trabalho",
    company: "Indústria ABC",
    image: "/images/avatar-2.jpg",
  },
  {
    quote:
      "A anonimidade das respostas aumentou drasticamente a participação dos colaboradores. Finalmente temos dados confiáveis para tomar decisões.",
    author: "Ana Oliveira",
    role: "Head de People",
    company: "Startup XYZ",
    image: "/images/avatar-3.jpg",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-24 bg-bg-sage">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-text-secondary">
            Mais de 500 organizações confiam no PsicoMapa para cuidar da saúde
            mental dos seus colaboradores.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Quote Icon */}
            <Quote className="absolute top-6 left-6 w-12 h-12 text-pm-olive/20" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <blockquote className="text-xl md:text-2xl text-text-primary leading-relaxed mb-8 italic">
                  &ldquo;{testimonials[currentIndex].quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4">
                  {/* Avatar placeholder */}
                  <div className="w-14 h-14 bg-gradient-to-br from-pm-olive to-pm-terracotta rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentIndex].author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-text-heading">
                      {testimonials[currentIndex].author}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {testimonials[currentIndex].role} -{" "}
                      {testimonials[currentIndex].company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-border-light">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-pm-terracotta"
                        : "bg-border-light hover:bg-border"
                    }`}
                    aria-label={`Ver depoimento ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  aria-label="Ver depoimento anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  aria-label="Ver próximo depoimento"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
