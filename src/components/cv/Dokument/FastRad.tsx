'use client'

/**
 * Den fasta raden (skissen yta 1 och 4): formatet med filikoner och den
 * enda knappen, alltid synliga.
 *
 * Mobil (granskningen B4): en rad, högst 76 px plus säker yta. Formatet som
 * ett segment PDF | Word till vänster, knappen till höger. Inloggat ligger
 * raden mot bottennavet (--bottom-nav-h) utan glapp. Dator (V7, UX
 * 2026-11-16): en rad om 64 px med verktygsraden till vänster, samma
 * kompakta formatsegment som mobilen (132 px; de trunkerade småtexterna och
 * mallnamnet klipptes och täckte fotoknappen) och knappen 280 px vid 1024
 * till 1279, 320 px därefter. Raden ryms hel från 1024 till 2560 px.
 *
 * Knappen fylls i takt med att filen skapas (framsteg 0 till 1). En
 * premiumknapp har två avsiktliga rader (V3): handlingen och priset. Word
 * visas med lås i premiummallar tills kontot har Premium (i gratismallarna
 * är Word gratisfilen, ägarens besked 2026-11-16).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
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
      `inline-flex h-full min-w-0 flex-1 items-center justify-center gap-0.5 rounded-[8px] px-1 text-[13px] font-semibold ${
        vald ? 'bg-papper text-ink-1 shadow-[0_0_0_1px_var(--ink-1)]' : 'text-ink-2 hover:text-ink-1'
      } disabled:opacity-60`
    return (
      <div className="flex h-12 w-[132px] shrink-0 items-stretch gap-0.5 rounded-[10px] bg-papper-2 p-1" role="radiogroup" aria-label="Format">
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
            <span className="block truncate text-[14px] min-[480px]:text-[15px]">{text}</span>
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
  /** Formatvalet som segment (samma på mobil och dator). */
  formatKompakt: ReactNode
  knapp: ReactNode
  /** Verktygsraden och mallraden till vänster på datorn. */
  dator?: ReactNode
  /** Felraden under knappen. */
  fel?: ReactNode
  /** Ligger mot bottennavet (inloggat). */
  ovanNav?: boolean
  /** Ersätter format och knapp (CV-byggarens Nästa-lucka). */
  ersattning?: ReactNode
  /** Format och knapp göms (ett öppet blad äger kopparknappen). */
  utanKnapp?: boolean
  /** En rad ovanför raden, i samma fasta lager (byggarens förslag, Ångra). */
  ovan?: ReactNode
}

/**
 * Verktygsraden mäts i sin plats (inloggat är ytan smalare än skärmen, så
 * skärmbredden räcker inte): rullar den, kortas chippen i två steg
 * (rad-trang-1: "Standard" bara som ikon, typsnittsnamnet kortat;
 * rad-trang-2: bara ikoner). Tillbaka när platsen vuxit igen.
 */
function useTrang() {
  const ref = useRef<HTMLDivElement>(null)
  const [steg, setSteg] = useState(0)
  const vid = useRef<number[]>([])
  // Raden eller verktygsraden inuti den (egen rullning) får inte rulla.
  const rullar = (el: HTMLElement) =>
    [el, ...Array.from(el.querySelectorAll<HTMLElement>('.overflow-x-auto'))].some((x) => x.scrollWidth > x.clientWidth + 1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mat = () => {
      if (el.offsetParent === null) return
      setSteg((s) => {
        if (rullar(el) && s < 2) {
          vid.current[s + 1] = el.clientWidth
          return s + 1
        }
        if (s > 0 && el.clientWidth > (vid.current[s] ?? 0) + 48) return s - 1
        return s
      })
    }
    mat()
    const ro = new ResizeObserver(mat)
    ro.observe(el)
    for (const barn of Array.from(el.querySelectorAll('.overflow-x-auto'))) ro.observe(barn)
    return () => ro.disconnect()
    // rullar är ren.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Ett nytt steg kan behöva ett till (mallbyte med fotoknapp).
  useEffect(() => {
    const el = ref.current
    if (!el || steg >= 2) return
    if (el.offsetParent !== null && rullar(el)) {
      vid.current[steg + 1] = el.clientWidth
      setSteg(steg + 1)
    }
  })
  return { ref, steg }
}

export default function FastRad({ formatKompakt, knapp, dator, fel, ovanNav, ersattning, utanKnapp, ovan }: FastRadProps) {
  const trang = useTrang()
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
        {ovan ? <div className="px-3 pt-2 lg:px-4">{ovan}</div> : null}
        <div className="flex items-center gap-2 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:h-16 lg:gap-4 lg:px-4 lg:py-0">
          {dator ? (
            <div
              ref={trang.ref}
              className={`hidden min-w-0 flex-1 items-center gap-3 overflow-x-auto [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden ${
                trang.steg >= 1 ? 'rad-trang-1' : ''
              } ${trang.steg >= 2 ? 'rad-trang-2' : ''}`}
              data-trang={trang.steg}
            >
              {dator}
            </div>
          ) : null}
          {utanKnapp ? null : ersattning ? (
            <div className="min-w-0 flex-1 lg:w-auto lg:max-w-[560px] lg:flex-none">{ersattning}</div>
          ) : (
            <>
              <div className="shrink-0">{formatKompakt}</div>
              <div className="min-w-0 flex-1 lg:w-[280px] lg:flex-none xl:w-[320px]">{knapp}</div>
            </>
          )}
        </div>
        {fel ? <div className="px-3 pb-2 lg:px-4">{fel}</div> : null}
      </div>
      {/* Luften under raden som rullytan hade, så att sista innehållet går att nå. */}
      {ovanNav ? <div aria-hidden style={{ height: 'var(--bottom-nav-h, 0px)' }} /> : null}
    </>
  )
}
