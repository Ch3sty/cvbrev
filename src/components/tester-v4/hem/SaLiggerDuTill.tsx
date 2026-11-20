/**
 * Så ligger du till (skissen Hem A, i ingångskortet Din utveckling):
 * nivåbandet per testtyp. Med plan provets delar först med etiketten för
 * provet, sedan övriga mätta typer nedtonade; utan plan de mätta typerna.
 * Raden öppnar typen i Din utveckling. Nivån står aldrig som löptext, bara
 * som bandet.
 *
 * Server component.
 */

import Link from 'next/link'
import Nivaband from '@/components/tester-v4/Nivaband'
import { utvecklingHref } from '@/lib/tester/v4/rutter'
import type { PlanV4, TesttypKort } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'
import { saLiggerTyper } from './hemData'

export default function SaLiggerDuTill({ typer, plan }: { typer: TesttypKort[]; plan: PlanV4 | null }) {
  const visa = saLiggerTyper(typer, plan)
  if (!visa.length) return null
  return (
    <div className="grid gap-1.5 border-t border-kant pt-3 sm:gap-1" data-sa-ligger>
      <h3 className="text-ey text-ink-3">{HEM_V4.ingangUtv.saLigger}</h3>
      <ul className="list-none p-0">
        {visa.map((t) => {
          const iPlan = !!plan && t.ingarIPlan
          return (
            <li key={t.id}>
              <Link
                href={utvecklingHref(t.id)}
                className="grid min-h-11 gap-1 py-1 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-3"
                data-typ={t.id}
              >
                <span className={`text-[13px] font-semibold leading-[17px] ${iPlan || !plan ? 'text-ink-1' : 'text-ink-2'}`}>
                  {t.namn}
                  {iPlan && plan ? (
                    <span className="ml-1.5 inline-flex h-[18px] items-center rounded-[5px] bg-koppar-mjuk px-1.5 align-[2px] text-[10.5px] font-semibold text-koppar-ink">
                      {plan.namn}
                    </span>
                  ) : null}
                </span>
                <span className="block max-w-[300px]">
                  <Nivaband namn={t.namn} typ={t.id} lage={t.niva} storlek="liten" ton={!plan || t.ingarIPlan ? 'koppar' : 'neutral'} />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
