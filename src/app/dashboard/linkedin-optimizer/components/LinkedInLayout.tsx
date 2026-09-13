'use client'

/**
 * Kolumnen för de LinkedIn-vyer som inte ligger i FlowShell. I dag används
 * den ingenstans i flödet självt: FlowShell äger toppraden, tråden och foten.
 * Marken kommer från DashboardShell, sidan sätter aldrig egen bakgrund.
 */

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function LinkedInLayout({ children }: Props) {
  return <div className="mx-auto w-full max-w-3xl space-y-4 pb-16 sm:space-y-6">{children}</div>
}
