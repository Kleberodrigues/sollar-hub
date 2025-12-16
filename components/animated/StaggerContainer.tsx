'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerContainerProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  children: ReactNode
  staggerDelay?: number
  delayChildren?: number
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
        hidden: {},
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Child item component for use inside StaggerContainer
export const StaggerItem = motion.div
