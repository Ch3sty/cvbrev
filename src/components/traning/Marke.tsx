/**
 * Ett av de fem graverade märkena (spec-rummen 4.4 och 4.5, konceptets
 * #m-matning ... #m-prov), med testansvarigs rättade definitioner
 * (granskningen 3.2, milstolpar.ts): Första mätningen, Första veckan, Nivån
 * upp, Generalrepetitionen, Provdagen.
 *
 * Märkena är React-SVG i RumSymboler (konceptets defs ordagrant, egna
 * gradient-id per instans). Storlek 132 på kvittot, 72 i listor, 48 i O1 och
 * kurvans legend. Klassen .marke ger landningen på 600 ms när den står i en
 * .motion-yta (globals.css), annars står märket stilla.
 */

import {
  MarkeGeneral,
  MarkeMatning,
  MarkeNiva,
  MarkeProv,
  MarkeVecka,
} from '@/components/illustrations/RumSymboler'
import type { MilstolpeNyckel } from '@/lib/traning/milstolpar'

export type MarkeTyp = 'matning' | 'vecka' | 'niva' | 'general' | 'prov'

/** Märket för en milstolpe. */
export const MARKE_FOR: Record<MilstolpeNyckel, MarkeTyp> = {
  forsta_matningen: 'matning',
  forsta_veckan: 'vecka',
  nivan_upp: 'niva',
  generalrepetitionen: 'general',
  provdagen: 'prov',
}

const KOMPONENT = {
  matning: MarkeMatning,
  vecka: MarkeVecka,
  niva: MarkeNiva,
  general: MarkeGeneral,
  prov: MarkeProv,
} as const

export interface MarkeProps {
  typ: MarkeTyp
  storlek: 48 | 72 | 132
  /** Tillgängligt namn. Utelämnat är märket dekor (aria-hidden). */
  title?: string
  /** Landningen (.marke) när ytan har .motion. */
  landa?: boolean
  className?: string
}

export default function Marke({ typ, storlek, title, landa, className }: MarkeProps) {
  const K = KOMPONENT[typ]
  return <K size={storlek} title={title} className={`shrink-0 ${landa ? 'marke' : ''} ${className ?? ''}`} />
}
