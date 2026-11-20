'use client'

/**
 * Startarket (omgång 3, skissens Mobil-startark): det som visas när man
 * väljer ett test, före första uppgiften. Scenen, namnet och var typen
 * förekommer, nivån med mätaren, och Välj hur du vill öva (Träna, mönstret,
 * Nivåkollen, övningsprovet och nivåtesten).
 *
 * Ett och samma element byter form med bredden:
 *   - under 900 px ett ark från botten
 *   - från 900 px en panel från höger över sidan
 * Båda är modala: fokus fångas i arket, sidan bakom låses, Esc stänger.
 * Arket ritas ur sidans data, utan nätverksanrop.
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TesttypKort, TypMeny } from '@/lib/tester/v4/typer'
import { kortDatumV } from '@/lib/tester/v4/vagen'
import { TESTER } from './copy'
import SattAttOva from '@/components/tester-v4/omgang3/SattAttOva'
import { Lucka, Matare3, matareEtikett, TypScen, VantarChip } from '@/components/tester-v4/omgang3/delar'
import { tal1, ZON_TEXT, zonFor } from '@/components/tester-v4/omgang3/matt'

/** Sedan omgång 3 är arket modalt på alla bredder. */
export const MODAL_FRAGA = '(min-width: 0px)'

const FOKUSERBARA =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function useMonterad(): boolean {
  const [monterad, setMonterad] = useState(false)
  useEffect(() => setMonterad(true), [])
  return monterad
}

function nivaRad(kort: TesttypKort, planNamn: string | null): string {
  const v = kort.niva.niva
  if (kort.niva.status === 'paborjad' && kort.niva.svar) return `Nivåkollen påbörjad, ${kort.niva.svar.besvarade} av ${kort.niva.svar.antal} svar`
  if (kort.niva.status !== 'matt' || v == null) return 'Inte mätt än. Nivåkollen sätter din nivå.'
  const z = zonFor(v)
  return `${ZON_TEXT[z]}${z === 'grund' ? '' : z === 'avancerad' ? ', på provens nivå' : ', över provens nivå'}${planNamn && kort.ingarIPlan ? `, ingår i ${planNamn}` : ''}`
}

export default function TypMenyPanel({
  kort,
  meny,
  onStang,
  planNamn = null,
}: {
  kort: TesttypKort
  meny: TypMeny
  onStang: () => void
  planNamn?: string | null
}) {
  const ref = useRef<HTMLElement | null>(null)
  const monterad = useMonterad()
  const titelId = `meny-${kort.id}`

  // Fokus in i arket när det öppnas eller byter typ, tillbaka när det stängs.
  useEffect(() => {
    const tidigare = document.activeElement as HTMLElement | null
    const id = window.requestAnimationFrame(() => ref.current?.focus())
    return () => {
      window.cancelAnimationFrame(id)
      if (tidigare && document.body.contains(tidigare)) tidigare.focus?.({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kort.id])

  // Esc stänger; Tab fångas i arket.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onStang()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
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
  }, [onStang])

  // Sidan bakom rullar inte.
  useEffect(() => {
    const body = document.body
    const forr = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = forr
    }
  }, [])

  const v = kort.niva.status === 'matt' ? kort.niva.niva : null
  const nk = meny.nivakoll.senaste

  const innehall = (
    <>
      <button type="button" aria-label={TESTER.meny.stang} tabIndex={-1} onClick={onStang} className="t3-ark-dimma" data-meny-dimma />
      <aside ref={ref} role="dialog" aria-modal aria-labelledby={titelId} tabIndex={-1} data-meny={kort.id} className="t3-ark">
        <span className="t3-ark-handtag" aria-hidden="true" />
        <div className="t3-ark-huvud">
          <span className="t3-ark-scen" aria-hidden="true">
            <TypScen typ={kort.id} bredd={96} hojd={42} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titelId} className="t3-ark-titel">
              {kort.namn}
            </h2>
            <p className="t3-ark-rad">{meny.rad}</p>
          </div>
          <button type="button" onClick={onStang} aria-label={TESTER.meny.stang} className="t3-ark-stang">
            <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="t3-ark-niva">
          {v != null ? <span className="t3-stortal">{tal1(v)}</span> : <Lucka bredd={72} hojd={52} etikett="Nivån är inte mätt än" />}
          <span className="min-w-0">
            <b className="block text-[15px] font-bold leading-5">{nivaRad(kort, planNamn)}</b>
            <small className="block text-[13px] leading-[18px] text-ink-2">
              {nk ? `Nivåkoll ${kortDatumV(nk.dag)}, ${kort.antalTraningar} ${kort.antalTraningar === 1 ? 'träning' : 'träningar'} totalt` : v == null ? <VantarChip /> : `${kort.antalTraningar} ${kort.antalTraningar === 1 ? 'träning' : 'träningar'}`}
            </small>
          </span>
        </div>
        <div>
          <Matare3 niva={v} etikett={matareEtikett(v)} />
          <div className="t3-matt-etiketter">
            <span>Grund</span>
            <span data-prov>Provens nivå</span>
            <span>Expert</span>
          </div>
        </div>
        <SattAttOva kort={kort} meny={meny} planNamn={planNamn} />
      </aside>
    </>
  )
  // Arket ligger i body, ovanför dörrnavet och skalets lager. Första
  // ritningen (servern och hydreringen) står på plats; portalen tar över efter.
  return monterad ? createPortal(innehall, document.body) : innehall
}
