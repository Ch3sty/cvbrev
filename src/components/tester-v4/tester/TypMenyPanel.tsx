'use client'

/**
 * Typens meny (utkast v4 avsnitt 4, skissens arkTypInnehall): symbol, namn,
 * raden (provets format med plan, annars "kallas även"), nivåbandet i
 * mellanstorlek, Träna i koppar, hårlinjen "eller", Testa dig på en nivå i
 * indigo, Mät dig och Senaste resultat.
 *
 * Ett och samma element byter form med bredden:
 *   - under 900 px ett ark från botten (modalt)
 *   - 900 till 1099 px en panel från höger över sidan (modal)
 *   - från 1100 px en panel i en egen spalt bredvid korten (inte modal)
 * Modalt fångas fokus i arket och sidan bakom låses. Esc stänger alltid.
 * Menyn ritas ur sidans data, utan nätverksanrop.
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TesttypKort, TypMeny } from '@/lib/tester/v4/typer'
import Nivaband from '../Nivaband'
import TypSymbol from './TypSymbol'
import TranaKort from './TranaKort'
import TestaDigKort from './TestaDigKort'
import MatDigRader from './MatDigRader'
import SenasteResultat from './SenasteResultat'
import { TESTER } from './copy'
import { NIVAKOLL_FINNS } from '@/lib/tester/v4/rutter'

export const MODAL_FRAGA = '(max-width: 1099px)'

const FOKUSERBARA =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function useModal(): { modal: boolean; monterad: boolean } {
  const [modal, setModal] = useState(true)
  const [monterad, setMonterad] = useState(false)
  useEffect(() => {
    setMonterad(true)
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(MODAL_FRAGA)
    const satt = () => setModal(mq.matches)
    satt()
    mq.addEventListener?.('change', satt)
    return () => mq.removeEventListener?.('change', satt)
  }, [])
  return { modal, monterad }
}

export default function TypMenyPanel({
  kort,
  meny,
  onStang,
}: {
  kort: TesttypKort
  meny: TypMeny
  onStang: () => void
}) {
  const ref = useRef<HTMLElement | null>(null)
  const { modal, monterad } = useModal()
  const titelId = `meny-${kort.id}`

  // Fokus in i menyn när den öppnas eller byter typ, tillbaka när den stängs.
  useEffect(() => {
    const tidigare = document.activeElement as HTMLElement | null
    // Bredden läses här och nu: bredvid korten ska fokus inte rulla sidan.
    const arModal = typeof window.matchMedia === 'function' ? window.matchMedia(MODAL_FRAGA).matches : true
    const id = window.requestAnimationFrame(() => ref.current?.focus({ preventScroll: !arModal }))
    return () => {
      window.cancelAnimationFrame(id)
      if (tidigare && document.body.contains(tidigare)) tidigare.focus?.({ preventScroll: true })
    }
    // Bara när typen byts, inte när bredden ändras.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kort.id])

  // Esc stänger; modalt fångas Tab i arket.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onStang()
        return
      }
      if (e.key !== 'Tab' || !modal || !ref.current) return
      const aktiv = document.activeElement
      // Ett ark ovanpå (betalväggen) sköter sitt eget fokus.
      if (aktiv && aktiv !== document.body && !ref.current.contains(aktiv)) return
      const delar = Array.from(ref.current.querySelectorAll<HTMLElement>(FOKUSERBARA))
      if (!delar.length) return
      const forsta = delar[0]
      const sista = delar[delar.length - 1]
      if (e.shiftKey && (aktiv === forsta || aktiv === ref.current)) {
        e.preventDefault()
        sista.focus()
      } else if (!e.shiftKey && aktiv === sista) {
        e.preventDefault()
        forsta.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modal, onStang])

  // Modalt: sidan bakom rullar inte.
  useEffect(() => {
    if (!modal) return
    const body = document.body
    const forr = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = forr
    }
  }, [modal])

  const senasteProv = meny.senaste.prov.length ? meny.senaste.prov[meny.senaste.prov.length - 1] : null

  const innehall = (
    <>
      <button
        type="button"
        aria-label={TESTER.meny.stang}
        tabIndex={-1}
        onClick={onStang}
        className="fixed inset-0 z-50 bg-[color:var(--dimma,rgba(10,12,30,.55))] motion-safe:animate-[fadeInPlace_200ms_ease-out] min-[1100px]:hidden"
        data-meny-dimma
      />
      <aside
        ref={ref}
        role={modal ? 'dialog' : 'region'}
        aria-modal={modal ? true : undefined}
        aria-labelledby={titelId}
        tabIndex={-1}
        data-meny={kort.id}
        className={[
          'fixed inset-x-0 bottom-0 z-50 grid max-h-[90dvh] content-start gap-3.5 overflow-y-auto overscroll-contain rounded-t-ark border border-kant bg-papper px-5 pt-2.5 text-ink-1 shadow-svav outline-none',
          'pb-[calc(30px+env(safe-area-inset-bottom))]',
          'max-[899px]:motion-safe:animate-[sheetUp_240ms_ease-out]',
          'min-[900px]:inset-y-0 min-[900px]:left-auto min-[900px]:right-0 min-[900px]:max-h-none min-[900px]:w-[440px] min-[900px]:rounded-none min-[900px]:px-[22px] min-[900px]:pb-7 min-[900px]:pt-[22px]',
          'min-[1100px]:sticky min-[1100px]:top-4 min-[1100px]:z-auto min-[1100px]:w-auto min-[1100px]:max-h-[calc(100dvh-32px)] min-[1100px]:self-start min-[1100px]:rounded-2xl min-[1100px]:shadow-lyft',
        ].join(' ')}
      >
        <span className="mx-auto mb-0.5 block h-1 w-10 rounded-full bg-kant-stark min-[900px]:hidden" aria-hidden="true" />
        <button
          type="button"
          onClick={onStang}
          aria-label={TESTER.meny.stang}
          className="absolute right-3 top-3 z-[2] grid h-11 w-11 place-items-center rounded-xl bg-papper-2 text-ink-1"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="flex items-center gap-3.5 pr-12">
          <TypSymbol typ={kort.id} size={56} />
          <div className="min-w-0">
            <h2 id={titelId} className="font-display text-xl font-bold leading-6 tracking-[-.02em]">
              {kort.namn}
            </h2>
            <p className="text-meta text-ink-3">{meny.rad}</p>
          </div>
        </div>

        <div className="mt-1">
          <Nivaband namn={kort.namn} typ={kort.id} lage={kort.niva} storlek="mellan" ton="koppar" />
        </div>

        <TranaKort trana={meny.trana} />
        <div className="-my-0.5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.1em] text-ink-3 before:h-px before:flex-1 before:bg-kant-stark after:h-px after:flex-1 after:bg-kant-stark" data-eller>
          {TESTER.meny.eller}
        </div>
        <TestaDigKort nivaer={meny.nivaer} matNiva={!NIVAKOLL_FINNS[kort.id]} />
        <MatDigRader typ={kort.id} nivakoll={meny.nivakoll} ovningsprov={meny.ovningsprov} senasteProv={senasteProv} />
        <SenasteResultat typ={kort.id} senaste={meny.senaste} />
      </aside>
    </>
  )
  // Modalt ligger arket i body, ovanför dörrnavet och skalets lager. Första
  // ritningen (servern och hydreringen) står på plats; portalen tar över efter.
  return monterad && modal ? createPortal(innehall, document.body) : innehall
}
