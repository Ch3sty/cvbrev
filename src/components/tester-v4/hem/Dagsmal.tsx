/**
 * Dagsmålet (utkast v4 avsnitt 2 punkt 3 och 8): "Dagsmål 1 av 2 · 4 dagar
 * i rad", Ändra. Frivilligt: utan mål står bara dagarna i rad och länken
 * Välj. Dagar i rad räknar dagar med slutfört test och pausar tyst; vi
 * räknar aldrig missar. Ändra öppnar väljaren Plan inför provet på steget
 * med datum och dagsmål.
 *
 * Server component.
 */

import Link from 'next/link'
import { LANK } from '@/components/shell/knappar'
import { PROVDATUM_HREF } from '@/lib/tester/v4/rutter'
import type { DagsmalLage } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'

export default function Dagsmal({ lage }: { lage: DagsmalLage }) {
  const { mal, gjortIdag, dagarIRad } = lage
  if (!mal && dagarIRad === 0) return null
  return (
    <section
      aria-label={mal ? HEM_V4.dagsmalAria(gjortIdag, mal, dagarIRad) : HEM_V4.iRad(dagarIRad)}
      className="flex min-h-[52px] flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-kant bg-papper px-4 py-2 text-meta text-ink-3"
      data-dagsmal
    >
      {mal ? (
        <span aria-hidden="true" className="flex gap-1.5">
          {Array.from({ length: mal }, (_, i) => (
            <i
              key={i}
              className={`block h-3 w-3 rounded-full border-2 ${i < gjortIdag ? 'border-koppar bg-koppar' : 'border-kant-stark'}`}
            />
          ))}
        </span>
      ) : null}
      <span aria-hidden="true">
        {mal ? (
          <>
            {HEM_V4.dagsmal} <b className="font-semibold text-ink-1">{HEM_V4.dagsmalAv(gjortIdag, mal)}</b>
            {dagarIRad > 0 ? (
              <>
                {' · '}
                <b className="font-semibold text-ink-1">{HEM_V4.iRad(dagarIRad)}</b>
              </>
            ) : null}
          </>
        ) : (
          <>
            <b className="font-semibold text-ink-1">{HEM_V4.iRad(dagarIRad)}</b>
            {' · '}
            {HEM_V4.ingetDagsmal}
          </>
        )}
      </span>
      <Link href={PROVDATUM_HREF} aria-label={mal ? `${HEM_V4.andra} ${HEM_V4.dagsmal.toLowerCase()}` : `${HEM_V4.valjDagsmal} ${HEM_V4.dagsmal.toLowerCase()}`} className={`${LANK} ml-auto inline-flex min-h-11 items-center text-[13px]`}>
        {mal ? HEM_V4.andra : HEM_V4.valjDagsmal}
      </Link>
    </section>
  )
}
