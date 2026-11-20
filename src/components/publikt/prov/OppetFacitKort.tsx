'use client'

/**
 * Det enda öppna facit före kontot (omgång 3, beslut A): kortet med
 * uppgiftens nummer, "Hela facit, utan konto", märket Öppet facit och
 * utfallet, typens uppgift ritad med facit och domen (Forklaringen) under,
 * samma komponenter som genomgången efter kontot. Inga rubrikelement: kortet
 * står också i artiklarnas provruta.
 *
 * facit_viewed skjuts av den som ritar kortet (onSynlig), en gång när kortet
 * kommer i bild.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import Forklaringen from '@/components/session/Forklaringen'
import Marke from '@/components/session/Marke'
import { RubrikTaggProvider } from '@/components/tests/RubrikTagg'
import { forklaringInnehall } from '@/components/session/typ'
import type { ListPost } from '@/components/session/Uppgiftslistan'
import type { ProvU } from './provPost'
import { PROV3 } from './prov-copy'

function OppetLas() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7" />
    </svg>
  )
}

export default function OppetFacitKort({
  post,
  nr,
  antal,
  titel,
  under = PROV3.kortUnder,
  piller = PROV3.oppetPiller,
  onSynlig,
}: {
  post: ListPost<ProvU>
  nr: number
  antal: number
  /** Kortets rad: "Uppgift 2" eller "Uppgift 2, din första miss". */
  titel?: string
  under?: string
  piller?: string
  onSynlig?: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const synlig = useRef(onSynlig)
  synlig.current = onSynlig

  useEffect(() => {
    const el = ref.current
    if (!el || !synlig.current) return
    if (typeof IntersectionObserver === 'undefined') {
      synlig.current?.()
      return
    }
    const io = new IntersectionObserver(
      (poster) => {
        if (poster.some((p) => p.isIntersecting)) {
          synlig.current?.()
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const ritare = post.ritare
  if (!ritare) return null
  const Uppgift = ritare.Uppgift
  const UL = ritare.underlag
  const ratt = post.facit.correct
  const utfall = post.valt == null ? 'obesvarad' : ratt ? 'ratt' : 'fel'
  const forklaringen: ReactNode = (
    <Forklaringen
      utfall={utfall}
      regel={post.facit.regel}
      text={post.facit.text}
      misstag={post.facit.misstag}
      innehall={forklaringInnehall(ritare, post.u, post.facit, post.valt, 'lista')}
    />
  )
  return (
    <div ref={ref} className="prov3-oppen" data-oppet-facit={nr} data-utfall={ratt ? 'ratt' : 'fel'}>
      <div className="prov3-oppen-huvud">
        <span className="res-nr" data-utfall={ratt ? 'ratt' : 'fel'}>
          {nr}
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] font-semibold leading-5 text-ink-1">{titel ?? PROV3.kortUppgift(nr)}</b>
          <span className="block text-[13px] leading-[18px] text-ink-2">{under}</span>
        </span>
        <span className="prov3-piller max-sm:!hidden" data-oppet-piller>
          <OppetLas />
          {piller}
        </span>
        <span className="prov3-utfall" data-utfall={ratt ? 'ratt' : 'fel'}>
          <Marke typ={ratt ? 'ratt' : 'fel'} storlek={22} fylld />
          {ratt ? PROV3.ratt : PROV3.fel}
        </span>
      </div>
      <div className="prov3-oppen-kropp">
        <RubrikTaggProvider value="p">
          {UL ? (
            <div className="mb-3">
              <UL.Ritare u={post.u} genomgang facitData={post.facit.data} />
            </div>
          ) : null}
          <Uppgift
            u={post.u}
            nr={nr}
            antal={antal}
            vald={post.valt}
            facit={post.facit.ratt >= 0 ? post.facit.ratt : null}
            facitData={post.facit.data}
            efterFel={false}
            last
            kompakt
            forklaring={ritare.forklaringIUppgift ? forklaringen : undefined}
          />
          {ritare.forklaringIUppgift ? null : <div className="mt-4">{forklaringen}</div>}
        </RubrikTaggProvider>
      </div>
    </div>
  )
}
