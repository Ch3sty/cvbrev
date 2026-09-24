'use client'

/**
 * Tvåstegsflödet för ett nytt intervjuprov (docs/design/rod-trad-prov-spec-2026-09-24.md,
 * avsnitt 3, design docs/design/rod-trad-prov-2026-09-24.html "Nytt intervjuprov").
 *
 *   steg 1  ?steg=fraga  sju ChoiceCards, det rekommenderade med marginalplatta
 *   steg 2  ?steg=svar   intervjuprovets panel i flödesläge, FlowShells fot bedömer
 *
 * Resultatet landar på /dashboard/intervju/{token}. Kvoten (429) ritas som i
 * artikeln, med statusraden och länken till Träningspaketet, och foten döljs.
 */

import { useCallback, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, ArrowUp, Clock, PenLine } from 'lucide-react'
import FlowShell from '@/components/shell/FlowShell'
import ChoiceCard from '@/components/shell/ChoiceCard'
import MarginPlate from '@/components/shell/MarginPlate'
import { IkonIntervju, IkonKrona, IkonProfil } from '@/components/illustrations/Ikoner'
import Intervjuprov from '@/components/artiklar/intervjuprov/Intervjuprov'
import { FRAGA_ORDNING, FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { capture } from '@/lib/analytics/events'
import { INFOR_INTERVJUN_HREF } from '@/lib/intervju/lankar'
import { NY } from '../infor-intervjun-copy'

type Ikon = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

/** Befintliga ikoner, inga nya: Ikoner.tsx och lucide i 24/1,75. */
const IKON: Record<FragaId, Ikon> = {
  beratta: IkonProfil,
  styrkor: ArrowUp,
  varfor_vi: IkonKrona,
  varfor_jobbet: PenLine,
  star: Clock,
  konflikt: IkonIntervju,
  misstag: AlertTriangle,
}

export default function NyttProvFlow({
  rekommenderad,
  forvald,
  antal,
  basta,
}: {
  rekommenderad: FragaId
  forvald: FragaId | null
  antal: Partial<Record<FragaId, number>>
  basta: Partial<Record<FragaId, number>>
}) {
  const router = useRouter()
  const params = useSearchParams()
  const steg = params.get('steg') === 'svar' ? 2 : 1

  const [vald, setVald] = useState<FragaId | null>(forvald ?? rekommenderad)
  const [laddar, setLaddar] = useState(false)
  const [kvot, setKvot] = useState(false)
  const bedomRef = useRef<(() => void) | null>(null)

  const gaTill = useCallback(
    (s: 'fraga' | 'svar') => {
      const q = new URLSearchParams(params.toString())
      q.set('steg', s)
      if (vald) q.set('fraga', vald)
      router.push(`/dashboard/intervju/ny?${q.toString()}`)
    },
    [params, router, vald]
  )

  const fragaISteg2 = (params.get('fraga') as FragaId | null) ?? vald ?? rekommenderad
  const fraga: FragaId = FRAGA_ORDNING.includes(fragaISteg2) ? fragaISteg2 : rekommenderad

  const onStart = useCallback(() => {
    capture('interview_practice_started', { question: fraga, surface: 'dashboard' })
  }, [fraga])

  const onResultat = useCallback(
    (href: string, level: number) => {
      capture('interview_practice_completed', { question: fraga, level, surface: 'dashboard' })
      router.push(href)
    },
    [fraga, router]
  )

  const onKvot = useCallback(() => setKvot(true), [])

  if (steg === 2) {
    return (
      <FlowShell
        title={NY.titel}
        step={2}
        totalSteps={2}
        onBack={() => gaTill('fraga')}
        onExit={() => router.push(INFOR_INTERVJUN_HREF)}
        primaryLabel={kvot ? undefined : NY.bedom}
        onPrimary={kvot ? undefined : () => bedomRef.current?.()}
        primaryBusy={laddar}
        busyLabel={NY.busy}
      >
        <Intervjuprov
          key={fraga}
          fraga={fraga}
          laege="flode"
          slug="dashboard/intervju/ny"
          bedomRef={bedomRef}
          onResultat={onResultat}
          onLaddar={setLaddar}
          onKvot={onKvot}
          onStart={onStart}
        />
      </FlowShell>
    )
  }

  return (
    <FlowShell
      title={NY.titel}
      step={1}
      totalSteps={2}
      onExit={() => router.push(INFOR_INTERVJUN_HREF)}
      primaryLabel={NY.fortsatt}
      onPrimary={() => vald && gaTill('svar')}
      primaryDisabled={!vald}
      primaryBlockedReason={NY.valjForst}
    >
      <p className="text-steg uppercase text-ink-3">{NY.steg1}</p>
      <p className="mt-2 text-fraga text-ink-1">{NY.fraga}</p>
      <div role="radiogroup" aria-label={NY.fraga} className="mt-3 grid gap-2">
        {FRAGA_ORDNING.map((id) => {
          const Ikon = IKON[id]
          const rek = id === rekommenderad
          return (
            <ChoiceCard
              key={id}
              selected={vald === id}
              onSelect={() => setVald(id)}
              variant={rek ? 'featured' : 'plain'}
              eyebrow={rek ? NY.rekommenderas : undefined}
              leading={
                rek ? (
                  <MarginPlate>
                    <Ikon size={28} strokeWidth={1.75} />
                  </MarginPlate>
                ) : (
                  <Ikon size={24} strokeWidth={1.75} />
                )
              }
              title={FRAGOR[id].text.replace(/\.$/, '')}
              description={FRAGOR[id].beskrivning}
              meta={NY.meta(antal[id] ?? 0, basta[id])}
            />
          )
        })}
      </div>
    </FlowShell>
  )
}
