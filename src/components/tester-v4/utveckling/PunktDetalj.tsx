/**
 * Detaljen under grafen (skissens punktDetalj): datum, slag, typ, resultat,
 * uppgifter och tempo, med knappen Öppna. Nivån och provets resultat står
 * som tal, resten som metarad (data som bild, inte löptext). Står i en
 * aria-live-yta i UtvecklingVy, så valet läses upp.
 *
 * Utan klientkod: ritas inuti klientvyn men har inga egna hooks.
 */

import Link from 'next/link'
import type { TestTypId, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { menyHref } from '@/lib/tester/v4/rutter'
import { KNAPP_SEKUNDAR_LAG } from '@/components/shell/knappar'
import TypSymbol from '../tester/TypSymbol'
import { nivaText } from './geometri'
import { UTV, kort, slagEtikett } from './copy'

export function detaljMeta(p: UtvecklingsPunkt, namn: string): string {
  const delar: string[] = [namn]
  if (p.provNamn) delar.push(p.provNamn)
  if (p.resultat && p.slag !== 'ovningsprov') delar.push(`${UTV.detalj.ratt(p.resultat.ratt, p.resultat.antal)} ${UTV.detalj.rattOrd}`)
  else if (p.resultat) delar.push(UTV.detalj.uppgifter(p.resultat.antal))
  if (p.overTid != null && p.resultat) {
    const n = Math.round(p.overTid * p.resultat.antal)
    delar.push(n > 0 ? UTV.detalj.overTid(n) : UTV.detalj.inomTid)
  }
  if (!p.raknas) delar.push(UTV.detalj.raknasInte)
  return delar.join(' · ')
}

/** Huvudtalet: nivån, provets resultat, eller inget. */
export function huvudtal(p: UtvecklingsPunkt): { tal: string; under: string } | null {
  if (p.slag === 'ovningsprov') return p.resultat ? { tal: UTV.detalj.ratt(p.resultat.ratt, p.resultat.antal), under: UTV.detalj.rattOrd } : null
  if (p.niva != null) return { tal: nivaText(p.niva), under: UTV.detalj.nivaEtikett }
  if (p.resultat) return { tal: UTV.detalj.ratt(p.resultat.ratt, p.resultat.antal), under: UTV.detalj.rattOrd }
  return null
}

export default function PunktDetalj({ punkt, namn }: { punkt: UtvecklingsPunkt | null; namn: Record<TestTypId, string> }) {
  if (!punkt) return <p className="text-meta text-ink-3">{UTV.graf.valjPunkt}</p>
  const tal = huvudtal(punkt)
  const href = punkt.href ?? menyHref(punkt.typ)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-papper-2 px-3 py-2.5" data-detalj={punkt.id}>
      <TypSymbol typ={punkt.typ} size={36} />
      <div className="min-w-0 flex-1 basis-[180px]">
        <p className="text-sm font-semibold leading-5 text-ink-1">
          {kort(punkt.dag)} · {slagEtikett(punkt)}
        </p>
        <p className="text-meta text-ink-3">{detaljMeta(punkt, namn[punkt.typ])}</p>
      </div>
      {tal ? (
        <p className="flex flex-col items-end leading-none">
          <span className="font-display text-[22px] font-bold tabular-nums tracking-[-.02em] text-ink-1">{tal.tal}</span>
          <span className="mt-1 text-xs text-ink-3">{tal.under}</span>
        </p>
      ) : null}
      <Link href={href} className={`${KNAPP_SEKUNDAR_LAG} shrink-0`} data-oppna>
        {punkt.href ? UTV.detalj.oppna : UTV.detalj.oppnaTyp}
      </Link>
    </div>
  )
}
