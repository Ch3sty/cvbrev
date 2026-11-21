'use client'

/**
 * Arket i arbetsläget (skisserna Redigera-1440, Bygg-1440, Mobil-redigera):
 * hennes CV i vald mall, med avsnittet hon ändrar markerat ("Du ändrar
 * här", från början "Syns direkt"). Jobbet hon ändrar markeras för sig när
 * det går att hitta på arket, annars hela avsnittet.
 *
 * - Hela dokumentet står på arket (alla sidor, brytlinje mellan dem), så att
 *   ett jobb på sida två också syns medan hon skriver.
 * - Två iframes i växel: den nya versionen laddas i den dolda och byts in
 *   först när den är klar, så det gamla arket står kvar skarpt.
 * - Tryck på ett avsnitt (eller namnet och kontakten) öppnar dess blad.
 * - Tomma avsnitt i ett CV som byggs står som grå exempeltext (spöke) med
 *   "+ Lägg till" vid rubriken.
 *
 * Mätningen läser mallsystemets märkning (data-avsnitt, data-sektion,
 * data-falt, data-post) och ändrar ingenting i mallarna.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import { arSektion } from '@/lib/cv/mallval/sektioner'
import { A4_KVOT, medSkala } from '@/components/cv/Dokument/matning'
import { AVSNITT, HUVUD } from '@/components/cv/Dokument/texter'
import s from './arbetslage.module.css'

type Ruta = { x: number; y: number; b: number; h: number }

interface ArkMatning {
  hojd: number
  avsnitt: { sektion: Sektion; ruta: Ruta; rubrik: Ruta | null; text: string }[]
  huvud: Ruta | null
}

export interface ArkMal {
  sektion: Sektion | 'huvud'
  /** Jobbet eller utbildningen hon ändrar: texterna som står på arket. */
  post?: { titel: string; under: string } | null
}

export interface ArbetsArkProps {
  html: string | null
  titel: string
  mal: ArkMal | null
  spok: readonly Sektion[]
  etikett: string
  /** Etiketten bredvid arket (dator); telefonen har bara markeringen. */
  visaEtikett: boolean
  onAvsnitt: (s: Sektion) => void
  onHuvud: () => void
  /** Markeringen i px från arkets överkant, för rullningen. */
  onMarkering?: (el: HTMLElement | null) => void
  /** Rubrikerna på arket (Arbetslivserfarenhet, Färdigheter) och antalet sidor. */
  onMatning?: (m: { rubriker: Partial<Record<Sektion, string>>; sidor: number }) => void
}

function ruta(r: DOMRect, rot: DOMRect, bredd: number): Ruta {
  return { x: (r.left - rot.left) / bredd, y: (r.top - rot.top) / bredd, b: r.width / bredd, h: r.height / bredd }
}

function union(a: Ruta | null, b: Ruta): Ruta {
  if (!a) return b
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return { x, y, b: Math.max(a.x + a.b, b.x + b.b) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}

function mat(doc: Document): ArkMatning {
  const rot = doc.documentElement.getBoundingClientRect()
  const bredd = rot.width || 1
  let botten = 0
  for (const el of Array.from(doc.body?.querySelectorAll('*') ?? [])) {
    const r = (el as HTMLElement).getBoundingClientRect()
    if (r.height > 0 && r.bottom > botten) botten = r.bottom
  }
  const avsnitt: ArkMatning['avsnitt'] = []
  let huvud: Ruta | null = null
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('section[data-avsnitt]'))) {
    const attr = el.getAttribute('data-avsnitt')
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    if (attr === 'kontakt') {
      huvud = union(huvud, ruta(r, rot, bredd))
      continue
    }
    if (!arSektion(attr)) continue
    const h = el.querySelector<HTMLElement>('h2, h3')
    const hr = h?.getBoundingClientRect()
    avsnitt.push({
      sektion: attr,
      ruta: ruta(r, rot, bredd),
      rubrik: hr && hr.width > 0 ? ruta(hr, rot, bredd) : null,
      text: (h?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })
  }
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('[data-falt]'))) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    huvud = union(huvud, ruta(r, rot, bredd))
  }
  return { hojd: Math.max(A4_KVOT, (botten - rot.top) / bredd), avsnitt, huvud }
}

const norm = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase()

/** Jobbets ruta på arket: posten i avsnittet vars text bär titeln och arbetsgivaren. */
function postRuta(doc: Document, sektion: Sektion, post: { titel: string; under: string }): Ruta | null {
  const titel = norm(post.titel)
  const under = norm(post.under)
  if (!titel && !under) return null
  const rot = doc.documentElement.getBoundingClientRect()
  const bredd = rot.width || 1
  const poster = Array.from(doc.querySelectorAll<HTMLElement>(`section[data-avsnitt="${sektion}"] [data-post]`))
  const traff =
    poster.find((p) => {
      const t = norm(p.textContent ?? '')
      return (!titel || t.includes(titel)) && (!under || t.includes(under))
    }) ?? poster.find((p) => norm(p.querySelector('.posttitel')?.textContent ?? '') === (titel || under))
  if (!traff) return null
  const r = traff.getBoundingClientRect()
  return r.width > 0 ? ruta(r, rot, bredd) : null
}

export default function ArbetsArk({ html, titel, mal, spok, etikett, visaEtikett, onAvsnitt, onHuvud, onMarkering, onMatning }: ArbetsArkProps) {
  const ramRef = useRef<HTMLDivElement>(null)
  const ifr = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)]
  const [bredd, setBredd] = useState(0)
  const [ramar, setRamar] = useState<[string | null, string | null]>([html ? medSkala(html) : null, null])
  const [visad, setVisad] = useState(0)
  const [matning, setMatning] = useState<ArkMatning | null>(null)
  const [post, setPost] = useState<Ruta | null>(null)
  const harRef = useRef<HTMLSpanElement>(null)
  const matningRef = useRef(onMatning)
  matningRef.current = onMatning

  useEffect(() => {
    const el = ramRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBredd(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Ny HTML: in i den dolda ramen; den byts in när den laddat.
  useEffect(() => {
    if (!html) return
    const ny = medSkala(html)
    setRamar((r) => {
      if (r[visad] === ny) return r
      const n: [string | null, string | null] = [...r] as [string | null, string | null]
      n[1 - visad] = ny
      return n
    })
    // visad läses bara för att välja ram.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html])

  const matRam = useCallback((i: number) => {
    const doc = ifr[i].current?.contentDocument
    if (!doc?.body) return
    try {
      const m = mat(doc)
      setMatning(m)
      matningRef.current?.({
        rubriker: Object.fromEntries(m.avsnitt.filter((a) => a.text).map((a) => [a.sektion, a.text])),
        sidor: Math.max(1, Math.ceil(m.hojd / A4_KVOT - 0.015)),
      })
    } catch {
      // Ett dokument som inte går att mäta visas ändå, utan träffytor.
    }
    // ifr är stabila referenser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLoad = (i: number) => {
    if (!ramar[i]) return
    window.setTimeout(() => {
      matRam(i)
      setVisad(i)
    }, 40)
  }

  // Serverns HTML kan ha laddat före hydreringen; då kom onLoad aldrig fram.
  useEffect(() => {
    const doc = ifr[0].current?.contentDocument
    if (doc?.readyState === 'complete' && doc.body?.childElementCount) {
      const t = window.setTimeout(() => matRam(0), 60)
      return () => window.clearTimeout(t)
    }
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ommätning när bredden ändras (zoomen i iframen följer bredden).
  useEffect(() => {
    if (!bredd) return
    const t = window.setTimeout(() => matRam(visad), 120)
    return () => window.clearTimeout(t)
  }, [bredd, visad, matRam])

  // Jobbet hon ändrar: letas upp i den visade versionen.
  const postNyckel = mal?.post ? `${mal.sektion}|${mal.post.titel}|${mal.post.under}` : ''
  useEffect(() => {
    if (!mal?.post || mal.sektion === 'huvud') {
      setPost(null)
      return
    }
    const doc = ifr[visad].current?.contentDocument
    setPost(doc ? postRuta(doc, mal.sektion, mal.post) : null)
    // postNyckel bär målet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postNyckel, visad, matning])

  const px = (v: number) => v * bredd
  const hojd = matning?.hojd ?? A4_KVOT
  const sidor = Math.max(1, Math.ceil(hojd / A4_KVOT - 0.015))

  const markering: Ruta | null = useMemo(() => {
    if (!mal || !matning) return null
    if (mal.sektion === 'huvud') return matning.huvud
    if (post) return post
    return matning.avsnitt.find((a) => a.sektion === mal.sektion)?.ruta ?? null
  }, [mal, matning, post])

  // Rullningen: markeringen in i bild när den byts eller flyttar.
  const markNyckel = markering ? `${Math.round(markering.y * 1000)}|${Math.round(markering.h * 1000)}` : ''
  useEffect(() => {
    if (!markering) return
    onMarkering?.(harRef.current)
    // markNyckel bär läget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markNyckel, mal?.sektion])

  // Etiketten bredvid arket; ryms den inte i fönstret står den inne i markeringens hörn.
  const chipRef = useRef<HTMLSpanElement>(null)
  const [inne, setInne] = useState(false)
  useEffect(() => {
    if (!visaEtikett || !bredd || !ramRef.current) return
    const r = ramRef.current.getBoundingClientRect()
    const chip = chipRef.current?.offsetWidth ?? 120
    setInne(r.right - 18 + chip > window.innerWidth - 20)
  }, [visaEtikett, bredd, etikett, markNyckel])

  const LUFT_X = 8
  const LUFT_Y = 5

  return (
    <div ref={ramRef} className={s.ark} style={{ height: bredd ? px(hojd) : undefined, aspectRatio: bredd ? undefined : '794 / 1123' }} data-arbets-ark>
      <div className={s.arkKlipp}>
        {ramar.map((src, i) =>
          src ? (
            <iframe
              key={i}
              ref={ifr[i]}
              srcDoc={src}
              title={titel}
              scrolling="no"
              tabIndex={-1}
              aria-hidden={i !== visad}
              data-dold={i !== visad ? '' : undefined}
              data-visad={i === visad ? '' : undefined}
              onLoad={() => onLoad(i)}
              style={{ height: bredd ? px(hojd) : '100%' }}
            />
          ) : null
        )}
      </div>

      {/* Brytlinjerna mellan sidorna. */}
      {bredd
        ? Array.from({ length: sidor - 1 }, (_, k) => <span key={k} aria-hidden className={s.brytlinje} style={{ top: px((k + 1) * A4_KVOT) }} />)
        : null}

      {/* Träffytorna: avsnitten och huvudet. */}
      {bredd && matning
        ? matning.avsnitt.map((a, i) => (
            <button
              key={`${a.sektion}-${i}`}
              type="button"
              className={s.traff}
              data-avsnitt-knapp={a.sektion}
              aria-label={spok.includes(a.sektion) ? AVSNITT.saknas(a.text || AVSNITT.rubrik[a.sektion]) : `${AVSNITT.rubrik[a.sektion]}: ${a.text}`}
              onClick={() => onAvsnitt(a.sektion)}
              style={{ left: px(a.ruta.x) - LUFT_X, top: px(a.ruta.y) - LUFT_Y, width: px(a.ruta.b) + 2 * LUFT_X, height: Math.max(44, px(a.ruta.h) + 2 * LUFT_Y) }}
            />
          ))
        : null}
      {bredd && matning?.huvud ? (
        <button
          type="button"
          className={s.traff}
          data-huvud="namn"
          aria-label={HUVUD.andra.namn}
          onClick={onHuvud}
          style={{
            left: px(matning.huvud.x) - LUFT_X,
            top: px(matning.huvud.y) - LUFT_Y,
            width: px(matning.huvud.b) + 2 * LUFT_X,
            height: Math.max(44, px(matning.huvud.h) + 2 * LUFT_Y),
          }}
        />
      ) : null}

      {/* "+ Lägg till" vid rubriken på ett tomt avsnitt (grå exempeltext). */}
      {bredd && matning
        ? matning.avsnitt
            .filter((a) => spok.includes(a.sektion) && a.rubrik)
            .map((a) => (
              <span
                key={`till-${a.sektion}`}
                aria-hidden
                className={s.till}
                data-lagg-till={a.sektion}
                style={{ right: Math.max(4, bredd - px(a.ruta.x + a.ruta.b)), top: px(a.rubrik!.y + a.rubrik!.h / 2) - 13 }}
              >
                {AVSNITT.laggTillFor(a.sektion, a.text)}
              </span>
            ))
        : null}

      {/* Markeringen och etiketten. */}
      {bredd && markering ? (
        <>
          <span
            ref={harRef}
            aria-hidden
            className={s.har}
            data-markering={mal?.sektion}
            style={{
              left: Math.max(2, px(markering.x) - LUFT_X),
              top: px(markering.y) - LUFT_Y,
              width: Math.min(bredd - 4, px(markering.b) + 2 * LUFT_X),
              height: px(markering.h) + 2 * LUFT_Y,
            }}
          />
          {visaEtikett ? (
            <span
              ref={chipRef}
              className={s.etikettChip}
              style={
                inne
                  ? { right: 10, top: px(markering.y) - LUFT_Y - 17 }
                  : { left: bredd - 18, top: px(markering.y) - LUFT_Y + Math.min(24, Math.max(0, px(markering.h) / 2 - 17)) }
              }
              data-inne={inne ? '' : undefined}
              data-etikett
            >
              <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden>
                <path d="M10 0L0 7l10 7z" fill="#E07A2F" />
              </svg>
              {etikett}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
