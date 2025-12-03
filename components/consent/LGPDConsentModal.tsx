'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { animations } from '@/lib/animation-tokens'
import Link from 'next/link'

interface LGPDConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}

export function LGPDConsentModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: LGPDConsentModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false)
      setIsAccepting(false)
    }
  }, [isOpen])

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (!contentRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current
    const isBottom = scrollTop + clientHeight >= scrollHeight - 10

    if (isBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
    }
  }

  const handleAccept = () => {
    setIsAccepting(true)
    setTimeout(() => {
      onAccept()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: animations.duration.normal / 1000,
              ease: animations.easing.smooth,
            }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-lg shadow-lg z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light">
              <h2 className="font-display text-2xl font-semibold text-sollar-green-dark">
                Política de Privacidade e Consentimento
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 font-serif text-text-primary"
            >
              <div className="prose prose-sm max-w-none">
                <p className="mb-4">
                  Para prosseguir, você precisa aceitar nossa Política de Privacidade e consentir com o tratamento de seus dados pessoais.
                </p>

                <h3 className="font-display text-lg font-semibold text-sollar-green-dark mt-6 mb-3">
                  Resumo da Política
                </h3>

                <p className="mb-3">
                  Ao prosseguir, você concorda que:
                </p>

                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>Suas respostas serão armazenadas de forma segura e anônima</li>
                  <li>Os dados serão utilizados exclusivamente para análise de riscos psicossociais</li>
                  <li>As informações serão visualizadas apenas de forma agregada</li>
                  <li>Você pode solicitar a exclusão de seus dados a qualquer momento</li>
                  <li>Seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD)</li>
                </ul>

                <h3 className="font-display text-lg font-semibold text-sollar-green-dark mt-6 mb-3">
                  Seus Direitos
                </h3>

                <p className="mb-3">
                  De acordo com a LGPD, você tem direito de:
                </p>

                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou incorretos</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Revogar o consentimento a qualquer momento</li>
                  <li>Solicitar a portabilidade de seus dados</li>
                </ul>

                <div className="bg-bg-sage rounded-lg p-4 mt-6">
                  <p className="text-sm">
                    <strong>Importante:</strong> Para exercer qualquer desses direitos ou tirar dúvidas, entre em contato em{' '}
                    <a
                      href="mailto:juliakalil@sollartreinamentos.com.br"
                      className="text-sollar-terracotta hover:text-sollar-terracotta-hover underline"
                    >
                      juliakalil@sollartreinamentos.com.br
                    </a>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-border-light">
                  <Link
                    href="/privacidade"
                    target="_blank"
                    className="text-sollar-terracotta hover:text-sollar-terracotta-hover underline text-sm"
                  >
                    Ler a Política de Privacidade completa →
                  </Link>
                </div>

                {!hasScrolledToBottom && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-text-muted animate-pulse">
                      ↓ Role até o final para aceitar ↓
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-light bg-bg-tertiary">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onDecline}
                  className="px-6 py-2.5 rounded-lg font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                >
                  Não aceito
                </button>
                <motion.button
                  onClick={handleAccept}
                  disabled={!hasScrolledToBottom || isAccepting}
                  whileTap={{ scale: hasScrolledToBottom ? 0.98 : 1 }}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    hasScrolledToBottom
                      ? 'bg-sollar-terracotta hover:bg-sollar-terracotta-hover text-white shadow-sm'
                      : 'bg-bg-secondary text-text-muted cursor-not-allowed'
                  }`}
                >
                  {isAccepting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Aceito os termos
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
