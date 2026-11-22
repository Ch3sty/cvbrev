'use client'

/**
 * Kortet "Vilken tjänst gäller provet?" på Hem i Rekryteringstester
 * (Jobbsöket omgång 2, byggspec 9.14 och 9.15). Frivilligt: leder till arket
 * Logga sökt tjänst i Sökta tjänster med tjänsten och arbetsgivaren ifyllda.
 *
 * Grinden avgörs på servern (tjanstfraga i lib/tester/v4/tjanstfraga.ts) och
 * HemGolv ritar ön bara när den ger ett kort. Ön ritar ingenting på servern
 * och ingenting i första klientritningen: kortet visas först när Hoppa över
 * är läst ur localStorage, så att inget hoppar fram och sedan försvinner.
 *
 * Ingen nivå, inget resultat och ingen testtyp följer med: adressen bär bara
 * tjanst, arbetsgivare och fran. Mätningen: tjanstfraga_val med oppnad och
 * hoppad. Fortsätt och Avbryt skickar ingenting.
 */

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { soktaHref } from '@/lib/jobbsok/adress'
import { arHoppad, TJANSTFRAGA_NYCKEL, type Tjanstfraga } from '@/lib/tester/v4/tjanstfraga'
import { lasTjanstfraga } from './HemMatning'

/** Kortets texter, ordagrant ur 9.15. */
export const TJANSTFRAGA_TEXT = {
  ogon: 'Valfritt',
  rubrik: {
    plan: 'Vilken tjänst gäller provet?',
    plan_passerad: 'Vilken tjänst gällde provet?',
    utan_plan: 'Vilken tjänst övar du inför?',
  },
  skal: {
    plan: 'Lägg in den i Sökta tjänster, så har du ansökan, provet och beskedet på ett ställe.',
    utan_plan: 'Lägg in den i Sökta tjänster, så har du ansökan, testet och beskedet på ett ställe.',
  },
  knapp: 'Lägg in tjänsten',
  hoppa: 'Hoppa över',
  utfalld: 'Fyll i två fält. Du sparar i nästa steg, i Sökta tjänster.',
  tjanst: 'Tjänst',
  tjanstPlats: 'Till exempel ekonomiassistent',
  arbetsgivare: 'Arbetsgivare',
  arbetsgivarePlats: 'Till exempel Volvo Cars',
  fortsatt: 'Fortsätt',
  avbryt: 'Avbryt',
  felTjanst: 'Skriv tjänsten också, så hittar du den igen.',
  felArbetsgivare: 'Skriv arbetsgivaren också, så hittar du tjänsten igen.',
} as const

const MAX = 200

function skrivNyckel(nyckel: string) {
  try {
    window.localStorage.setItem(TJANSTFRAGA_NYCKEL, nyckel)
  } catch {
    // Utan lagring (privat fönster) gäller valet tills sidan laddas om.
  }
}

const FOKUSBAR = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/** Nästa fokuserbara element efter kortet i dokumentets ordning. */
function nastaFokus(efter: Element): HTMLElement | null {
  const alla = Array.from(document.querySelectorAll<HTMLElement>(FOKUSBAR))
  return alla.find((el) => !efter.contains(el) && (efter.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) ?? null
}

function Ikon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5" />
    </svg>
  )
}

export default function TjanstFraga({ fraga }: { fraga: Tjanstfraga }) {
  const router = useRouter()
  // null: lagringen är inte läst än (servern och första klientritningen ritar ingenting).
  const [synlig, setSynlig] = useState<boolean | null>(null)
  const [utfalld, setUtfalld] = useState(false)
  const [tjanst, setTjanst] = useState('')
  const [arbetsgivare, setArbetsgivare] = useState('')
  const [fel, setFel] = useState<{ tjanst: boolean; arbetsgivare: boolean }>({ tjanst: false, arbetsgivare: false })
  const kort = useRef<HTMLElement>(null)
  const rubrik = useRef<HTMLHeadingElement>(null)
  const tjanstRef = useRef<HTMLInputElement>(null)
  const arbetsgivareRef = useRef<HTMLInputElement>(null)
  const fokusEfter = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const sparad = lasTjanstfraga()
    const hoppad = arHoppad(sparad, fraga.nyckel)
    // Ett första datum på samma prov räknas inte som en ny rekrytering: skriv om till den nya nyckeln.
    if (hoppad && sparad !== fraga.nyckel) skrivNyckel(fraga.nyckel)
    setSynlig(!hoppad)
  }, [fraga.nyckel])

  useEffect(() => {
    if (utfalld) rubrik.current?.focus()
  }, [utfalld])

  useEffect(() => {
    if (synlig === false && fokusEfter.current) {
      fokusEfter.current.focus()
      fokusEfter.current = null
    }
  }, [synlig])

  if (!synlig) return null

  const variant = fraga.variant
  const id = 'tjanstfraga-rubrik'

  const hoppaOver = () => {
    skrivNyckel(fraga.nyckel)
    capture('tjanstfraga_val', { plats: 'test-hem', val: 'hoppad' })
    fokusEfter.current = kort.current ? nastaFokus(kort.current) : null
    setSynlig(false)
  }

  const oppna = () => {
    capture('tjanstfraga_val', { plats: 'test-hem', val: 'oppnad' })
    setUtfalld(true)
  }

  const avbryt = () => {
    setUtfalld(false)
    setFel({ tjanst: false, arbetsgivare: false })
  }

  const fortsatt = (e?: FormEvent) => {
    e?.preventDefault()
    const t = tjanst.trim().slice(0, MAX)
    const a = arbetsgivare.trim().slice(0, MAX)
    const nyttFel = { tjanst: !t, arbetsgivare: !a }
    setFel(nyttFel)
    if (nyttFel.tjanst) return tjanstRef.current?.focus()
    if (nyttFel.arbetsgivare) return arbetsgivareRef.current?.focus()
    // Sparar hon ingen rad i arket räknas det som Hoppa över för den här planen.
    skrivNyckel(fraga.nyckel)
    router.push(soktaHref({ logga: 'sokt', tjanst: t, arbetsgivare: a, fran: fraga.fran }))
  }

  return (
    <section ref={kort} className="t3-fraga" data-lage={utfalld ? 'utfalld' : 'hopfalld'} aria-labelledby={id} data-tjanstfraga={variant}>
      <span className="t3-fraga-ik" aria-hidden="true">
        <Ikon />
      </span>
      <div className="t3-fraga-text">
        <p className="t3-ogon-matt">{TJANSTFRAGA_TEXT.ogon}</p>
        <h2 id={id} ref={rubrik} tabIndex={-1}>
          {TJANSTFRAGA_TEXT.rubrik[variant]}
        </h2>
        <p>{utfalld ? TJANSTFRAGA_TEXT.utfalld : variant === 'utan_plan' ? TJANSTFRAGA_TEXT.skal.utan_plan : TJANSTFRAGA_TEXT.skal.plan}</p>
      </div>
      {utfalld ? (
        <form className="t3-fraga-falt" onSubmit={fortsatt} noValidate>
          <div>
            <label className="t3-falt">
              <span>{TJANSTFRAGA_TEXT.tjanst}</span>
              <input
                ref={tjanstRef}
                type="text"
                value={tjanst}
                maxLength={MAX}
                placeholder={TJANSTFRAGA_TEXT.tjanstPlats}
                autoComplete="organization-title"
                aria-invalid={fel.tjanst ? true : undefined}
                aria-describedby={fel.tjanst ? 'tjanstfraga-fel-tjanst' : undefined}
                onChange={(e) => {
                  setTjanst(e.target.value)
                  if (e.target.value.trim()) setFel((f) => ({ ...f, tjanst: false }))
                }}
              />
            </label>
            {fel.tjanst ? (
              <p id="tjanstfraga-fel-tjanst" className="t3-falt-fel" role="alert">
                {TJANSTFRAGA_TEXT.felTjanst}
              </p>
            ) : null}
          </div>
          <div>
            <label className="t3-falt">
              <span>{TJANSTFRAGA_TEXT.arbetsgivare}</span>
              <input
                ref={arbetsgivareRef}
                type="text"
                value={arbetsgivare}
                maxLength={MAX}
                placeholder={TJANSTFRAGA_TEXT.arbetsgivarePlats}
                autoComplete="organization"
                aria-invalid={fel.arbetsgivare ? true : undefined}
                aria-describedby={fel.arbetsgivare ? 'tjanstfraga-fel-arbetsgivare' : undefined}
                onChange={(e) => {
                  setArbetsgivare(e.target.value)
                  if (e.target.value.trim()) setFel((f) => ({ ...f, arbetsgivare: false }))
                }}
              />
            </label>
            {fel.arbetsgivare ? (
              <p id="tjanstfraga-fel-arbetsgivare" className="t3-falt-fel" role="alert">
                {TJANSTFRAGA_TEXT.felArbetsgivare}
              </p>
            ) : null}
          </div>
          <div className="t3-fraga-val">
            <button type="submit" className="t3-liten t3-liten-mork">
              {TJANSTFRAGA_TEXT.fortsatt}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <button type="button" className="t3-fraga-hoppa" onClick={avbryt}>
              {TJANSTFRAGA_TEXT.avbryt}
            </button>
          </div>
        </form>
      ) : (
        <div className="t3-fraga-val">
          <button type="button" className="t3-liten" onClick={oppna}>
            {TJANSTFRAGA_TEXT.knapp}
          </button>
          <button type="button" className="t3-fraga-hoppa" onClick={hoppaOver}>
            {TJANSTFRAGA_TEXT.hoppa}
          </button>
        </div>
      )}
    </section>
  )
}
