/**
 * Fortsätt där du slutade (utkast v4 avsnitt 2 punkt 7): det senaste testet
 * med resultat ("Träna, figurer och mönster" och "7 av 10 rätt, i går").
 * Raden öppnar typens meny i Tester, där Träna och resten står.
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

export default function FortsattDarDuSlutade({ fortsatt, idag }: { fortsatt: Fortsatt | null; idag: Dag }) {
  if (!fortsatt) return null
  return (
    <section aria-labelledby="fortsatt" className="rounded-2xl border border-kant bg-papper px-4 pb-1 pt-3.5" data-fortsatt>
      <h2 id="fortsatt" className="text-ey text-ink-3">
        {HEM_V4.fortsatt}
      </h2>
      <Link href={menyHref(fortsatt.punkt.typ)} className="flex min-h-[60px] items-center gap-3 py-2">
        <TypSymbol typ={fortsatt.punkt.typ} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-5 text-ink-1">{fortsatt.rubrik}</span>
          <span className="mt-0.5 block text-meta text-ink-3">{fortsattMeta(fortsatt, idag)}</span>
        </span>
        <IkonChev size={20} className="shrink-0 text-ink-3" />
      </Link>
    </section>
  )
}
