'use client'

/**
 * Hemvyns interaktiva öar (våg 2). Allt annat i hemvyn är serverrenderat.
 *
 *   Betalvagg       ett gemensamt ark (GraValSheet) för vyns låsta rader;
 *                   rubriken namnger det låsta efter platsen ("Riktade pass
 *                   ingår i Premium") och det sekundära är länken "Se vad
 *                   som ingår" (paywall-copy testrumRubrik, 24.3 punkt 5)
 *   KopKnapp        kopparknappen i det lyfta kortet på gratisnivån (17.2):
 *                   kortet är betalväggen (1f, W3), knappen går direkt till
 *                   köpsteget för Premium och betalvagg_visad skjuts en gång
 *                   per montering
 *   LasChip         låst rad: "Riktat pass", "Ingår i Premium"; öppnar arket
 *   ForsokIgen      felet (X1): laddar om serverdatan
 *   EfterProvet     "Hur gick det?" (1e), tre glasknappar, aldrig "sparat" på fel
 *   TaBortSvar      svaret är frivilligt och raderbart
 *   HemMatning      traning_hem_visad en gång per visning
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GraValSheet from '@/components/paywall/GraValSheet'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'
import type { Scope } from '@/lib/access/features'
import { SALD_PLAN, type PlanKey } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { KNAPP_GLAS, KNAPP_PRIMAR, LANK, LANK_VAGG } from '@/components/shell/knappar'
import Chip from '@/components/rum/Chip'
import { HEM } from '@/lib/traning/hem-copy'
import type { Betalvagg as Feature, HemMatning as Tillstand } from '@/lib/traning/hemvy'

interface BetalvaggVarde {
  oppna: (f: Feature, plats: BetalvaggPlats) => void
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
  const [last, setLast] = useState<{ feature: Feature; plats: BetalvaggPlats } | null>(null)
  const oppna = useCallback((feature: Feature, plats: BetalvaggPlats) => setLast({ feature, plats }), [])
  return (
    <Kontext.Provider value={{ oppna }}>
      {children}
      {last ? (
        <GraValSheet
          open
          onClose={() => setLast(null)}
          feature={last.feature}
          variant="testniva"
          plats={last.plats}
          scope={scope}
          track={track}
          planKey={planKey}
          surface="/dashboard/tester"
        />
      ) : null}
    </Kontext.Provider>
  )
}

/**
 * Köpknappen i det lyfta kortet. Kortet bär redan rubrik, text och prisrad,
 * så knappen går direkt till köpsteget (en betalvägg bär sin egen knapp,
 * art-director 20.2 fråga 1). betalvagg_visad en gång per montering.
 */
export function KopKnapp({
  text,
  plats,
  dagarKvar = null,
}: {
  text: string
  plats: BetalvaggPlats
  dagarKvar?: number | null
}) {
  const skickad = useRef(false)
  useEffect(() => {
    if (skickad.current) return
    skickad.current = true
    capture('betalvagg_visad', { plats, dagar_kvar: dagarKvar })
  }, [plats, dagarKvar])
  return (
    <Link
      href={kopstegHref(SALD_PLAN, plats)}
      className={KNAPP_PRIMAR}
      onClick={() =>
        capture('paywall_cta_clicked', { variant: 'testniva', surface: '/dashboard/tester', cta: 'primary', plan: SALD_PLAN, plats })
      }
    >
      {text}
    </Link>
  )
}

export function LasChip({ feature, text, label, plats }: { feature: Feature; text: string; label?: string; plats: BetalvaggPlats }) {
  const { oppna } = useContext(Kontext)
  return (
    <button
      type="button"
      onClick={() => oppna(feature, plats)}
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
