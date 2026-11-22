/**
 * Arket som byggare (delar/skapa-cv-ark.html): CV:t i mallen medan man
 * skriver, som nya CV-byggaren "Direkt på arket" (live 2026-11-16). Ett
 * avsnitt är öppet med kopparram, riktig punkttext, Jobbcoachens förslag
 * markerat, knappen "Skriv punkter åt mig", grå exempeltext i det som inte
 * är ifyllt och "+ Lägg till". Valfritt verktygsraden under arket (typsnitt,
 * färger, Byt mall, PDF eller Word) och numrerade nålar per del.
 *
 * Förvalet är Sara Lindström. Meriterna följer grundens brev (Brevpar.tsx):
 * inga belopp, samma tal som där (SEO:s slutbesked, avsnitt 5). Exempel,
 * aldrig verkliga resultat: aria-label börjar "Exempel".
 */

import type { ReactNode } from 'react'
import { SARA_KONTAKT } from './CvArk'

export type ByggarInnehall =
  | { typ: 'text'; text: ReactNode }
  | { typ: 'rad'; text: ReactNode; tid?: string }
  | { typ: 'punkter'; punkter: readonly { text: ReactNode; ny?: boolean; nal?: number }[] }
  /** Knappen i det öppna avsnittet. Standard: "Skriv punkter åt mig". */
  | { typ: 'knapp'; text?: string }
  /** Grå exempeltext, följer inte med i filen. */
  | { typ: 'gra'; text: ReactNode }
  /** "+ Lägg till utbildning". */
  | { typ: 'lagg'; text: ReactNode }
  | { typ: 'linjer'; linjer: readonly ('hel' | 'm' | 'k' | 's')[] }

export interface ByggarDel {
  rubrik: string
  innehall: readonly ByggarInnehall[]
  /** Avsnittet som är öppet (kopparram). */
  oppen?: boolean
  /** Nålens nummer, visas när nalar är på. */
  nal?: number
}

export interface Verktygsrad {
  typsnitt?: string
  /** Mallens accentfärger, ur katalogen. */
  farger?: readonly string[]
  nal?: number
}

export const SARA_BYGGARE: readonly ByggarDel[] = [
  {
    rubrik: 'Profil',
    innehall: [
      {
        typ: 'text',
        text: 'Projektledare med åtta års erfarenhet av energi- och byggprojekt, från förstudie till överlämning. Van att hålla ihop upphandling, budget och tidplan.',
      },
    ],
  },
  {
    rubrik: 'Arbetslivserfarenhet',
    oppen: true,
    nal: 1,
    innehall: [
      { typ: 'rad', text: 'Projektledare, Nordanvind Energi', tid: '2021 till nu' },
      {
        typ: 'punkter',
        punkter: [
          { text: 'Ledde en ombyggnad inom budget och två veckor före plan.' },
          { text: 'Drev fyra upphandlingar enligt LOU, från förfrågningsunderlag till tilldelning.', ny: true, nal: 2 },
        ],
      },
      { typ: 'knapp' },
      { typ: 'rad', text: 'Biträdande projektledare, Halda Logistik', tid: '2018 till 2021' },
      { typ: 'linjer', linjer: ['m', 'k'] },
    ],
  },
  {
    rubrik: 'Utbildning',
    nal: 3,
    innehall: [
      { typ: 'gra', text: 'Examen eller utbildning, skola, år' },
      { typ: 'lagg', text: '+ Lägg till utbildning' },
    ],
  },
  { rubrik: 'Kompetenser', innehall: [{ typ: 'text', text: 'Projektledning · LOU · Budgetansvar · Tidplanering · MS Project' }] },
  { rubrik: 'Språk', innehall: [{ typ: 'text', text: 'Svenska, modersmål · Engelska, flytande' }] },
]

function Nal({ nr, visa }: { nr?: number; visa: boolean }) {
  if (!visa || nr === undefined) return null
  return <span className="p3-bnal">{nr}</span>
}

function Penna() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" />
    </svg>
  )
}

function Innehall({ i, nalar }: { i: ByggarInnehall; nalar: boolean }) {
  switch (i.typ) {
    case 'text':
      return <p>{i.text}</p>
    case 'rad':
      return (
        <div className="p3-ark-rad">
          {i.text}
          {i.tid ? <span>{i.tid}</span> : null}
        </div>
      )
    case 'punkter':
      return (
        <ul>
          {i.punkter.map((p, j) => (
            <li key={j} className={p.ny ? 'p3-ny' : undefined}>
              <Nal nr={p.nal} visa={nalar} />
              {p.text}
            </li>
          ))}
        </ul>
      )
    case 'knapp':
      return (
        <span className="p3-skrivknapp">
          <Penna />
          {i.text ?? 'Skriv punkter åt mig'}
        </span>
      )
    case 'gra':
      return <p className="p3-gra">{i.text}</p>
    case 'lagg':
      return <span className="p3-lagg">{i.text}</span>
    case 'linjer':
      return (
        <>
          {i.linjer.map((l, j) => (
            <i key={j} className={`p3-l ${l === 'hel' ? '' : `p3-${l}`}`.trim()} />
          ))}
        </>
      )
  }
}

export function ByggarArk({
  namn = 'Sara Lindström',
  kontakt = SARA_KONTAKT,
  delar = SARA_BYGGARE,
  nalar = false,
  verktygsrad,
  ariaLabel = 'Exempel: Sara Lindströms CV i mallen Linne medan hon skriver. Avsnittet Arbetslivserfarenhet är öppet och Jobbcoachen föreslår en punkt.',
  className = '',
}: {
  namn?: string
  kontakt?: string
  delar?: readonly ByggarDel[]
  /** Numrerade nålar (delens och punktens nal, verktygsradens nal). */
  nalar?: boolean
  /** Raden under arket. Utan den ritas bara arket. */
  verktygsrad?: Verktygsrad
  ariaLabel?: string
  className?: string
}) {
  const ark = (
    <div className={`p3-ark p3-bark ${nalar ? 'p3-med-nal' : ''}`.trim()}>
      <div className="p3-ark-namn">{namn}</div>
      <span className="p3-ark-kontakt">{kontakt}</span>
      {delar.map((d) => {
        const innehall = d.innehall.map((i, j) => <Innehall key={j} i={i} nalar={nalar} />)
        if (d.oppen || (nalar && d.nal !== undefined)) {
          return (
            <div key={d.rubrik} className={`p3-bdel ${d.oppen ? 'p3-vald' : ''}`.trim()}>
              <Nal nr={d.nal} visa={nalar} />
              <div className="p3-ark-rubrik">{d.rubrik}</div>
              {innehall}
            </div>
          )
        }
        return (
          <div key={d.rubrik}>
            <div className="p3-ark-rubrik">{d.rubrik}</div>
            {innehall}
          </div>
        )
      })}
    </div>
  )
  return (
    <div className={`p3-byggare ${className}`.trim()} role="img" aria-label={ariaLabel}>
      {ark}
      {verktygsrad ? (
        <div className="p3-verktygsrad">
          <span>Aa {verktygsrad.typsnitt ?? 'Calibri'}</span>
          {verktygsrad.farger?.length ? (
            <span className="p3-vfarg">
              {verktygsrad.farger.map((f) => (
                <i key={f} style={{ background: f }} />
              ))}
            </span>
          ) : null}
          <span>Byt mall</span>
          <span className="p3-vtva">
            <b className="p3-pa">PDF</b>
            <b>Word</b>
          </span>
          <Nal nr={verktygsrad.nal} visa={nalar} />
        </div>
      ) : null}
    </div>
  )
}
