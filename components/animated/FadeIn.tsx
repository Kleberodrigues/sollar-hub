'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { animations } from '@/lib/animation-tokens'
import { ReactNode } from 'react'

interface FadeInProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  children: ReactNode
  delay?: number
  duration?: number
}

export function FadeIn({
  children,
  delay = 0,
  duration = animations.duration.normal,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: duration / 1000,
        delay,
        ease: animations.easing.smooth,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
