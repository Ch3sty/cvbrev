'use client'

/**
 * Klientön i <CvOchBrevPar />: vilken mall som visas, svepet och laddningen.
 * Allt annat (namn, nivå, format, bilder, fotraden) kommer färdigt från
 * servern ur katalogen.
 *
 * Byte: namnraden, miniatyren och adresserna byter direkt; de gamla arken
 * ligger kvar nedtonade tills båda de nya bilderna har laddat, sedan tonas de
 * in (samma mönster som brevets mallvisare). Svep åt vänster eller höger på
 * arken byter mall och stannar i ändarna; kantpilarna gör samma sak med mus
 * och tangentbord.
 *
 * Händelserna bär bara mall och sida: mallvisning_visad när visaren kommer i
 * bild, mallvisning_mall_bytt med hur, mallvisning_klick med mal.
 */
import { useEffect, useRef, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import { Ikon } from '@/components/publikt/v3/Ikon'

export interface ParMall {
  id: string
  namn: string
  /** "Gratis" eller "Premium" (paketKort), färdig text. */
  niva: string
  gratis: boolean
  /** "PDF · Word" eller "PDF". */
  format: string
  foto: boolean
  /** CV-bilden, 300 x 424. */
  cv: string
  /** CV-miniatyren, 112 x 158. */
  mini: string
  /** Brevbilden, 480 x 679. */
  brev: string
}

interface Props {
  slug: string
  mallar: readonly ParMall[]
  fot: string
  fotoRad: string
}

const brevHref = (id: string) => `/skapa-brev/start?mall=${encodeURIComponent(id)}`
const cvHref = (id: string) => `/cv-mallar/prova?mall=${encodeURIComponent(id)}`

export default function CvOchBrevParVal({ slug, mallar, fot, fotoRad }: Props) {
  const [i, setI] = useState(0)
  // Paret som syns nu; skiljer det sig från i laddas i i ett lager ovanpå.
  const [visad, setVisad] = useState(0)
  const [tona, setTona] = useState(false)
  const iNu = useRef(0)
  iNu.current = i
  const laddade = useRef(new Set<string>())
  const start = useRef<{ x: number; y: number } | null>(null)
  const rot = useRef<HTMLDivElement>(null)
  const rad = useRef<HTMLDivElement>(null)

  // mallvisning_visad en gång, när visaren kommer i bild.
  useEffect(() => {
    const el = rot.current
    if (!el) return
    const skicka = () => capture('mallvisning_visad', { slug, template: mallar[0].id, typ: 'par' })
    if (typeof IntersectionObserver === 'undefined') {
      skicka()
      return
    }
    const io = new IntersectionObserver(
      (poster) => {
        if (poster.some((p) => p.isIntersecting)) {
          skicka()
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [slug, mallar])

  const laddad = (src: string) => {
    laddade.current.add(src)
    const m = mallar[iNu.current]
    if (laddade.current.has(m.cv) && laddade.current.has(m.brev)) {
      setVisad(iNu.current)
      setTona(true)
    }
  }

  const byt = (ny: number, hur: 'miniatyr' | 'svep' | 'kant') => {
    if (ny < 0 || ny >= mallar.length || ny === i) return
    setI(ny)
    const m = mallar[ny]
    if (laddade.current.has(m.cv) && laddade.current.has(m.brev)) {
      setVisad(ny)
      setTona(true)
    }
    capture('mallvisning_mall_bytt', { slug, template: m.id, typ: 'par', hur })
    // Den valda miniatyren i bild i raden (telefonens rullande rad), utan att sidan rullar.
    const knapp = rad.current?.querySelectorAll<HTMLElement>('.cbp-mini')[ny]
    const r = rad.current
    if (knapp && r && r.scrollWidth > r.clientWidth) {
      r.scrollTo({ left: knapp.offsetLeft - (r.clientWidth - knapp.offsetWidth) / 2, behavior: 'smooth' })
    }
  }

  const m = mallar[i]
  const laddar = i !== visad
  const lager = laddar ? [visad, i] : [i]
  const fore = i > 0 ? mallar[i - 1] : null
  const efter = i < mallar.length - 1 ? mallar[i + 1] : null

  const ark = (typ: 'cv' | 'brev') =>
    lager.map((k) => {
      const x = mallar[k]
      const src = typ === 'cv' ? x.cv : x.brev
      const ny = laddar && k === i
      const gammal = laddar && k === visad
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={x.id}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth > 0) laddade.current.add(src)
          }}
          src={src}
          alt={gammal ? '' : typ === 'cv' ? `CV i mallen ${x.namn}` : `Personligt brev i mallen ${x.namn}`}
          aria-hidden={gammal ? 'true' : undefined}
          width={typ === 'cv' ? 300 : 480}
          height={typ === 'cv' ? 424 : 679}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={ny ? 'cbp-ny' : gammal ? 'cbp-gammal' : tona ? 'cbp-tona' : undefined}
          onLoad={() => (ny || k === i ? laddad(src) : undefined)}
        />
      )
    })

  return (
    <div ref={rot} className="cbp-in" aria-busy={laddar ? 'true' : undefined}>
      <p className="cbp-huvud" aria-live="polite">
        <strong>{m.namn}</strong>
        <span className={`p3-chip ${m.gratis ? 'p3-chip-gratis' : 'p3-chip-premium'}`}>{m.niva}</span>
        <span className="cbp-format">{m.format}</span>
      </p>

      <div
        className="cbp-scen"
        onPointerDown={(e) => {
          start.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerUp={(e) => {
          const s = start.current
          start.current = null
          if (!s) return
          const dx = e.clientX - s.x
          const dy = e.clientY - s.y
          // Vänster ger nästa mall, höger föregående; stopp i ändarna.
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) byt(i + (dx < 0 ? 1 : -1), 'svep')
        }}
        onPointerCancel={() => {
          start.current = null
        }}
      >
        <div className="cbp-par">
          <div className="cbp-ark cbp-ark-cv">
            <span className="cbp-etikett">CV</span>
            <span className="cbp-papper">{ark('cv')}</span>
          </div>
          <div className="cbp-ark cbp-ark-brev">
            <span className="cbp-etikett">Personligt brev</span>
            <span className="cbp-papper">{ark('brev')}</span>
          </div>
          {laddar ? <span className="cbp-laddar" aria-hidden="true" /> : null}
        </div>
        {fore ? (
          <button type="button" className="cbp-kant cbp-kant-v" aria-label={`Visa ${fore.namn}`} onClick={() => byt(i - 1, 'kant')}>
            <Ikon namn="tillbaka" />
          </button>
        ) : null}
        {efter ? (
          <button type="button" className="cbp-kant cbp-kant-h" aria-label={`Visa ${efter.namn}`} onClick={() => byt(i + 1, 'kant')}>
            <Ikon namn="pil" />
          </button>
        ) : null}
      </div>

      <p className="cbp-foto">{m.foto ? fotoRad : null}</p>

      <div ref={rad} className="cbp-rad" role="group" aria-label="Välj mall">
        {mallar.map((x, k) => (
          <button key={x.id} type="button" className="cbp-mini" aria-pressed={k === i} aria-label={`Visa ${x.namn}`} onClick={() => byt(k, 'miniatyr')}>
            <span className="cbp-mini-bild">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.mini} alt="" width={112} height={158} loading="lazy" decoding="async" draggable={false} />
            </span>
            <span className="cbp-mini-namn">{x.namn}</span>
          </button>
        ))}
      </div>

      <div className="cbp-handling">
        <a
          className="p3-knapp cbp-knapp"
          href={brevHref(m.id)}
          data-cta-klick={brevHref(m.id)}
          onClick={() => capture('mallvisning_klick', { slug, template: m.id, typ: 'par', mal: 'brev' })}
        >
          {`Skriv brevet i ${m.namn}`}
          <Ikon namn="pil" />
        </a>
        <a
          className="p3-lank cbp-cvlank"
          href={cvHref(m.id)}
          data-cta-klick={cvHref(m.id)}
          onClick={() => capture('mallvisning_klick', { slug, template: m.id, typ: 'par', mal: 'cv' })}
        >
          {`Bygg CV:t i ${m.namn}`}
        </a>
      </div>

      <p className="cbp-fot">{fot}</p>
      <a className="p3-lank cbp-alla" href="/cv-mallar">
        Se alla mallar
      </a>
    </div>
  )
}
