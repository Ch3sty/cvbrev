'use client'

/**
 * Raden "Dölj hjälpen" i profilen (skiss Provbladet, avsnitt 4: "Dölj
 * hjälpen" tar bort hjälpen helt tills man slår på den igen i profilen).
 * Växeln är på när hjälpen är dold. Valet sparas i profiles.hjalp_dold och
 * i localStorage (src/lib/traning/hjalp.ts).
 */


import { ToggleSwitch } from '@/app/dashboard/profil/components/ProfileField'
import { HJALP_UI } from '@/lib/traning/hjalp-copy'
import { HjalpProvider, useHjalp } from './HjalpKontext'

function Rad() {
  const { dold, dolj, visa } = useHjalp()
  const titelId = 'hjalp-dold-titel'
  return (
    <section id="hjalp" className="scroll-mt-24 rounded-xl border border-kant bg-papper">
      <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 id={titelId} className="text-kort text-ink-1">
            {HJALP_UI.profilTitel}
          </h2>
          <p className="mt-0.5 text-meta text-ink-3">{HJALP_UI.profilText}</p>
        </div>
        <ToggleSwitch checked={dold} onChange={(v) => (v ? dolj() : visa())} labelledBy={titelId} />
      </div>
    </section>
  )
}

export default function HjalpProfilRad({ initialDold }: { initialDold: boolean | null }) {
  return (
    <HjalpProvider dold={initialDold} forsta={false}>
      <Rad />
    </HjalpProvider>
  )
}
