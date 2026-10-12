'use client'

/**
 * Knappen under papperet (ägarbeslut 7 i del B: mallväljaren öppnas med en
 * knapp). Papperet är serverrenderat och står kvar i HTML; först vid klick
 * laddas den interaktiva förhandsvisningen med mallar och typsnitt och
 * visas i papperets ställe. Ingen kod för väljaren i första laddningen.
 */

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const InteractiveCVPreview = dynamic(() => import('@/app/(public)/cv-exempel/[yrke]/InteractiveCVPreview'), {
  ssr: false,
  loading: () => <p className="pub-liten">Laddar mallarna…</p>,
})
const InteractiveLetterPreview = dynamic(
  () => import('@/app/(public)/personligt-brev-exempel/[yrke]/InteractiveLetterPreview'),
  { ssr: false, loading: () => <p className="pub-liten">Laddar mallarna…</p> }
)

export default function MallValjare({
  typ,
  yrke,
  data,
  papperId,
}: {
  typ: 'cv' | 'brev'
  yrke: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
  /** Id på det serverrenderade papperet, som göms medan väljaren är öppen. */
  papperId: string
}) {
  const [oppen, setOppen] = useState(false)

  useEffect(() => {
    const el = document.getElementById(papperId)
    if (el) el.hidden = oppen
  }, [oppen, papperId])

  return (
    <>
      {oppen ? (
        <div className="ib-valjare">
          {typ === 'cv' ? (
            <InteractiveCVPreview exempelCV={data} yrke={yrke} initialHTML="" />
          ) : (
            <InteractiveLetterPreview exempelBrev={data} />
          )}
        </div>
      ) : null}
      <button type="button" aria-expanded={oppen} onClick={() => setOppen((v) => !v)} data-byt-mall="">
        {oppen ? 'Visa exemplet igen' : 'Byt mall'}
      </button>
    </>
  )
}
