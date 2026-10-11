/**
 * Dagsraden på väggen (spec-rummen 4.4, konceptets .dagsrad): ringen och
 * ett huvudtal i ett glaskort (beslut-hemvy 2026-10-11 punkt 2, sifferregeln:
 * tal radas aldrig upp). Talet i display 22/24 tabulärt i vagg-ink,
 * etiketten 12/16 i vagg-mjuk. Renderas inte på provdagen (spec 16.2
 * fråga 4). På dator ett kompakt kort till höger om rubriken.
 *
 * Server component.
 */

import type { ReactNode } from 'react'
import TalText from './TalText'

export interface DagsradTal {
  varde: string
  etikett: string
  /** Etiketten under lg, när den skiljer sig (formordet, tillägget punkt 4). */
  etikettMobil?: string
}

export interface DagsradProps {
  /** Dagsring */
  ring: ReactNode
  tal: DagsradTal
  className?: string
}

export default function Dagsrad({ ring, tal, className }: DagsradProps) {
  return (
    <div
      className={`mt-5 flex items-center gap-3 rounded-2xl border border-vagg-kant bg-white/5 px-3 py-2.5 lg:max-w-[300px] lg:gap-4 lg:p-3.5 ${className ?? ''}`}
    >
      {ring}
      <dl className="min-w-0 flex-1">
        <div className="flex flex-col-reverse">
          <dt className="mt-0.5 text-xs leading-4 text-vagg-mjuk">
            {tal.etikettMobil ? (
              <>
                <span className="lg:hidden" data-dagsrad-mobil>{tal.etikettMobil}</span>
                <span className="hidden lg:inline">{tal.etikett}</span>
              </>
            ) : (
              tal.etikett
            )}
          </dt>
          <dd className="text-tal-rad text-vagg-ink">
            <TalText>{tal.varde}</TalText>
          </dd>
        </div>
      </dl>
    </div>
  )
}
