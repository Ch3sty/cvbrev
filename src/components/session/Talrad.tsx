/**
 * Talraden (omgång 2 steg A, ägarens anmärkning på skissen: serien gick
 * utanför rutan på Pixel 7 och i artikelrutan). En gemensam talrad för
 * talserierna i ramen, i Uppgiftslistan, i artiklarna och i det publika
 * provet (steg C).
 *
 * Måtten är skissens (talserier.js): rutor 56 × 54 med 10 px mellan, radie
 * 12, talet 26 px i display (22 vid åtta rutor eller fler, mindre när talet
 * har många tecken). Raden är aldrig bredare än sin behållare: hela raden
 * skalas likformigt med container query-enheter (cqw) när behållaren är
 * smalare än raden, så att hela serien alltid ryms på en rad, i ramen på
 * 412 px och i en artikelruta på 300 px. Inget skript, ingen mätning: rätt
 * storlek redan i serverns HTML (CLS 0).
 *
 * Bågarna och det röda steget i facit (steg B) ritas i `overlay`, en SVG i
 * radens egna designmått (viewBox: radens bredd W och höjden ovan + 54 +
 * under) som skalas med raden. `ovan` och `under` reserverar platsen från
 * start, så att inget flyttar när facit kommer. `geometri(n)` ger rutornas
 * mitt för den som ritar.
 *
 * Ingen 'use client': ritas på servern i artiklarna.
 */

import type { CSSProperties, ReactNode } from 'react'

export const TALRAD = { BW: 56, BH: 54, GAP: 10 } as const

export interface TalradGeometri {
  n: number
  /** Radens bredd i designmått. */
  W: number
  /** Rutans mitt (x) i designmått. */
  cx: (i: number) => number
  /** Rutornas överkant (y) i overlay-SVG:n, det vill säga `ovan`. */
  topp: number
  BW: number
  BH: number
  GAP: number
}

export function geometri(n: number, ovan = 0): TalradGeometri {
  const { BW, BH, GAP } = TALRAD
  return { n, W: n * BW + Math.max(0, n - 1) * GAP, cx: (i) => i * (BW + GAP) + BW / 2, topp: ovan, BW, BH, GAP }
}

export interface TalradRuta {
  /** Talet som text ("76", "−7"), eller null för en tom lucka ("?"). */
  text: string | null
  /** Luckan: ton-yta med streckad kant, eller fylld med facit. */
  lucka?: boolean
  /** Luckan fylld med rätt tal efter facit: positiv-mjuk med 2 px positiv. */
  facit?: boolean
  /** Varvade serier: rutan hör till serien som ritas i ton-ink. */
  ton?: boolean
  /** Skärmläsarens text för rutan. Utelämnad: talet eller "lucka". */
  aria?: string
}

export interface TalradProps {
  rutor: TalradRuta[]
  /** Plats ovanför rutorna i designmått (bågarna), reserverad från start. */
  ovan?: number
  /** Plats under rutorna i designmått (varvade serier, det röda steget). */
  under?: number
  /** Bågarna och felsteget i designmått (steg B). */
  overlay?: (g: TalradGeometri) => ReactNode
  /** Rad under rutorna i radens bredd (etiketter i procent av raden). */
  efter?: ReactNode
  /** Mindre rutor (Uppgiftslistan, artikelns lösning): skalan 0,8. */
  liten?: boolean
  className?: string
  ariaLabel?: string
}

/** Designmått till CSS: px när raden ryms, annars andel av behållarens bredd. */
function matt(d: number, W: number, skala: number): string {
  const px = d * skala
  return `min(${+px.toFixed(2)}px, ${+((d / W) * 100).toFixed(4)}cqw)`
}

/** Talets storlek i designmått efter antal rutor och tecken. */
export function talStorlek(tecken: number, n: number): number {
  const bas = n >= 8 ? 22 : 26
  // Siffrorna är tabulära och cirka 0,6 em breda; 6 px luft i rutan.
  return Math.min(bas, (TALRAD.BW - 6) / (Math.max(1, tecken) * 0.6))
}

export default function Talrad({ rutor, ovan = 0, under = 0, overlay, efter, liten = false, className = '', ariaLabel = 'Talraden' }: TalradProps) {
  const n = rutor.length
  const g = geometri(n, ovan)
  const { BW, BH, GAP } = TALRAD
  const W = g.W
  const s = liten ? 0.8 : 1
  const m = (d: number) => matt(d, W, s)
  const H = ovan + BH + under
  return (
    <div className={`talrad w-full ${className}`} style={{ containerType: 'inline-size' }} data-talrad-yta>
      <div className="relative mx-auto" style={{ width: m(W), paddingTop: m(ovan), paddingBottom: m(under) }}>
        <div role="list" aria-label={ariaLabel} className="flex" style={{ gap: m(GAP) }} data-talrad>
          {rutor.map((r, i) => {
            const text = r.text ?? '?'
            const tom = r.lucka && r.text == null
            const stil: CSSProperties = {
              width: m(BW),
              height: m(BH),
              borderRadius: m(12),
              fontSize: m(talStorlek(text.length, n)),
            }
            const yta = tom
              ? 'border-[1.5px] border-dashed border-kant-stark bg-ton text-ink-3'
              : r.facit
                ? 'border-2 border-positiv bg-positiv-mjuk text-ink-1 talrad-in'
                : r.ton
                  ? 'border border-ton-ink bg-papper text-ink-1'
                  : 'border border-kant bg-papper text-ink-1 shadow-[inset_0_0_0_1px_var(--papper-2)]'
            return (
              <span
                key={i}
                role="listitem"
                aria-label={r.aria ?? (tom ? 'lucka' : r.lucka ? `lucka, ${text}` : text)}
                className={`flex flex-shrink-0 items-center justify-center font-sess-display font-bold leading-none tabular-nums tracking-[-.02em] ${yta}`}
                style={stil}
                data-lucka={r.lucka ? (tom ? 'tom' : 'fylld') : undefined}
              >
                {text}
              </span>
            )
          })}
        </div>
        {overlay ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="pointer-events-none absolute inset-x-0 top-0 h-full w-full overflow-visible"
            aria-hidden="true"
            focusable="false"
            data-talrad-overlay
          >
            {overlay(g)}
          </svg>
        ) : null}
      </div>
      {efter ? (
        <div className="relative mx-auto" style={{ width: m(W) }}>
          {efter}
        </div>
      ) : null}
    </div>
  )
}
