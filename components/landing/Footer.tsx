'use client';

import Link from "next/link";
import { SunIcon } from "@/components/Logo";
import { Mail, Phone } from "lucide-react";

const legalLinks = [
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
  { label: "LGPD", href: "/lgpd" },
  { label: "Cookies", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="bg-pm-brown text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-display font-bold relative">
                <span className="text-pm-olive-light">Psico</span>
                <span className="text-white">Mapa</span>
                <SunIcon size={14} className="absolute -top-1 -right-3 text-pm-olive-light" />
              </span>
            </div>
            <p className="text-white/70 text-sm max-w-xs">
              Diagnóstico de riscos psicossociais e pesquisa de clima contínua
              para organizações que cuidam de pessoas.
            </p>
          </div>

          {/* Contact Column */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="mailto:contato@psicomapa.cloud"
                className="flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                contato@psicomapa.cloud
              </a>
              <a
                href="tel:+5511999999999"
                className="flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
            </div>
          </div>

          {/* Legal Column */}
          <div className="text-right">
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* COPSOQ Reference */}
        <div className="pt-6 border-t border-white/10 mb-6">
          <p className="text-white/50 text-xs text-center max-w-2xl mx-auto">
            O diagnóstico é baseado no COPSOQ II Brasileiro (COPSOQ II-BR),
            referência internacional para avaliação de fatores de riscos
            psicossociais, adaptada ao contexto brasileiro.
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} PsicoMapa. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
