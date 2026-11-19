/**
 * Så ligger du till (utkast v4 avsnitt 2 punkt 6): nivåbandet (liten) per
 * testtyp. Med plan provets delar med etiketten "Ingår i ...", utan plan de
 * mätta typerna. Raden öppnar typens meny i Tester; rubrikens länk går till
 * Din utveckling. Nivån står aldrig som löptext, bara som bandet.
 *
 * Server component.
 */

import Link from 'next/link'
import { LANK } from '@/components/shell/knappar'
import Nivaband from '@/components/tester-v4/Nivaband'
import TypSymbol from '@/components/tester-v4/tester/TypSymbol'
import { IngarChip } from '@/components/tester-v4/tester/TesttypKort'
import { menyHref, UTVECKLING_HREF } from '@/lib/tester/v4/rutter'
import type { PlanV4, TesttypKort } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'

/** Typerna som står i Så ligger du till. Ren, testas. */
export function typerAttVisa(typer: TesttypKort[], plan: PlanV4 | null): TesttypKort[] {
  const synliga = typer.filter((t) => t.synlig)
  return plan ? synliga.filter((t) => t.ingarIPlan) : synliga.filter((t) => t.niva.status !== 'omatt')
}

export default function SaLiggerDuTill({ typer, plan }: { typer: TesttypKort[]; plan: PlanV4 | null }) {
  const visa = typerAttVisa(typer, plan)
  if (!visa.length) return null
  return (
    <section aria-labelledby="sa-ligger" className="rounded-2xl border border-kant bg-papper px-4 pb-2 pt-3.5" data-sa-ligger>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="sa-ligger" className="text-ey text-ink-3">
          {HEM_V4.saLigger}
        </h2>
        <Link href={UTVECKLING_HREF} className={`${LANK} -my-2.5 inline-flex min-h-11 items-center text-[13px]`}>
          {HEM_V4.utveckling}
        </Link>
      </div>
      <ul className="mt-1 list-none p-0">
        {visa.map((t) => (
          <li key={t.id}>
            <Link href={menyHref(t.id)} className="flex min-h-[56px] items-center gap-3 rounded-xl py-1.5" data-typ={t.id}>
              <TypSymbol typ={t.id} size={36} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold leading-5 text-ink-1">{t.namn}</span>
                  {plan && t.ingarIPlan ? (
                    <IngarChip namn={plan.namn} />
                  ) : null}
                </span>
                <span className="mt-0.5 block max-w-[320px]">
                  <Nivaband namn={t.namn} lage={t.niva} storlek="liten" ton={!plan || t.ingarIPlan ? 'koppar' : 'neutral'} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
