/**
 * Mät dig i typens meny: Nivåkollen (typens omfång, "Nio uppgifter, cirka sju
 * minuter. Högst en om dagen räknas.", senaste datum och nivå som chip, "Gratis en
 * gång" eller "Igen med Premium" för gratis) och övningsproven i provets
 * format där de finns.
 */

import { kortDatum } from '@/lib/traning/rubrik'
import type { TestTypId, TypMeny, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import MenyRad, { MenyChip } from './MenyRad'
import { TESTER, nivaText } from './copy'


export default function MatDigRader({
  typ,
  nivakoll,
  ovningsprov,
  senasteProv,
}: {
  typ: TestTypId
  nivakoll: TypMeny['nivakoll']
  ovningsprov: TypMeny['ovningsprov']
  senasteProv: UtvecklingsPunkt | null
}) {
  const nk = nivakoll.senaste
  return (
    <section aria-label={TESTER.meny.matDig} className="grid gap-2">
      <h3 className="mx-0.5 text-ey text-ink-3">{TESTER.meny.matDig}</h3>
      <div className="overflow-hidden rounded-2xl border border-kant bg-papper">
        <MenyRad
          h={nivakoll}
          rubrik={TESTER.meny.nivakollRubrik}
          text={TESTER.meny.nivakollText(typ)}
          hoger={
            nivakoll.las ? undefined : nk ? (
              <MenyChip ton="gjord">{`${kortDatum(nk.dag)} · ${nivaText(nk.niva)}`}</MenyChip>
            ) : undefined
          }
        />
        {ovningsprov.map((o, i) => (
          <MenyRad
            key={o.href || o.rubrik}
            h={o}
            rubrik={o.rubrik}
            text={o.text}
            hoger={
              !o.las && i === 0 && senasteProv ? <MenyChip ton="gjord">{kortDatum(senasteProv.dag)}</MenyChip> : undefined
            }
          />
        ))}
      </div>
    </section>
  )
}
