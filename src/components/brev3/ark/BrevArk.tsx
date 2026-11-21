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
    passaBrevet(rot)
    const cv = rot.querySelector<HTMLElement>('.cv.brev')
    if (cv) setHojdPx(Math.max(ARK_HOJD_PX, cv.offsetHeight))
    const bas = ut.getBoundingClientRect()

    const lista: Siffra[] = []
    rot.querySelectorAll<HTMLElement>('mark[data-krav]').forEach((m) => {
      const r = m.getClientRects()[0]
      const stycke = m.closest<HTMLElement>('[data-stycke]') ?? m.parentElement
      if (!r || !stycke) return
      const textVanster = stycke.getBoundingClientRect().left - bas.left
      lista.push({ nr: Number(m.dataset.krav), top: r.top - bas.top + r.height / 2 - SIFFRA_HOJD / 2, left: Math.max(2, textVanster - 30) })
    })
    lista.sort((x, y) => x.top - y.top)
    // Två krav på samma rad: siffrorna staplas i stället för att krocka.
    for (let i = 1; i < lista.length; i++) if (lista[i].top < lista[i - 1].top + SIFFRA_HOJD + 1) lista[i].top = lista[i - 1].top + SIFFRA_HOJD + 1
    setSiffror(lista)

    if (saknatKrav) {
      const st = rot.querySelector<HTMLElement>(`[data-stycke="${saknatKrav.stycke}"]`) ?? [...rot.querySelectorAll<HTMLElement>('[data-stycke]')].pop()
      if (st) {
        const rng = document.createRange()
        rng.selectNodeContents(st)
        const rader = rng.getClientRects()
        const sista = rader[rader.length - 1] ?? st.getBoundingClientRect()
        const sr = st.getBoundingClientRect()
        const hojd = Math.max(8, sista.height)
        let left = sista.right - bas.left + 6
        let top = sista.top - bas.top
        const hoger = sr.right - bas.left
        if (hoger - left < 40) {
          left = sr.left - bas.left
          top = sista.bottom - bas.top + 2
        }
        setPlats({ top, left, bredd: Math.max(30, Math.min(134 * (b! / 480), hoger - left)), hojd, nrTop: top + hojd / 2 - SIFFRA_HOJD / 2, nrLeft: Math.max(2, sr.left - bas.left - 30) })
      } else setPlats(null)
    } else setPlats(null)

    const a = rot.querySelector<HTMLElement>('[data-aktivt]')
    if (a) {
      const r = a.getBoundingClientRect()
      setAktiv({ top: r.top - bas.top, left: bas.width - 30 })
    } else setAktiv(null)
  }, [skala, saknatKrav, b])

  useLayoutEffect(() => {
    mat()
  }, [mat, kropp])

  // Typsnitten laddas efter första målningen: mät igen när de är klara.
  useEffect(() => {
    let levande = true
    document.fonts?.ready.then(() => levande && mat())
    return () => {
      levande = false
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
