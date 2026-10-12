'use client'

/**
 * Raden "Dölj hjälpen" (skiss Provbladet, avsnitt 4: "Dölj hjälpen" tar bort
 * hjälpen helt tills man slår på den igen). Sedan 2026-10-13 står raden i
 * kortet Utseende på Inställningar (skiss-installningar-2026-10-12), som en
 * rad under segmentet, inte som eget kort.
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
    <div id="hjalp" className="flex min-h-14 scroll-mt-24 items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p id={titelId} className="text-sm font-medium leading-5 text-ink-1">
          {HJALP_UI.profilTitel}
        </p>
        <p className="mt-0.5 text-meta text-ink-3">{HJALP_UI.profilText}</p>
      </div>
      <ToggleSwitch checked={dold} onChange={(v) => (v ? dolj() : visa())} labelledBy={titelId} />
    </div>
  )
}

export default function HjalpProfilRad({ initialDold }: { initialDold: boolean | null }) {
  return (
    <HjalpProvider dold={initialDold} forsta={false}>
      <Rad />
    </HjalpProvider>
  )
}
