'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** När live-preview visas på desktop använder vi bredare layout */
  withPreview?: boolean
}

/**
 * Wrapper för skapa-cv-flödet. FlowShell äger mark, topprad och fot; det
 * här är bara kolumnen. Två bredder: standard för granskningen, bredare när
 * förhandsvisningen ligger i en egen kolumn till höger på desktop.
 */
export default function SkapaCvLayout({ children, withPreview = false }: Props) {
  return (
    <div
      className={`mx-auto space-y-4 pb-4 sm:space-y-6 ${
        withPreview ? 'max-w-6xl' : 'max-w-3xl'
      }`}
    >
      {children}
    </div>
  )
}
