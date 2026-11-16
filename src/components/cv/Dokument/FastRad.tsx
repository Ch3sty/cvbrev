'use client'

/**
 * Den fasta raden (skissen yta 1 och 4): formatet med filikoner och den
 * enda knappen, alltid synliga.
 *
 * Mobil (granskningen B4): en rad, högst 76 px plus säker yta. Formatet som
 * ett segment PDF | Word till vänster, knappen till höger. Inloggat ligger
 * raden mot bottennavet (--bottom-nav-h) utan glapp. Dator (V7): en rad om
 * 64 px med verktygsraden till vänster (rullar i sidled i stället för att
 * klippas), formatparet utan småtext och knappen 320 px.
 *
 * Knappen fylls i takt med att filen skapas (framsteg 0 till 1). En
 * premiumknapp har två avsiktliga rader (V3): handlingen och priset. Word
 * visas med lås i premiummallar tills kontot har Premium (i gratismallarna
 * är Word gratisfilen, ägarens besked 2026-11-16).
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
  /** Word är öppet för mallen: gratismall, eller kontot har Premium (annars lås och "ingår i Premium"). */
  kanWord: boolean
  last?: boolean
  /** Kompakt segment (den fasta raden): ikon och ord, ingen småtext. */
  kompakt?: boolean
}

export function FormatVal({ format, onFormat, mallHarWord, kanWord, last, kompakt }: FormatValProps) {
  if (kompakt) {
    const del = (vald: boolean) =>
      `inline-flex h-full min-w-0 flex-1 items-center justify-center gap-1 rounded-[8px] px-2 text-[13px] font-semibold ${
        vald ? 'bg-papper text-ink-1 shadow-[0_0_0_1px_var(--ink-1)]' : 'text-ink-2 hover:text-ink-1'
      } disabled:opacity-60`
    return (
      <div className="flex h-12 w-[150px] shrink-0 items-stretch gap-1 rounded-[10px] bg-papper-2 p-1" role="radiogroup" aria-label="Format">
        <button type="button" role="radio" aria-checked={format === 'pdf'} className={del(format === 'pdf')} onClick={() => onFormat('pdf')} disabled={last}>
          <IkonPdf size={18} />
          {FORMAT.pdf}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={format === 'docx'}
          aria-label={kanWord ? FORMAT.word : `${FORMAT.word}, ${FORMAT.wordPremium}`}
          className={del(format === 'docx')}
          onClick={() => onFormat('docx')}
          disabled={last || !mallHarWord}
        >
          <IkonWord size={18} />
          {FORMAT.word}
          {!kanWord ? <IkonLas size={14} className="shrink-0 text-ink-3" /> : null}
        </button>
      </div>
    )
  }
  const ruta = (vald: boolean) =>
    `flex h-12 min-w-0 items-center gap-2 rounded-[10px] border bg-papper px-3 text-left text-[13px] font-semibold text-ink-1 ${
      vald ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant-stark hover:border-ink-1'
    } disabled:opacity-60`
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Format">
      <button type="button" role="radio" aria-checked={format === 'pdf'} className={ruta(format === 'pdf')} onClick={() => onFormat('pdf')} disabled={last}>
        <IkonPdf size={20} />
        {FORMAT.pdf}
        <small className="ml-auto hidden truncate text-[11px] font-normal text-ink-3 min-[480px]:inline">{FORMAT.klar}</small>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={format === 'docx'}
        aria-label={kanWord ? FORMAT.word : `${FORMAT.word}, ${FORMAT.wordPremium}`}
        className={ruta(format === 'docx')}
        onClick={() => onFormat('docx')}
        disabled={last || !mallHarWord}
      >
        <IkonWord size={20} />
        {FORMAT.word}
        {!kanWord ? (
          <>
            <small className="ml-auto hidden truncate text-[11px] font-normal leading-tight text-ink-3 min-[480px]:inline">{FORMAT.wordPremium}</small>
            <IkonLas size={16} className="ml-auto shrink-0 text-ink-3 min-[480px]:ml-0" />
          </>
        ) : null}
      </button>
    </div>
  )
}

export interface LaddaKnappProps {
  text: string
  /** Andra raden (priset) i en premiumknapp. */
  under?: string
  format: Format
  onClick: () => void
  /** 0 till 1 medan filen skapas, annars null. */
  framsteg: number | null
  disabled?: boolean
}

export function LaddaKnapp({ text, under, format, onClick, framsteg, disabled }: LaddaKnappProps) {
  const pagar = framsteg !== null
  const tva = Boolean(under) && !pagar
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pagar}
      aria-busy={pagar}
      className={`relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[linear-gradient(180deg,#E8863B,var(--koppar)_60%,var(--koppar-djup))] px-3 text-center font-semibold leading-tight text-koppar-text disabled:cursor-default ${
        tva ? 'h-14' : 'h-12'
      }`}
    >
      {pagar ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-black/15 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${Math.round((framsteg ?? 0) * 100)}%` }}
        />
      ) : null}
      <span className="relative inline-flex min-w-0 items-center gap-2">
        {format === 'docx' ? <IkonWord size={18} className="shrink-0" /> : <IkonPdf size={18} className="shrink-0" />}
        {tva ? (
          <span className="min-w-0 text-left">
            <span className="block truncate text-[15px]">{text}</span>
            <span className="block truncate text-[12px] font-medium opacity-85">{under}</span>
          </span>
        ) : (
          <span className="truncate text-sm">{text}</span>
        )}
      </span>
    </button>
  )
}

export interface FastRadProps {
  /** Formatvalet i två former: kompakt (mobil) och par (dator). */
  format: ReactNode
  formatKompakt: ReactNode
  knapp: ReactNode
  /** Verktygsraden och mallraden till vänster på datorn. */
  dator?: ReactNode
  /** Felraden under knappen. */
  fel?: ReactNode
  /** Ligger mot bottennavet (inloggat). */
  ovanNav?: boolean
}

export default function FastRad({ format, formatKompakt, knapp, dator, fel, ovanNav }: FastRadProps) {
  return (
    <>
      {/* Inloggat räknar rullytan sin luft under innehållet (padding-bottom
          för navet), och då hamnade raden med ett glapp ovanför navet. Luften
          nollas här och läggs under raden i stället (granskningen B4). */}
      {ovanNav ? <style>{'main.dashboard-main-content{padding-bottom:0!important}'}</style> : null}
      <div
        className="sticky z-40 -mx-3.5 mt-4 border-t border-kant bg-papper/95 backdrop-blur supports-[backdrop-filter]:bg-papper/85 lg:mx-0 lg:rounded-t-xl lg:border-x"
        style={{ bottom: ovanNav ? 'var(--bottom-nav-h, 0px)' : 0 }}
        data-fast-rad
      >
        <div className="flex items-center gap-2 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:h-16 lg:gap-4 lg:px-4 lg:py-0">
          {dator ? (
            <div className="hidden min-w-0 flex-1 items-center gap-3 overflow-x-auto [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
              {dator}
            </div>
          ) : null}
          <div className="lg:hidden">{formatKompakt}</div>
          <div className="hidden w-[220px] shrink-0 lg:block">{format}</div>
          <div className="min-w-0 flex-1 lg:w-[320px] lg:flex-none">{knapp}</div>
        </div>
        {fel ? <div className="px-3 pb-2 lg:px-4">{fel}</div> : null}
      </div>
      {/* Luften under raden som rullytan hade, så att sista innehållet går att nå. */}
      {ovanNav ? <div aria-hidden style={{ height: 'var(--bottom-nav-h, 0px)' }} /> : null}
    </>
  )
}
