'use client'

/**
 * Fler steg (utkast v4 avsnitt 2 punkt 4): hint två till fyra som rader.
 * Raden är länken: rubriken (handlingen), skälet som meta, och till höger
 * knappens ord eller låschippet. Samma mål som Nästa steg (hintHref).
 */

import Link from 'next/link'
import Chip from '@/components/rum/Chip'
import type { Hint } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'
import { hintHref } from './NastaSteg'
import { hintKlickad, type HintKontext } from './HintSparning'

export default function FlerSteg({ hintar, kontext }: { hintar: Hint[]; kontext: HintKontext }) {
  if (!hintar.length) return null
  return (
    <section aria-labelledby="fler-steg" className="rounded-2xl border border-kant bg-papper px-4 pb-1 pt-3.5" data-fler-steg>
      <h2 id="fler-steg" className="flex items-baseline gap-2 text-ey text-ink-3">
        {HEM_V4.flerSteg}
        <span className="text-meta normal-case tracking-normal">{HEM_V4.flerStegRad}</span>
      </h2>
      <ul className="mt-1 list-none p-0">
        {hintar.map((h, i) => (
          <li key={h.id} className={i > 0 ? 'border-t border-kant' : undefined}>
            <Link
              href={hintHref(h)}
              onClick={() => hintKlickad(h, kontext, i + 1)}
              className="flex min-h-[60px] items-center gap-3 py-2.5"
              data-hint={h.typ}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-5 text-ink-1">{h.rubrik}</span>
                <span className="mt-0.5 block text-meta text-ink-3">{h.skal}</span>
              </span>
              {h.knapp.las ? (
                <Chip las className="shrink-0">
                  {HEM_V4.las}
                </Chip>
              ) : (
                <span className="shrink-0 whitespace-nowrap text-[13px] font-medium text-ink-2 underline decoration-kant-stark underline-offset-4">
                  {h.knapp.etikett}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
