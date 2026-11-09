'use client'

/**
 * Provbladets bilder för testplanens steg 2 (skiss-tester-steg2-2026-11-09,
 * symbolerna sym-tal, sym-kub48 och sym-ord, i Provbladets färgroller och
 * 160 × 120). En kopparyta per bild: svaret.
 *
 * - Talserier: fyra rutor med tal och en lucka sist, luckan i koppar.
 * - Spatial förmåga: en tärning i isometri med tre symboler, toppens prick
 *   i koppar.
 * - Ordförråd: bladet med ett ord i versaler och fem alternativ, det rätta
 *   i koppar.
 */

import { A, DIM, FILL, IlluRam, MJUK, type IlluProvbladProps } from './Provbladet'

export function IlluTalserie(p: IlluProvbladProps) {
  const x = [10, 46, 82, 118]
  return (
    <IlluRam w={160} h={120} {...p}>
      {x.map((v, i) =>
        i < 3 ? (
          <rect key={v} x={v} y="38" width="32" height="44" rx="6" fill={FILL} stroke="currentColor" strokeWidth="3" />
        ) : (
          <rect key={v} x={v} y="38" width="32" height="44" rx="6" fill={MJUK} stroke={A} strokeWidth="3" strokeDasharray="5 5" />
        )
      )}
      <path d="M21 52l8 16M57 52v16M63 52v16M93 52v16M99 52v16M105 52v16" stroke="currentColor" strokeWidth="3" />
      <path d="M131 54a4 4 0 1 1 6 3.5c-1.5 1-3 2-3 4.5M134 68v.5" stroke={A} strokeWidth="3" />
      <path d="M26 30c6-8 14-8 20 0M62 30c6-8 14-8 20 0M98 30c6-8 14-8 20 0" stroke={DIM} strokeWidth="2.5" />
    </IlluRam>
  )
}

export function IlluSpatial(p: IlluProvbladProps) {
  return (
    <IlluRam w={160} h={120} {...p}>
      <path d="M80 14l40 23v46l-40 23-40-23V37z" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M40 37l40 23 40-23M80 60v46" stroke="currentColor" strokeWidth="3" />
      <path d="M40 37l40 23v46l-40-23z" fill={MJUK} stroke="currentColor" strokeWidth="3" />
      <ellipse cx="80" cy="37" rx="9" ry="5" fill={A} />
      <path d="M53 66l14 8M67 66l-14 8" stroke="currentColor" strokeWidth="3" />
      <ellipse cx="100" cy="72" rx="6" ry="9" transform="rotate(-30 100 72)" stroke="currentColor" strokeWidth="3" />
    </IlluRam>
  )
}

export function IlluOrdforrad(p: IlluProvbladProps) {
  const y = [52, 66, 80, 94]
  return (
    <IlluRam w={160} h={120} {...p}>
      <rect x="8" y="8" width="144" height="104" rx="8" fill={FILL} stroke="currentColor" strokeWidth="3" />
      <path d="M50 28h60" stroke="currentColor" strokeWidth="5" />
      {y.map((v, i) => (
        <g key={v}>
          <circle cx="30" cy={v} r="3.5" fill={i === 1 ? A : DIM} />
          <path d={`M42 ${v}h${i === 1 ? 70 : 54 + i * 6}`} stroke={i === 1 ? A : DIM} strokeWidth="3" />
        </g>
      ))}
    </IlluRam>
  )
}
