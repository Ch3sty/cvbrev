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
import { BOKSTAV } from '@/components/session/Svarskort'
import { SESSION } from '@/components/session/copy'
import { FigurV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'
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

/**
 * Domen som tvåspaltsruta (skissen Publik-prov-resultat-1440): huvudet med
 * utfallet och raden "Du valde B. Rätt svar är A.", sedan Regeln och Ditt
 * misstag bredvid varandra på dator, under varandra på telefon. Bara när
 * både regel och misstag finns. Matrisen får raden "Du valde / Rätt" av
 * hennes valda figur och den rätta (alternativen i uppgiften); regelns
 * bildrad finns inte i banken och ritas inte. Samma tonade yta som
 * Forklaringen (sess-dom), inga rubrikelement.
 */
function DomTva({ post }: { post: ListPost<ProvU> }) {
  const ritare = post.ritare!
  const ratt = post.facit.correct
  const utfall = ratt ? 'ratt' : 'fel'
  const C = SESSION.forklaring
  const etikett = (i: number) => (ritare.svarEtikett ? ritare.svarEtikett(post.u, i) : BOKSTAV(i))
  const huvudRad =
    post.valt == null
      ? null
      : ratt
        ? PROV3.dom.duValdeRatt(etikett(post.valt))
        : post.facit.ratt >= 0
          ? PROV3.dom.duValde(etikett(post.valt), etikett(post.facit.ratt))
          : null
  const options = (post.u as { options?: LayeredCell[] }).options
  const figurer =
    ritare.kind === 'matris' && Array.isArray(options) && post.valt != null && post.facit.ratt >= 0 && !ratt
      ? { valt: options[post.valt], ratt: options[post.facit.ratt] }
      : null
  const innehall = forklaringInnehall(ritare, post.u, post.facit, post.valt, 'lista')
  return (
    <section role="status" className="sess-dom prov3-dom" data-forklaringen={utfall} data-dom={utfall} data-dom-tva>
      <p className="flex items-center gap-3">
        <Marke typ={utfall} storlek={40} fylld className="h-9 w-9 lg:h-10 lg:w-10" />
        <span className="min-w-0 flex-1 font-sess-display text-[20px] font-extrabold leading-6 tracking-[-.01em] lg:text-[22px] lg:leading-[26px]">{ratt ? C.ratt : C.fel}</span>
        {huvudRad ? (
          <span className="sess-dom-ton hidden flex-shrink-0 text-[13px] font-semibold leading-4 sm:inline" data-dom-valde>
            {huvudRad}
          </span>
        ) : null}
      </p>
      {huvudRad ? <p className="sess-dom-ton mt-1 text-[13px] font-semibold leading-4 sm:hidden">{huvudRad}</p> : null}
      <div className="prov3-dom-kolumner">
        <div>
          <p className="prov3-dom-ey">{PROV3.dom.regeln}</p>
          <p className="mt-1 text-[15px] font-semibold leading-[22px]" data-regel>
            {post.facit.regel}
          </p>
        </div>
        <div>
          <p className="prov3-dom-ey">{C.misstag}</p>
          <p className="mt-1 text-[15px] font-semibold leading-[22px]" data-misstag>
            {post.facit.misstag}
          </p>
          {figurer?.valt && figurer.ratt ? (
            <div className="prov3-dom-figurer" aria-hidden="true">
              <span className="prov3-dom-fig" data-fig="valt">
                <i className="matrisyta">
                  <FigurV7 cell={figurer.valt} />
                </i>
                <b>{PROV3.dom.duValdeKort}</b>
              </span>
              <span className="text-ink-3">→</span>
              <span className="prov3-dom-fig" data-fig="ratt">
                <i className="matrisyta">
                  <FigurV7 cell={figurer.ratt} />
                </i>
                <b>{PROV3.dom.rattKort}</b>
              </span>
            </div>
          ) : null}
        </div>
      </div>
      {innehall ? <div className="mt-3">{innehall}</div> : null}
    </section>
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
  const tva = !ritare.forklaringIUppgift && Boolean(post.facit.regel && post.facit.misstag)
  const forklaringen: ReactNode = tva ? (
    <DomTva post={post} />
  ) : (
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
