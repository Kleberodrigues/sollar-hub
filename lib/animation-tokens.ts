/**
 * Animation Design Tokens
 * Centralized animation configuration for Framer Motion
 */

export const animations = {
  // Duration in milliseconds
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Easing functions (cubic-bezier values)
  easing: {
    smooth: [0.4, 0, 0.2, 1] as const,
    entrance: [0, 0, 0.2, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
  },

  // Common animation variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  },

  // Stagger configurations
  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    fast: {
      animate: {
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    slow: {
      animate: {
        transition: {
          staggerChildren: 0.15,
        },
      },
    },
  },
} as const;

// Type exports for TypeScript
export type AnimationVariant = keyof typeof animations.variants;
export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;
