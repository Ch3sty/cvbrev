/**
 * Byggstenarna för kalkylatorerna under /rakna-ut, i Trådens form
 * (docs/designsystem.md avsnitt 6): fält i insunken yta, kryssrutor och
 * reglage i ink-1, resultatet som vyns enda bläckyta.
 *
 * Inga hooks här, så delarna kan användas i klientkalkylatorerna och
 * renderas på servern med dem. Delningsknappen, som behöver webbläsaren,
 * ligger i DelaResultat.tsx.
 */
import type { CSSProperties, ReactNode } from 'react'
import InkPanel from '@/components/shell/InkPanel'
import Fordelning, { type FordelningSegment } from '@/components/shell/Fordelning'

export const FALT_ETIKETT = 'mb-1 block text-sm font-medium text-ink-2'
export const FALT_INPUT =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken tabular-nums placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1'
export const FALT_HJALP = 'mt-1 block text-meta text-ink-3'

/** Panelen med kalkylatorns fält. */
export function FaltPanel({ children, etikett = 'Dina uppgifter' }: { children: ReactNode; etikett?: string }) {
  return (
    <section aria-label={etikett} className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/** Ett textfält för tal. */
export function TalFalt({
  id,
  etikett,
  value,
  onChange,
  decimal,
  hjalp,
  enhet,
}: {
  id: string
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
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${FALT_INPUT} ${enhet ? 'pr-12' : ''}`}
        />
        {enhet ? (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-3">
            {enhet}
          </span>
        ) : null}
      </div>
      {hjalp ? <span className={FALT_HJALP}>{hjalp}</span> : null}
    </div>
  )
}

/** Kryssruta i ink-1 med en träffyta på 44 px. */
export function Kryss({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 cursor-pointer accent-ink-1"
      />
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
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-2">
          {etikett}
        </label>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-1">{visa}</span>
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
        className="h-11 w-full cursor-pointer accent-ink-1"
      />
      {minText || maxText ? (
        <div className="flex justify-between text-meta text-ink-3">
          <span>{minText}</span>
          <span>{maxText}</span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Fordelning och listor på bläck: pekar om tonerna så att ink-1 blir vitt,
 * ink-2 och ink-3 den dämpade tonen på bläck, och de mjuka segmenten
 * papperet i ink-hover. Samma grepp som InkPanel gör för scenen.
 */
export const PA_BLACK = {
  '--ink-1': 'var(--panel)',
  '--ink-2': 'var(--ink-1-mjuk)',
  '--ink-3': 'var(--ink-1-mjuk)',
  '--kant-stark': 'var(--ink-1-mjuk)',
  '--insunken': 'var(--ink-hover)',
  '--kant': 'var(--ink-1-kant)',
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

/**
 * Resultatet: vyns enda bläckyta. Etiketten säger vilken kalkylator det är,
 * rubriken förutsättningarna ("35 000 kr i Stockholm"), och talet står i
 * display med en mening som säger vad det betyder. Finns en fördelning ritas
 * den med Fordelning (regel 5), annars står talet med sin mening. Källan
 * står alltid synlig under. Delningsknappen skickas in som handling.
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
    <InkPanel
      label="Resultat"
      eyebrow={etikett}
      titleAs="p"
      title={premiss}
      action={dela}
      secondary={sekundar}
    >
      <div style={PA_BLACK} aria-live="polite">
        {segment ? (
          <Fordelning total={tal} unit={enhet} mening={mening} segments={segment} />
        ) : (
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="whitespace-nowrap text-tal-display text-ink-1">{tal}</span>
              <span className="text-sm font-medium text-ink-2">{enhet}</span>
            </div>
            <p className="mt-2 text-sm leading-[22px] text-ink-2">{mening}</p>
          </div>
        )}
      </div>
      {children ? (
        <div className="mt-4" style={PA_BLACK}>
          {children}
        </div>
      ) : null}
      <p className="mt-4 text-meta text-ink-1-mjuk">Källa: {kalla}</p>
    </InkPanel>
  )
}

/** Kalkylatorns ram: fälten till vänster, resultatet till höger från lg. */
export function KalkylatorRam({ falt, resultat, efter }: { falt: ReactNode; resultat: ReactNode; efter?: ReactNode }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-6">
      {falt}
      <div className="lg:sticky lg:top-24">
        {resultat}
        {efter}
      </div>
    </div>
  )
}
