/**
 * Provets resultat som bild (omgång 2 steg C, skissen rad 13 och 14):
 * Uppgiftslistans låsta rader utan huvud, för artikelns provruta och
 * registreringens panel. En rad per uppgift med numret, miniatyren när den
 * finns (matrisens rutnät ur fliken eller typens egen), det ritade märket
 * (Marke), "Rätt" eller "Fel" och låset. Fel står på fel-mjuk.
 *
 * `mobil="brickor"` (registreringen): under 640 px blir raderna en rad med
 * märkena i små brickor, så att panelen står kompakt ovanför formuläret.
 *
 * Hela bilden är role="img" med brickorText som namn: raderna är dekor för
 * skärmläsaren, texten säger vilka som blev fel. Bara rutnätet ritas, aldrig
 * alternativen eller svaret. Ingen 'use client': ritas också på servern.
 */

import type { ReactNode } from 'react'
import { FigurV7, LuckaV7 } from '@/lib/logicTestV7/layered.v7'
import type { Rutnat } from '@/lib/tests/prova-lokalt'
import { brickorText } from '@/components/registrering/registrering-copy'
import Marke, { Las } from '@/components/session/Marke'
import { SESSION } from '@/components/session/copy'

/** Matrisens rutnät i miniatyr (3 × 3), utan alternativ. */
export function ProvBricka({ rutnat, className = '' }: { rutnat?: Rutnat | null; className?: string }) {
  const celler = rutnat ? rutnat.flat() : new Array<null>(9).fill(null)
  return (
    <span className={`pub-bricka-g matrisyta ${className}`.trim()} aria-hidden="true">
      {celler.slice(0, 9).map((c, i) => (
        <i key={i}>{c ? <FigurV7 cell={c} /> : rutnat ? <LuckaV7 /> : null}</i>
      ))}
    </span>
  )
}

export default function ProvBrickor({
  totalt,
  fel,
  rutnat = [],
  mini,
  lasText,
  mobil = 'rader',
  className = '',
}: {
  totalt: number
  fel: readonly number[]
  /** Matrisens rutnät per uppgift, när fliken har dem. */
  rutnat?: readonly Rutnat[]
  /** Typens miniatyr per uppgift (artikeln har uppgifterna). Går före rutnätet. */
  mini?: (i: number) => ReactNode
  /** Låsets text från 640 px. Utelämnad: "Rätt svar och regeln". */
  lasText?: string
  mobil?: 'rader' | 'brickor'
  className?: string
}) {
  const felSet = new Set(fel)
  const L = SESSION.lista
  const rader = Array.from({ length: totalt }, (_, i) => {
    const ratt = !felSet.has(i)
    const m = mini?.(i) ?? (rutnat[i] ? <ProvBricka rutnat={rutnat[i]} className="pub-bricka-mini" /> : null)
    return { i, ratt, m }
  })
  return (
    <div role="img" aria-label={brickorText(fel, totalt)} className={className} data-prov-brickor={mobil}>
      <ol className={`m-0 list-none p-0 ${mobil === 'brickor' ? 'hidden sm:block' : ''}`}>
        {rader.map(({ i, ratt, m }) => (
          <li key={i} className="border-t border-kant first:border-t-0" data-lista-rad={ratt ? 'ratt' : 'fel'} data-last="">
            <div className={`flex h-14 items-center gap-2.5 px-3 sm:gap-3.5 sm:px-4 ${ratt ? 'bg-papper' : 'bg-fel-mjuk'}`}>
              <span className="w-[22px] flex-shrink-0 text-[13px] tabular-nums text-ink-3">{i + 1}</span>
              {m ? <span className="flex min-w-0 flex-shrink items-center overflow-hidden">{m}</span> : null}
              <Marke typ={ratt ? 'ratt' : 'fel'} storlek={22} />
              <span className="text-sm font-medium leading-5 text-ink-1">{L.radLast(ratt)}</span>
              <span className="ml-auto inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] leading-4 text-ink-3 sm:rounded-full sm:bg-papper-2 sm:px-2.5 sm:py-[3px]" data-lista-las>
                <Las storlek={13} />
                <span className="hidden sm:inline">{lasText ?? L.las}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
      {mobil === 'brickor' ? (
        <div className="grid gap-2 px-4 py-3 sm:hidden" style={{ gridTemplateColumns: `repeat(${totalt}, minmax(0, 1fr))` }}>
          {rader.map(({ i, ratt }) => (
            <span key={i} className={`flex h-11 items-center justify-center rounded-xl ${ratt ? 'bg-papper-2' : 'bg-fel-mjuk'}`} data-lista-rad={ratt ? 'ratt' : 'fel'}>
              <Marke typ={ratt ? 'ratt' : 'fel'} storlek={22} />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Resultatets ring (skissens Prova-resultat och Artikel-prov-resultat): andelen rätt i koppar och bocken. */
export function ProvRing({ andel, storlek = 48, yta = 'ljus' }: { andel: number; storlek?: number; yta?: 'ljus' | 'vagg' }) {
  const a = Math.max(0.04, Math.min(1, andel))
  const omkrets = 2 * Math.PI * 20
  const bak = yta === 'vagg' ? 'var(--vagg-kant)' : 'var(--kant)'
  const bock = yta === 'vagg' ? 'var(--vagg-ink)' : 'var(--ink-1)'
  return (
    <svg viewBox="0 0 48 48" width={storlek} height={storlek} aria-hidden="true" focusable="false" className="block flex-shrink-0" data-prov-ring>
      <circle cx="24" cy="24" r="20" fill="none" stroke={bak} strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="var(--koppar)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${(omkrets * a).toFixed(1)} ${omkrets.toFixed(1)}`}
        transform="rotate(-90 24 24)"
      />
      <path d="M16.5 24.5l5 5 10-11" fill="none" stroke={bock} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
