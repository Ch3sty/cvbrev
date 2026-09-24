'use client'

/**
 * "Hoppa till" (docs/design/profil-registrering-2026-09-24.html, Del A):
 * ankarlänkar till profilens fyra sektioner, 44 px höga. Understrykningen i
 * ink-1 följer sektionen som syns (IntersectionObserver), aldrig orange.
 * Inte sticky: under en sticky topprad på 412 px hade den tagit 100 px.
 */

import { useEffect, useState } from 'react'
import { PROFIL } from '../profil-copy'

export type ProfilSektion = 'cv' | 'personliga-brev' | 'jobbsok' | 'konto'

export interface HoppaTillProps {
  sektioner: { id: ProfilSektion; etikett: string }[]
}

export default function HoppaTill({ sektioner }: HoppaTillProps) {
  const [aktiv, setAktiv] = useState<ProfilSektion>(sektioner[0]?.id ?? 'cv')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      (poster) => {
        const synlig = poster.filter((p) => p.isIntersecting).map((p) => p.target.id as ProfilSektion)
        if (synlig.length) setAktiv(synlig[0])
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    for (const s of sektioner) {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [sektioner])

  return (
    <nav aria-label={PROFIL.hoppaTill} className="flex flex-wrap gap-x-5 border-b border-kant">
      {sektioner.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={aktiv === s.id ? 'location' : undefined}
          onClick={() => setAktiv(s.id)}
          className={`relative text-sm font-medium leading-[44px] transition-colors hover:text-ink-1 ${
            aktiv === s.id
              ? 'text-ink-1 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ink-1'
              : 'text-ink-2'
          }`}
        >
          {s.etikett}
        </a>
      ))}
    </nav>
  )
}
