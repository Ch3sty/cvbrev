/**
 * Testramen: en uppgift som den ser ut i testet inloggat sedan omgång 3
 * (2026-11-21). Ritad efter sessionsramen i src/components/session/ och
 * --sess-* i globals.css, via skissernas delar/rekryteringstester-stil.html
 * och delar/start-testram.html. En komponent för alla sidor, rita inga egna.
 *
 * Huvudet: kryss, testets namn och nivå, räknaren och klockan som egna
 * brickor. Framsteget i bitar. Brädet (figurer) eller ett stycke (text),
 * uppgiften under, svaren som klossar med bokstavsbricka, foten med
 * tillbaka och knappen. Valfritt domen (förklaringen efter facit).
 *
 * Förvalet är en matrisuppgift som är kontrollräknad: varje rad har en
 * triangel, en cirkel och en kvadrat, rad två med prick, rad tre med kors,
 * alltså saknas cirkeln med kors (C). Byt uppgift bara mot en ur bankerna
 * eller en som sidan redan visar (byggbriefen, Exempel och påhittat).
 */

import type { CSSProperties, ReactNode } from 'react'
import { Ikon } from './Ikon'

export type Figur = 't' | 'c' | 'k' | 'tp' | 'cp' | 'kp' | 'tx' | 'cx' | 'kx' | 'pil' | 'l'

function FigurRitning({ figur }: { figur: Figur }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' } as const
  const form = figur[0]
  const tillagg = figur.slice(1)
  if (figur === 'pil') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 32V9M11 17l9-9 9 9" {...s} strokeWidth={3.4} />
      </svg>
    )
  }
  if (figur === 'l') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" fill="currentColor">
        <rect x="9" y="4" width="10" height="10" rx="2" />
        <rect x="9" y="15" width="10" height="10" rx="2" />
        <rect x="9" y="26" width="10" height="10" rx="2" />
        <rect x="20" y="26" width="10" height="10" rx="2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      {form === 't' ? <path d="M20 6l15 27H5z" {...s} /> : null}
      {form === 'c' ? <circle cx="20" cy="20" r="14" {...s} /> : null}
      {form === 'k' ? <rect x="6" y="6" width="28" height="28" rx="3" {...s} /> : null}
      {tillagg === 'p' ? <circle cx="20" cy={form === 't' ? 24 : 20} r="3" fill="currentColor" /> : null}
      {tillagg === 'x' ? <path d={form === 't' ? 'M15 25h10M20 20v10' : 'M13 20h14M20 13v14'} {...s} /> : null}
    </svg>
  )
}

export interface TestSvar {
  /** Figur i klossen, eller text. */
  figur?: Figur
  text?: ReactNode
  tillstand?: 'vald' | 'ratt' | 'fel'
}

export interface TestDom {
  ratt: boolean
  rubrik: ReactNode
  /** Rubriken i den vita rutan, till exempel "Regeln". */
  etikett?: ReactNode
  regel: ReactNode
  text?: ReactNode
}

const BOKSTAVER = 'ABCDEFGH'

export const MATRIS_BRADE: readonly (Figur | null)[] = ['t', 'c', 'k', 'cp', 'kp', 'tp', 'kx', 'tx', null]
export const MATRIS_SVAR: readonly TestSvar[] = [
  { figur: 'c' },
  { figur: 'kx' },
  { figur: 'cx', tillstand: 'vald' },
  { figur: 't' },
  { figur: 'cp' },
  { figur: 'k' },
]

export function Testram({
  test = 'Matrislogik',
  niva = 'Grundnivå',
  uppgift = 9,
  av = 15,
  tid = '4:12',
  bitar,
  brade = MATRIS_BRADE,
  bradeKolumner = 3,
  stycke,
  fraga = 'Vilken figur hör hemma i den tomma rutan?',
  svar = MATRIS_SVAR,
  svarKolumner,
  knapp = 'Nästa',
  dom,
  ariaLabel,
  className = '',
}: {
  test?: string
  niva?: string
  /** Uppgiften man står på (räknaren "9 av 15"). */
  uppgift?: number
  av?: number
  /** Klockan, null för ingen klocka. */
  tid?: string | null
  /** Bitarnas lägen: 'b' besvarad, 'r' rätt, 'f' fel, 'nu', '' kvar. Standard: besvarade fram till uppgiften. */
  bitar?: readonly ('b' | 'r' | 'f' | 'nu' | '')[]
  /** Brädets rutor, null är luckan. null för uppgifter utan bräde. */
  brade?: readonly (Figur | null)[] | null
  bradeKolumner?: number
  /** Text ovanför uppgiften (verbala och numeriska uppgifter). */
  stycke?: ReactNode
  fraga?: ReactNode
  svar?: readonly TestSvar[]
  /** Standard: 6 figurer på en rad när ramen är bred, text en per rad. */
  svarKolumner?: 1 | 2 | 3 | 4 | 6
  /** Knappen i foten: Nästa, Svara, Lämna in, Visa resultatet. null för ingen fot. */
  knapp?: string | null
  dom?: TestDom
  ariaLabel?: string
  className?: string
}) {
  const bitarna =
    bitar ?? Array.from({ length: av }, (_, i) => (i + 1 < uppgift ? 'b' : i + 1 === uppgift ? 'nu' : '')) as readonly string[]
  const arFigurer = svar.every((s) => s.figur)
  const kol = svarKolumner ?? (arFigurer ? (svar.length === 6 ? 6 : svar.length === 4 ? 4 : 3) : 1)
  const svarKlass = `p3-tsvar ${kol === 3 ? '' : `p3-s${kol}`}`.trim()
  return (
    <div
      className={`p3-tram ${className}`.trim()}
      role="img"
      aria-label={ariaLabel ?? `Exempel: en uppgift i ${test.toLowerCase()} som den ser ut i testet`}
    >
      <div className="p3-tram-huvud">
        <span className="p3-tkryss">
          <Ikon namn="x" />
        </span>
        <b>
          {test}
          <span>{niva}</span>
        </b>
        <span className="p3-tkapsel">
          {uppgift} av {av}
        </span>
        {tid ? (
          <span className="p3-tkapsel">
            <i />
            {tid}
          </span>
        ) : null}
      </div>
      <div className="p3-tbitar">
        {bitarna.map((b, i) => (
          <i key={i} className={b ? `p3-${b}` : undefined} />
        ))}
      </div>
      <div className="p3-tram-kropp">
        {brade?.length ? (
          <div className={`p3-tbrade ${bradeKolumner === 3 ? '' : 'p3-rad'}`.trim()} style={bradeKolumner === 3 ? undefined : ({ ['--kol' as string]: bradeKolumner } as CSSProperties)}>
            {brade.map((f, i) =>
              f ? (
                <span key={i}>
                  <FigurRitning figur={f} />
                </span>
              ) : (
                <span key={i} className="p3-lucka">
                  ?
                </span>
              )
            )}
          </div>
        ) : null}
        {stycke ? <div className="p3-tstycke">{stycke}</div> : null}
        {fraga ? <p className="p3-tfraga">{fraga}</p> : null}
        {svar.length ? (
          <div className={svarKlass}>
            {svar.map((s, i) => {
              const k = ['p3-tkloss', s.figur ? 'p3-fig' : 'p3-rad', s.tillstand ? `p3-${s.tillstand}` : ''].filter(Boolean).join(' ')
              return (
                <span key={i} className={k}>
                  <i className="p3-ttan">{BOKSTAVER[i]}</i>
                  {s.figur ? <FigurRitning figur={s.figur} /> : <span>{s.text}</span>}
                </span>
              )
            })}
          </div>
        ) : null}
        {dom ? (
          <div className={`p3-tdom ${dom.ratt ? '' : 'p3-fel'}`.trim()}>
            <div className="p3-tdom-rad">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill={dom.ratt ? '#2F7D5B' : '#B3382E'} />
                <path
                  d={dom.ratt ? 'M7.2 12.4l3.2 3.2 6.4-7' : 'M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6'}
                  stroke="#fff"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {dom.rubrik}
            </div>
            <div className="p3-tdom-kropp">
              {dom.etikett ? <em>{dom.etikett}</em> : null}
              <b>{dom.regel}</b>
              {dom.text ? <p>{dom.text}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
      {knapp ? (
        <div className="p3-tram-fot">
          <span className="p3-tkryss">
            <Ikon namn="tillbaka" />
          </span>
          <span className="p3-knapp">{knapp}</span>
        </div>
      ) : null}
    </div>
  )
}
