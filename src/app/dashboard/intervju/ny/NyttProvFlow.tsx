'use client'

/**
 * Tvåstegsflödet för ett nytt intervjuprov (docs/design/rod-trad-prov-spec-2026-09-24.md,
 * avsnitt 3, design docs/design/rod-trad-prov-2026-09-24.html "Nytt intervjuprov").
 *
 *   steg 1  ?steg=fraga  sju ChoiceCards, det rekommenderade med marginalplatta
 *   steg 2  ?steg=svar   intervjuprovets panel i flödesläge, FlowShells fot bedömer
 *
 * Resultatet landar på /dashboard/intervju/{token} och ersätter flödets
 * steg i historiken, så bakåt från resultatet går till rummet. Krysset går
 * till rummet flödet startades från (flodeshistorik.ts). Kvoten (429) ritas som i
 * artikeln, med statusraden och länken till Träningspaketet, och foten döljs.
 */

import { useCallback, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, ArrowUp, Clock, PenLine } from '@/components/illustrations/RumIkoner'
import FlowShell from '@/components/shell/FlowShell'
import ChoiceCard from '@/components/shell/ChoiceCard'
import { IkonIntervju, IkonKrona, IkonProfil } from '@/components/illustrations/Ikoner'
import Intervjuprov from '@/components/artiklar/intervjuprov/Intervjuprov'
import { FRAGA_ORDNING, FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { capture } from '@/lib/analytics/events'
import { avslutaFlodet, lamnaFlodet } from '@/lib/flow/flodeshistorik'
import { useFlodeshistorik } from '@/lib/flow/useFlodeshistorik'
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
  const urlSteg = params.get('steg') === 'svar' ? 2 : 1
  // Medan resultatet ersätter stegen i historiken står flödet still.
  const stillaSteg = useRef(urlSteg)
  const { fore, stilla } = useFlodeshistorik(params.toString(), () => true)
  if (!stilla) stillaSteg.current = urlSteg
  const steg = stilla ? stillaSteg.current : urlSteg

  const [vald, setVald] = useState<FragaId | null>(forvald ?? rekommenderad)
  const [laddar, setLaddar] = useState(false)
  const [kvot, setKvot] = useState(false)
  const bedomRef = useRef<(() => void) | null>(null)

  const gaTill = useCallback(
    (s: 'fraga' | 'svar') => {
      const q = new URLSearchParams(params.toString())
      q.set('steg', s)
      if (vald) q.set('fraga', vald)
      fore('push')
      router.push(`/dashboard/intervju/ny?${q.toString()}`)
    },
    [params, router, vald, fore]
  )

  const fragaISteg2 = (params.get('fraga') as FragaId | null) ?? vald ?? rekommenderad
  const fraga: FragaId = FRAGA_ORDNING.includes(fragaISteg2) ? fragaISteg2 : rekommenderad

  const onStart = useCallback(() => {
    capture('interview_practice_started', { question: fraga, surface: 'dashboard' })
  }, [fraga])

  const onResultat = useCallback(
    (href: string, level: number) => {
      capture('interview_practice_completed', { question: fraga, level, surface: 'dashboard' })
      avslutaFlodet(router, href)
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
        onExit={() => lamnaFlodet(router)}
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
      onExit={() => lamnaFlodet(router)}
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
                  <span aria-hidden="true" className="inline-flex shrink-0 text-ton-ink [&>svg]:block">
                    <Ikon size={28} strokeWidth={1.75} />
                  </span>
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
