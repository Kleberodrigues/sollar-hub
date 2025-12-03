'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'

interface ConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  required?: boolean
}

export function ConsentCheckbox({
  checked,
  onChange,
  label = 'Li e aceito a Política de Privacidade',
  required = true,
}: ConsentCheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Custom Checkbox */}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-6 h-6 rounded border-2 transition-all ${
          checked
            ? 'bg-sollar-terracotta border-sollar-terracotta'
            : 'bg-white border-border-DEFAULT hover:border-sollar-olive'
        }`}
        aria-label={checked ? 'Desmarcar consentimento' : 'Marcar consentimento'}
        aria-checked={checked}
        role="checkbox"
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Label */}
      <label className="flex-1 font-serif text-sm text-text-primary cursor-pointer" onClick={() => onChange(!checked)}>
        {label}
        {required && <span className="text-sollar-terracotta ml-1">*</span>}
        {' '}
        <Link
          href="/privacidade"
          target="_blank"
          className="text-sollar-terracotta hover:text-sollar-terracotta-hover underline"
          onClick={(e) => e.stopPropagation()}
        >
          (ler política completa)
        </Link>
      </label>
    </div>
  )
}
