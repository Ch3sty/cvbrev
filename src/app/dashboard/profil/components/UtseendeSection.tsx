'use client'

/**
 * Utseende: Följer systemet, Ljust, Mörkt (spec-rummen 4.3 och 6, våg 1b).
 *
 * Valet sparas i localStorage.tema på den här enheten, utan serverlagring,
 * och slår igenom direkt: attributet data-theme på <html> sätts eller tas
 * bort. Skriptet i rotlayoutens <head> läser samma nyckel före hydrering,
 * så nästa sidladdning står i rätt läge från första bilden. Väggen byter
 * aldrig färg; mörkt läge byter golv och papper.
 *
 * Före montering visas "Följer systemet" som valt (servern vet inget om
 * enheten). Segmentet har samma mått i alla lägen, så inget hoppar när det
 * sparade valet läses in.
 */

import { useEffect, useState } from 'react'
import Segment from '@/components/shell/Segment'
import { capture } from '@/lib/analytics/events'
import { UTSEENDE } from '@/lib/rum/copy'

type Tema = 'system' | 'ljust' | 'morkt'

const NYCKEL = 'tema'

function lasTema(): Tema {
  try {
    const t = window.localStorage.getItem(NYCKEL)
    return t === 'ljust' || t === 'morkt' ? t : 'system'
  } catch {
    return 'system'
  }
}

function tillampa(tema: Tema): void {
  const rot = document.documentElement
  if (tema === 'ljust') rot.dataset.theme = 'light'
  else if (tema === 'morkt') rot.dataset.theme = 'dark'
  else delete rot.dataset.theme
}

export default function UtseendeSection() {
  const [tema, setTema] = useState<Tema>('system')

  useEffect(() => {
    setTema(lasTema())
  }, [])

  const valj = (nytt: Tema) => {
    setTema(nytt)
    try {
      if (nytt === 'system') window.localStorage.removeItem(NYCKEL)
      else window.localStorage.setItem(NYCKEL, nytt)
    } catch {
      // Privat läge: valet gäller den här sidvisningen.
    }
    tillampa(nytt)
    capture('tema_bytt', { tema: nytt })
  }

  return (
    <section id="utseende" className="scroll-mt-24 rounded-xl border border-kant bg-papper">
      <div className="border-b border-kant px-4 py-3 sm:px-5">
        <h2 className="text-kort text-ink-1">{UTSEENDE.rubrik}</h2>
      </div>
      <div className="px-4 py-4 sm:px-5">
        <Segment<Tema>
          value={tema}
          onChange={valj}
          label={UTSEENDE.rubrik}
          options={[
            { value: 'system', label: UTSEENDE.val.system },
            { value: 'ljust', label: UTSEENDE.val.ljust },
            { value: 'morkt', label: UTSEENDE.val.morkt },
          ]}
        />
      </div>
    </section>
  )
}
