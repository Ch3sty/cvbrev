'use client'

/**
 * Illustrationssystemets primitiver (docs/designsystem.md, "Marginalplattan
 * och illustrationer").
 *
 * Regler:
 * - Konturer i currentColor. Fyllningar via CSS-variablerna --illu-fill,
 *   --illu-accent, --illu-soft och --illu-muted, som i globals.css pekar på
 *   Trådens tokens (panel, accent, accent-mjuk, kant-stark) och i inloggat på
 *   Rummens (papper, koppar, koppar-mjuk, kant-stark).
 * - Linjetjocklek per viewBox: 24 → 1.75, 48 → 2, 96 → 3, 120 → 3 (Rummens
 *   märken), 240 → 6.
 * - Hörnradie 8 procent av viewBox.
 * - En accentform per illustration, fylld och liten, högst en tiondel av
 *   motivet. Aldrig som bakgrundscirkel, aldrig på en kontur.
 * - Unika id via useIlluId(), aldrig hårdkodade strängar.
 *
 * Scen-regler för 96 och 240: en scen berättar ett ögonblick, högst tre
 * element (bärande, rörligt, accent), det rörliga lutar 4 till 8 grader,
 * aldrig ovanpå text.
 */

import { useId } from 'react'
import { ILLU, IlluSvg, type IlluBox, type IlluProps } from './primitives-bas'

// IlluSvg och ILLU bor i primitives-bas.tsx utan 'use client', så att
// serverkomponenter (TestGlyfer, TestBredd) kan rita symbolerna utan klient-JS.
export { ILLU, IlluSvg, type IlluBox, type IlluProps }

/** Unikt id-prefix för gradienter och clip-paths inuti en illustration. */
export function useIlluId(): string {
  return useId().replace(/[:]/g, '')
}

/**
 * Accentfyllning. Behåller namnet och API:t från v1 så att befintliga
 * illustrationer fortsätter fungera, men i Tråden är accenten platt: orange
 * är en linje eller ett bläck, aldrig en gradient. Båda stoppen pekar på
 * --illu-accent, så `fill="url(#id)"` ger samma ton som ILLU.accent.
 */
export function IlluAccentGradient({ id, vertical = false }: { id: string; vertical?: boolean }) {
  return (
    <defs>
      <linearGradient
        id={id}
        x1="0"
        y1="0"
        x2={vertical ? '0' : '1'}
        y2={vertical ? '1' : '1'}
      >
        <stop offset="0" stopColor={ILLU.accent} />
        <stop offset="1" stopColor={ILLU.accent} />
      </linearGradient>
    </defs>
  )
}
