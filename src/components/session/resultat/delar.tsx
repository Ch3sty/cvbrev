'use client'

/**
 * Delarna i målgången och resultatsidan (omgång 3, steg 3b, skissens
 * Trana-klar och Resultat-test): brickorna, mätaren, tiden per uppgift och
 * väggens former. Rena ritare: de får riktiga tal och ritar ingenting när
 * talen saknas. Färgerna kommer ur tokens i globals.css (steg 3b-blocket).
 */

import type { ReactNode } from 'react'
import { antalOrd } from '../copy'

export type BrickUtfall = 'ratt' | 'fel' | 'obesvarad'

/** Nivån med en decimal och kommatecken: 3,0 och 4,1. */
export function nivaText(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace('.', ',')
}

/** Skalan 1 till 10 som andel av mätarens bredd. */
export function nivaAndel(n: number): number {
  return Math.min(1, Math.max(0, (n - 1) / 9))
}

/** Provets nivå börjar vid 4 (avancerad, samma gräns som sidkortet). */
export const PROVETS_NIVA = 4

export function mmss(sek: number): string {
  const s = Math.max(0, Math.round(sek))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** "två minuter", "90 sekunder": provets tid per uppgift i ord. */
export function budgetOrd(sek: number): string {
  const s = Math.round(sek)
  if (s >= 60 && s % 60 === 0) {
    const m = s / 60
    return m === 1 ? 'en minut' : `${antalOrd(m)} minuter`
  }
  return `${s} sekunder`
}

export function IkonBock({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M4.5 12.5l5 5L20 6.5" />
    </svg>
  )
}

export function IkonKryssLiten({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IkonPil({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IkonFlaggaProv({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 21V3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8.5 4h12l-3.5 4.5L20.5 13h-12z" fill="var(--koppar)" />
    </svg>
  )
}

export function IkonLas({ size = 16, farg = 'var(--sess-lucka-ink)' }: { size?: number; farg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 10.5V8a4.5 4.5 0 019 0v2.5" fill="none" stroke={farg} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill={farg} />
    </svg>
  )
}

/** Väggens former (skissens cirkel, våg och svävande figurer). Bara dekor. */
export function VaggFormer({ hojd = 900, enkel = false }: { hojd?: number; enkel?: boolean }) {
  return (
    <svg className="res-vagg-former" width="100%" height="100%" viewBox={`0 0 1440 ${hojd}`} preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <circle cx="1260" cy="-40" r="330" fill="var(--sess-res-panel)" />
      <path d={`M0 ${hojd}V${hojd - 140}C240 ${hojd - 200} 520 ${hojd - 100} 820 ${hojd - 170}S1260 ${hojd - 260} 1440 ${hojd - 210}V${hojd}Z`} fill="var(--vagg-3)" opacity=".35" />
      <g className={enkel ? 'hidden' : 'max-lg:hidden'}>
        <rect x="92" y="150" width="34" height="34" rx="7" fill="none" stroke="var(--koppar)" strokeWidth="3" strokeDasharray="6 5" transform="rotate(-12 109 167)" />
        <circle cx="668" cy="118" r="13" fill="none" stroke="var(--vagg-svag)" strokeWidth="3" />
        <path d="M1338 420l16 28h-32z" fill="none" stroke="var(--vagg-svag)" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

/** En bricka per uppgift: rätt koppar med bock, fel mörk med kryss, obesvarad streckad. */
export function Brickremsa({ utfall, tat, aria }: { utfall: BrickUtfall[]; tat?: boolean; aria: string }) {
  const kol = Math.min(10, Math.max(1, utfall.length))
  return (
    <div className="res-remsa" style={{ ['--kol' as string]: kol }} role="img" aria-label={aria} data-tat={tat ? '' : undefined} data-resultat-brickor>
      {utfall.map((u, i) => (
        <span key={i} className="res-br" data-utfall={u}>
          <i style={{ animationDelay: `${200 + i * 35}ms` }}>
            {u === 'ratt' ? <IkonBock size={18} className="res-br-ikon" /> : u === 'fel' ? <IkonKryssLiten size={17} className="res-br-ikon" /> : null}
            {u !== 'ratt' ? <span className="res-br-nr">{i + 1}</span> : null}
          </i>
          <small>{i + 1}</small>
        </span>
      ))}
    </div>
  )
}

/** Brickornas skärmläsartext: "20 uppgifter: 15 rätt, fel på 4, 9 och 13, uppgift 20 obesvarad." */
export function brickAria(utfall: BrickUtfall[]): string {
  const ratt = utfall.filter((u) => u === 'ratt').length
  const fel = utfall.flatMap((u, i) => (u === 'fel' ? [i + 1] : []))
  const obes = utfall.flatMap((u, i) => (u === 'obesvarad' ? [i + 1] : []))
  const lista = (n: number[]) => (n.length > 1 ? `${n.slice(0, -1).join(', ')} och ${n[n.length - 1]}` : String(n[0]))
  let s = `${utfall.length} uppgifter: ${ratt} rätt`
  if (fel.length) s += `, fel på ${lista(fel)}`
  if (obes.length) s += `, ${obes.length === 1 ? 'uppgift' : 'uppgifterna'} ${lista(obes)} obesvarad${obes.length === 1 ? '' : 'e'}`
  return `${s}.`
}

/**
 * Mätaren: grund, avancerad (provets nivå) och expert på skalan 1 till 10.
 * `fore` ritar strecket "förut" och låter fyllningen växa därifrån.
 */
export function NivaMatare({ nu, fore, etikett, kort }: { nu: number; fore?: number | null; etikett?: 'nu' | 'fore'; kort?: boolean }) {
  const a = nivaAndel(nu)
  const f = fore != null ? nivaAndel(fore) : null
  const stil: Record<string, string | number> = { width: `${(a * 100).toFixed(1)}%` }
  if (f != null && a > 0) stil['--fran-skala'] = Math.max(0.05, f / a)
  const uStil: Record<string, string | number> = { left: `${(a * 100).toFixed(1)}%` }
  if (f != null) uStil['--fran-dx'] = `${((f - a) * 100).toFixed(1)}cqw`
  const aria =
    fore != null
      ? `Nivån ${Math.abs(nu - fore) < 0.05 ? 'låg kvar på' : nu > fore ? `steg från ${nivaText(fore)} till` : `gick från ${nivaText(fore)} till`} ${nivaText(nu)} av 10. Provet ligger på avancerad nivå, 4 till 7.`
      : `Din nivå är ${nivaText(nu)} av 10. Provet ligger på avancerad nivå, 4 till 7.`
  return (
    <div className="flex flex-col gap-3" data-resultat-matare>
      <div className="relative h-4" aria-hidden="true">
        {etikett === 'fore' && f != null ? (
          <span className="absolute whitespace-nowrap pr-2 text-xs leading-4 text-vagg-mjuk" style={{ left: `${(f * 100).toFixed(1)}%`, transform: 'translateX(-100%)' }}>
            förut {nivaText(fore!)}
          </span>
        ) : (
          <span className="absolute whitespace-nowrap text-xs font-semibold leading-4 text-vagg-ink" style={{ left: `${(a * 100).toFixed(1)}%`, transform: a < 0.12 ? 'none' : a > 0.88 ? 'translateX(-100%)' : 'translateX(-50%)' }}>
            din nivå {nivaText(nu)}
          </span>
        )}
      </div>
      <div className="res-matare" role="img" aria-label={aria} style={{ containerType: 'inline-size' }}>
        <i />
        <i data-prov="" />
        <i />
        <b style={stil} />
        {f != null ? <s style={{ left: `${(f * 100).toFixed(1)}%` }} /> : null}
        <u style={uStil} />
      </div>
      <div className="res-matare-axel mt-1" aria-hidden="true">
        <span>Grund</span>
        <span data-prov="">{kort ? 'Provets nivå' : 'Avancerad, provets nivå'}</span>
        <span>Expert</span>
      </div>
    </div>
  )
}

/** Tiden per uppgift som staplar mot provets tid (Resultat-test, panelen till höger). */
export function TidStaplar({ tider, utfall, budget }: { tider: (number | null)[]; utfall: BrickUtfall[]; budget: number }) {
  const W = 490
  const H = 230
  const bas = 208
  const n = tider.length
  const max = Math.max(budget * 1.35, ...tider.map((t) => t ?? 0))
  const y = (s: number) => bas - (Math.min(s, max) / max) * (bas - 20)
  const steg = W / n
  const bred = Math.min(16, steg * 0.66)
  const over = tider.flatMap((t, i) => (t != null && t > budget ? [i + 1] : []))
  const aria = over.length
    ? `Tiden per uppgift. ${antalOrd(over.length, true)} ${over.length === 1 ? 'uppgift' : 'uppgifter'} tog längre än provets ${budgetOrd(budget)}: ${over.join(', ')}.`
    : `Tiden per uppgift. Alla inom provets ${budgetOrd(budget)}.`
  const visaNr = (i: number) => n <= 20 || i % 2 === 0 || utfall[i] !== 'ratt'
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={aria} data-resultat-tidstaplar>
        <path d={`M0 ${bas}H${W}`} stroke="var(--vagg-2)" strokeWidth="1.5" />
        {tider.map((t, i) => {
          const cx = steg * i + steg / 2
          const u = utfall[i]
          const nr = (
            <text key={`t${i}`} x={cx} y={225} textAnchor="middle" fontSize="11" fontWeight={u === 'ratt' ? 500 : 700} fill={u === 'fel' ? 'var(--sess-res-fel-ljus)' : u === 'obesvarad' ? 'var(--vagg-ink)' : 'var(--vagg-mjuk)'}>
              {visaNr(i) ? i + 1 : ''}
            </text>
          )
          if (t == null || u === 'obesvarad') {
            const h = t != null ? bas - y(t) : 24
            return (
              <g key={i}>
                <rect x={cx - bred / 2 + 1} y={bas - h} width={bred - 2} height={h} rx={3.5} fill="none" stroke="var(--vagg-svag)" strokeWidth="2" strokeDasharray="3.5 3" />
                {nr}
              </g>
            )
          }
          const h = Math.max(4, bas - y(t))
          return (
            <g key={i}>
              {u === 'fel' ? (
                <rect x={cx - bred / 2 + 1.25} y={bas - h} width={bred - 2.5} height={h} rx={3.5} fill="var(--sess-res-fel)" stroke="var(--sess-res-fel-ljus)" strokeWidth="2.5" />
              ) : (
                <rect className="sess-stapel" x={cx - bred / 2} y={bas - h} width={bred} height={h} rx={4} fill="var(--koppar)" style={{ animationDelay: `${i * 25}ms` }} />
              )}
              {nr}
            </g>
          )
        })}
        <path d={`M0 ${y(budget).toFixed(1)}H${W}`} stroke="var(--vagg-ink)" strokeWidth="1.5" strokeDasharray="4 5" opacity=".8" />
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-[18px] gap-y-1 text-xs leading-4 text-vagg-mjuk" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded" style={{ background: 'var(--koppar)' }} />rätt</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded" style={{ background: 'var(--sess-res-fel)', boxShadow: 'inset 0 0 0 2px var(--sess-res-fel-ljus)' }} />fel</span>
        {utfall.includes('obesvarad') ? <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded border-2 border-dashed" style={{ borderColor: 'var(--vagg-svag)' }} />obesvarad</span> : null}
        <span className="ml-auto inline-flex items-center gap-1.5 text-vagg-ink"><i className="w-[22px] border-t-2 border-dashed opacity-80" style={{ borderColor: 'var(--vagg-ink)' }} />provets tid</span>
      </div>
    </div>
  )
}

/** Talen under tidens staplar: tiden mot provets och hur många som tog längre. */
export function TidTal({ total, budgetTotal, over, antal, budget }: { total: number; budgetTotal: number; over: number; antal: number; budget: number }) {
  const andel = budgetTotal > 0 ? Math.min(1, total / budgetTotal) : 0
  const min = Math.round(budgetTotal / 60)
  return (
    <div className="mt-4 grid grid-cols-2 gap-6 border-t pt-4" style={{ borderColor: 'var(--sess-res-linje)' }} data-resultat-tidtal>
      <div>
        <b className="block font-sess-display text-[26px] font-extrabold leading-[30px] tracking-[-.02em] lg:text-[30px] lg:leading-[34px]">{mmss(total)}</b>
        <span className="text-[13px] leading-[18px] text-vagg-mjuk">av provets {min} {min === 1 ? 'minut' : 'minuter'}</span>
        <div className="mt-2 h-2 overflow-hidden rounded bg-vagg-2" role="img" aria-label={`${mmss(total)} av ${min} minuter`}>
          <div className="h-full rounded" style={{ width: `${(andel * 100).toFixed(1)}%`, background: 'var(--ljus)' }} />
        </div>
      </div>
      <div>
        <b className="block font-sess-display text-[26px] font-extrabold leading-[30px] tracking-[-.02em] lg:text-[30px] lg:leading-[34px]">
          {over} av {antal}
        </b>
        <span className="text-[13px] leading-[18px] text-vagg-mjuk">tog längre än {budgetOrd(budget)}</span>
      </div>
    </div>
  )
}

/** Raden med bitar per mönster i Var du tappade: rätt gröna, fel röda, obesvarade streckade. */
export function Bitar({ utfall, smal }: { utfall: BrickUtfall[]; smal?: boolean }) {
  return (
    <span className="res-bitar" data-smal={smal ? '' : undefined} aria-hidden="true">
      {utfall.map((u, i) => (
        <i key={i} data-utfall={u} />
      ))}
    </span>
  )
}

export function Panel({ titel, hoger, children, className, aria }: { titel: string; hoger?: ReactNode; children: ReactNode; className?: string; aria?: string }) {
  return (
    <section className={`res-panel ${className ?? ''}`} aria-label={aria ?? titel}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="m-0 font-sess-display text-[18px] font-bold leading-6 lg:text-[20px]">{titel}</h2>
        {hoger ? <span className="text-right text-[13px] leading-[18px] text-vagg-mjuk">{hoger}</span> : null}
      </div>
      {children}
    </section>
  )
}
