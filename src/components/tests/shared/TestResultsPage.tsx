'use client'

/**
 * TestResultsPage: resultatet efter ett test (tester-lyftet, skiss
 * Provbladet avsnitt 3, "samma språk, avslöjat i fyra steg").
 *
 *   s1  väggen: ringen (fylld till andelen rätt) och rubriken "12 av 15 rätt"
 *   s2  väggen: två tal (tiden och tempot mot provets tid)
 *   s3  golvet: det lyfta kortet Genomgång, missarna som små provblad
 *   s4  golvet: Var du tappade, tempot och statusraden
 *
 * Statusraden (testansvarig 2026-10-11 punkt 3 och 4, art-director beslut
 * 1): rytmraden efter om nivån sitter (SITTER_PROCENT), om nästa nivå eller
 * provläget är öppet, och gratisnivåns dagskvot; sist steget vidare till
 * CV:t när hon saknar ett. Bryggan till CV:t är borta; test_completed
 * loggas här, en gång per visning.
 *
 * Ingen "nästa nivå", ingen percentil (jämförelsen bor i Din utveckling) och
 * inget rött: fel är ihåligt, långsamt är koppar.
 *
 * Sessionen och analysen (missar, grupper, tempo) kommer färdiga från
 * servern (getResultsData.ts). Gick den läsningen inte igenom faller sidan
 * tillbaka på klienthämtningen och visar poängen och tiden utan analys.
 * Genomgången fråga för fråga laddas först när hon ber om den.
 *
 * Gamla sessioner (answers som objekt, före blandningen, utan meta) visas
 * med det som finns: poängen, tiden och en rad om att genomgången saknas.
 */

import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { KIND_LABEL, LEVEL_LABEL, TEST_CONFIGS, testPaths, totalForSession, type TestConfig, type TestLevel } from '@/app/dashboard/tester/testConfig'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { scopeHasFeature, type Scope } from '@/lib/access/features'
import { logUserActivity } from '@/lib/activity-logger'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import type { ResultsData } from '@/app/dashboard/tester/[slug]/getResultsData'
import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import LyftKort from '@/components/rum/LyftKort'
import VaggLaddar from '@/components/rum/VaggLaddar'
import { requestInstallPrompt } from '@/lib/pwa/installPrompt'
import type { GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'
import { SITTER_PROCENT, analysera, budgetPerFraga, ordTal, svarslista, type ResultatAnalys } from '@/lib/tester/resultat'
import { RESULTAT, TESTSIDA, enhetsord, sakord } from '@/lib/tester/copy'
import ResultatVagg from '@/components/tests/resultat/ResultatVagg'
import GenomgangKort from '@/components/tests/resultat/GenomgangKort'
import TappadeKort from '@/components/tests/resultat/TappadeKort'
import TempoKort from '@/components/tests/resultat/TempoKort'

/* Genomgången fråga för fråga ligger under första vyn och laddas när hon
   ber om den. Platsen reserveras medan den laddar. */
const ReviewFallback = () => <div className="h-64 rounded-xl border border-kant bg-papper" aria-hidden="true" />

const MatrixQuestionReview = dynamic(() => import('./reviews/MatrixQuestionReview'), { loading: ReviewFallback })
const NumericalReview = dynamic(() => import('./reviews/NumericalReview'), { loading: ReviewFallback })
const VerbalReview = dynamic(() => import('./reviews/VerbalReview'), { loading: ReviewFallback })

interface SessionData {
  id: string
  score: number | null
  time_spent: number | null
  completed_at: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers?: any
  /** meta.antal: sessionens antal frågor (testConfig.totalForSession). */
  meta?: unknown
  /** Matrislogikens genomgång, byggd på servern. */
  genomgang?: GenomgangsFraga[] | null
}


const NASTA: Partial<Record<TestLevel, TestLevel>> = { grund: 'avancerad', avancerad: 'expert', expert: 'prov' }

/**
 * Rytmraden i statusraden. scope undefined: paketet är inte känt än, och
 * raden säger då inget om lås.
 */
function rytmrad(config: TestConfig, pct: number, scope: Scope | null | undefined): string | null {
  if (config.level === 'prov') return null
  const kand = scope !== undefined
  if (pct < SITTER_PROCENT) {
    return kand && config.level === 'grund' && !scopeHasFeature(scope, 'tests_above_base')
      ? RESULTAT.status.rytm.gratisGrund
      : RESULTAT.status.rytm.under
  }
  const nastaNiva = NASTA[config.level]
  const nasta = nastaNiva ? TEST_CONFIGS.find((c) => c.kind === config.kind && c.level === nastaNiva) : undefined
  if (!nasta) return RESULTAT.status.rytm.under
  const oppen = !kand || !nasta.requiresFeature || scopeHasFeature(scope, nasta.requiresFeature)
  if (nasta.level === 'prov') return oppen ? RESULTAT.status.rytm.provOppet : RESULTAT.status.rytm.provLast()
  return oppen ? RESULTAT.status.rytm.nastaOppen : RESULTAT.status.rytm.nastaLast()
}

function datumText(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Stockholm' })
}

export default function TestResultsPage({
  config,
  sessionId,
  resultsData,
}: {
  config: TestConfig
  sessionId: string
  /** Serverhämtat resultat. Saknas det hämtar sidan själv, som förut. */
  resultsData?: ResultsData
}) {
  const fromServer = resultsData?.resolved ? resultsData : null

  const [session, setSession] = useState<SessionData | null>(() =>
    fromServer?.session
      ? {
          id: fromServer.session.id,
          score: fromServer.session.score,
          time_spent: fromServer.session.timeSpent,
          completed_at: fromServer.session.completedAt,
          answers: fromServer.session.answers,
          genomgang: fromServer.session.genomgang ?? null,
          meta: fromServer.session.meta,
        }
      : null
  )
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>(() => (fromServer?.session ? 'ready' : 'loading'))
  /** null: genomgången stängd. Annars de frågor (nollbaserat index) som står öppna. */
  const [genomgang, setGenomgang] = useState<number[] | null>(null)
  const listaRef = useRef<HTMLDivElement>(null)
  const { summary } = useDashboardData()
  const scope: Scope | null | undefined = summary ? ((summary.paket?.scope ?? null) as Scope | null) : undefined

  /* test_completed, en gång per visning (förut i bryggan, B7). */
  const loggad = useRef(false)
  useEffect(() => {
    if (state !== 'ready' || !session || loggad.current) return
    loggad.current = true
    const logga = (uid: string | null | undefined) => {
      if (uid) void logUserActivity(uid, 'test_completed', 'Testresultat visades', { slug: config.slug })
    }
    if (resultsData?.userId) return logga(resultsData.userId)
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => logga(data.session?.user?.id))
      .catch(() => {})
  }, [state, session, config.slug, resultsData?.userId])

  useEffect(() => {
    if (fromServer?.session) return
    let cancelled = false
    const load = async () => {
      try {
        // Matrislogikens session-API svarar på ?id= med raden och genomgången.
        if (config.kind === 'matris') {
          const res = await fetch(`${config.api}/session?id=${sessionId}`)
          if (!res.ok) throw new Error('missing')
          const data = await res.json()
          if (!data?.session) throw new Error('missing')
          if (!cancelled) {
            setSession({ ...(data.session as SessionData), genomgang: data.genomgang ?? null })
            setState('ready')
          }
          return
        }
        const url = config.sessionQuery ? `${config.api}/session?${config.sessionQuery}` : `${config.api}/session`
        const res = await fetch(url)
        if (!res.ok) throw new Error('missing')
        const data = await res.json()
        const found = (data.sessions as SessionData[] | undefined)?.find((s) => s.id === sessionId)
        if (!cancelled) {
          setSession(found ?? null)
          setState(found ? 'ready' : 'missing')
        }
      } catch {
        if (!cancelled) setState('missing')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [config.api, config.sessionQuery, config.kind, sessionId, fromServer])

  /* Frågan om hemskärmen (docs/plan-pwa.md), efter ett slutfört logiktest. */
  useEffect(() => {
    if (config.kind !== 'matris') return
    if (state !== 'ready' || !session) return
    requestInstallPrompt('logic_test_completed')
  }, [config.kind, state, session])

  const budget = budgetPerFraga(config.examMinutes ?? config.minutes, config.totalQuestions)
  // Utan serverns analys (reservvägen) finns bara poängen och tiden.
  const analys: ResultatAnalys = useMemo(
    () => fromServer?.analys ?? analysera([], budget),
    [fromServer, budget]
  )

  const oppna = useCallback((index: number[]) => setGenomgang(index), [])

  // Genomgången monteras när hon ber om den; scrolla dit när den finns.
  useEffect(() => {
    if (genomgang === null) return
    const reducerad = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    listaRef.current?.scrollIntoView({ behavior: reducerad ? 'auto' : 'smooth', block: 'start' })
  }, [genomgang])

  if (state === 'loading') {
    return (
      <>
        <VaggLaddar label="Laddar resultat" />
        <Golv key="laddar" lyft>
          <div className="w-full space-y-4" role="status" aria-busy="true" aria-label="Laddar resultat">
            <div className="loading-thread relative z-[2] -mt-[30px] h-48 rounded-2xl border border-[color:var(--lyft-kant)] bg-papper shadow-lyft" aria-hidden="true" />
            <div className="h-64 rounded-2xl border border-kant bg-papper" aria-hidden="true" />
          </div>
        </Golv>
      </>
    )
  }

  if (state === 'missing' || !session) {
    return (
      <>
        <RumHuvud title={RESULTAT.saknas.rubrik} tat={false} />
        <Golv key="saknas" lyft>
          <LyftKort
            className="w-full max-w-3xl"
            label={config.title}
            titel={config.title}
            text={RESULTAT.saknas.text}
            handling={
              <Link href={testPaths.hub(config.slug)} className={KNAPP_PRIMAR}>
                {RESULTAT.saknas.knapp(config.title)}
              </Link>
            }
          />
        </Golv>
      </>
    )
  }

  const total = totalForSession(config.slug, session.meta)
  const score = session.score ?? 0
  const pct = Math.min(100, Math.round((score / total) * 100))
  const timeSpent = session.time_spent ?? 0
  const answers = svarslista(session.answers)
  const sak = sakord(config.kind, config.slug)
  const matris = config.kind === 'matris'
  const prov = config.level === 'prov'
  const nyss = fromServer?.nyss ?? false

  const missar = analys.fragor.filter((f) => f.utfall !== 'ratt')
  const lage: 'missar' | 'alla-ratt' | 'saknas' =
    analys.fragor.length === 0 ? 'saknas' : missar.length === 0 ? 'alla-ratt' : 'missar'

  // "Två av tre är samma familj" när minst två av missarna delar grupp.
  let samma: string | null = null
  if (missar.length >= 2) {
    const antal = new Map<string, number>()
    for (const f of missar) if (f.grupp) antal.set(f.grupp, (antal.get(f.grupp) ?? 0) + 1)
    const [namn, n] = [...antal.entries()].sort((a, b) => b[1] - a[1])[0] ?? []
    if (namn && n && n >= 2) samma = RESULTAT.genomgang.sammaFamilj(n, missar.length, namn, matris)
  }

  const regel = prov ? RESULTAT.genomgang.regel.prov : RESULTAT.genomgang.regel[config.kind as 'matris' | 'verbal' | 'numerisk']
  const tempo = analys.tempo
  // Per underlag talar tempot om texter eller tabeller, annars om frågorna.
  const tempoOrd = tempo?.enhet === 'underlag' ? enhetsord(config.kind) : sak
  const tempoTal = tempo
    ? { tal: `${tempo.over} av ${tempo.matta}`, etikett: RESULTAT.tre.over(tempo.budget, tempoOrd.en) }
    : { tal: `${total > 0 ? Math.round(timeSpent / total) : 0} s`, etikett: RESULTAT.tre.snitt(sak.en) }

  const bast = resultsData?.bastaPoang ?? null
  const rad = bast === null ? null : score >= bast ? RESULTAT.bast.nu : RESULTAT.bast.tidigare(bast, total)

  const harTappade = analys.grupper.length > 0
  const term = RESULTAT.tappade.term[config.kind as 'matris' | 'verbal' | 'numerisk']

  const gaIgenom = (nr?: number) => oppna(nr ? [nr - 1] : missar.map((f) => f.nr - 1))
  const visaAlla = () => oppna([])

  const rytm = rytmrad(config, pct, scope)
  const utanCv = resultsData?.hasCv === false
  const status = (
    // Full bredd på dator: i en tredjedelskolumn bröts raden på sex till sju
    // rader (QA efter lyftet). Var du tappade spänner i stället över två rader.
    <div className="steg s4 flex items-center justify-between gap-3 self-start rounded-xl lg:col-span-3 border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-koppar" aria-hidden="true" />
        <span>
          {RESULTAT.status.text}
          {rytm ? ` ${rytm}` : null}
          {utanCv ? ` ${RESULTAT.status.cv}` : null}
        </span>
      </span>
      <Link
        href={utanCv ? '/dashboard/profil/cv' : '/dashboard/tester/alla'}
        className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
      >
        {utanCv ? RESULTAT.status.lankCv : RESULTAT.status.lank}
      </Link>
    </div>
  )

  return (
    <div className={nyss ? 'motion' : undefined} data-resultat>
      <ResultatVagg
        brand={`${KIND_LABEL[config.kind]}, ${LEVEL_LABEL[config.level].toLowerCase()}`}
        eyebrow={nyss || !session.completed_at ? RESULTAT.klart : datumText(session.completed_at)}
        eyebrowKoppar={nyss || !session.completed_at}
        ratt={score}
        totalt={total}
        pct={pct}
        tidSek={timeSpent}
        minuter={config.examMinutes ?? config.minutes}
        tempo={tempoTal}
        rad={rad}
      />
      <Golv key="resultat" lyft>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
          <GenomgangKort
            className={`steg s3 ${harTappade ? 'lg:col-span-2' : 'lg:col-span-3'}`}
            lage={lage}
            missar={missar}
            totalt={analys.fragor.length || total}
            genomgang={matris ? session.genomgang : null}
            sak={sak}
            regel={regel}
            samma={samma}
            hubHref={testPaths.hub(config.slug)}
            gorOm={prov ? TESTSIDA.gorOmProv : TESTSIDA.gorOm}
            onGaIgenom={gaIgenom}
            onVisaAlla={visaAlla}
          />
          {harTappade ? (
            <TappadeKort
              className="steg s4 lg:row-span-2"
              lyft
              grupper={analys.grupper}
              svagast={analys.svagast}
              matris={matris}
              term={term}
              flera={sak.flera}
            />
          ) : null}
          {tempo ? (
            <TempoKort className={`steg s4 ${harTappade ? 'lg:col-span-2' : 'lg:col-span-3'}`} tempo={tempo} sak={tempoOrd} />
          ) : null}
          {status}
        </div>

        {genomgang !== null ? (
          <div ref={listaRef} className="scroll-mt-4 space-y-4" id="genomgang">
            <h2 className="text-kort-t text-ink-1">
              {RESULTAT.genomgang.rubrikLista}
              <span className="sr-only">, {ordTal(analys.fragor.length || total)} {sak.flera}</span>
            </h2>
            {matris ? (
              <MatrixQuestionReview
                slug={config.slug}
                answers={answers as never}
                fragor={session.genomgang ?? []}
                key={genomgang.join(',')}
                oppnaFran={genomgang}
                utanKategorier
                utanRubrik
              />
            ) : config.kind === 'numerisk' ? (
              <NumericalReview slug={config.slug} sessionId={sessionId} answers={answers as never} meta={session.meta} />
            ) : (
              <VerbalReview
                slug={config.slug}
                sessionId={sessionId}
                answers={answers as never}
                score={score}
                timeSpent={timeSpent}
                totalStatements={total}
                meta={session.meta}
              />
            )}
          </div>
        ) : null}
      </Golv>
    </div>
  )
}
