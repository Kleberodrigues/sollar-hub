'use client';

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Quanto tempo leva para ter os resultados?",
    answer: "Em até 24 horas após o envio do questionário, você terá acesso aos dashboards e relatórios completos.",
  },
  {
    question: "As respostas são anônimas?",
    answer: "Sim. As respostas são totalmente anônimas, sem identificação individual. Os resultados são apresentados de forma agregada por área e as respostas abertas não ficam visíveis para os avaliadores da empresa.",
  },
  {
    question: "É preciso instalar algo?",
    answer: "Não. O PsicoMapa é 100% online. Basta acessar pelo navegador — funciona em qualquer dispositivo.",
  },
  {
    question: "Serve para qualquer setor?",
    answer: "Sim. Atendemos empresas de tecnologia, indústria, varejo, logística, serviços, saúde, educação e muito mais. O diagnóstico se adapta à realidade de cada organização.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim. Você pode cancelar sua assinatura a qualquer momento, sem burocracia. Seus dados permanecem acessíveis até o fim do período contratado.",
  },
  {
    question: "Tem limite de colaboradores?",
    answer: "Os planos atuais contemplam empresas com até 400 colaboradores. Se sua empresa tiver mais que isso, entre em contato para um plano personalizado Enterprise.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
  isInView,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border-b border-border-light last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-text-heading group-hover:text-pm-terracotta transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-pm-terracotta"
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-text-secondary leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-6 lg:py-8 bg-white" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-6"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pm-terracotta/10 mb-4">
            <HelpCircle className="w-7 h-7 text-pm-terracotta" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-heading mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-text-secondary">
            Tire suas dúvidas sobre o PsicoMapa
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-bg-secondary rounded-2xl p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-4"
        >
          <p className="text-text-secondary">
            Ainda tem dúvidas?{" "}
            <a
              href="mailto:contato@psicomapa.cloud"
              className="text-pm-terracotta hover:text-pm-terracotta-hover font-medium underline underline-offset-2 transition-colors"
            >
              Fale conosco
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
