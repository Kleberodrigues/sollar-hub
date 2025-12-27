'use client';

import Link from "next/link";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const navLinks = [
  { href: "#para-quem", label: "Para quem é", isAnchor: true },
  { href: "/sobre", label: "Quem Somos", isAnchor: false },
  { href: "#como-funciona", label: "Como funciona", isAnchor: true },
  { href: "#o-que-mede", label: "O que mede", isAnchor: true },
  { href: "#planos", label: "Planos", isAnchor: true },
  { href: "/blog", label: "Blog", isAnchor: false },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        const headerHeight = 80; // altura do header fixo
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerHeight,
          behavior: 'smooth'
        });
      }
      setIsMenuOpen(false);
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border-light">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo variant="default" size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isAnchor ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="text-text-primary hover:text-pm-terracotta transition-colors font-medium cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text-primary hover:text-pm-terracotta transition-colors font-medium"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              className="bg-pm-terracotta hover:bg-pm-terracotta-hover"
              asChild
            >
              <Link href="/contato">Agendar Demo</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <nav className="py-4 space-y-4">
                {navLinks.map((link) => (
                  link.isAnchor ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="block text-text-primary hover:text-pm-terracotta transition-colors font-medium cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-text-primary hover:text-pm-terracotta transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
                <div className="pt-4 space-y-2 border-t border-border-light">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button
                    className="w-full bg-pm-terracotta hover:bg-pm-terracotta-hover"
                    asChild
                  >
                    <Link href="/contato">Agendar Demo</Link>
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
