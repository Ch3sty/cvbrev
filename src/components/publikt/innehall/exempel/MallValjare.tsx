'use client'

/**
 * Knappen under papperet (ägarbeslut 7 i del B: mallväljaren öppnas med en
 * knapp). Papperet är serverrenderat och står kvar i HTML; först vid klick
 * laddas visaren och visas i papperets ställe. Ingen kod för visaren i
 * första laddningen.
 *
 * Brevet (byggspecen våg 2, 2026-11-21): "Byt mall" med fem små ark öppnar
 * mallvisaren ("Bunten") med yrkets brev i fem mallar. Öppen: papperet och
 * knappen göms, sidan rullas till scenens överkant och fokus flyttas till
 * "Visa exemplet igen". Kommentarskortets fyllda knapp byts mot en textlänk
 * (visarens knapp är den fyllda), och telefonens fasta knapprad göms. Vid
 * stängning tvärtom: papperet, rullning till dess överkant, fokus på
 * "Byt mall". CV:ts väljare är orörd.
 */

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { VISARE_TEXT as T } from '@/components/publikt/brevvisare/texter'
import type { VisarMall } from '@/components/publikt/brevvisare/visare-data'

const InteractiveCVPreview = dynamic(() => import('@/app/(public)/cv-exempel/[yrke]/InteractiveCVPreview'), {
  ssr: false,
  loading: () => <p className="pub-liten">Laddar mallarna…</p>,
})
const BrevVisare = dynamic(() => import('@/components/publikt/brevvisare/BrevVisare'), {
  ssr: false,
  loading: () => <p className="pub-liten">{T.laddar}</p>,
})

/** Det exempelsidan räknar på servern åt brevets visare. */
export interface BrevValjarData {
  slug: string
  /** Yrket i gemener, för arkets titel. */
  yrke: string
  mallar: VisarMall[]
  fot: string
  /** Länken efter fotraden: "Se alla 40 brevmallar" (omgång 3). */
  alla?: { text: string; href: string }
  /** /skapa-brev/start?yrke=<slug>, samma som "Använd som mall". */
  href: string
  /** Kommentarskortets fyllda knapp, som göms medan visaren är öppen. */
  ctaKnappId: string
  /** Platsen i kommentarskortet där textlänken ritas medan visaren är öppen. */
  ctaPlatsId: string
}

const rorelse = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

function BrevValjare({ papperId, brev }: { papperId: string; brev: BrevValjarData }) {
  const [oppen, setOppen] = useState(false)
  const [plats, setPlats] = useState<HTMLElement | null>(null)
  const bytKnapp = useRef<HTMLButtonElement>(null)
  const tillbaka = useRef<HTMLButtonElement>(null)
  const varOppen = useRef(false)

  useEffect(() => {
    const papper = document.getElementById(papperId)
    if (papper) papper.hidden = oppen
    const cta = document.getElementById(brev.ctaKnappId)
    if (cta) cta.hidden = oppen
    setPlats(oppen ? document.getElementById(brev.ctaPlatsId) : null)
    document.documentElement.toggleAttribute('data-brevvisare-oppen', oppen)
    if (!oppen && varOppen.current) {
      papper?.scrollIntoView({ block: 'start', behavior: rorelse() })
      bytKnapp.current?.focus({ preventScroll: true })
    }
    varOppen.current = oppen
  }, [oppen, papperId, brev.ctaKnappId, brev.ctaPlatsId])

  useEffect(() => () => document.documentElement.removeAttribute('data-brevvisare-oppen'), [])

  // När visaren har ritats: scenens överkant under sidhuvudet, fokus på "Visa exemplet igen".
  const visarenRitad = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    el.scrollIntoView({ block: 'start', behavior: rorelse() })
    tillbaka.current?.focus({ preventScroll: true })
  }, [])

  return (
    <>
      {oppen ? (
        <div className="ib-valjare">
          <BrevVisare
            mallar={brev.mallar}
            brev={`slug=${encodeURIComponent(brev.slug)}`}
            yrke={brev.yrke}
            kontext="exempel"
            handling={{ text: T.anvand, href: brev.href }}
            fot={brev.fot}
            alla={brev.alla}
            onTillbaka={() => setOppen(false)}
            tillbakaRef={tillbaka}
            rotRef={visarenRitad}
          />
        </div>
      ) : null}
      <button
        ref={bytKnapp}
        type="button"
        className="ib-byt-brev"
        aria-expanded={oppen}
        hidden={oppen}
        onClick={() => setOppen(true)}
        data-byt-mall=""
      >
        {/* De fem riktiga miniatyrerna (omgång 3), samma som i visaren. */}
        <span className="ib-byt-bunt ib-byt-bilder" aria-hidden="true">
          {brev.mallar.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.bild} alt="" width={480} height={679} loading="lazy" decoding="async" />
          ))}
        </span>
        {T.bytMall}
      </button>
      {plats
        ? createPortal(
            <a className="ib-cta-lank" href={brev.href} data-cta-klick={brev.href}>
              {T.skrivPaAnnons}
            </a>,
            plats
          )
        : null}
    </>
  )
}

export default function MallValjare({
  typ,
  yrke,
  data,
  papperId,
  brev,
}: {
  typ: 'cv' | 'brev'
  yrke: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data?: any
  /** Id på det serverrenderade papperet, som göms medan väljaren är öppen. */
  papperId: string
  /** Brevets visare (typ brev). */
  brev?: BrevValjarData
}) {
  const [oppen, setOppen] = useState(false)

  useEffect(() => {
    if (typ !== 'cv') return
    const el = document.getElementById(papperId)
    if (el) el.hidden = oppen
  }, [oppen, papperId, typ])

  if (typ === 'brev') return brev ? <BrevValjare papperId={papperId} brev={brev} /> : null

  return (
    <>
      {oppen ? (
        <div className="ib-valjare">
          <InteractiveCVPreview exempelCV={data} yrke={yrke} initialHTML="" />
        </div>
      ) : null}
      <button type="button" aria-expanded={oppen} onClick={() => setOppen((v) => !v)} data-byt-mall="">
        {oppen ? 'Visa exemplet igen' : 'Byt mall'}
      </button>
    </>
  )
}
