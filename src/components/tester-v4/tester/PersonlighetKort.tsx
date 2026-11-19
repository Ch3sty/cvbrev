/**
 * Personlighet sist i rutnätet: inga rätta svar, ingen nivå, därför inget
 * nivåband och ingen meny. Kortet går direkt till profilen.
 */

import Link from 'next/link'
import TypSymbol from './TypSymbol'
import { KNAPP_LITEN, KORT_KLASS, KORT_VANLIG } from './TesttypKort'
import { TESTER } from './copy'

export default function PersonlighetKort({ gjord, href }: { gjord: boolean; href: string }) {
  return (
    <div className={`${KORT_KLASS} ${KORT_VANLIG}`} data-testtyp="personlighet">
      <span className="flex min-w-0 items-center gap-3">
        <TypSymbol typ="personlighet" size={44} />
        <b className="font-display text-base font-bold leading-5 tracking-[-.01em]">{TESTER.personlighet.namn}</b>
      </span>
      <span className="text-meta text-ink-3">{TESTER.personlighet.text}</span>
      <Link href={href} className={`${KNAPP_LITEN} justify-self-start`}>
        {gjord ? TESTER.personlighet.knappGjord : TESTER.personlighet.knapp}
      </Link>
    </div>
  )
}
