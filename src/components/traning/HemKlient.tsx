'use client'

/**
 * Hemvyns interaktiva öar (våg 2). Allt annat i hemvyn är serverrenderat.
 *
 *   Betalvagg       ett gemensamt ark (GraValSheet) för vyns lås och
 *                   köpknapp, med paketets namn och pris ur PLANS
 *   KopKnapp        kopparknappen i det lyfta kortet på gratisnivån (17.2)
 *   LasChip         låst rad: "Riktat pass", "Ingår i Hela paketet"
 *   ForsokIgen      felet (X1): laddar om serverdatan
 *   EfterProvet     "Hur gick det?" (1e), tre glasknappar, aldrig "sparat" på fel
 *   TaBortSvar      svaret är frivilligt och raderbart
 *   HemMatning      traning_hem_visad en gång per visning
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import GraValSheet from '@/components/paywall/GraValSheet'
import { capture } from '@/lib/analytics/events'
import type { Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import { KNAPP_GLAS, KNAPP_PRIMAR, LANK, LANK_VAGG } from '@/components/shell/knappar'
import Chip from '@/components/rum/Chip'
import { HEM } from '@/lib/traning/hem-copy'
import type { Betalvagg as Feature, HemMatning as Tillstand } from '@/lib/traning/hemvy'

interface BetalvaggVarde {
  oppna: (f: Feature) => void
}

const Kontext = createContext<BetalvaggVarde>({ oppna: () => {} })

export function Betalvagg({
  children,
  scope,
  track,
  planKey,
}: {
  children: ReactNode
  scope: Scope | null
  track: Scope | null
  planKey: PlanKey | null
}) {
  const [feature, setFeature] = useState<Feature | null>(null)
  const oppna = useCallback((f: Feature) => setFeature(f), [])
  return (
    <Kontext.Provider value={{ oppna }}>
      {children}
      {feature ? (
        <GraValSheet
          open
          onClose={() => setFeature(null)}
          feature={feature}
          variant="testniva"
          scope={scope}
          track={track}
          planKey={planKey}
          surface="/dashboard/tester"
        />
      ) : null}
    </Kontext.Provider>
  )
}

export function KopKnapp({ feature, text }: { feature: Feature; text: string }) {
  const { oppna } = useContext(Kontext)
  return (
    <button type="button" className={KNAPP_PRIMAR} onClick={() => oppna(feature)}>
      {text}
    </button>
  )
}

export function LasChip({ feature, text, label }: { feature: Feature; text: string; label?: string }) {
  const { oppna } = useContext(Kontext)
  return (
    <button
      type="button"
      onClick={() => oppna(feature)}
      aria-label={label ?? `${text}. Låst.`}
      className="inline-flex min-h-11 items-center"
    >
      <Chip las>{text}</Chip>
    </button>
  )
}

export function ForsokIgen({ text }: { text: string }) {
  const router = useRouter()
  const [arbetar, setArbetar] = useState(false)
  return (
    <button
      type="button"
      className={KNAPP_PRIMAR}
      disabled={arbetar}
      onClick={() => {
        setArbetar(true)
        router.refresh()
        window.setTimeout(() => setArbetar(false), 1500)
      }}
    >
      {text}
    </button>
  )
}

type Utfall = 'vidare' | 'vet_inte' | 'inte_vidare'

export function EfterProvet() {
  const router = useRouter()
  const [arbetar, setArbetar] = useState<Utfall | null>(null)
  const [fel, setFel] = useState(false)
  const svara = async (utfall: Utfall) => {
    if (arbetar) return
    setArbetar(utfall)
    setFel(false)
    try {
      const svar = await fetch('/api/traning/efter-provet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utfall }),
      })
      if (!svar.ok) throw new Error(String(svar.status))
      capture('efter_provet_svar', { svar: utfall })
      router.refresh()
    } catch {
      setFel(true)
    } finally {
      setArbetar(null)
    }
  }
  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Hur gick det?">
        {(['vidare', 'vet_inte', 'inte_vidare'] as const).map((u) => (
          <button key={u} type="button" className={KNAPP_GLAS} disabled={arbetar !== null} onClick={() => svara(u)}>
            {arbetar === u ? HEM.efter.sparar : HEM.efter.svar[u]}
          </button>
        ))}
      </div>
      {fel ? (
        <p role="alert" className="mt-3 text-sm text-vagg-ink">
          {HEM.efter.fel}
        </p>
      ) : null}
    </div>
  )
}

export function TaBortSvar({ pa = 'golv' }: { pa?: 'golv' | 'vagg' }) {
  const router = useRouter()
  const [arbetar, setArbetar] = useState(false)
  const [fel, setFel] = useState(false)
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        className={`${pa === 'vagg' ? LANK_VAGG : LANK} min-h-11 text-left`}
        disabled={arbetar}
        onClick={async () => {
          setArbetar(true)
          setFel(false)
          try {
            const r = await fetch('/api/traning/efter-provet', { method: 'DELETE' })
            if (!r.ok) throw new Error(String(r.status))
            router.refresh()
          } catch {
            setFel(true)
          } finally {
            setArbetar(false)
          }
        }}
      >
        {HEM.efterSvar.taBort}
      </button>
      {fel ? (
        <span role="alert" className="text-meta text-ink-3">
          {HEM.efter.fel}
        </span>
      ) : null}
    </span>
  )
}

export function HemMatning({ tillstand }: { tillstand: Tillstand }) {
  const skickad = useRef<string | null>(null)
  useEffect(() => {
    if (skickad.current === tillstand) return
    skickad.current = tillstand
    capture('traning_hem_visad', { tillstand })
  }, [tillstand])
  return null
}
