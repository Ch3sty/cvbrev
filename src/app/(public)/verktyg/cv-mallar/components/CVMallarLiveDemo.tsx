'use client'

/**
 * Mallväljaren i heron på /verktyg/cv-mallar: fyra mallar ur registret, en
 * från varje stil plus en betald. Besökaren klickar sig mellan dem och ser
 * registrets förhandsvisning. Ingen animering, ingen automatisk rotation.
 */

import { useState } from 'react'
import Image from 'next/image'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

const DEMO_TEMPLATE_IDS = ['norrsken', 'aurora', 'atlas', 'galleri']

const DEMO_TEMPLATES = DEMO_TEMPLATE_IDS.map((id) => SIMPLE_TEMPLATES.find((t) => t.id === id)).filter(
  (t): t is NonNullable<typeof t> => t !== undefined
)

export default function CVMallarLiveDemo() {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = DEMO_TEMPLATES[activeIdx]
  if (!active) return null

  return (
    <div className="w-full rounded-xl border border-kant bg-panel p-4 sm:p-6">
      <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">Välj din mall</p>

      <div role="radiogroup" aria-label="Välj mall att förhandsvisa" className="mt-3 grid grid-cols-2 gap-2">
        {DEMO_TEMPLATES.map((tpl, idx) => {
          const on = idx === activeIdx
          return (
            <button
              key={tpl.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setActiveIdx(idx)}
              className={`min-h-11 truncate rounded-md border px-3 text-left text-sm text-ink-1 transition-colors ${
                on ? 'border-ink-1 font-medium shadow-val' : 'border-kant hover:border-kant-stark'
              }`}
            >
              {tpl.name}
            </button>
          )
        })}
      </div>

      {/* Dokumentet är papper: vit bakgrund är designsystemets undantag för
          mallförhandsvisning (§10). */}
      <div className="relative mt-4 aspect-[5/7] overflow-hidden rounded-lg border border-kant bg-white">
        <Image
          key={active.id}
          src={active.imagePath}
          alt={`Mallen ${active.name}`}
          width={300}
          height={420}
          className="h-full w-full object-contain p-4"
          priority={activeIdx === 0}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink-1">
          {active.name}
          <span className="ml-2 font-normal text-ink-3">
            {active.tier === 'premium' ? `ingår i ${PLAN_BY_KEY.cv_week.name}` : 'gratis'}
          </span>
        </p>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{active.description}</p>
      </div>
    </div>
  )
}
