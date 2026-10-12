/**
 * Vågkanten mellan två ytor: SVG 1440 × 72 utan proportioner, fast höjd
 * clamp(28px, 6vw, 72px), absolut i sektionens botten. Högst en per sida
 * plus hjältens (spec-publikt-v2 del A avsnitt 3).
 */

const FORMER = {
  1: 'M0 72V40C240 0 480 0 720 36S1200 72 1440 24V72z',
  2: 'M0 72V28C200 64 520 70 760 38S1240 2 1440 30V72z',
} as const

export default function Vag({ till, form = 1 }: { till: 'mark' | 'panel'; form?: 1 | 2 }) {
  return (
    <div className="pub-vag" aria-hidden="true">
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none" focusable="false">
        <path d={FORMER[form]} fill={`var(--${till})`} />
      </svg>
    </div>
  )
}
