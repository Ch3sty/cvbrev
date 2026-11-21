/**
 * Arkbunten i väggen (skissens Main och Hem-ny): brevet överst och upp till
 * två ark bakom, i solfjäder. Varje ark är 206 x 291 med skissens skugga; en
 * miniatyr eller bild läggs in som innehåll (BrevMiniatyr från arket, eller
 * en <img>). Bunten är absolut placerad; vyn sätter left och top.
 *
 * Main: tre ark (överst -4°, sedan 5° och 13°). Hem-ny: två (-3° och 11°).
 * Läget följer antalet ark, så vyn behöver bara skicka in dem.
 *
 * Serverkomponent.
 */

import type { CSSProperties, ReactNode } from 'react'

export interface ArkBuntProps {
  /** Arket överst, oftast brevet i sin mall. */
  overst: ReactNode
  /** Arken bakom, närmast först (högst två). */
  bakom?: readonly ReactNode[]
  /** Etikett eller länk som ligger på bunten ("Så här blir det", "Se det i fler mallar"). */
  etikett?: ReactNode
  /** Var etiketten står, i buntens koordinater. */
  etikettStil?: CSSProperties
  /** Skärmläsarens text om brevet överst. Utelämnad: bunten är dekor. */
  alt?: string
  style?: CSSProperties
  className?: string
}

/** Lägen per antal ark, i buntens egna koordinater (översta arket i 0,0). */
const LAGEN: Record<number, readonly { left: number; top: number; rot: number }[]> = {
  1: [{ left: 0, top: 0, rot: -4 }],
  2: [
    { left: 0, top: 0, rot: -3 },
    { left: 54, top: 12, rot: 11 },
  ],
  3: [
    { left: 0, top: 0, rot: -4 },
    { left: 46, top: 2, rot: 5 },
    { left: 88, top: 12, rot: 13 },
  ],
}

export function ArkBunt({ overst, bakom = [], etikett, etikettStil, alt, style, className }: ArkBuntProps) {
  const ark = [overst, ...bakom.slice(0, 2)]
  const lagen = LAGEN[ark.length]
  // Bakersta arket ritas först, så att det översta hamnar ovanpå.
  const ordning = ark.map((innehall, i) => ({ innehall, i })).reverse()
  return (
    <div className={className ? `b3-bunt ${className}` : 'b3-bunt'} style={style}>
      <span role={alt ? 'img' : undefined} aria-label={alt} aria-hidden={alt ? undefined : true}>
        {ordning.map(({ innehall, i }) => {
          const l = lagen[i]
          return (
            <span key={i} className="b3-bunt-ark" aria-hidden="true" style={{ left: l.left, top: l.top, transform: `rotate(${l.rot}deg)` }}>
              {innehall}
            </span>
          )
        })}
      </span>
      {etikett ? (
        <span className="b3-bunt-etikett" style={etikettStil}>
          {etikett}
        </span>
      ) : null}
    </div>
  )
}
