/**
 * Miniatyrer av brevmallarna (spec-publikt-v2 del A 5.4): en statisk SVG per
 * mall-id i LETTER_TEMPLATES. Layouten följer mallens kännetecken (sidofält,
 * färgat sidhuvud, accentstreck), texten är streck. aria-hidden.
 */

import type { ReactNode } from 'react'

/** Brödtextens streck: varje tredje rad kortare. */
function Rader({ x, y0, steg, antal, bredd, farg = 'var(--ink-1)' }: { x: number; y0: number; steg: number; antal: number; bredd: number; farg?: string }) {
  return (
    <>
      {Array.from({ length: antal }, (_, i) => (
        <path key={i} d={`M${x} ${+(y0 + i * steg).toFixed(1)}h${i % 3 === 2 ? +(bredd * 0.72).toFixed(1) : bredd}`} stroke={farg} />
      ))}
    </>
  )
}

const MALLAR: Record<string, ReactNode> = {
  classic: (
    <>
      <path d="M30 16h30" strokeWidth="3" />
      <path d="M34 24h22" stroke="var(--kant-stark)" />
      <Rader x={14} y0={40} steg={7.5} antal={9} bredd={62} />
      <path d="M14 110h22" />
    </>
  ),
  minimalist: (
    <>
      <path d="M20 18h22" strokeWidth="3" />
      <Rader x={20} y0={44} steg={8.5} antal={7} bredd={50} farg="var(--kant-stark)" />
      <path d="M20 106h14" />
    </>
  ),
  compact: (
    <>
      <path d="M12 15h26" strokeWidth="3" />
      <path d="M44 15h34" stroke="var(--kant-stark)" />
      <path d="M12 22h66" stroke="var(--kant-stark)" />
      <Rader x={12} y0={34} steg={6.2} antal={12} bredd={66} />
      <path d="M12 110h22" />
    </>
  ),
  modern: (
    <>
      <rect x="10" y="12" width="4" height="96" rx="2" fill="var(--koppar)" stroke="none" />
      <path d="M22 18h30" strokeWidth="3" />
      <rect x="58" y="12" width="20" height="16" rx="2" fill="var(--rum-ton)" stroke="none" />
      <Rader x={22} y0={42} steg={8} antal={8} bredd={56} />
      <path d="M22 108h20" />
    </>
  ),
  executive: (
    <>
      <rect x="7" y="7" width="24" height="106" rx="3" fill="var(--rum-ton)" stroke="none" />
      <path d="M12 20h14M12 30h14M12 40h10" />
      <path d="M38 16h30" strokeWidth="3" />
      <Rader x={38} y0={32} steg={7.5} antal={10} bredd={42} />
    </>
  ),
  creative: (
    <>
      <rect x="3" y="3" width="84" height="26" rx="6" fill="var(--koppar)" stroke="none" />
      <path d="M14 16h32" stroke="var(--koppar-text)" strokeWidth="3" />
      <Rader x={14} y0={42} steg={8} antal={8} bredd={62} />
      <path d="M14 108h22" />
    </>
  ),
  traditional: (
    <>
      <path d="M50 14h28" strokeWidth="3" />
      <path d="M58 22h20" stroke="var(--kant-stark)" />
      <path d="M12 36h30" />
      <Rader x={12} y0={48} steg={7.5} antal={8} bredd={66} />
      <path d="M12 110h20" />
    </>
  ),
}

export default function MallMiniatyr({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 90 120" width={90} height={120} fill="none" stroke="var(--ink-1)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="84" height="114" rx="6" fill="var(--papper-skarm)" strokeWidth="2.2" />
      {MALLAR[id] ?? MALLAR.classic}
    </svg>
  )
}

/** Brevet i tre stycken: öppningen i koppar, mitten och avslutet i grått. */
export function TreStycken() {
  return (
    <svg viewBox="0 0 200 240" width={200} height={240} fill="none" stroke="var(--ink-1)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
      <rect x="20" y="8" width="160" height="224" rx="10" fill="var(--panel)" />
      <path d="M40 30h44" strokeWidth="3.5" />
      <path d="M40 42h28" stroke="var(--kant-stark)" />
      <rect x="34" y="60" width="4" height="40" rx="2" fill="var(--koppar)" stroke="none" />
      <path d="M48 64h110M48 76h100M48 88h74" />
      <rect x="34" y="112" width="4" height="52" rx="2" fill="var(--kant-stark)" stroke="none" />
      <path d="M48 116h110M48 128h110M48 140h96M48 152h80" />
      <rect x="34" y="176" width="4" height="28" rx="2" fill="var(--kant-stark)" stroke="none" />
      <path d="M48 180h110M48 192h64" />
      <path d="M40 218h40" />
    </svg>
  )
}
