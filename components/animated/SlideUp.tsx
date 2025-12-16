'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { animations } from '@/lib/animation-tokens'
import { ReactNode } from 'react'

interface SlideUpProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  children: ReactNode
  delay?: number
  duration?: number
  offset?: number
}

export function SlideUp({
  children,
  delay = 0,
  duration = animations.duration.normal,
  offset = 20,
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
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
