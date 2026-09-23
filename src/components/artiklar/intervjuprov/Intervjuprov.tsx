'use client'

/**
 * Intervjuprovet i artiklarna (docs/design/intervjuprov-spec-2026-09-23.md,
 * design docs/design/intervjuprov-2026-09-23.html).
 *
 * En panel i löptexten som byter innehåll på plats: inbjudan, skriver,
 * laddar, resultat, plus fel och kvot. Resultatet är nivå, mening, det som
 * fungerar och det som saknas. Hela återkopplingen och det omskrivna svaret
 * lämnar aldrig servern före claim: de låsta blocken är tomma platshållare.
 *
 * Rubriken är ett p med display-stil, aldrig h2 eller h3, så artikelns
 * rubrikträd är orört. Panelen har inga data-cta-position-attribut och
 * räknas därför inte som ett reklamkort i ArtikelKlient.
 *
 * Mönstret för spärrkortet är brevprovets DraftGate, i Trådens tokens.
 * Ingen delad komponent med test- och brevprovet (ägarens beslut 4).
 */

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { capture } from '@/lib/analytics/events'
import { storePendingIntervju } from '@/lib/letters/claim-draft-client'
import { IlluBlurGate } from '@/components/illustrations/StartFlowIllustrations'
import { useFriSikt } from '@/components/shared/useFriSikt'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import FlowError from '@/components/shell/FlowError'
import StatusRow from '@/components/shell/StatusRow'
import { FRAGOR, STAR_DELAR, type FragaId } from './fragor'
import { COPY, MAX_TECKEN, MIN_TECKEN } from './intervjuprov-copy'

export interface IntervjuprovProps {
  fraga: FragaId
  /** Artikelns slug, för source_page och slug i eventen. Sätts av page.tsx. */
  slug?: string
}

type Phase = 'inbjudan' | 'skriver' | 'laddar' | 'resultat'
type FelTyp = 'server' | 'natverk' | 'irrelevant'

interface Resultat {
  token: string
  level: number
  levelLabel: string
  summary: string
  works: string
  missing: string
  lockedPointCount: number
  improvedLineCount: number
  missingKind: string
  expiresAt: string
  /** Satt när användaren är inloggad: svaret ligger redan i kontot. */
  href?: string
}

interface Kvot {
  text: string
  /** Kontoknappen för besökare utan konto. */
  registerHref?: string
  /** Textlänken till paketen för inloggade. */
  upgradeHref?: string
}

const KNAPP =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto'
const TEXTLANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

/** Platshållarradernas bredder, ur designfilen. Sista raden i omskrivningen är kort. */
const BREDD_ATERKOPPLING = [84, 72, 90, 64, 78, 86, 70, 80]
const BREDD_OMSKRIVET = [92, 80, 88, 70, 86, 82, 90, 76]

const LANG_VANTAN_MS = 20_000

export default function Intervjuprov({ fraga, slug }: IntervjuprovProps) {
  const f = FRAGOR[fraga]
  const rubrikId = useId()
  const hjalpId = useId()

  const [phase, setPhase] = useState<Phase>('inbjudan')
  const [text, setText] = useState('')
  const [felKort, setFelKort] = useState(false)
  const [felLangt, setFelLangt] = useState(false)
  const [fel, setFel] = useState<FelTyp | null>(null)
  const [kvot, setKvot] = useState<Kvot | null>(null)
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const [langVantan, setLangVantan] = useState(false)

  const faltRef = useRef<HTMLTextAreaElement>(null)
  const resultatRef = useRef<HTMLParagraphElement>(null)
  const felRef = useRef<HTMLDivElement>(null)
  // Spärrkortet och kvotkortet: samtycket och mobilens knapprad får aldrig täcka kontoknappen.
  const sparrRef = useRef<HTMLElement>(null)
  useFriSikt(sparrRef, phase === 'resultat' || kvot !== null)
  const startadRef = useRef(false)
  const forstaTeckenRef = useRef<number | null>(null)

  const langd = text.trim().length
  const kallsida = slug ? `/artiklar/${slug}` : undefined

  // Laddningen: efter 20 s byts metaraden till den långa varianten.
  useEffect(() => {
    if (phase !== 'laddar') {
      setLangVantan(false)
      return
    }
    const t = setTimeout(() => setLangVantan(true), LANG_VANTAN_MS)
    return () => clearTimeout(t)
  }, [phase])

  // Resultatet: fokus till eyebrow, mätning, och token sparas inför registreringen.
  useEffect(() => {
    if (phase !== 'resultat' || !resultat) return
    resultatRef.current?.focus()
    const duration_ms = forstaTeckenRef.current ? Date.now() - forstaTeckenRef.current : undefined
    capture('sample_completed', {
      kind: 'interview',
      cluster: 'interview',
      question: fraga,
      slug,
      duration_ms,
      level: resultat.level,
    })
    if (!resultat.href) {
      storePendingIntervju(resultat.token)
      capture('signup_gate_shown', { kind: 'interview', cluster: 'interview', question: fraga, slug })
    }
  }, [phase, resultat, fraga, slug])

  // Fel: fokus till felraden så att skärmläsaren och tangentbordet hamnar där.
  useEffect(() => {
    if (fel) felRef.current?.focus()
  }, [fel])

  function onInput(varde: string) {
    if (!startadRef.current && varde.length > 0) {
      startadRef.current = true
      forstaTeckenRef.current = Date.now()
      capture('sample_started', { kind: 'interview', cluster: 'interview', question: fraga, slug })
    }
    setText(varde)
    if (phase === 'inbjudan' && varde.length > 0) setPhase('skriver')
    if (felKort && varde.trim().length >= MIN_TECKEN) setFelKort(false)
    if (felLangt && varde.trim().length <= MAX_TECKEN) setFelLangt(false)
    if (fel) setFel(null)
  }

  function fokusFalt() {
    faltRef.current?.focus()
  }

  async function bedom() {
    // För kort: inget anrop, felkant och hjälptext, fokus tillbaka i fältet.
    if (langd < MIN_TECKEN) {
      setFelKort(true)
      fokusFalt()
      return
    }

    setFel(null)
    setFelKort(false)
    setFelLangt(false)
    setPhase('laddar')

    try {
      const res = await fetch('/api/public/intervjuprov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: fraga, answer: text, slug }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setResultat(data as Resultat)
        setPhase('resultat')
        return
      }

      setPhase('skriver')
      if (data.error === 'too_short') {
        setFelKort(true)
        fokusFalt()
      } else if (data.error === 'too_long') {
        setFelLangt(true)
        fokusFalt()
      } else if (data.error === 'irrelevant') {
        setFel('irrelevant')
      } else if (res.status === 429 || res.status === 503) {
        setKvot({
          text: typeof data.message === 'string' ? data.message : COPY.kvot.ip,
          registerHref: typeof data.registerHref === 'string' ? data.registerHref : undefined,
          upgradeHref: typeof data.upgradeHref === 'string' ? data.upgradeHref : undefined,
        })
      } else {
        setFel('server')
      }
    } catch {
      setPhase('skriver')
      setFel('natverk')
    }
  }

  function skrivOm() {
    setResultat(null)
    setPhase('skriver')
    // Vänta in att fältet ritats igen innan fokus flyttas.
    requestAnimationFrame(fokusFalt)
  }

  const eyebrow = <p className="text-steg uppercase text-ink-3">{COPY.eyebrow}</p>
  const rubrik = (
    <p
      id={rubrikId}
      className="mt-2 font-display text-[22px] font-bold leading-7 tracking-[-0.02em] text-ink-1 [text-wrap:balance]"
    >
      {COPY.rubrik}
    </p>
  )
  const citat = (
    <blockquote className="mt-4 border-l-[3px] border-accent py-0.5 pl-3 font-display text-lg font-semibold leading-6 tracking-[-0.01em] text-ink-1 sm:text-xl sm:leading-[26px]">
      {COPY.fraga(f.text)}
    </blockquote>
  )

  /* -------------------------------------------------------------- kvoten */
  if (kvot) {
    return (
      <aside ref={sparrRef} className="not-prose my-8 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-labelledby={rubrikId}>
        {eyebrow}
        {rubrik}
        {citat}
        <StatusRow
          tone="neutral"
          showDot
          wrap
          className="mt-4"
          action={
            kvot.upgradeHref ? (
              <Link href={kvot.upgradeHref} className={TEXTLANK}>
                {COPY.kvot.inloggadLank}
              </Link>
            ) : undefined
          }
        >
          {kvot.text}
        </StatusRow>
        {kvot.registerHref ? (
          <>
            <Link
              href={kvot.registerHref}
              data-cta="intervjuprov-gate"
              onClick={() => capture('signup_started', { cluster: 'interview', source_page: kallsida })}
              className={`mt-4 ${KNAPP}`}
            >
              {COPY.sparr.knapp}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-meta text-ink-3">{COPY.sparr.villkor}</p>
          </>
        ) : null}
      </aside>
    )
  }

  /* ----------------------------------------------------------- resultatet */
  if (phase === 'resultat' && resultat) {
    const niva = Math.min(5, Math.max(1, Math.round(resultat.level)))
    const inloggad = Boolean(resultat.href)
    const registerHref = `/register?intervju=${encodeURIComponent(resultat.token)}`

    return (
      <>
        <aside
          className="not-prose my-8 rounded-xl border border-kant bg-panel p-4 sm:p-6"
          aria-labelledby={rubrikId}
          aria-live="polite"
        >
          <p
            id={rubrikId}
            ref={resultatRef}
            tabIndex={-1}
            className="text-steg uppercase text-ink-3 focus:outline-none"
          >
            {COPY.resultat.eyebrow}
          </p>
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-tal-display text-ink-1">{niva}</span>
            <span className="text-sm text-ink-3">{COPY.resultat.av}</span>
          </div>
          <div className="mt-2.5 grid grid-cols-5 gap-1" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`h-1.5 rounded-[3px] ${n <= niva ? 'bg-ink-1' : 'bg-insunken'}`} />
            ))}
          </div>
          <p className="mt-2.5 text-varde text-ink-1">
            {resultat.levelLabel}. {resultat.summary}
          </p>

          <ul className="mt-4 grid gap-3 border-t border-kant pt-4">
            <li className="grid grid-cols-[10px_1fr] items-start gap-2.5">
              <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-positiv" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold leading-5 text-ink-1">{COPY.punkt.fungerar}</p>
                <p className="text-sm leading-[22px] text-ink-2 sm:text-[15px] sm:leading-[23px]">{resultat.works}</p>
              </div>
            </li>
            <li className="grid grid-cols-[10px_1fr] items-start gap-2.5">
              <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-varning" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold leading-5 text-ink-1">{COPY.punkt.saknas}</p>
                <p className="text-sm leading-[22px] text-ink-2 sm:text-[15px] sm:leading-[23px]">{resultat.missing}</p>
              </div>
            </li>
          </ul>

          <LastBlock
            etikett={COPY.last.aterkoppling(fraga, resultat.lockedPointCount)}
            bredder={BREDD_ATERKOPPLING.slice(0, Math.max(1, Math.min(8, resultat.lockedPointCount)))}
            forsta
          />
          <LastBlock
            etikett={COPY.last.omskrivet(resultat.missingKind)}
            bredder={[
              ...BREDD_OMSKRIVET.slice(0, Math.max(3, Math.min(8, resultat.improvedLineCount)) - 1),
              48,
            ]}
          />
          {inloggad ? null : <p className="sr-only">{COPY.last.sr}</p>}
        </aside>

        <section ref={sparrRef} className="mt-6 mb-8 rounded-xl border border-kant-stark bg-panel p-4 not-prose sm:p-6">
          <div className="sm:flex sm:items-start sm:gap-5">
            <IlluBlurGate size={96} className="hidden shrink-0 text-ink-1 sm:block" />
            <div className="min-w-0 flex-1">
              <p className="text-kort text-ink-1">{inloggad ? COPY.inloggad.rubrik : COPY.sparr.rubrik}</p>
              <p className="mt-1.5 text-sm leading-[22px] text-ink-2">
                {inloggad ? COPY.inloggad.text : COPY.sparr.text(fraga)}
              </p>
              {inloggad ? (
                <Link href={resultat.href!} data-cta="intervjuprov-konto" className={`mt-4 ${KNAPP}`}>
                  {COPY.inloggad.knapp}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href={registerHref}
                  data-cta="intervjuprov-gate"
                  onClick={() => capture('signup_started', { cluster: 'interview', source_page: kallsida })}
                  className={`mt-4 ${KNAPP}`}
                >
                  {COPY.sparr.knapp}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 text-meta text-ink-3">
                {inloggad ? null : <span>{COPY.sparr.villkor}</span>}
                <button type="button" onClick={skrivOm} className={TEXTLANK}>
                  {COPY.sparr.igen}
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  /* ------------------------------------------ inbjudan, skriver, laddar */
  const laddar = phase === 'laddar'
  const visaIngress = phase === 'inbjudan' && text.length === 0
  const visaTips = !laddar && text.length > 0
  const faltFel = felKort || felLangt
  const hjalptext = felKort ? COPY.fel.kort(fraga) : felLangt ? COPY.fel.langt : null
  // Räknaren läses upp var 50:e tecken, annars tjatar skärmläsaren.
  const upplast = langd >= 50 ? COPY.meta.raknare(Math.floor(langd / 50) * 50) + ' tecken' : ''

  const felCopy =
    fel === 'irrelevant' ? COPY.fel.irrelevant : fel === 'natverk' ? COPY.fel.natverk : COPY.fel.server

  return (
    <aside className="not-prose my-8 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-labelledby={rubrikId}>
      {eyebrow}
      {rubrik}
      {visaIngress ? (
        <p className="mt-2 text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">{COPY.ingress}</p>
      ) : null}
      {citat}

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-ink-2">{COPY.falt.etikett}</span>
        <textarea
          ref={faltRef}
          value={text}
          onChange={(e) => onInput(e.target.value)}
          readOnly={laddar}
          maxLength={MAX_TECKEN}
          placeholder={f.platshallare}
          aria-invalid={faltFel || undefined}
          aria-describedby={hjalpId}
          className={`block min-h-[152px] w-full resize-y rounded-lg border bg-insunken p-3 text-base leading-6 shadow-insunken placeholder:text-ink-3 ${
            faltFel ? 'border-fel' : 'border-kant focus:border-ink-1'
          } ${laddar ? 'text-ink-3' : 'text-ink-1'}`}
        />
      </label>

      <div className="mt-1 flex justify-between gap-3 text-meta tabular-nums text-ink-3">
        {hjalptext ? (
          <span id={hjalpId} role="alert" className="flex-1 text-fel">
            {hjalptext}
          </span>
        ) : (
          <span id={hjalpId}>{COPY.meta.min}</span>
        )}
        <span className="shrink-0 whitespace-nowrap" aria-hidden="true">
          {COPY.meta.raknare(langd)}
        </span>
        <span className="sr-only" aria-live="polite">
          {upplast}
        </span>
      </div>

      {visaTips ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-meta text-ink-3">
          <span>{f.tips}</span>
          {fraga === 'star'
            ? STAR_DELAR.map((del) => (
                <span
                  key={del}
                  className="inline-flex h-6 items-center rounded-md bg-insunken px-2 text-xs font-medium text-ink-2"
                >
                  {del}
                </span>
              ))
            : null}
        </div>
      ) : null}

      {laddar ? (
        <LoadingSkeleton
          variant="writing"
          label={COPY.laddar.rubrik}
          meta={langVantan ? COPY.laddar.lang : COPY.laddar.meta}
          className="mt-4"
        />
      ) : fel ? (
        <div ref={felRef} tabIndex={-1} className="mt-4 focus:outline-none">
          <FlowError
            title={felCopy.rubrik}
            message={felCopy.text}
            retryLabel={felCopy.lank}
            onRetry={fel === 'irrelevant' ? fokusFalt : bedom}
          />
        </div>
      ) : (
        <button type="button" onClick={bedom} data-cta="intervjuprov-bedom" className={`mt-4 ${KNAPP}`}>
          {COPY.knapp.bedom}
        </button>
      )}

      {laddar ? null : <p className="mt-3 text-meta text-ink-3">{COPY.fotnot}</p>}
    </aside>
  )
}

/** Ett låst block: etikett med hänglås och tomma platshållarrader, som i DraftGate. */
function LastBlock({ etikett, bredder, forsta }: { etikett: string; bredder: number[]; forsta?: boolean }) {
  return (
    <div className={forsta ? 'mt-4 border-t border-kant pt-4' : 'mt-5'}>
      <p className="flex items-center gap-2 text-sm font-semibold leading-5 text-ink-3">
        <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        {etikett}
      </p>
      <div className="mt-2.5 grid gap-2.5" aria-hidden="true">
        {bredder.map((b, i) => (
          <div key={i} className="h-3 rounded bg-kant opacity-[0.55]" style={{ width: `${b}%` }} />
        ))}
      </div>
    </div>
  )
}
