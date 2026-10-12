/**
 * Byggstenarna för kalkylatorerna under /rakna-ut, i publikt v2
 * (docs/design/spec-publikt-v2-del-b-2026-10-12.md avsnitt 3.5): fälten
 * på papper, knappen Räkna ut i koppar, resultatet på bläck med huvudtalet,
 * stapeln och legenden, källan och Dela.
 *
 * Inga hooks här, så delarna kan användas i klientkalkylatorerna och
 * renderas på servern med dem. Delningsknappen, som behöver webbläsaren,
 * ligger i DelaResultat.tsx. Stilarna står i rakna.css.
 */
import type { CSSProperties, ReactNode } from 'react'
import type { FordelningSegment } from '@/components/shell/Fordelning'
import './rakna.css'

export const FALT_ETIKETT = 'rk-etikett'
export const FALT_INPUT = 'rk-input'
export const FALT_HJALP = 'rk-hjalp'

/** Knappen som skickar formuläret. Med JavaScript räknar kalkylatorn redan vid inmatning. */
export function RaknaKnapp() {
  return (
    <button type="submit" className="pub-knapp rk-knapp" data-primar="">
      Räkna ut
    </button>
  )
}

/**
 * Kalkylatorns fält. Knappen Räkna ut står sist, om inte kalkylatorn
 * placerar den själv (egenKnapp), som lön efter skatt gör direkt under
 * kommunvalet.
 */
export function FaltPanel({ children, egenKnapp }: { children: ReactNode; egenKnapp?: boolean; etikett?: string }) {
  return (
    <div className="rk-falt">
      {children}
      {egenKnapp ? null : <RaknaKnapp />}
    </div>
  )
}

/** Ett textfält för tal. */
export function TalFalt({
  id,
  namn,
  etikett,
  value,
  onChange,
  decimal,
  hjalp,
  enhet,
}: {
  id: string
  /** Parameterns namn när formuläret skickas utan JavaScript. */
  namn?: string
  etikett: string
  value: string
  onChange: (v: string) => void
  decimal?: boolean
  hjalp?: ReactNode
  enhet?: string
}) {
  return (
    <div>
      <label htmlFor={id} className={FALT_ETIKETT}>
        {etikett}
      </label>
      <div className={enhet ? 'rk-enhet' : undefined}>
        <input
          id={id}
          name={namn}
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={FALT_INPUT}
        />
        {enhet ? <span aria-hidden="true">{enhet}</span> : null}
      </div>
      {hjalp ? <span className={FALT_HJALP}>{hjalp}</span> : null}
    </div>
  )
}

/** Kryssruta i koppar med en träffyta på 44 px. */
export function Kryss({
  checked,
  onChange,
  namn,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  /** Parameterns namn utan JavaScript; värdet är 1. */
  namn?: string
  children: ReactNode
}) {
  return (
    <label className="rk-kryss">
      <input type="checkbox" name={namn} value={namn ? '1' : undefined} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  )
}

/** Reglage med värdet utskrivet till höger om etiketten. */
export function Reglage({
  id,
  etikett,
  value,
  min,
  max,
  steg,
  visa,
  onChange,
  minText,
  maxText,
}: {
  id: string
  etikett: string
  value: number
  min: number
  max: number
  steg: number
  visa: string
  onChange: (v: number) => void
  minText?: string
  maxText?: string
}) {
  return (
    <div className="rk-reglage">
      <div className="rk-reglage-topp">
        <label htmlFor={id}>{etikett}</label>
        <b>{visa}</b>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={steg}
        value={value}
        aria-valuetext={visa}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {minText || maxText ? (
        <div className="rk-reglage-skala">
          <span>{minText}</span>
          <span>{maxText}</span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Tokens på bläck för det kalkylatorerna själva ritar under talet (trattar,
 * prickar, jämförelser i Tailwinds tokenklasser): ink-1 blir vitt, ink-2
 * och ink-3 den dämpade tonen, ytorna genomskinligt vitt.
 */
export const PA_BLACK = {
  '--ink-1': '#FFFFFF',
  '--ink-2': 'var(--vagg-mjuk)',
  '--ink-3': 'var(--vagg-mjuk)',
  '--kant-stark': 'rgba(255, 255, 255, 0.32)',
  '--insunken': 'rgba(255, 255, 255, 0.12)',
  '--kant': 'var(--premium-kant)',
  '--ink-1-mjuk': 'var(--vagg-mjuk)',
  '--ink-1-kant': 'var(--premium-kant)',
} as CSSProperties

/** En rad med post och belopp på bläck. */
export function PostRader({ rader }: { rader: readonly (readonly [string, string])[] }) {
  return (
    <dl className="divide-y divide-ink-1-kant border-t border-ink-1-kant text-sm">
      {rader.map(([namn, belopp]) => (
        <div key={namn} className="flex items-baseline justify-between gap-3 py-2">
          <dt className="text-ink-1-mjuk">{namn}</dt>
          <dd className="shrink-0 font-semibold tabular-nums text-white">{belopp}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Stapeln och legenden ur segmenten. Färgen bär aldrig ensam: legenden skriver ut talet. */
export function Stapel({ segment, ljus }: { segment: readonly FordelningSegment[]; ljus?: boolean }) {
  const summa = segment.reduce((s, x) => s + Math.max(0, x.value), 0) || 1
  return (
    <>
      <div className={`rk-stapel ${ljus ? 'rk-stapel-ljus' : ''}`.trim()} aria-hidden="true">
        {segment.map((s, i) => (
          <i key={i} className={`rk-ton-${i % 5}`} style={{ width: `${((Math.max(0, s.value) / summa) * 100).toFixed(1)}%` }} />
        ))}
      </div>
      <ul className="rk-leg">
        {segment.map((s, i) => (
          <li key={i} style={{ '--rk-prick': TONER[i % 5] } as CSSProperties}>
            <span>
              <b>{s.visa ?? s.value}</b>{s.label ? ` ${s.label}` : null}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

const TONER = [
  'var(--koppar)',
  'rgba(255, 255, 255, 0.4)',
  'rgba(255, 255, 255, 0.22)',
  'rgba(255, 255, 255, 0.62)',
  'rgba(244, 185, 138, 0.55)',
]

/**
 * Resultatet på bläck. Etiketten säger vilken kalkylator det är, raden
 * förutsättningarna ("35 000 kr i lön i Stockholm"), huvudtalet med vad det
 * är, stapeln med legenden om det finns en fördelning, meningen som säger
 * vad talet betyder, och källan. Dela och Bädda in sist.
 */
export function ResultatYta({
  etikett,
  premiss,
  tal,
  enhet,
  mening,
  segment,
  kalla,
  children,
  dela,
  sekundar,
}: {
  etikett: string
  premiss: ReactNode
  tal: string
  enhet: string
  mening: ReactNode
  segment?: readonly FordelningSegment[]
  kalla: string
  children?: ReactNode
  dela: ReactNode
  sekundar?: ReactNode
}) {
  return (
    <section className="rk-res" aria-label="Resultat" id="resultat">
      <p className="rk-res-kick">{etikett}</p>
      <div aria-live="polite">
        <p className="rk-res-rad">{premiss}</p>
        <p className="rk-tal">
          {tal}
          <small>{enhet}</small>
        </p>
        {segment ? <Stapel segment={segment} /> : null}
        <p className="rk-mening">{mening}</p>
      </div>
      {children ? (
        <div className="rk-detaljer" style={PA_BLACK}>
          {children}
        </div>
      ) : null}
      <p className="rk-kalla">
        <b>Källa:</b> {kalla}
      </p>
      <div className="rk-dela" style={PA_BLACK}>
        {dela}
        {sekundar}
      </div>
    </section>
  )
}

/** Kalkylatorns kort: fälten till vänster, resultatet på bläck till höger från 900 px. */
export function KalkylatorRam({ falt, resultat, efter }: { falt: ReactNode; resultat: ReactNode; efter?: ReactNode }) {
  return (
    <div className="rk-kalk" id="kalkylator">
      {falt}
      <div>
        {resultat}
        {efter}
      </div>
    </div>
  )
}
