'use client'

/**
 * Scenen på golvet (omgång 2 steg A, artboarden Main i skissen): typens scen
 * ur scener/ står svagt nere till höger på golvet bakom uppgiften, från 1440
 * px bredd. 240 × 180, kontur i vagg-2, 16 % opacitet, aldrig i kolumnen.
 *
 * Den tonas bort när kolumnen når ner till scenens höjd: en vakt på 24 px
 * står sist i uppgiftens spalt (efter foten), och en IntersectionObserver mot
 * main med scenens höjd som bottenmarginal säger om vakten står ovanför
 * scenen. Står den inte där tonas scenen ut på 200 ms (bara opacitet).
 *
 * aria-hidden, pointer-events av, position absolute med fasta mått: tar
 * ingen plats och flyttar inget (CLS 0). Utan IntersectionObserver står
 * scenen synlig.
 */

import { useEffect, useState, type RefObject } from 'react'
import { scenFor } from './scener'

const BREDD = 240
const HOJD = 180
const UNDER = 32

export default function ScenGolv({ id, rot, vakt }: { id: string; rot: RefObject<HTMLElement | null>; vakt: RefObject<HTMLElement | null> }) {
  const [fri, setFri] = useState(true)
  useEffect(() => {
    const r = rot.current
    const v = vakt.current
    if (!r || !v || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (poster) => {
        const p = poster[poster.length - 1]
        if (!p) return
        // Vakten syns i main ovanför scenens överkant: kolumnen slutar innan scenen.
        // Ovanför main (rullad förbi) räknas också som fri.
        setFri(p.isIntersecting || p.boundingClientRect.bottom <= (p.rootBounds?.top ?? 0))
      },
      { root: r, rootMargin: `0px 0px -${HOJD + UNDER}px 0px`, threshold: 0 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [rot, vakt])

  const Scen = scenFor(id)
  return (
    <div
      aria-hidden="true"
      className="sess-scen-golv pointer-events-none absolute z-0 hidden min-[1440px]:block"
      style={{ right: 48, bottom: UNDER, width: BREDD, height: HOJD, opacity: fri ? 0.16 : 0 }}
      data-scen-golv={fri ? 'synlig' : 'dold'}
    >
      <Scen className="block h-full w-full" />
    </div>
  )
}
