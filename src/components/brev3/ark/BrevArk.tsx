'use client'

/**
 * Brevarket: brevets HTML (renderBrevHtml) ritat i sidan, skalat till sin
 * behållares bredd, alltid vitt papper. Ingen iframe: CSS:en scopas till
 * arkets egen klass (scopa.ts).
 *
 * Över arket, mätt i klienten:
 *  - siffrorna för kraven i marginalen, en per <mark data-krav>,
 *  - platsen för ett saknat krav (pulserar) med etiketten "Här hamnar meningen",
 *  - etiketten "Du ändrar här" vid stycket med data-aktivt,
 *  - tryck på ett stycke ger onStycke(i) (också med tangentbordet).
 *
 * Skissen: Brevet-1440 (arket i arbetsläget). Ge `bredd` när arkets bredd är
 * känd vid serverrenderingen (480 px i arbetsläget på dator): då ritas arket
 * i rätt skala direkt, utan layoutförskjutning. Utan `bredd` mäts behållaren;
 * platsen hålls under tiden med A4:ans proportioner.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { passaBrevet, scopaBrevHtml } from '@/lib/letters/brevmall/scopa'

/** Arket i CSS-pixlar (210 x 297 mm i 96 dpi). */
export const ARK_BREDD_PX = 793.7
export const ARK_HOJD_PX = 1122.5

export interface BrevArkProps {
  /** Dokumentet från renderBrevHtml. */
  html: string
  /** Arkets bredd i px. Saknas: behållarens bredd mäts. */
  bredd?: number
  /** arbete: djup skugga (arbetsläget). golv: mjukare (Dina brev, Mallar). */
  lage?: 'arbete' | 'golv'
  /** Kravet som saknas svar: dess nummer och stycket meningen hamnar sist i (0-baserat). */
  saknatKrav?: { nr: number; stycke: number } | null
  /** Tryck på ett stycke på arket. */
  onStycke?: (index: number) => void
  /** Beskrivning för skärmläsare av arket som bild. */
  ariaLabel?: string
  className?: string
}

interface Siffra {
  nr: number
  top: number
  left: number
}

interface Plats {
  top: number
  left: number
  bredd: number
  hojd: number
  nrTop: number
  nrLeft: number
}

const SIFFRA_HOJD = 18
const SKUGGA = {
  arbete: '0 5px 0 #1C0A18, 0 30px 60px rgba(0,0,0,.4)',
  golv: '0 3px 0 rgba(28,10,24,.28), 0 14px 32px rgba(28,10,24,.18)',
}

/**
 * Styckets sista rad som den syns: rektangeln längst ner, och på den raden
 * den som slutar längst till höger. Range.getClientRects() ger inte raderna i
 * synlig ordning när stycket har <mark> (elementets egna rutor kommer med),
 * så "sista i listan" kunde vara en rad högre upp och platsen för ett saknat
 * krav hamnade över text.
 */
/** Samma värde som förut behålls, så att en ny mätning utan ändring inte ritar om. */
function lika<T>(forra: T, ny: T): T {
  return JSON.stringify(forra) === JSON.stringify(ny) ? forra : ny
}

function sistaRaden(el: HTMLElement): DOMRect | null {
  const rng = document.createRange()
  rng.selectNodeContents(el)
  const rader = [...rng.getClientRects()].filter((r) => r.width > 0 && r.height > 0)
  if (!rader.length) return null
  const botten = Math.max(...rader.map((r) => r.bottom))
  const pa = rader.filter((r) => botten - r.bottom < Math.max(2, r.height / 2))
  return pa.reduce((x, y) => (y.right > x.right ? y : x))
}

export default function BrevArk({ html, bredd, lage = 'arbete', saknatKrav: saknatProp = null, onStycke, ariaLabel, className }: BrevArkProps) {
  const saknatNr = saknatProp?.nr
  const saknatStycke = saknatProp?.stycke
  const saknatKrav = useMemo(() => (saknatNr !== undefined && saknatStycke !== undefined ? { nr: saknatNr, stycke: saknatStycke } : null), [saknatNr, saknatStycke])
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const scope = `brevark-${id}`
  const { css, kropp } = useMemo(() => scopaBrevHtml(html, scope), [html, scope])

  const yttre = useRef<HTMLDivElement>(null)
  const inre = useRef<HTMLDivElement>(null)
  const [matt, setMatt] = useState<number | null>(bredd ?? null)
  const [hojdPx, setHojdPx] = useState(ARK_HOJD_PX)
  const [siffror, setSiffror] = useState<Siffra[]>([])
  const [plats, setPlats] = useState<Plats | null>(null)
  const [aktiv, setAktiv] = useState<{ top: number; left: number } | null>(null)

  const b = bredd ?? matt
  const skala = b ? b / ARK_BREDD_PX : 0

  // Behållarens bredd när ingen bredd är given.
  useLayoutEffect(() => {
    if (bredd || !yttre.current) return
    const el = yttre.current
    const satt = () => setMatt(el.clientWidth || null)
    satt()
    const ro = new ResizeObserver(satt)
    ro.observe(el)
    return () => ro.disconnect()
  }, [bredd])

  // Krympsteget, arkets höjd och lägena för siffror, plats och etikett.
  const mat = useCallback(() => {
    const rot = inre.current
    const ut = yttre.current
    if (!rot || !ut || !skala) return
    // Luften för ett saknat krav från förra mätningen tas bort först.
    rot.querySelectorAll<HTMLElement>('[data-b3-luft]').forEach((e) => {
      e.style.paddingBottom = ''
      e.removeAttribute('data-b3-luft')
    })
    passaBrevet(rot)

    // Allt mäts i arkets egna koordinater. getBoundingClientRect räknar med
    // föräldrarnas transform (t.ex. en inglidning som skalar ytan), och en
    // mätning mitt i en sådan gav siffror och plats på fel rad (klicktestet
    // 2026-11-21, telefonen). Skalan k tas ut ur mätningen.
    const bas = ut.getBoundingClientRect()
    const k = ut.offsetWidth ? bas.width / ut.offsetWidth || 1 : 1
    const x = (v: number) => (v - bas.left) / k
    const y = (v: number) => (v - bas.top) / k

    // Saknat krav vars stycke slutar med en full rad: platsen blir en egen
    // rad efter stycket. Luften läggs i dokumentet (padding under stycket),
    // så att nästa stycke flyttas ner och platsen aldrig täcker text.
    const saknatSt = saknatKrav ? (rot.querySelector<HTMLElement>(`[data-stycke="${saknatKrav.stycke}"]`) ?? [...rot.querySelectorAll<HTMLElement>('[data-stycke]')].pop() ?? null) : null
    let egenRad = false
    if (saknatSt) {
      const sista = sistaRaden(saknatSt)
      const sr = saknatSt.getBoundingClientRect()
      if (sista && (sr.right - sista.right) / k - 6 < 40) {
        egenRad = true
        saknatSt.setAttribute('data-b3-luft', '')
        saknatSt.style.paddingBottom = `${(sista.height / k + 4) / skala}px`
      }
    }

    const cv = rot.querySelector<HTMLElement>('.cv.brev')
    cv?.setAttribute('data-b3-matt', '')
    if (cv) setHojdPx(Math.max(ARK_HOJD_PX, cv.offsetHeight))

    const lista: Siffra[] = []
    rot.querySelectorAll<HTMLElement>('mark[data-krav]').forEach((m) => {
      const r = m.getClientRects()[0]
      const stycke = m.closest<HTMLElement>('[data-stycke]') ?? m.parentElement
      if (!r || !stycke) return
      const textVanster = x(stycke.getBoundingClientRect().left)
      lista.push({ nr: Number(m.dataset.krav), top: y(r.top) + r.height / k / 2 - SIFFRA_HOJD / 2, left: Math.max(2, textVanster - 30) })
    })
    lista.sort((x, y) => x.top - y.top)
    // Två krav på samma rad: siffrorna staplas i stället för att krocka.
    for (let i = 1; i < lista.length; i++) if (lista[i].top < lista[i - 1].top + SIFFRA_HOJD + 1) lista[i].top = lista[i - 1].top + SIFFRA_HOJD + 1
    setSiffror((f) => lika(f, lista))

    if (saknatKrav) {
      const st = saknatSt
      if (st) {
        const sista = sistaRaden(st) ?? st.getBoundingClientRect()
        const sr = st.getBoundingClientRect()
        const hojd = Math.max(8, sista.height / k)
        let left = x(sista.right) + 6
        let top = y(sista.top)
        const hoger = x(sr.right)
        if (egenRad) {
          left = x(sr.left)
          top = y(sista.bottom) + 2
        }
        const ny = { top, left, bredd: Math.max(30, Math.min(134 * (b! / 480), hoger - left)), hojd, nrTop: top + hojd / 2 - SIFFRA_HOJD / 2, nrLeft: Math.max(2, x(sr.left) - 30) }
        setPlats((f) => lika(f, ny))
      } else setPlats(null)
    } else setPlats(null)

    const a = rot.querySelector<HTMLElement>('[data-aktivt]')
    if (a) {
      const r = a.getBoundingClientRect()
      const ny = { top: y(r.top), left: ut.offsetWidth - 30 }
      setAktiv((f) => lika(f, ny))
    } else setAktiv(null)
  }, [skala, saknatKrav, b])

  useLayoutEffect(() => {
    mat()
  }, [mat, kropp])

  // React kan sätta arkets innerHTML på nytt vid en omritning utan att
  // strängen ändrats (klicktestet 2026-11-21: Brevet på telefon). Då försvann
  // krympsteget och luften som mätningen satt i DOM:en, och siffrorna och
  // platsen för saknat krav stod kvar från det krympta läget, på fel rad.
  // Ett nytt innehåll mäts därför alltid om.
  useEffect(() => {
    const rot = inre.current
    if (!rot || typeof MutationObserver === 'undefined') return
    let ram = 0
    const mo = new MutationObserver(() => {
      // Redan mätt (markeringen sitter kvar): innehållet är inte utbytt.
      if (rot.querySelector('.cv.brev[data-b3-matt]')) return
      cancelAnimationFrame(ram)
      ram = requestAnimationFrame(() => mat())
    })
    mo.observe(rot, { childList: true })
    return () => {
      cancelAnimationFrame(ram)
      mo.disconnect()
    }
  }, [mat, b])

  // Typsnitten laddas efter första målningen: mät igen när de är klara.
  // fonts.ready kan lösas innan arkets typsnitt ens har begärts (de laddas
  // först när texten ritas), och då bryts raderna om efter mätningen: mät
  // också om varje gång ett typsnitt har laddats klart.
  useEffect(() => {
    let levande = true
    const igen = () => levande && mat()
    document.fonts?.ready.then(igen)
    document.fonts?.addEventListener?.('loadingdone', igen)
    return () => {
      levande = false
      document.fonts?.removeEventListener?.('loadingdone', igen)
    }
  }, [mat, kropp])

  // Styckena som knappar när trycket gör något.
  useEffect(() => {
    const rot = inre.current
    if (!rot || !onStycke) return
    rot.querySelectorAll<HTMLElement>('[data-stycke]').forEach((p) => {
      p.tabIndex = 0
      p.setAttribute('role', 'button')
      p.setAttribute('aria-label', `Ändra stycke ${Number(p.dataset.stycke) + 1}`)
      p.style.cursor = 'pointer'
    })
  }, [onStycke, kropp])

  const tryck = (e: MouseEvent<HTMLDivElement>) => {
    const p = (e.target as HTMLElement).closest<HTMLElement>('[data-stycke]')
    if (p && onStycke) onStycke(Number(p.dataset.stycke))
  }
  const tangent = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const p = (e.target as HTMLElement).closest<HTMLElement>('[data-stycke]')
    if (p && onStycke) {
      e.preventDefault()
      onStycke(Number(p.dataset.stycke))
    }
  }

  const s = skala || 1
  return (
    <div
      ref={yttre}
      className={`b3-brevark ${className ?? ''}`}
      style={{ position: 'relative', width: bredd ?? '100%', flex: bredd ? 'none' : undefined, height: b ? hojdPx * s : undefined, aspectRatio: b ? undefined : '210 / 297' }}
    >
      <style>{`${css}
.b3-brevark .b3-ark-papper{position:absolute;inset:0;overflow:hidden;border-radius:8px;background:#fff}
.b3-brevark .b3-nr{position:absolute;width:20px;height:${SIFFRA_HOJD}px;border-radius:6px;background:#2F7D5B;color:#fff;font:800 11px/${SIFFRA_HOJD}px 'Schibsted Grotesk',Inter,sans-serif;text-align:center;pointer-events:none}
.b3-brevark .b3-nr.lucka{background:#fff;border:2px dashed #E07A2F;color:#A8491A;line-height:${SIFFRA_HOJD - 4}px}
@keyframes b3-ark-blink{0%,100%{box-shadow:0 0 0 2.5px #E07A2F}50%{box-shadow:0 0 0 2.5px #E07A2F,0 0 0 8px rgba(224,122,47,.22)}}
.b3-brevark .b3-plats{position:absolute;border-radius:5px;background:rgba(224,122,47,.12);animation:b3-ark-blink 2.2s ease-in-out infinite;pointer-events:none}
.b3-brevark .b3-etikett{position:absolute;display:inline-flex;align-items:center;height:34px;padding:0 12px;border-radius:11px;background:#E07A2F;color:#1A1206;font:700 13px/16px Inter,sans-serif;box-shadow:0 3px 0 #A8491A;white-space:nowrap;pointer-events:none;z-index:2}
.b3-brevark .b3-etikett.liten{height:26px;padding:0 10px;font-size:12px;border-radius:9px;box-shadow:0 2px 0 #A8491A}
.b3-brevark [data-stycke][role=button]:focus-visible{outline:3px solid #E07A2F;outline-offset:4px;border-radius:4px}
@media (prefers-reduced-motion:reduce){.b3-brevark .b3-plats{animation:none;box-shadow:0 0 0 2.5px #E07A2F}}`}</style>
      <div className="b3-ark-papper" style={{ boxShadow: SKUGGA[lage] }} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
        {b ? (
          <div
            ref={inre}
            className={scope}
            onClick={onStycke ? tryck : undefined}
            onKeyDown={onStycke ? tangent : undefined}
            style={{ width: ARK_BREDD_PX, transform: `scale(${s})`, transformOrigin: '0 0' }}
            dangerouslySetInnerHTML={{ __html: kropp }}
          />
        ) : null}
      </div>
      {siffror.map((x) => (
        <span key={`k${x.nr}`} className="b3-nr" aria-hidden="true" style={{ top: x.top, left: x.left }}>
          {x.nr}
        </span>
      ))}
      {plats && saknatKrav ? (
        <>
          <span className="b3-plats" aria-hidden="true" style={{ top: plats.top, left: plats.left, width: plats.bredd, height: plats.hojd }} />
          <span className="b3-nr lucka" aria-hidden="true" style={{ top: plats.nrTop, left: plats.nrLeft }}>
            {saknatKrav.nr}
          </span>
          <span className="b3-etikett" style={{ top: plats.top + plats.hojd / 2 - 17, left: (b ?? 0) - 30 }}>
            Här hamnar meningen
            <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true" style={{ position: 'absolute', left: -9, top: 10 }}>
              <path d="M10 0L0 7l10 7z" fill="#E07A2F" />
            </svg>
          </span>
        </>
      ) : null}
      {aktiv ? (
        <span className="b3-etikett liten" style={{ top: aktiv.top - 4, left: aktiv.left }}>
          Du ändrar här
        </span>
      ) : null}
    </div>
  )
}
