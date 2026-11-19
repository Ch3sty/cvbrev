'use client'

/**
 * Plankortet utan plan (utkast v4 avsnitt 2 punkt 8): "Vet du vilket test du
 * ska göra?". Ja öppnar väljaren Plan inför provet; "Inte än" fäller ihop
 * kortet till en rad, och valet sparas i localStorage (inom try/catch, så
 * kortet står öppet om lagringen saknas). Planen föreslår, låser inte: de
 * flesta vet inte, och då är bredden rätt.
 */

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { KNAPP_SEKUNDAR_SMAL, LANK } from '@/components/shell/knappar'
import { PLAN_HREF } from '@/lib/tester/v4/rutter'
import { HEM_V4 } from './copy'

const NYCKEL = 'v4_plankort_ihop'
const lyssnare = new Set<() => void>()
let minne = false

function las(): boolean {
  try {
    return window.localStorage.getItem(NYCKEL) === '1' || minne
  } catch {
    return minne
  }
}

export default function PlanKort() {
  const ihop = useSyncExternalStore(
    (fn) => {
      lyssnare.add(fn)
      return () => lyssnare.delete(fn)
    },
    las,
    () => false
  )
  const fallIhop = () => {
    minne = true
    try {
      window.localStorage.setItem(NYCKEL, '1')
    } catch {
      /* lagringen saknas */
    }
    lyssnare.forEach((fn) => fn())
  }
  const P = HEM_V4.plankort

  if (ihop) {
    return (
      <section aria-label={P.hopfalldTitel} className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-kant bg-papper px-4 py-2" data-plankort="ihop">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-5 text-ink-1">{P.hopfalldTitel}</span>
          <span className="mt-0.5 block text-meta text-ink-3">{P.hopfalldText}</span>
        </span>
        <Link href={PLAN_HREF} className={`${LANK} inline-flex min-h-11 items-center text-[13px]`}>
          {P.valj}
        </Link>
      </section>
    )
  }

  return (
    <section aria-labelledby="plankort" className="rounded-2xl border border-kant bg-papper p-4" data-plankort="oppen">
      <p className="text-ey text-ink-3">{P.eyebrow}</p>
      <h2 id="plankort" className="mt-1 font-display text-[19px] font-bold leading-6 tracking-[-.02em] text-ink-1">
        {P.titel}
      </h2>
      <p className="mt-1 text-sm leading-[21px] text-ink-2">{P.text}</p>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href={PLAN_HREF} className={KNAPP_SEKUNDAR_SMAL}>
          {P.ja}
        </Link>
        <button type="button" onClick={fallIhop} className={`${LANK} inline-flex min-h-11 items-center`}>
          {P.inteAn}
        </button>
      </div>
    </section>
  )
}
