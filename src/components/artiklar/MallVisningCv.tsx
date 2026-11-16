'use client'

/**
 * Namnet först (skissen yta 2, beslut 1): artikelns CV-visning. Två fält,
 * namn och titel, byter text direkt i exempel-CV:t (samma ursprung, så
 * texten byts i iframens dokument via data-falt, utan server och utan konto).
 * Titeln byter rubrikerna (uppsättningen i iframens adress, cachad per
 * uppsättning). Fem riktiga miniatyrer under, svep på dokumentet byter mall.
 * En knapp utan pris eller köp: "Fortsätt med ditt CV" till provsidan med
 * valen.
 *
 * Budget: under 3 kB JavaScript (plan avsnitt 6). Inga arkkomponenter,
 * ingen katalog: mallarna kommer som fem små objekt i props. Utan
 * JavaScript är fälten osynliga (platsen står kvar, CLS 0) och dokumentet
 * visas som i dag.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { capture } from '@/lib/analytics/events'
import { uppsattningForTitel } from '@/lib/cv/mallval/uppsattning'

export interface ArtikelMall {
  id: string
  namn: string
  /** "Gratis, även som Word" osv., färdig text från servern. */
  rad: string
  bild: string
}

interface Props {
  mallar: readonly ArtikelMall[]
  etiketter: { namn: string; titel: string; fortsatt: string; svep: string }
  /** Uppladdningsraden, serverrenderad (noll JavaScript). */
  uppladdning?: ReactNode
  /** Yrkessidan: yrkets exempel-CV och rubriker, titeln förifylld. */
  yrke?: string
  titelForval?: string
  /** Rad under knappen (yrkessidans rad om premiummallarna). */
  efter?: ReactNode
  /**
   * Bilden av första mallen med beskrivande alt-text, under iframen (syns tills
   * den laddat). Yrkessidan: samma bild som Product-schemat, så att schemabilden
   * finns synlig på sidan (SEO-strategen 2026-11-16).
   */
  affisch?: { src: string; alt: string }
}

const slug = () => window.location.pathname

export default function MallVisningCv({ mallar, etiketter, uppladdning, yrke, titelForval = '', efter, affisch }: Props) {
  const yta = yrke ? 'yrkessida' : 'artikel'
  const [i, setI] = useState(0)
  const [namn, setNamn] = useState('')
  const [titel, setTitel] = useState(titelForval)
  const [redo, setRedo] = useState(false)
  const ram = useRef<HTMLIFrameElement>(null)
  const original = useRef<{ namn?: string; titel?: string }>({})
  const ifyllt = useRef<Record<string, boolean>>({})
  const x0 = useRef<number | null>(null)
  const mall = mallar[i]
  const upps = uppsattningForTitel(titel)
  const egenUpps = titel !== titelForval ? upps : undefined
  const src = `/api/public/exempel/cv?mall=${mall.id}${yrke ? `&yrke=${yrke}` : ''}${egenUpps ? `&uppsattning=${egenUpps}` : ''}`

  useEffect(() => {
    setRedo(true)
    capture('mallvisning_visad', { slug: slug(), template: mallar[0].id })
  }, [mallar])

  // Namn och titel in i dokumentet; tomt fält ger exemplets text tillbaka.
  const skriv = () => {
    const d = ram.current?.contentDocument
    if (!d) return
    const n = d.querySelector('[data-falt="namn"]')
    const t = d.querySelector('[data-falt="titel"]')
    if (n && original.current.namn === undefined) original.current.namn = n.textContent ?? ''
    if (t && original.current.titel === undefined) original.current.titel = t.textContent ?? ''
    if (n) n.textContent = namn.trim() || original.current.namn || ''
    if (t) t.textContent = titel.trim() || original.current.titel || ''
  }
  useEffect(skriv)

  const falt = (f: 'namn' | 'titel', v: string) => {
    if (f === 'namn') setNamn(v)
    else setTitel(v)
    if (!ifyllt.current[f] && v.trim()) {
      ifyllt.current[f] = true
      capture('namn_ifyllt', { surface: yta, slug: slug(), yrke_slug: yrke, falt: f })
    }
  }

  const byt = (ny: number) => {
    const k = (ny + mallar.length) % mallar.length
    original.current = {}
    setI(k)
    capture('mallvisning_mall_bytt', { slug: slug(), template: mallar[k].id, typ: 'cv' })
  }

  const q = new URLSearchParams({ mall: mall.id })
  if (namn.trim()) q.set('namn', namn.trim())
  if (titel.trim()) q.set('titel', titel.trim())
  if (upps) q.set('uppsattning', upps)
  if (yrke) q.set('yrke', yrke)

  const FALT = 'h-12 w-full rounded-[10px] border border-kant-stark bg-papper px-3 text-sm text-ink-1 outline-none placeholder:text-ink-3 focus:border-ink-1'

  return (
    <div>
      <div className="grid grid-cols-2 gap-2" style={{ visibility: redo ? 'visible' : 'hidden' }}>
        <input aria-label={etiketter.namn} placeholder={etiketter.namn} value={namn} onChange={(e) => falt('namn', e.target.value)} className={FALT} autoComplete="name" />
        <input aria-label={etiketter.titel} placeholder={etiketter.titel} value={titel} onChange={(e) => falt('titel', e.target.value)} className={FALT} />
      </div>

      {uppladdning}

      <div
        className="relative mx-auto mt-3 max-w-[560px] touch-pan-y overflow-hidden rounded-[4px] bg-white shadow-[0_1px_0_rgba(0,0,0,.08),0_10px_24px_-14px_rgba(0,0,0,.45)]"
        onPointerDown={(e) => (x0.current = e.clientX)}
        onPointerUp={(e) => {
          const dx = x0.current === null ? 0 : e.clientX - x0.current
          x0.current = null
          if (Math.abs(dx) > 50) byt(i + (dx < 0 ? 1 : -1))
        }}
      >
        {affisch && i === 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={affisch.src} alt={affisch.alt} className="absolute inset-0 h-full w-full object-cover object-top" />
        ) : null}
        <iframe
          ref={ram}
          key={src}
          src={src}
          title={`Exempel på CV i mallen ${mall.namn}`}
          loading="lazy"
          scrolling="no"
          onLoad={skriv}
          className="pointer-events-none relative block aspect-[794/1123] w-full border-0"
        />
      </div>
      <p className="mt-1 text-center text-meta text-ink-3">{etiketter.svep}</p>

      <div className="mt-2 grid grid-cols-5 gap-2">
        {mallar.map((m, k) => (
          <button key={m.id} type="button" onClick={() => byt(k)} aria-pressed={k === i} aria-label={m.namn} className="min-w-0 text-left">
            <span className={`relative block aspect-[210/297] overflow-hidden rounded-md bg-white ${k === i ? 'border-2 border-koppar' : 'border border-kant'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.bild} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
            </span>
            <span className="mt-1 block truncate text-xs font-semibold text-ink-1">{m.namn}</span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-[13px] text-ink-2">
        <b className="font-semibold text-ink-1">{mall.namn}</b> {mall.rad}
      </p>

      <a
        href={`/cv-mallar/prova?${q.toString()}`}
        onClick={() => capture('fortsatt_klickad', { surface: yta, slug: slug(), yrke_slug: yrke, template: mall.id })}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(180deg,#E8863B,var(--koppar)_60%,var(--koppar-djup))] px-4 text-sm font-semibold text-koppar-text"
      >
        {etiketter.fortsatt}
      </a>
      {efter}
    </div>
  )
}
