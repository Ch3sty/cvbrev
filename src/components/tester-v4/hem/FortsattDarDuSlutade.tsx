/**
 * Fortsätt där du slutade (skissen Hem A, utkast v4 avsnitt 2 punkt 7): det
 * senaste testet med resultatet som ring ("6/6 rätt"), rubriken ("Träna,
 * ordförråd") och när. Raden öppnar typens meny i Tester, där Träna och
 * resten står. Utan resultat står bara symbolen.
 *
 * Server component.
 */

import Link from 'next/link'
import { IkonChev } from '@/components/illustrations/RumSymboler'
import TypSymbol from '@/components/tester-v4/tester/TypSymbol'
import { dagarMellan } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { menyHref } from '@/lib/tester/v4/rutter'
import type { Dag, Fortsatt } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'

/** "i dag", "i går" eller "17 nov". */
export function narText(dag: Dag, idag: Dag): string {
  const n = dagarMellan(dag, idag)
  if (n <= 0) return 'i dag'
  if (n === 1) return 'i går'
  return kortDatum(dag)
}

/** "7 av 10 rätt, i går". Ren, testas. */
export function fortsattMeta(f: Fortsatt, idag: Dag): string {
  const r = f.punkt.resultat
  const nar = narText(f.punkt.dag, idag)
  return r ? `${r.ratt} av ${r.antal} rätt, ${nar}` : `${nar.charAt(0).toUpperCase()}${nar.slice(1)}`
}

function ResultatRing({ ratt, antal }: { ratt: number; antal: number }) {
  const r = 26
  const omkrets = 2 * Math.PI * r
  const del = antal > 0 ? Math.max(0, Math.min(1, ratt / antal)) : 0
  const farg = del >= 0.8 ? 'var(--positiv)' : 'var(--ton-ink)'
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={`${ratt} av ${antal} rätt`} className="h-14 w-14 shrink-0 xl:h-16 xl:w-16">
      <circle cx="32" cy="32" r={r} fill="none" style={{ stroke: 'var(--kant)' }} strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        style={{ stroke: farg }}
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
        strokeDasharray={`${(del * omkrets).toFixed(1)} ${omkrets.toFixed(1)}`}
      />
      <text x="32" y="30" textAnchor="middle" className="font-display" style={{ fontSize: 17, fontWeight: 800, fill: 'var(--ink-1)' }}>
        {ratt}/{antal}
      </text>
      <text x="32" y="43" textAnchor="middle" style={{ fontSize: 9.5, fontWeight: 600, fill: 'var(--ink-3)' }}>
        rätt
      </text>
    </svg>
  )
}

export default function FortsattDarDuSlutade({ fortsatt, idag }: { fortsatt: Fortsatt | null; idag: Dag }) {
  if (!fortsatt) return null
  const r = fortsatt.punkt.resultat
  const nar = narText(fortsatt.punkt.dag, idag)
  return (
    <section aria-labelledby="fortsatt" className="grid content-start gap-2.5 rounded-2xl border border-kant bg-papper px-4 py-3.5 sm:px-5 sm:py-4 xl:gap-3" data-fortsatt>
      <h2 id="fortsatt" className="text-ey text-ink-3">
        {HEM_V4.fortsatt}
      </h2>
      <Link href={menyHref(fortsatt.punkt.typ)} className="flex min-h-[60px] items-center gap-3 xl:gap-3.5">
        {r ? <ResultatRing ratt={r.ratt} antal={r.antal} /> : <TypSymbol typ={fortsatt.punkt.typ} size={40} />}
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="flex items-center gap-2">
            {r ? <TypSymbol typ={fortsatt.punkt.typ} size={22} /> : null}
            <b className="text-[15px] font-semibold leading-5 text-ink-1">{fortsatt.rubrik}</b>
          </span>
          <span className="text-[12.5px] leading-[17px] text-ink-3 sm:text-meta">{r ? `${nar.charAt(0).toUpperCase()}${nar.slice(1)}.` : fortsattMeta(fortsatt, idag)}</span>
        </span>
        <IkonChev size={20} className="shrink-0 text-ink-3" />
      </Link>
    </section>
  )
}
