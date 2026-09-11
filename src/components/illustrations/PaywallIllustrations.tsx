'use client'

/**
 * Betalväggarnas illustrationer, viewBox 48, stroke 2, radie 4.
 * Ett accentelement per illustration. Inga gradientcirklar.
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

const SW = ILLU.stroke[48]
const R = ILLU.radius[48]

/** Brevark med textrader, vikt hörn med nedladdningspil. */
export function IlluBrevKlart(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />
      <path
        d="M12 6h18l8 8v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M30 6v8h8" stroke="currentColor" strokeWidth={SW} />
      <path d="M16 20h16M16 26h16M16 32h9" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <circle cx="36" cy="36" r="8" fill={`url(#${id})`} />
      <path d="M36 31v8M32.5 36.5l3.5 3.5 3.5-3.5" stroke={ILLU.onAccent} strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Två brevark staplade, tredje som streckad kontur. */
export function IlluDagensBrev(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />
      <rect x="18" y="4" width="22" height="28" rx={R} stroke="currentColor" strokeWidth={SW} strokeDasharray="3 3" opacity="0.5" />
      <rect x="12" y="10" width="22" height="28" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} opacity="0.7" />
      <rect x="6" y="16" width="22" height="28" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M11 24h12M11 30h12M11 36h7" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <circle cx="22" cy="20" r="3.5" fill={`url(#${id})`} />
    </IlluSvg>
  )
}

/** Checklista sex rader, tre med bock, tre streckade. */
export function IlluAnalysDelvis(props: IlluProps) {
  const id = useIlluId()
  const rows = [10, 17, 24, 31, 38, 45]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />
      <rect x="6" y="3" width="36" height="42" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      {rows.slice(0, 3).map((y, i) => (
        <g key={y}>
          <rect x="11" y={y - 3} width="6" height="6" rx="1.5" fill={i === 0 ? `url(#${id})` : ILLU.accent} />
          <path d={`M12.5 ${y} l1.5 1.5 3-3`} stroke={ILLU.onAccent} strokeWidth={1.5} />
          <path d={`M21 ${y}h14`} stroke="currentColor" strokeWidth={SW} opacity="0.7" />
        </g>
      ))}
      {rows.slice(3).map((y) => (
        <g key={y} opacity="0.35">
          <rect x="11" y={y - 3} width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={1.5} strokeDasharray="2 2" />
          <path d={`M21 ${y}h14`} stroke="currentColor" strokeWidth={SW} strokeDasharray="2 3" />
        </g>
      ))}
    </IlluSvg>
  )
}

/** 2x2-rutnät, tre fyllda rutor, fjärde streckad. */
export function IlluTestTak(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />
      <rect x="6" y="6" width="16" height="16" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="26" y="6" width="16" height="16" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="6" y="26" width="16" height="16" rx={R} fill={`url(#${id})`} />
      <rect x="26" y="26" width="16" height="16" rx={R} stroke="currentColor" strokeWidth={SW} strokeDasharray="3 3" opacity="0.5" />
      <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth={SW} />
      <path d="M30 14h8M34 10v8" stroke="currentColor" strokeWidth={SW} />
      <path d="M10 34h8" stroke={ILLU.onAccent} strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Stapel som gått från hög till låg, streckad linje kvar på gamla höjden. */
export function IlluNedgraderad(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} vertical />
      <path d="M6 42h36" stroke="currentColor" strokeWidth={SW} />
      <rect x="10" y="26" width="8" height="16" rx="2" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="20" y="18" width="8" height="24" rx="2" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="30" y="30" width="8" height="12" rx="2" fill={`url(#${id})`} />
      <rect x="30" y="8" width="8" height="34" rx="2" stroke="currentColor" strokeWidth={SW} strokeDasharray="3 3" opacity="0.4" />
    </IlluSvg>
  )
}

/** Två CV-ark, tredje streckat. */
export function IlluCvStack(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />
      <rect x="20" y="4" width="20" height="26" rx={R} stroke="currentColor" strokeWidth={SW} strokeDasharray="3 3" opacity="0.5" />
      <rect x="13" y="10" width="20" height="26" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} opacity="0.7" />
      <rect x="6" y="16" width="20" height="26" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <circle cx="12" cy="23" r="2.5" fill={`url(#${id})`} />
      <path d="M17 22h5M17 25h3M10 31h12M10 36h8" stroke="currentColor" strokeWidth={1.5} opacity="0.6" />
    </IlluSvg>
  )
}
