'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if the user prefers reduced motion
 * Respects prefers-reduced-motion media query for accessibility
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    setReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return reducedMotion
}
