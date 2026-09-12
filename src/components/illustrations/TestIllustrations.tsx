'use client'

/**
 * Testflödets illustrationer (docs/plan-konvertering.md, E3).
 * Följer reglerna i primitives.tsx.
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

/** Testrutnät, pil, CV-ark. viewBox 96, stroke 3. */
export function IlluTestTillCv(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[96]
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />

      {/* Testrutnätet till vänster */}
      <rect x="8" y="26" width="16" height="16" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="8" y="50" width="16" height="16" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="30" y="26" width="16" height="16" rx="3" fill={ILLU.soft} stroke="currentColor" strokeWidth={SW} />
      <rect x="30" y="50" width="16" height="16" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />

      {/* Accent: pilen mellan test och CV */}
      <path d="M52 46h14M60 40l6 6-6 6" stroke={ILLU.accent} strokeWidth={SW} />

      {/* CV-arket till höger */}
      <rect x="66" y="18" width="24" height="58" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M72 32h12M72 42h12M72 52h7" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </IlluSvg>
  )
}

/** Fem stigande staplar där den fjärde är accent. viewBox 48, stroke 2. */
export function IlluPercentil(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  const bars = [
    { x: 5, h: 10 },
    { x: 14, h: 17 },
    { x: 23, h: 24 },
    { x: 32, h: 33 },
    { x: 41, h: 21 },
  ]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} vertical />

      {/* Baslinjen */}
      <path d="M3 42h42" stroke="currentColor" strokeWidth={SW} opacity="0.4" />

      {bars.map((b, i) => (
        <rect
          key={b.x}
          x={b.x - 3}
          y={42 - b.h}
          width="6"
          height={b.h}
          rx="1.5"
          fill={i === 3 ? `url(#${id})` : ILLU.fill}
          stroke="currentColor"
          strokeWidth={i === 3 ? 0 : SW}
          opacity={i === 3 ? 1 : 0.65}
        />
      ))}
    </IlluSvg>
  )
}

/* ========================================================================== *
 * Testtypernas ikoner och nivåmärken (våg 3 punkt 22).
 *
 * En ikon per testtyp, ett märke per nivå. Tillsammans blir varje test en
 * egen tydlig upplevelse utan att någon yta behöver hitta på egna motiv.
 * viewBox 48, stroke 2, hörnradie 4, enligt primitives.tsx.
 * ========================================================================== */

/** Matris med saknad ruta. Accent på den ruta som ska lösas. */
export function IlluMatris(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  const cells = [
    { x: 6, y: 6 },
    { x: 19, y: 6 },
    { x: 32, y: 6 },
    { x: 6, y: 19 },
    { x: 19, y: 19 },
    { x: 32, y: 19 },
    { x: 6, y: 32 },
    { x: 19, y: 32 },
  ]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />

      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x}
          y={c.y}
          width="10"
          height="10"
          rx="2"
          fill={ILLU.fill}
          stroke="currentColor"
          strokeWidth={SW}
        />
      ))}

      {/* Accent: den saknade rutan nere till höger */}
      <rect x="32" y="32" width="10" height="10" rx="2" fill={`url(#${id})`} />
      <path d="M37 35v4M35 37h4" stroke={ILLU.onAccent} strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Textsida med markerad rad. Accent på den rad som prövas. */
export function IlluVerbal(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />

      <rect
        x="9"
        y="5"
        width="30"
        height="38"
        rx="4"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M15 14h18M15 21h18M15 35h12"
        stroke="currentColor"
        strokeWidth={SW}
        opacity="0.45"
      />

      {/* Accent: den rad påståendet gäller */}
      <rect x="14" y="26" width="20" height="4" rx="2" fill={`url(#${id})`} />
    </IlluSvg>
  )
}

/** Staplar och en tabellrad. Accent på den stapel som ska läsas av. */
export function IlluNumerisk(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} vertical />

      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="4"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M12 36h24" stroke="currentColor" strokeWidth={SW} opacity="0.45" />

      <rect x="14" y="26" width="5" height="10" rx="1" fill={ILLU.soft} stroke="currentColor" strokeWidth={SW} />
      <rect x="30" y="22" width="5" height="14" rx="1" fill={ILLU.soft} stroke="currentColor" strokeWidth={SW} />

      {/* Accent: den högsta stapeln */}
      <rect x="22" y="15" width="5" height="21" rx="1" fill={`url(#${id})`} />
    </IlluSvg>
  )
}

/** Fem dimensioner som ett spindeldiagram. Personlighetstestens ikon. */
export function IlluPersonlighet(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  // Fem punkter på en cirkel runt (24,24), första rakt upp.
  const pts = [0, 1, 2, 3, 4].map((i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return { x: 24 + Math.cos(a) * 17, y: 24 + Math.sin(a) * 17 }
  })
  const outline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  // Profilen: olika utslag per dimension, det som gör en profil unik.
  const levels = [0.9, 0.55, 0.8, 0.45, 0.7]
  const inner = pts
    .map((p, i) => {
      const x = 24 + (p.x - 24) * levels[i]
      const y = 24 + (p.y - 24) * levels[i]
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />

      <polygon points={outline} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />

      {/* Accent: den egna profilen inuti */}
      <polygon points={inner} fill={`url(#${id})`} opacity="0.85" />
    </IlluSvg>
  )
}

/** Stämpel för det skarpa provet. Accent på bocken. */
export function IlluProv(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />

      <rect
        x="9"
        y="6"
        width="30"
        height="36"
        rx="4"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M15 15h12M15 22h18" stroke="currentColor" strokeWidth={SW} opacity="0.45" />

      {/* Accent: stämpeln */}
      <circle cx="31" cy="32" r="9" fill={`url(#${id})`} />
      <path d="M27 32l3 3 6-6" stroke={ILLU.onAccent} strokeWidth={SW} />
    </IlluSvg>
  )
}

export type TestKindName = 'matris' | 'verbal' | 'numerisk' | 'personlighet'

/** Ikonen för en testtyp. Prov får sin egen ikon via IlluProv. */
export const TEST_KIND_ILLU: Record<
  TestKindName,
  (props: IlluProps) => React.ReactElement
> = {
  matris: IlluMatris,
  verbal: IlluVerbal,
  numerisk: IlluNumerisk,
  personlighet: IlluPersonlighet,
}

/**
 * Nivåindikator: tre steg där de fyllda visar hur långt upp nivån ligger.
 * Grund ett steg, avancerad två, expert tre. Måttet är stegens höjd, inte
 * färgen, så nivån går att läsa även utan färgseende.
 *
 * viewBox 24, stroke 1.5.
 */
export function IlluNiva({
  level,
  ...props
}: IlluProps & { level: 'grund' | 'avancerad' | 'expert' }) {
  const id = useIlluId()
  const SW = ILLU.stroke[24]
  const filled = level === 'expert' ? 3 : level === 'avancerad' ? 2 : 1
  const steps = [
    { x: 3, y: 14, h: 7 },
    { x: 9.5, y: 9, h: 12 },
    { x: 16, y: 4, h: 17 },
  ]
  return (
    <IlluSvg box={24} {...props}>
      <IlluAccentGradient id={id} vertical />

      {steps.map((s, i) => (
        <rect
          key={s.x}
          x={s.x}
          y={s.y}
          width="5"
          height={s.h}
          rx="2"
          fill={i < filled ? `url(#${id})` : ILLU.fill}
          stroke={i < filled ? 'none' : 'currentColor'}
          strokeWidth={i < filled ? 0 : SW}
          opacity={i < filled ? 1 : 0.4}
        />
      ))}
    </IlluSvg>
  )
}
