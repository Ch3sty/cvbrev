'use client'

/**
 * En föreslagen fråga på /verktyg/jobbcoachen som leder in i ett riktigt
 * första meddelande: genom registreringen till Jobbcoachen i kontot, med
 * frågan i fältet. Frågan läggs i webbläsarens lagring vid trycket
 * (lib/jobbsok/provaFraga.ts) och adressen bär bara flaggan ?fraga=1, så
 * att ingen fråga hamnar i mätningen: PostHog läser hela adressen.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'
import { coachHref, sparaCoachFraga } from '@/lib/jobbsok/provaFraga'

const HREF = coachHref(true)

export default function FragaLank({ fraga, className, children }: { fraga: string; className?: string; children: ReactNode }) {
  return (
    <Link className={className} href={HREF} onClick={() => sparaCoachFraga(fraga)}>
      {children}
    </Link>
  )
}
