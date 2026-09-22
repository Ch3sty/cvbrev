'use client'

/**
 * Skärm 2.1: de första tio sekunderna efter köpet
 * (docs/plan-paket-och-onboarding.md, Fas 2A flöde 2).
 *
 * Confirmation gör tempot: linjen landar, användaren läser rubriken och
 * "DAG 1 AV 7", och trycker. Efter det står skärmen stilla. Primärknappen går
 * rakt in i dag 1:s flöde, aldrig till översikten.
 *
 * Har CV-spåraren inget CV visas skärm 2.2 i stället för dag 1:s vanliga
 * ingång: uppladdningsytan, aldrig en tom analyssida.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Confirmation from '@/components/shell/Confirmation'
import StatusRow from '@/components/shell/StatusRow'
import { IlluPlattaAnsokan, IlluPlattaTest } from '@/components/illustrations/TradenScener'
import { capture } from '@/lib/analytics/events'
import {
  KOPT,
  PAKET,
  TOMT,
  koptRubrik,
  koptIngress,
  veckansDagar,
  type Track,
  type WeekTrack,
} from '@/lib/onboarding/program'
import { PLAN_BY_KEY, isPlanKey, type PlanKey } from '@/lib/plans/plans'

const KNAPP_PRIMAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto sm:min-w-[220px]'
const LANK =
  'text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

/** Datum i svensk tid, "3 oktober". */
function svensktDatum(d: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Stockholm',
  }).format(d)
}

/** Timmen i svensk tid just nu. Köp efter 20 flyttar dag 1 till morgondagen. */
function timmeStockholm(now: Date = new Date()): number {
  const s = new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Europe/Stockholm',
  }).format(now)
  const n = Number.parseInt(s, 10)
  return Number.isNaN(n) ? 12 : n
}

export interface VeckaStartClientProps {
  track: Track
  weekTrack: WeekTrack
  planKey: string | null
  harCv: boolean
  harAllaGrundnivaer: boolean
  currentPeriodEnd: string | null
}

export default function VeckaStartClient({
  track,
  weekTrack,
  planKey,
  harCv,
  harAllaGrundnivaer,
  currentPeriodEnd,
}: VeckaStartClientProps) {
  const router = useRouter()
  const [portalBusy, setPortalBusy] = useState(false)

  // Paketet ur returadressen, annars ur spåret. Kassan sätter alltid plan,
  // men vyn får inte gå sönder om parametern tappas vid en omladdning.
  const nyckel: PlanKey = isPlanKey(planKey)
    ? planKey
    : track === 'cv'
      ? 'cv_week'
      : track === 'tester'
        ? 'test_week'
        : 'all_week'
  const plan = PLAN_BY_KEY[nyckel]
  const paket = PAKET[nyckel]

  const dagar = veckansDagar(track, weekTrack)
  const dagEtt = dagar[0]

  // Dag 1 är dagen för köpet i svensk tid, inte 24 timmar från köptidpunkten.
  // Ett köp klockan 23.40 ska inte ge en dag 1 som är tjugo minuter lång.
  const dagEttIMorgon = timmeStockholm() >= 20

  const nasta = currentPeriodEnd
    ? new Date(currentPeriodEnd)
    : new Date(Date.now() + (plan.length === 'månad' ? 30 : plan.length === 'kvartal' ? 90 : 7) * 86400000)
  const nastaDatum = svensktDatum(nasta)

  // week_day_opened en gång per montering, aldrig per omritning.
  const skjutet = useRef(false)
  useEffect(() => {
    if (skjutet.current) return
    skjutet.current = true
    capture('week_day_opened', { track, day: 1, source: 'app' })

    // Veckan startas här: week_started_at sätts och dagsmejlen schemaläggs.
    // Rutten är idempotent, så en omladdning av köpreturen gör ingenting.
    void fetch('/api/onboarding/vecka', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' }),
    }).catch(() => {
      /* veckan syns ändå, och nästa besök försöker igen */
    })
  }, [track])

  const oppnaPortal = async () => {
    if (portalBusy) return
    setPortalBusy(true)
    try {
      const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (json?.url) window.open(json.url as string, '_blank', 'noopener')
    } catch {
      /* portalen är en bekvämlighet här, kvittot ligger redan i mailen */
    } finally {
      setPortalBusy(false)
    }
  }

  // Dag 1 i CV-spåret kräver ett CV. Har köparen inget går knappen till
  // uppladdningen, och raden under säger varför (skärm 2.2).
  const behoverCv = weekTrack === 'cv' && !harCv
  const primarHref = behoverCv ? '/dashboard/profil/cv' : dagEtt.href
  const primarText = behoverCv ? TOMT.cvPrimar : KOPT.primar

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 py-2 sm:py-4">
      {/* Dag 1-panelen ligger mellan ingressen och knappen, enligt skissen i
          Fas 2A skärm 2.1: användaren ska läsa "DAG 1 AV 7" innan hon trycker.
          Därför står både panelen och handlingarna i children, och
          Confirmations egna action-props lämnas tomma. */}
      <Confirmation
        title={koptRubrik(paket, nastaDatum)}
        description={koptIngress(paket, nastaDatum, dagEttIMorgon)}
        illustration={weekTrack === 'tester' ? IlluPlattaTest : IlluPlattaAnsokan}
      >
        <section className="rounded-xl border border-kant bg-panel p-4 text-left">
          <p className="text-steg uppercase text-ink-3">{KOPT.dagEtikett}</p>
          <p className="mt-1 text-kort text-ink-1">{dagEtt.titel}</p>
          <p className="mt-0.5 text-meta text-ink-3">{dagEtt.meta}</p>
        </section>

        <div className="mt-5 flex flex-col items-center gap-2">
          <Link href={primarHref} className={KNAPP_PRIMAR} onClick={() => router.prefetch(primarHref)}>
            {primarText}
          </Link>
          <Link href="/dashboard" className={LANK}>
            {KOPT.helaVeckan}
          </Link>
          <button type="button" onClick={oppnaPortal} disabled={portalBusy} className={LANK}>
            {KOPT.kvitto}
          </button>
        </div>
      </Confirmation>

      {behoverCv ? (
        <StatusRow tone="neutral" showDot wrap>
          {TOMT.cvText}
        </StatusRow>
      ) : null}

      {/* Testspåraren som redan kört grundnivån i alla testtyper hoppar över
          diagnosen. Raden säger varför, så vi aldrig ber någon göra om ett
          test hon gjort samma vecka (skärm 2.2). */}
      {weekTrack === 'tester' && harAllaGrundnivaer ? (
        <StatusRow tone="neutral" showDot wrap>
          {TOMT.testTidigare}
        </StatusRow>
      ) : null}
    </div>
  )
}
