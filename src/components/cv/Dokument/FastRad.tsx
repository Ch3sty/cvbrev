'use client'

/**
 * Den fasta raden (skissen yta 1 och 4): formatet med filikoner och den
 * enda knappen, alltid synliga. Mobil: längst ner i vyn, ovanför bottennavet
 * inloggat (--bottom-nav-h). Dator: en rad om 64 px längst ner med
 * verktygsraden till vänster (children) och knappen till höger.
 *
 * Knappen fylls i takt med att filen skapas (framsteg 0 till 1). Word visas
 * med lås tills kontot har Premium; trycket på det låsta Word-valet är ytans
 * sak (betalväggen).
 */
import type { ReactNode } from 'react'
import { IkonLas, IkonPdf, IkonWord } from '@/components/illustrations/MallIkoner'
import type { Format } from '@/lib/cv/mallar/kontrakt'
import { FORMAT } from './texter'

export interface FormatValProps {
  format: Format
  onFormat: (f: Format) => void
  /** Mallen finns som Word. */
  mallHarWord: boolean
  /** Kontot har Word (annars lås och "ingår i Premium"). */
  kanWord: boolean
  last?: boolean
}

export function FormatVal({ format, onFormat, mallHarWord, kanWord, last }: FormatValProps) {
  const ruta = (vald: boolean) =>
    `flex h-12 min-w-0 items-center gap-2 rounded-[10px] border bg-papper px-3 text-left text-[13px] font-semibold text-ink-1 ${
      vald ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant-stark hover:border-ink-1'
    } disabled:opacity-60`
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Format">
      <button type="button" role="radio" aria-checked={format === 'pdf'} className={ruta(format === 'pdf')} onClick={() => onFormat('pdf')} disabled={last}>
        <IkonPdf size={20} />
        {FORMAT.pdf}
        <small className="ml-auto truncate text-[11px] font-normal text-ink-3">{FORMAT.klar}</small>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={format === 'docx'}
        className={ruta(format === 'docx')}
        onClick={() => onFormat('docx')}
        disabled={last || !mallHarWord}
      >
        <IkonWord size={20} />
        {FORMAT.word}
        {!kanWord ? (
          <>
            <small className="ml-auto truncate text-[11px] font-normal leading-tight text-ink-3">{FORMAT.wordPremium}</small>
            <IkonLas size={16} className="shrink-0 text-ink-3" />
          </>
        ) : null}
      </button>
    </div>
  )
}

export interface LaddaKnappProps {
  text: string
  format: Format
  onClick: () => void
  /** 0 till 1 medan filen skapas, annars null. */
  framsteg: number | null
  disabled?: boolean
}

export function LaddaKnapp({ text, format, onClick, framsteg, disabled }: LaddaKnappProps) {
  const pagar = framsteg !== null
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pagar}
      aria-busy={pagar}
      className="relative inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[linear-gradient(180deg,#E8863B,var(--koppar)_60%,var(--koppar-djup))] px-4 py-2 text-center text-sm font-semibold leading-tight text-koppar-text disabled:cursor-default"
    >
      {pagar ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-black/15 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${Math.round((framsteg ?? 0) * 100)}%` }}
        />
      ) : null}
      <span className="relative inline-flex items-center gap-2">
        {format === 'docx' ? <IkonWord size={18} /> : <IkonPdf size={18} />}
        {text}
      </span>
    </button>
  )
}

export interface FastRadProps {
  /** Formatvalet och knappen. */
  format: ReactNode
  knapp: ReactNode
  /** Verktygsraden och mallraden till vänster på datorn. */
  dator?: ReactNode
  /** Felraden under knappen. */
  fel?: ReactNode
  /** Ligger ovanför bottennavet (inloggat). */
  ovanNav?: boolean
}

export default function FastRad({ format, knapp, dator, fel, ovanNav }: FastRadProps) {
  return (
    <>
      {/* Klistrad mot vyns botten så länge arbetsytan syns: följer kolumnens
          bredd (inloggat bredvid sidomenyn) och släpper när sidan rullat förbi. */}
      <div
        className="sticky z-40 -mx-3.5 mt-4 border-t border-kant bg-papper/95 backdrop-blur supports-[backdrop-filter]:bg-papper/85 lg:mx-0 lg:rounded-t-xl lg:border-x"
        style={{ bottom: ovanNav ? 'var(--bottom-nav-h, 0px)' : 0 }}
      >
        <div className="mx-auto max-w-[1180px] px-3.5 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5 lg:flex lg:h-16 lg:items-center lg:gap-4 lg:px-6 lg:py-0">
          {dator ? <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">{dator}</div> : null}
          <div className="grid gap-2 lg:flex lg:w-auto lg:shrink-0 lg:items-center">
            <div className="lg:w-[300px]">{format}</div>
            <div className="lg:w-[280px]">{knapp}</div>
          </div>
          {fel ? <div className="mt-1.5 lg:hidden">{fel}</div> : null}
        </div>
        {fel ? <div className="mx-auto hidden max-w-[1180px] px-6 pb-2 lg:block">{fel}</div> : null}
      </div>
    </>
  )
}
