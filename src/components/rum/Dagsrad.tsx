/**
 * Dagsraden på väggen (spec-rummen 4.4, konceptets .dagsrad): ringen och
 * tre tal i ett glaskort. Talen i display 22/24 tabulärt i vagg-ink,
 * etiketterna 12/16 i vagg-mjuk. Renderas inte på provdagen (spec 16.2
 * fråga 4).
 *
 * Server component.
 */

import type { ReactNode } from 'react'
import TalText from './TalText'

export interface DagsradTal {
  varde: string
  etikett: string
}

export interface DagsradProps {
  /** Dagsring */
  ring: ReactNode
  tal: [DagsradTal, DagsradTal, DagsradTal]
  className?: string
}

export default function Dagsrad({ ring, tal, className }: DagsradProps) {
  return (
    <div
      className={`mt-5 flex items-center gap-4 rounded-2xl border border-vagg-kant bg-white/5 p-3.5 ${className ?? ''}`}
    >
      {ring}
      <dl className="grid min-w-0 flex-1 grid-cols-3 gap-2">
        {tal.map((t) => (
          <div key={t.etikett} className="flex flex-col-reverse">
            <dt className="mt-0.5 text-xs leading-4 text-vagg-mjuk">{t.etikett}</dt>
            <dd className="text-tal-rad text-vagg-ink">
              <TalText>{t.varde}</TalText>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
