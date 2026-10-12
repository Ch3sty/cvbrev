'use client'

/**
 * Utseende på Inställningar: Följer systemet, Ljust, Mörkt (spec-rummen 4.3
 * och 6, våg 1b; skiss-installningar-2026-10-12). Under segmentet står
 * hjälpväxeln för Rekryteringstester, som flyttade hit från profilen.
 *
 * Temalogiken delas med segmentet i avatarmenyn (useTema, src/lib/tema.ts):
 * localStorage.tema på den här enheten, data-theme på <html>, skriptet i
 * rotlayouten före hydrering. Byts läget i menyn medan sidan är öppen följer
 * segmentet här med.
 *
 * Före montering visas "Följer systemet" som valt (servern vet inget om
 * enheten). Segmentet har samma mått i alla lägen, så inget hoppar när det
 * sparade valet läses in.
 */

import Segment from '@/components/shell/Segment'
import HjalpProfilRad from '@/components/hjalp/HjalpProfilRad'
import { useTema } from '@/hooks/useTema'
import { TEMAN, type Tema } from '@/lib/tema'
import { UTSEENDE } from '@/lib/rum/copy'

export default function UtseendeSection({ initialHjalpDold }: { initialHjalpDold: boolean | null }) {
  const { tema, valj } = useTema('installningar')

  return (
    <section id="utseende" aria-labelledby="utseende-rubrik" className="scroll-mt-24 rounded-xl border border-kant bg-papper">
      <div className="border-b border-kant px-4 py-3 sm:px-5">
        <h2 id="utseende-rubrik" className="text-kort text-ink-1">{UTSEENDE.rubrik}</h2>
        <p className="mt-0.5 text-meta text-ink-3">{UTSEENDE.under}</p>
      </div>
      <div className="px-4 py-3 sm:px-5">
        <Segment<Tema>
          value={tema}
          onChange={valj}
          label={UTSEENDE.rubrik}
          className="sm:max-w-[420px]"
          efterInnehall
          options={TEMAN.map((t) => ({ value: t, label: UTSEENDE.val[t] }))}
        />
      </div>
      <div className="border-t border-kant px-4 sm:px-5">
        <HjalpProfilRad initialDold={initialHjalpDold} />
      </div>
    </section>
  )
}
