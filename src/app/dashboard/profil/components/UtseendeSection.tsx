'use client'

/**
 * Utseende: Följer systemet, Ljust, Mörkt (spec-rummen 4.3 och 6, våg 1b).
 *
 * Temalogiken bor i src/lib/tema.ts och delas med segmentet i avatarmenyn
 * genom useTema: localStorage.tema på den här enheten, data-theme på <html>
 * och skriptet i rotlayoutens <head> före hydrering.
 *
 * Före montering visas "Följer systemet" som valt (servern vet inget om
 * enheten). Segmentet har samma mått i alla lägen, så inget hoppar när det
 * sparade valet läses in.
 */

import Segment from '@/components/shell/Segment'
import { useTema } from '@/hooks/useTema'
import { TEMAN, type Tema } from '@/lib/tema'
import { UTSEENDE } from '@/lib/rum/copy'

export default function UtseendeSection() {
  const { tema, valj } = useTema('installningar')

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
          options={TEMAN.map((t) => ({ value: t, label: UTSEENDE.val[t] }))}
        />
      </div>
    </section>
  )
}
