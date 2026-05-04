'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** När live-preview visas på desktop använder vi bredare layout */
  withPreview?: boolean
}

/**
 * Wrapper för skapa-cv-flödet. Två varianter:
 * - Standard (max-w-3xl): för Steg 0 (intro), Steg 7 (granska)
 * - Med preview (max-w-6xl): för Steg 1-6 där live-preview visas till
 *   höger på desktop
 */
export default function SkapaCvLayout({ children, withPreview = false }: Props) {
  return (
    <div
      className={`mx-auto py-2 sm:py-6 pb-32 sm:pb-20 space-y-6 sm:space-y-8 ${
        withPreview ? 'max-w-6xl' : 'max-w-3xl'
      }`}
    >
      {children}
    </div>
  )
}
