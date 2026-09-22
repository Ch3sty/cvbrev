'use client'

/**
 * Veckopanelen på hemskärmen (docs/plan-paket-och-onboarding.md, flöde 3).
 *
 * Två lägen på samma tråd:
 *   sammandragen  sju noder på en rad, och under dem dagens sak med sin knapp
 *   utfälld       alla sju dagar som lista, efter tryck på "Hela veckan"
 *
 * Dag 7 är sammanställningen med fyra stora tal och förnyelsefrågan, och den
 * frågan ställs här och ingen annanstans. Den är inte ett köpbeslut:
 * prenumerationen förnyas automatiskt, det står i statusraden, och
 * "Se vecka 2" betyder just det.
 *
 * All data kommer serverrenderad via /api/dashboard/summary. Panelen hämtar
 * ingenting själv: ett eget anrop efter mount ger CLS och bryter hemskärmens
 * LCP-budget på 1,0 s.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import VeckoNoder from '@/components/shell/VeckoNoder'
import MarginPlate from '@/components/shell/MarginPlate'
import StatusRow from '@/components/shell/StatusRow'
import Sheet from '@/components/shell/Sheet'
import {
  IlluPlattaAnsokan,
  IlluPlattaCvPoang,
  IlluPlattaNedladdning,
  IlluPlattaPresentation,
  IlluPlattaTest,
  IlluPlattaUppfoljning,
} from '@/components/illustrations/TradenScener'
import { capture } from '@/lib/analytics/events'
import {
  DAG7,
  VECKOPANEL,
  dag7Dragning,
  dag7Kvar,
  veckansDagar,
  veckansNamn,
  type Dag,
  type Track,
  type WeekTrack,
} from '@/lib/onboarding/program'
import { PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans'

const KNAPP_PRIMAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40'
const LANK =
  'text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

/** En platta per dag. Vyns enda, och därför får NastaHandling ingen. */
const PLATTOR = [
  IlluPlattaAnsokan,
  IlluPlattaCvPoang,
  IlluPlattaPresentation,
  IlluPlattaNedladdning,
  IlluPlattaCvPoang,
  IlluPlattaUppfoljning,
  IlluPlattaTest,
]

function svensktDatum(iso: string | null, fallbackDagar: number): string {
  const d = iso ? new Date(iso) : new Date(Date.now() + fallbackDagar * 86400000)
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Stockholm',
  }).format(d)
}

export interface VeckoTradProps {
  track: Track
  /** Vilket spårs vecka Allt-köparen kör. */
  weekTrack: WeekTrack
  /** Dagen hon står på, 1 till 7. 0 betyder att veckan inte börjat. */
  progressDay: number
  planKey: PlanKey
  currentPeriodEnd: string | null
  /** Fyra tal till dag 7:s sammanställning, i talens ordning. */
  summaryTal?: readonly [number, number, number, number]
  /** Kallas när panelen ändrat framsteg, så hemskärmen kan hämta om. */
  onProgress?: () => void
  className?: string
}

export default function VeckoTrad({
  track,
  weekTrack,
  progressDay,
  planKey,
  currentPeriodEnd,
  summaryTal,
  onProgress,
  className,
}: VeckoTradProps) {
  const router = useRouter()
  const dagar = useMemo(() => veckansDagar(track, weekTrack), [track, weekTrack])
  const plan = PLAN_BY_KEY[planKey]

  // Lokalt framsteg så kvitteringen syns utan omladdning. Servern är
  // sanningen, men användaren ska inte se en sida hoppa efter ett klick.
  const [dag, setDag] = useState(() => Math.min(7, Math.max(1, progressDay || 1)))
  const [kvitterad, setKvitterad] = useState<number | null>(null)
  const [utfalld, setUtfalld] = useState(false)
  const [arkOppet, setArkOppet] = useState(false)
  const [busy, setBusy] = useState(false)
  const hoppaRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setDag(Math.min(7, Math.max(1, progressDay || 1)))
  }, [progressDay])

  const klara = useMemo(
    () => Array.from({ length: Math.max(0, dag - 1) }, (_, i) => i + 1),
    [dag]
  )
  const aktuell = dagar[dag - 1] ?? dagar[0]
  const Platta = PLATTOR[dag - 1] ?? IlluPlattaAnsokan

  // week_day_opened en gång per dag och session, aldrig per omritning.
  const skjutna = useRef<Set<number>>(new Set())
  useEffect(() => {
    if (skjutna.current.has(dag)) return
    skjutna.current.add(dag)
    capture('week_day_opened', { track, day: dag, source: 'app' })
  }, [dag, track])

  // Dag 7 mäts som sammanställningen, och den varma raden som förnyelsen.
  const visat7 = useRef(false)
  useEffect(() => {
    if (dag !== 7 || visat7.current) return
    visat7.current = true
    capture('week_summary_viewed', { track, days_completed: klara.length })
    capture('renewal_upcoming_shown', { plan: planKey, days_left: 1 })
  }, [dag, track, klara.length, planKey])

  const spara = useCallback(
    async (action: 'complete' | 'goto', day: number) => {
      setBusy(true)
      try {
        await fetch('/api/onboarding/vecka', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, day }),
        })
        onProgress?.()
      } catch {
        /* framsteget syns lokalt även om skrivningen misslyckas */
      } finally {
        setBusy(false)
      }
    },
    [onProgress]
  )

  const kvitteraDag = useCallback(async () => {
    const klarDag = dag
    setKvitterad(klarDag)
    capture('week_day_completed', { track, day: klarDag })
    if (klarDag < 7) setDag(klarDag + 1)
    await spara('complete', klarDag)
  }, [dag, track, spara])

  const hoppaTill = useCallback(
    async (n: number) => {
      setArkOppet(false)
      setKvitterad(null)
      setDag(n)
      await spara('goto', n)
    },
    [spara]
  )

  const nastaDatum = svensktDatum(currentPeriodEnd, 7)

  /* --------------------------------------------- dag 7: sammanställningen */

  if (dag === 7 && kvitterad === null) {
    const tal = summaryTal ?? [0, 0, 0, 0]
    const etiketter = weekTrack === 'tester' ? DAG7.tester.tal : DAG7.cv.tal
    const rubrik = weekTrack === 'tester' ? DAG7.tester.rubrik : DAG7.cv.rubrik

    return (
      <div className={`space-y-4 ${className ?? ''}`}>
        <section
          className="rounded-xl border border-kant-stark bg-panel p-4"
          aria-label="Veckan"
        >
          <p className="text-steg uppercase text-ink-3">
            {veckansNamn(track)} · Dag 7 av 7
          </p>

          <div className="mt-3">
            <VeckoNoder days={dagar} current={7} completed={klara} onSelect={hoppaTill} />
          </div>

          <p className="mt-4 text-kort text-ink-1">{rubrik}</p>

          <dl className="mt-3 grid grid-cols-4 gap-2 sm:gap-6">
            {etiketter.map((etikett, i) => (
              <div key={etikett} className="min-w-0">
                <dd className="text-tal tabular-nums text-ink-1">{tal[i] ?? 0}</dd>
                <dt className="mt-1 truncate text-meta text-ink-3">{etikett}</dt>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-sm leading-[22px] text-ink-2">
            {dag7Kvar(dagar, klara, weekTrack)}
          </p>

          <div className="mt-4">
            <Link href="/dashboard/profil/prenumeration" className={KNAPP_PRIMAR}>
              {DAG7.primar}
            </Link>
          </div>

          <div className="mt-3">
            <Link href="/dashboard/profil/prenumeration" className={LANK}>
              {DAG7.avsluta}
            </Link>
          </div>
        </section>

        <StatusRow tone="warm" showDot wrap>
          {dag7Dragning(plan.amount, nastaDatum)}
        </StatusRow>
      </div>
    )
  }

  /* -------------------------------------------------- kvitteringsläget */

  if (kvitterad !== null) {
    const klarDagen = dagar[kvitterad - 1] ?? dagar[0]
    const nastaDagen = dagar[kvitterad] ?? null

    return (
      <section
        className={`rounded-xl border border-kant-stark bg-panel p-4 ${className ?? ''}`}
        aria-label="Veckan"
      >
        <p className="text-steg uppercase text-ink-3">
          {veckansNamn(track)} · Dag {Math.min(dag, 7)} av 7
        </p>

        <div className="mt-3">
          <VeckoNoder
            days={dagar}
            current={Math.min(dag, 7)}
            completed={Array.from({ length: kvitterad }, (_, i) => i + 1)}
            onSelect={hoppaTill}
          />
        </div>

        <div className="mt-4 flex items-start gap-2">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-ink-1" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="text-kort text-ink-1">{klarDagen.klarTitel}</p>
            <p className="mt-0.5 text-meta text-ink-3">{klarDagen.klarText}</p>
          </div>
        </div>

        {nastaDagen ? (
          <>
            <div className="mt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => setKvitterad(null)}
                className={KNAPP_PRIMAR}
              >
                {VECKOPANEL.vidare(nastaDagen.dag)}
              </button>
            </div>
            <div className="mt-3">
              <Link href="/dashboard" className={LANK} onClick={() => setKvitterad(null)}>
                {VECKOPANEL.klartForIdag}
              </Link>
            </div>
          </>
        ) : null}
      </section>
    )
  }

  /* --------------------------------------------- sammandragen och utfälld */

  return (
    <>
      <section
        className={`rounded-xl border border-kant-stark bg-panel p-4 ${className ?? ''}`}
        aria-label="Veckan"
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-steg uppercase text-ink-3">
            {veckansNamn(track)} · Dag {dag} av 7
          </p>
          <button
            type="button"
            onClick={() => setUtfalld((v) => !v)}
            aria-expanded={utfalld}
            className="shrink-0 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
          >
            {VECKOPANEL.helaVeckan}
          </button>
        </div>

        <div className="mt-3">
          <VeckoNoder days={dagar} current={dag} completed={klara} onSelect={hoppaTill} />
        </div>

        {utfalld ? (
          <ul className="mt-4 divide-y divide-kant border-t border-kant">
            {dagar.map((d) => (
              <li key={d.dag}>
                <button
                  type="button"
                  onClick={() => hoppaTill(d.dag)}
                  className="flex min-h-12 w-full items-center gap-3 py-3 text-left"
                >
                  <span className="w-12 shrink-0 text-steg uppercase text-ink-3">
                    Dag {d.dag}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      d.dag === dag ? 'font-medium text-ink-1' : klara.includes(d.dag) ? 'text-ink-1' : 'text-ink-3'
                    }`}
                  >
                    {d.kort}
                  </span>
                  {klara.includes(d.dag) ? (
                    <Check className="h-5 w-5 shrink-0 text-ink-1" strokeWidth={1.75} />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="mt-4 flex items-start gap-3">
              <MarginPlate>
                <Platta size={48} />
              </MarginPlate>
              <div className="min-w-0 flex-1">
                <p className="text-kort text-ink-1">{aktuell.titel}</p>
                <p className="mt-0.5 text-sm leading-[22px] text-ink-2">{aktuell.text}</p>
                <p className="mt-1 text-meta text-ink-3">{aktuell.meta}</p>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`${aktuell.href}${aktuell.href.includes('?') ? '&' : '?'}vecka=${dag}`}
                className={KNAPP_PRIMAR}
                onClick={() => router.prefetch(aktuell.href)}
              >
                {aktuell.knapp}
              </Link>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                ref={hoppaRef}
                onClick={() => setArkOppet(true)}
                className={LANK}
              >
                {VECKOPANEL.hoppa}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={kvitteraDag}
                className="text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1 disabled:opacity-40"
              >
                Markera dagen klar
              </button>
            </div>
          </>
        )}
      </section>

      <Sheet
        open={arkOppet}
        onClose={() => {
          setArkOppet(false)
          hoppaRef.current?.focus()
        }}
        title={VECKOPANEL.arkRubrik}
        description={VECKOPANEL.arkText}
      >
        <ul className="divide-y divide-kant">
          {dagar.map((d) => {
            const klar = klara.includes(d.dag)
            const arAktuell = d.dag === dag
            return (
              <li key={d.dag}>
                <button
                  type="button"
                  onClick={() => hoppaTill(d.dag)}
                  className="flex min-h-12 w-full items-center gap-3 py-3 text-left"
                >
                  <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                    {klar ? (
                      <Check className="h-5 w-5 text-ink-1" strokeWidth={1.75} />
                    ) : (
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          arAktuell ? 'border-ink-1' : 'border-kant-stark'
                        }`}
                      />
                    )}
                  </span>
                  <span className="w-12 shrink-0 text-steg uppercase text-ink-3">Dag {d.dag}</span>
                  <span
                    className={`min-w-0 flex-1 text-sm ${
                      arAktuell ? 'font-medium text-ink-1' : klar ? 'text-ink-1' : 'text-ink-3'
                    }`}
                  >
                    {d.kort}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Sheet>
    </>
  )
}
