/**
 * Senaste resultat i typens meny: tre senaste nivåkoller och två senaste
 * övningsprov, och länken till hela historiken i Din utveckling (grafen
 * filtrerad på typen). Resultaten står i en tabell, aldrig i löptext.
 */

import Link from 'next/link'
import { kortDatum } from '@/lib/traning/rubrik'
import { utvecklingHref } from '@/lib/tester/v4/rutter'
import type { TestTypId, TypMeny, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { LANK } from '@/components/shell/knappar'
import { TESTER, nivaText, rattAv } from './copy'

function varde(p: UtvecklingsPunkt): string {
  if (p.slag === 'ovningsprov') return p.resultat ? rattAv(p.resultat) : ''
  return p.niva != null ? nivaText(p.niva) : p.resultat ? rattAv(p.resultat) : ''
}

export default function SenasteResultat({ typ, senaste }: { typ: TestTypId; senaste: TypMeny['senaste'] }) {
  const rader = [...senaste.nivakoller.slice(-3), ...senaste.prov.slice(-2)]
  if (!rader.length) return null
  return (
    <section aria-label={TESTER.meny.senaste} className="grid gap-1.5" data-senaste>
      <h3 className="mx-0.5 text-ey text-ink-3">{TESTER.meny.senaste}</h3>
      <div className="grid">
        {rader.map((p) => {
          const inre = (
            <>
              <span>{kortDatum(p.dag)}</span>
              <span>{p.slag === 'ovningsprov' ? TESTER.meny.ovningsprov : p.kalla === 'nivatest' ? TESTER.meny.nivatest : TESTER.meny.nivakoll}</span>
              <b className="text-right font-semibold text-ink-1">{varde(p)}</b>
            </>
          )
          const klass =
            'grid min-h-9 grid-cols-[64px_1fr_auto] items-center gap-2.5 border-t border-kant py-[7px] text-[13px] leading-[18px] text-ink-3 tabular-nums'
          return p.href ? (
            <Link key={p.id} href={p.href} className={`${klass} hover:bg-papper-2`}>
              {inre}
            </Link>
          ) : (
            <div key={p.id} className={klass}>
              {inre}
            </div>
          )
        })}
      </div>
      <Link href={utvecklingHref(typ)} className={`${LANK} inline-flex min-h-11 items-center justify-self-start`}>
        {TESTER.meny.historik}
      </Link>
    </section>
  )
}
